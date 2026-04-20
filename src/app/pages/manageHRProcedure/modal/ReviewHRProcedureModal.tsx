import { useEffect } from "react";
import { Modal, Descriptions, Tag, Button, Spin, Typography, message } from "antd";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { fetchProcedureById, selectHRProcedureSelected, selectHRProcedureLoading, applyProcedure } from "../../../../store/hrProcedureSlide";

const { Text } = Typography;

interface ReviewHRProcedureModalProps {
    open: boolean;
    procedureId: number;
    canApprove?: boolean;
    onCancel: () => void;
    onApprove: () => void;
    onReject: () => void;
}

const STATUS_COLOR: Record<string, string> = {
    Approved: "green",
    Pending: "orange",
    Rejected: "red",
    Applied: "blue",
};

const PROCEDURE_TYPE_MAP: Record<string, string> = {
    Appointment: "Bổ nhiệm",
    Transfer: "Điều chuyển",
    Demotion: "Giáng chức",
    Termination: "Sa thải",
};

const ReviewHRProcedureModal = ({ open, procedureId, canApprove = false, onCancel, onApprove, onReject }: ReviewHRProcedureModalProps) => {
    const dispatch = useAppDispatch();
    const loading = useAppSelector(selectHRProcedureLoading);
    const detail = useAppSelector(selectHRProcedureSelected);

    useEffect(() => {
        if (open && procedureId) {
            dispatch(fetchProcedureById(procedureId));
        }
    }, [open, procedureId, dispatch]);

    const isPending = detail?.status === "Pending";
    const isApprovedNotApplied = detail?.status === "Approved" && !detail.appliedDate;

    const handleApply = () => {
        if (!detail) return;
        dispatch(applyProcedure(detail.procedureId))
            .unwrap()
            .then(() => {
                message.success("Đã áp dụng thay đổi vào hồ sơ nhân viên thành công!");
                dispatch(fetchProcedureById(detail.procedureId));
            })
            .catch((err) => {
                message.error(err?.message || "Lỗi khi áp dụng thủ tục!");
            });
    };

    return (
        <Modal
            title="Chi tiết Thủ tục HR"
            open={open}
            onCancel={onCancel}
            width={800}
            destroyOnHidden
            footer={[
                <Button key="close" onClick={onCancel}>
                    Đóng
                </Button>,
                isPending && canApprove && (
                    <Button key="reject" danger onClick={onReject}>
                        Từ chối
                    </Button>
                ),
                isPending && canApprove && (
                    <Button key="approve" type="primary" onClick={onApprove}>
                        Phê duyệt
                    </Button>
                ),
                isApprovedNotApplied && (
                    <Button key="apply" type="primary" style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }} onClick={handleApply}>
                        Áp dụng hồ sơ
                    </Button>
                ),
            ].filter(Boolean)}
        >
            <Spin spinning={loading}>
                {detail ? (
                    <Descriptions bordered column={2} style={{ marginTop: 16 }}>
                        <Descriptions.Item label="Mã thủ tục">{detail.procedureNumber}</Descriptions.Item>
                        <Descriptions.Item label="Loại thủ tục">
                            <Tag color="blue">{PROCEDURE_TYPE_MAP[detail.procedureType] || detail.procedureType}</Tag>
                        </Descriptions.Item>

                        <Descriptions.Item label="Nhân viên">
                            {detail.employeeCode} - {detail.employeeFullName}
                        </Descriptions.Item>
                        <Descriptions.Item label="Ngày hiệu lực">
                            {new Date(detail.effectiveDate).toLocaleDateString("vi-VN")}
                        </Descriptions.Item>

                        <Descriptions.Item label="Phòng ban mới">
                            {detail.newDepartmentId ? `${detail.newDepartmentName} (ID: ${detail.newDepartmentId})` : "Không có thay đổi"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Chức vụ mới">
                            {detail.newPositionId ? `${detail.newPositionName} (ID: ${detail.newPositionId})` : "Không có thay đổi"}
                        </Descriptions.Item>

                        <Descriptions.Item label="Lương mới">
                            {detail.newSalary ? `${detail.newSalary.toLocaleString()} VND` : "Không có thay đổi"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Quản lý mới">
                            {detail.newManagerId ? `${detail.newManagerName} (ID: ${detail.newManagerId})` : "Không có thay đổi"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Trạng thái">
                            <Tag color={STATUS_COLOR[detail.status] ?? "default"}>
                                {detail.status} {detail.appliedDate ? "(Đã áp dụng)" : ""}
                            </Tag>
                        </Descriptions.Item>

                        <Descriptions.Item label="Lý do thay đổi" span={2}>
                            <Text>{detail.reason || "Không có"}</Text>
                        </Descriptions.Item>

                        {detail.status === "Rejected" && (
                            <Descriptions.Item label="Lý do từ chối" span={2}>
                                <Text type="danger">{detail.rejectionReason || "Không có"}</Text>
                            </Descriptions.Item>
                        )}

                        <Descriptions.Item label="Người tạo">{detail.submittedByName}</Descriptions.Item>
                        <Descriptions.Item label="Ngày tạo">
                            {new Date(detail.submittedDate).toLocaleString("vi-VN")}
                        </Descriptions.Item>

                        {detail.reviewedBy && (
                            <>
                                <Descriptions.Item label="Người duyệt">{detail.reviewedByName || detail.reviewedBy}</Descriptions.Item>
                                <Descriptions.Item label="Ngày duyệt">
                                    {detail.reviewedDate ? new Date(detail.reviewedDate).toLocaleString("vi-VN") : "N/A"}
                                </Descriptions.Item>
                            </>
                        )}
                        {detail.appliedBy && (
                            <>
                                <Descriptions.Item label="Người áp dụng">{detail.appliedByName || detail.appliedBy}</Descriptions.Item>
                                <Descriptions.Item label="Ngày áp dụng">
                                    {detail.appliedDate ? new Date(detail.appliedDate).toLocaleString("vi-VN") : "N/A"}
                                </Descriptions.Item>
                            </>
                        )}
                    </Descriptions>
                ) : (
                    <div style={{ padding: "40px", textAlign: "center" }}>
                        <Text type="secondary">Không tìm thấy thông tin thủ tục</Text>
                    </div>
                )}
            </Spin>
        </Modal>
    );
};

export default ReviewHRProcedureModal;
