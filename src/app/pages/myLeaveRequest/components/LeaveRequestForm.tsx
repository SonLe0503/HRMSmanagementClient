import { Card, Form, Select, DatePicker, Input, Button, InputNumber, Modal, message } from "antd";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { 
    createLeaveRequest, 
    fetchMyLeaveRequests,
    selectLeaveRequestLoading, 
    selectLeaveRequestLastResponse,
    clearLastResponse
} from "../../../../store/leaveRequestSlide";
import dayjs from "dayjs";

const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

const LeaveTypeOptions = [
    { label: "Nghỉ phép năm", value: 1 },
    { label: "Nghỉ bệnh", value: 2 },
    { label: "Nghỉ không lương", value: 3 },
    { label: "Nghỉ việc riêng", value: 4 },
];

const LeaveRequestForm = () => {
    const [form] = Form.useForm();
    const dispatch = useAppDispatch();
    const loading = useAppSelector(selectLeaveRequestLoading);
    const lastResponse = useAppSelector(selectLeaveRequestLastResponse);
    const [submitAnywayModal, setSubmitAnywayModal] = useState(false);
    const [formData, setFormData] = useState<any>(null);

    useEffect(() => {
        if (lastResponse) {
            if (lastResponse.messageCode === "MSG-22") {
                message.success(lastResponse.message);
                form.resetFields();
                dispatch(fetchMyLeaveRequests());
                dispatch(clearLastResponse());
            } else if (lastResponse.messageCode === "MSG-27") {
                // Insufficient balance, show warning modal
                setFormData(lastResponse.data);
                setSubmitAnywayModal(true);
            } else {
                message.error(lastResponse.message || "Something went wrong.");
                dispatch(clearLastResponse());
            }
        }
    }, [lastResponse, form, dispatch]);

    const onFinish = (values: any) => {
        const payload = {
            leaveTypeID: values.leaveTypeID,
            startDate: values.range[0].format("YYYY-MM-DD"),
            endDate: values.range[1].format("YYYY-MM-DD"),
            numberOfDays: values.numberOfDays,
            reason: values.reason,
            submitAnyway: false
        };
        dispatch(createLeaveRequest(payload));
    };

    const handleSubmitAnyway = () => {
        if (formData) {
            const payload = {
                leaveTypeID: formData.leaveTypeID,
                startDate: formData.startDate,
                endDate: formData.endDate,
                numberOfDays: formData.numberOfDays,
                reason: formData.reason,
                submitAnyway: true
            };
            dispatch(createLeaveRequest(payload));
            setSubmitAnywayModal(false);
        }
    };

    const handleDateChange = (dates: any) => {
        if (dates && dates[0] && dates[1]) {
            const diff = dates[1].diff(dates[0], 'day') + 1;
            form.setFieldsValue({ numberOfDays: diff });
        }
    };

    return (
        <Card title="Đăng ký nghỉ phép" className="shadow-sm border-none">
            <Form form={form} layout="vertical" onFinish={onFinish}>
                <Form.Item name="leaveTypeID" label="Loại nghỉ phép" rules={[{ required: true, message: 'Vui lòng chọn loại nghỉ phép' }]}>
                    <Select placeholder="Chọn loại nghỉ phép">
                        {LeaveTypeOptions.map(item => (
                            <Option key={item.value} value={item.value}>
                                {item.label}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item name="range" label="Thời gian" rules={[{ required: true, message: 'Vui lòng chọn thời gian' }]}>
                    <RangePicker 
                        className="w-full" 
                        onChange={handleDateChange}
                        disabledDate={(current) => current && current < dayjs().startOf('day')}
                    />
                </Form.Item>

                <Form.Item name="numberOfDays" label="Số ngày nghỉ" rules={[{ required: true, message: 'Vui lòng nhập số ngày' }]}>
                    <InputNumber min={0.5} step={0.5} className="w-full" />
                </Form.Item>

                <Form.Item name="reason" label="Lý do" rules={[{ required: true, message: 'Vui lòng nhập lý do' }]}>
                    <TextArea rows={3} placeholder="Mô tả lý do nghỉ phép..." />
                </Form.Item>

                <Button type="primary" htmlType="submit" block loading={loading}>
                    Gửi yêu cầu
                </Button>
            </Form>

            <Modal
                title="Cảnh báo số dư"
                open={submitAnywayModal}
                onOk={handleSubmitAnyway}
                onCancel={() => {
                    setSubmitAnywayModal(false);
                    dispatch(clearLastResponse());
                }}
                okText="Vẫn gửi"
                cancelText="Hủy"
            >
                <p>Số dư ngày nghỉ của bạn không đủ. Bạn có chắc chắn muốn gửi yêu cầu nghỉ phép này không?</p>
                <p>Số dư hiện tại: <b>{formData?.currentBalance}</b> ngày</p>
                <p>Yêu cầu: <b>{formData?.numberOfDays}</b> ngày</p>
            </Modal>
        </Card>
    );
};

export default LeaveRequestForm;
