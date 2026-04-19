import { Card, Form, DatePicker, Input, Button, Select, Alert, message, Modal } from "antd";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../../store";
import {
    createResignationRequest,
    fetchMyResignationRequests,
    selectResignationRequestLoading,
    selectResignationRequestLastResponse,
    selectResignationRequestError,
    clearLastResponse,
    clearError,
} from "../../../../store/resignationRequestSlide";
import { fetchAllEmployees, selectEmployees } from "../../../../store/employeeSlide";
import dayjs from "dayjs";

const { TextArea } = Input;
const { Option } = Select;

const ResignationRequestForm = () => {
    const [form] = Form.useForm();
    const dispatch = useAppDispatch();
    const loading = useAppSelector(selectResignationRequestLoading);
    const lastResponse = useAppSelector(selectResignationRequestLastResponse);
    const error = useAppSelector(selectResignationRequestError);
    const employees = useAppSelector(selectEmployees);
    const [taskWarningVisible, setTaskWarningVisible] = useState(false);
    const [taskCount, setTaskCount] = useState(0);

    useEffect(() => {
        dispatch(fetchAllEmployees());
    }, [dispatch]);

    useEffect(() => {
        if (lastResponse?.success) {
            const count = lastResponse.data?.incompleteTaskCount ?? 0;
            if (count > 0) {
                setTaskCount(count);
                setTaskWarningVisible(true);
            } else {
                message.success(lastResponse.message || "Đơn xin thôi việc đã được gửi thành công.");
            }
            form.resetFields();
            dispatch(fetchMyResignationRequests());
            dispatch(clearLastResponse());
        }
    }, [lastResponse, form, dispatch]);

    useEffect(() => {
        if (error) {
            const msg = error?.message || error?.data?.message || "Đã có lỗi xảy ra.";
            message.error(msg);
            dispatch(clearError());
        }
    }, [error, dispatch]);

    const onFinish = (values: any) => {
        dispatch(createResignationRequest({
            expectedLastWorkingDate: values.expectedLastWorkingDate.format("YYYY-MM-DD"),
            reason: values.reason,
            handoverNote: values.handoverNote,
            handoverToEmployeeId: values.handoverToEmployeeId,
        }));
    };

    const disabledDate = (current: dayjs.Dayjs) => {
        return current && current < dayjs().add(30, "day").startOf("day");
    };

    return (
        <>
            <Card
                title="Nộp đơn xin thôi việc"
                className="shadow-lg border-none rounded-2xl bg-white/70 backdrop-blur-md"
            >
                <Alert
                    message="Lưu ý quan trọng"
                    description="Bạn phải báo trước ít nhất 30 ngày. Sau khi nộp đơn, quản lý trực tiếp sẽ xem xét và phê duyệt."
                    type="warning"
                    showIcon
                    className="mb-4"
                />

                <Form form={form} layout="vertical" onFinish={onFinish}>
                    <Form.Item
                        name="expectedLastWorkingDate"
                        label="Ngày làm việc cuối dự kiến"
                        rules={[{ required: true, message: "Vui lòng chọn ngày làm việc cuối" }]}
                        tooltip="Phải cách ngày hôm nay ít nhất 30 ngày"
                    >
                        <DatePicker
                            className="w-full"
                            size="large"
                            disabledDate={disabledDate}
                            format="DD/MM/YYYY"
                            placeholder="Chọn ngày làm việc cuối"
                        />
                    </Form.Item>

                    <Form.Item name="reason" label="Lý do thôi việc">
                        <TextArea
                            rows={3}
                            maxLength={1000}
                            showCount
                            placeholder="Mô tả lý do bạn muốn thôi việc (không bắt buộc)..."
                            className="rounded-lg"
                        />
                    </Form.Item>

                    <Form.Item name="handoverToEmployeeId" label="Bàn giao công việc cho">
                        <Select
                            placeholder="Chọn nhân viên nhận bàn giao (không bắt buộc)"
                            size="large"
                            allowClear
                            showSearch
                            optionFilterProp="children"
                        >
                            {(employees || []).map((emp: any) => (
                                <Option key={emp.employeeId} value={emp.employeeId}>
                                    {emp.firstName} {emp.lastName} — {emp.employeeCode}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item name="handoverNote" label="Nội dung bàn giao">
                        <TextArea
                            rows={4}
                            maxLength={2000}
                            showCount
                            placeholder="Mô tả các công việc, tài liệu, hệ thống, tài khoản cần bàn giao..."
                            className="rounded-lg"
                        />
                    </Form.Item>

                    <Button
                        type="primary"
                        danger
                        htmlType="submit"
                        block
                        loading={loading}
                        className="h-12 text-md font-bold rounded-xl mt-2"
                    >
                        Gửi đơn xin thôi việc
                    </Button>
                </Form>
            </Card>

            <Modal
                title="⚠️ Cảnh báo task chưa hoàn thành"
                open={taskWarningVisible}
                onOk={() => setTaskWarningVisible(false)}
                onCancel={() => setTaskWarningVisible(false)}
                okText="Đã hiểu"
                cancelButtonProps={{ style: { display: "none" } }}
                centered
            >
                <div className="py-4 text-center">
                    <p className="text-gray-800 text-lg font-medium mb-2">
                        Đơn xin thôi việc đã được gửi thành công.
                    </p>
                    <Alert
                        type="warning"
                        showIcon
                        message={`Bạn còn ${taskCount} task chưa hoàn thành`}
                        description="Vui lòng hoàn thành hoặc bàn giao các task này trước ngày làm việc cuối."
                        className="text-left mt-3"
                    />
                </div>
            </Modal>
        </>
    );
};

export default ResignationRequestForm;
