import { Table, Button, Space, Modal, Input, message } from "antd";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { 
    fetchPendingLeaveRequests, 
    approveLeaveRequest, 
    rejectLeaveRequest, 
    selectPendingLeaveRequests, 
    selectLeaveRequestLoading 
} from "../../../../store/leaveRequestSlide";
import dayjs from "dayjs";

const { TextArea } = Input;

const PendingLeaveRequestTable = () => {
    const dispatch = useAppDispatch();
    const requests = useAppSelector(selectPendingLeaveRequests);
    const loading = useAppSelector(selectLeaveRequestLoading);
    const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);
    const [comments, setComments] = useState("");

    useEffect(() => {
        dispatch(fetchPendingLeaveRequests());
    }, [dispatch]);

    const handleApprove = () => {
        if (selectedRequestId) {
            dispatch(approveLeaveRequest({ id: selectedRequestId, data: { comments } }))
                .unwrap()
                .then(() => {
                    message.success("Đã phê duyệt yêu cầu nghỉ phép.");
                    setIsApproveModalOpen(false);
                    setComments("");
                    dispatch(fetchPendingLeaveRequests());
                })
                .catch(err => message.error(err?.message || "Lỗi khi phê duyệt."));
        }
    };

    const handleReject = () => {
        if (selectedRequestId) {
            if (!comments) {
                message.warning("Vui lòng nhập lý do từ chối.");
                return;
            }
            dispatch(rejectLeaveRequest({ id: selectedRequestId, data: { rejectionReason: comments } }))
                .unwrap()
                .then(() => {
                    message.success("Đã từ chối yêu cầu nghỉ phép.");
                    setIsRejectModalOpen(false);
                    setComments("");
                    dispatch(fetchPendingLeaveRequests());
                })
                .catch(err => message.error(err?.message || "Lỗi khi từ chối."));
        }
    };

    const columns = [
        {
            title: "Nhân viên",
            dataIndex: "employeeName",
            key: "employeeName",
            render: (text: string) => <span className="font-medium text-gray-800">{text}</span>
        },
        {
            title: "Loại nghỉ",
            dataIndex: "leaveTypeName",
            key: "leaveTypeName",
        },
        {
            title: "Thời gian",
            key: "dates",
            render: (_: any, record: any) => (
                <div className="flex flex-col">
                    <span className="text-sm">
                        {dayjs(record.startDate).format("DD/MM/YYYY")} - {dayjs(record.endDate).format("DD/MM/YYYY")}
                    </span>
                    <span className="text-xs text-gray-400">({record.numberOfDays} ngày)</span>
                </div>
            )
        },
        {
            title: "Lý do",
            dataIndex: "reason",
            key: "reason",
            ellipsis: true
        },
        {
            title: "Ngày gửi",
            dataIndex: "submittedDate",
            key: "submittedDate",
            render: (date: string) => dayjs(date).format("DD/MM/YYYY HH:mm")
        },
        {
            title: "Thao tác",
            key: "action",
            render: (_: any, record: any) => (
                <Space size="small">
                    <Button 
                        type="primary" 
                        size="small" 
                        onClick={() => {
                            setSelectedRequestId(record.leaveRequestId);
                            setIsApproveModalOpen(true);
                        }}
                    >
                        Duyệt
                    </Button>
                    <Button 
                        danger 
                        size="small" 
                        onClick={() => {
                            setSelectedRequestId(record.leaveRequestId);
                            setIsRejectModalOpen(true);
                        }}
                    >
                        Từ chối
                    </Button>
                </Space>
            )
        }
    ];

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold mb-6 flex items-center">
                <span className="w-2 h-6 bg-blue-500 rounded-full mr-3"></span>
                Yêu cầu chờ phê duyệt
            </h3>
            <Table 
                columns={columns} 
                dataSource={requests || []} 
                loading={loading} 
                rowKey="leaveRequestId"
                pagination={{ pageSize: 10 }}
            />

            {/* Approve Modal */}
            <Modal
                title="Phê duyệt nghỉ phép"
                open={isApproveModalOpen}
                onOk={handleApprove}
                confirmLoading={loading}
                onCancel={() => setIsApproveModalOpen(false)}
            >
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ghi chú (tùy chọn)</label>
                    <TextArea 
                        rows={4} 
                        placeholder="Nhập ghi chú phê duyệt..." 
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                    />
                </div>
            </Modal>

            {/* Reject Modal */}
            <Modal
                title="Từ chối nghỉ phép"
                open={isRejectModalOpen}
                onOk={handleReject}
                confirmLoading={loading}
                onCancel={() => setIsRejectModalOpen(false)}
                okButtonProps={{ danger: true }}
                okText="Từ chối"
            >
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Lý do từ chối (bắt buộc)</label>
                    <TextArea 
                        rows={4} 
                        placeholder="Vui lòng nhập lý do từ chối..." 
                        status={!comments ? "error" : ""}
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                    />
                </div>
            </Modal>
        </div>
    );
};

export default PendingLeaveRequestTable;
