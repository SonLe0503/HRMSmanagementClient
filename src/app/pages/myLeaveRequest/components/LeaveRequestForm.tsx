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
import { fetchMyBalance } from "../../../../store/leaveBalanceSlide";
import { fetchActiveLeaveTypes, selectActiveLeaveTypes } from "../../../../store/leaveTypeSlide";
import dayjs from "dayjs";

const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

const LeaveRequestForm = () => {
    const [form] = Form.useForm();
    const dispatch = useAppDispatch();
    const loading = useAppSelector(selectLeaveRequestLoading);
    const lastResponse = useAppSelector(selectLeaveRequestLastResponse);
    const leaveTypes = useAppSelector(selectActiveLeaveTypes);
    const [submitAnywayModal, setSubmitAnywayModal] = useState(false);
    const [formData, setFormData] = useState<any>(null);

    useEffect(() => {
        dispatch(fetchActiveLeaveTypes());
    }, [dispatch]);

    useEffect(() => {
        if (lastResponse) {
            if (lastResponse.messageCode === "MSG-22") {
                message.success(lastResponse.message);
                form.resetFields();
                dispatch(fetchMyLeaveRequests());
                dispatch(fetchMyBalance());
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
        <Card title="Đăng ký nghỉ phép" className="shadow-lg border-none rounded-2xl bg-white/70 backdrop-blur-md">
            <Form form={form} layout="vertical" onFinish={onFinish}>
                <Form.Item name="leaveTypeID" label="Loại nghỉ phép" rules={[{ required: true, message: 'Vui lòng chọn loại nghỉ phép' }]}>
                    <Select placeholder="Chọn loại nghỉ phép" size="large" className="rounded-lg">
                        {(leaveTypes || []).map(item => (
                            <Option key={item.leaveTypeId} value={item.leaveTypeId}>
                                {item.leaveTypeName}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item name="range" label="Thời gian" rules={[{ required: true, message: 'Vui lòng chọn thời gian' }]}>
                    <RangePicker 
                        className="w-full h-12 rounded-lg" 
                        onChange={handleDateChange}
                        disabledDate={(current) => current && current < dayjs().startOf('day')}
                        size="large"
                    />
                </Form.Item>

                <Form.Item name="numberOfDays" label="Số ngày nghỉ" rules={[{ required: true, message: 'Vui lòng nhập số ngày' }]}>
                    <InputNumber min={0.5} step={0.5} className="w-full !h-12 flex items-center rounded-lg" size="large" />
                </Form.Item>

                <Form.Item name="reason" label="Lý do" rules={[{ required: true, message: 'Vui lòng nhập lý do' }]}>
                    <TextArea rows={4} placeholder="Mô tả lý do nghỉ phép..." className="rounded-lg" />
                </Form.Item>

                <Button type="primary" htmlType="submit" block loading={loading} className="h-12 text-md font-bold rounded-xl mt-4 shadow-blue-200 shadow-lg">
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
                centered
                className="rounded-2xl overflow-hidden"
            >
                <div className="py-4 text-center">
                    <svg className="w-16 h-16 text-yellow-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <p className="text-gray-800 text-lg font-medium mb-4">Số dư ngày nghỉ của bạn không đủ.</p>
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-slate-400 text-sm mb-1 uppercase font-bold tracking-wider">Số dư hiện tại</p>
                            <p className="text-slate-800 text-2xl font-bold">{formData?.currentBalance} <span className="text-sm font-normal text-slate-400">ngày</span></p>
                        </div>
                        <div>
                            <p className="text-slate-400 text-sm mb-1 uppercase font-bold tracking-wider">Yêu cầu</p>
                            <p className="text-slate-800 text-2xl font-bold">{formData?.numberOfDays} <span className="text-sm font-normal text-slate-400">ngày</span></p>
                        </div>
                    </div>
                    <p className="mt-6 text-slate-500 italic">Bạn có chắc chắn muốn gửi yêu cầu này không?</p>
                </div>
            </Modal>
        </Card>
    );
};

export default LeaveRequestForm;
