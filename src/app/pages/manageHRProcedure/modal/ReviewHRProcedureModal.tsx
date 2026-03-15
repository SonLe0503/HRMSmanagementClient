import { useEffect } from "react";
import { Modal, Descriptions, Tag, Button, Space, Spin, Typography } from "antd";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { fetchProcedureById, selectHRProcedureSelected, selectHRProcedureLoading } from "../../../../store/hrProcedureSlide";

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

    return (
        <Modal
            title="Chi tiết Thủ tục HR"
            open={open}
            onCancel={onCancel}
            width={800}
            destroyOnHidden
            footer={
                <Space>
                    <Button onClick={onCancel}>Đóng</Button>
                    {isPending && canApprove && (
                        <>
                            <Button danger onClick={onReject}>Từ chối</Button>
                            <Button type="primary" onClick={onApprove}>Phê duyệt</Button>
                        </>
                    )}
                </Space>
            }
        >
            <Spin spinning={loading}>
                {detail ? (
                    <Descriptions bordered column={2} style={{ marginTop: 16 }}>
                        <Descriptions.Item label="Mã thủ tục">{detail.procedureNumber}</Descriptions.Item>
                        <Descriptions.Item label="Loại thủ tục">
                            <Tag color="blue">{detail.procedureType}</Tag>
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
                        <Descriptions.Item label="Trạng thái">
                            <Tag color={STATUS_COLOR[detail.status] ?? "default"}>
                                {detail.status}
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

                        <Descriptions.Item label="Người tạo">{detail.submittedBy}</Descriptions.Item>
                        <Descriptions.Item label="Ngày tạo">
                            {new Date(detail.submittedDate).toLocaleString("vi-VN")}
                        </Descriptions.Item>

                        {detail.reviewedBy && (
                            <>
                                <Descriptions.Item label="Người duyệt">{detail.reviewedBy}</Descriptions.Item>
                                <Descriptions.Item label="Ngày duyệt">
                                    {detail.reviewedDate ? new Date(detail.reviewedDate).toLocaleString("vi-VN") : "N/A"}
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
