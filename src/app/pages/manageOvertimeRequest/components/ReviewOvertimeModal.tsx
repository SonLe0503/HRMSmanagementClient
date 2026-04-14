import { Modal, Form, Input, Button, message, Descriptions, Divider } from "antd";
import { useEffect } from "react";
import { ClockCircleOutlined } from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { approveOvertimeRequest, rejectOvertimeRequest, selectOvertimeLoading, fetchPendingOvertimeRequests } from "../../../../store/overtimeSlide";
import dayjs from "dayjs";

const { TextArea } = Input;

interface ReviewOvertimeModalProps {
    open: boolean;
    onCancel: () => void;
    record: any;
}

const ReviewOvertimeModal = ({ open, onCancel, record }: ReviewOvertimeModalProps) => {
    const dispatch = useAppDispatch();
    const loading = useAppSelector(selectOvertimeLoading);
    const [form] = Form.useForm();

    useEffect(() => {
        if (open && record) {
            form.resetFields();
        }
    }, [open, record, form]);

    const handleApprove = () => {
        dispatch(approveOvertimeRequest({ id: record.overtimeRequestId, data: { comments: form.getFieldValue("comments") } }))
            .unwrap()
            .then(() => {
                message.success("Đã phê duyệt yêu cầu!");
                dispatch(fetchPendingOvertimeRequests());
                onCancel();
            })
            .catch((err: any) => {
                const errMsg = typeof err === "string" ? err : err?.message || "Phê duyệt thất bại!";
                message.error(errMsg);
            });
    };

    const handleReject = () => {
        const reason = form.getFieldValue("reason");
        if (!reason) {
            message.warning("Vui lòng nhập lý do từ chối!");
            return;
        }

        dispatch(rejectOvertimeRequest({ id: record.overtimeRequestId, data: { reason } }))
            .unwrap()
            .then(() => {
                message.success("Đã từ chối yêu cầu!");
                dispatch(fetchPendingOvertimeRequests());
                onCancel();
            })
            .catch((err: any) => {
                const errMsg = typeof err === "string" ? err : err?.message || "Từ chối thất bại!";
                message.error(errMsg);
            });
    };

    return (
        <Modal
            title={<div className="flex items-center gap-2 text-indigo-600 font-bold"><ClockCircleOutlined /> Chi Tiết Yêu Cầu Tăng Ca</div>}
            open={open}
            onCancel={onCancel}
            footer={null}
            width={700}
            centered
            destroyOnHidden
        >
            {record ? (
               <div className="p-2">
                <Descriptions bordered column={2} className="bg-slate-50/50 rounded-xl overflow-hidden shadow-sm">
                    <Descriptions.Item label="Nhân viên" span={2}>
                        <span className="font-bold text-slate-800">{record.employeeName}</span>
                    </Descriptions.Item>
                    <Descriptions.Item label="Mã yêu cầu">{record.requestNumber}</Descriptions.Item>
                    <Descriptions.Item label="Ngày tăng ca">{dayjs(record.overtimeDate).format("DD/MM/YYYY")}</Descriptions.Item>
                    <Descriptions.Item label="Thời gian">
                        {record.startTime.slice(0, 5)} - {record.endTime.slice(0, 5)}
                    </Descriptions.Item>
                    <Descriptions.Item label="Tổng giờ">{record.totalHours} giờ</Descriptions.Item>
                    <Descriptions.Item label="Lý do">{record.reason}</Descriptions.Item>
                    <Descriptions.Item label="Nội dung công việc" span={2}>
                        <div className="bg-white p-3 rounded-lg border border-slate-100 italic text-slate-500 whitespace-pre-wrap min-h-[60px]">
                            {record.taskDescription || "Không có mô tả chi tiết"}
                        </div>
                    </Descriptions.Item>
                </Descriptions>

                <Divider />

                <Form form={form} layout="vertical">
                    <Form.Item name="comments" label="Nhận xét (Tùy chọn)">
                        <TextArea rows={2} placeholder="Nhận xét nếu phê duyệt..." />
                    </Form.Item>
                    <Form.Item name="reason" label="Lý do (Bắt buộc nếu từ chối)">
                        <TextArea rows={2} placeholder="Nhập lý do nếu từ chối..." />
                    </Form.Item>

                    <div className="flex justify-end gap-3 mt-8">
                        <Button onClick={onCancel} className="h-10 px-6 rounded-lg font-semibold hover:bg-slate-50 transition-colors">
                            Đóng
                        </Button>
                        <Button
                            danger
                            onClick={handleReject}
                            loading={loading}
                            className="h-10 px-6 rounded-lg font-semibold hover:bg-rose-50 transition-colors"
                        >
                            Từ chối
                        </Button>
                        <Button
                            type="primary"
                            onClick={handleApprove}
                            loading={loading}
                            className="h-10 px-6 rounded-lg font-semibold bg-emerald-600 hover:bg-emerald-700 shadow-[0_4px_12px_rgba(5,150,105,0.2)] transition-all"
                        >
                            Phê duyệt
                        </Button>
                    </div>
                </Form>
            </div> 
            ) : null}
        </Modal>
    );
};

export default ReviewOvertimeModal;
