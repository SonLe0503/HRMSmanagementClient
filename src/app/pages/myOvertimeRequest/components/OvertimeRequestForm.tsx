import { Button, Form, Input, DatePicker, TimePicker, message, Card, Typography } from "antd";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { createOvertimeRequest, selectOvertimeLoading, fetchMyOvertimeRequests } from "../../../../store/overtimeSlide";

const { Title } = Typography;
const { TextArea } = Input;

const OvertimeRequestForm = () => {
    const [form] = Form.useForm();
    const dispatch = useAppDispatch();
    const loading = useAppSelector(selectOvertimeLoading);

    const onFinish = (values: any) => {
        const startTime = values.timeRange[0].format("HH:mm:ss");
        const endTime = values.timeRange[1].format("HH:mm:ss");
        const overtimeDate = values.overtimeDate.format("YYYY-MM-DD");

        const start = values.timeRange[0];
        const end = values.timeRange[1];
        const totalHours = end.diff(start, "hour", true);

        if (totalHours <= 0) {
            message.error("Giờ kết thúc phải sau giờ bắt đầu.");
            return;
        }

        const payload = {
            overtimeDate,
            startTime,
            endTime,
            totalHours,
            reason: values.reason,
            taskDescription: values.taskDescription,
        };

        dispatch(createOvertimeRequest(payload))
            .unwrap()
            .then(() => {
                message.success("Gửi yêu cầu tăng ca thành công!");
                form.resetFields();
                dispatch(fetchMyOvertimeRequests());
            })
            .catch((err: any) => {
                const errMsg = typeof err === "string" ? err : err?.message || "Gửi yêu cầu thất bại!";
                message.error(errMsg);
            });
    };

    return (
        <Card className="rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <Title level={4} className="mb-6 flex items-center">
                <span className="w-1.5 h-6 bg-blue-500 rounded-full mr-3"></span>
                Gửi yêu cầu tăng ca
            </Title>
            <Form form={form} layout="vertical" onFinish={onFinish}>
                <Form.Item name="overtimeDate" label="Ngày tăng ca" rules={[{ required: true, message: "Vui lòng chọn ngày!" }]}>
                    <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
                </Form.Item>

                <Form.Item name="timeRange" label="Thời gian (Từ - Đến)" rules={[{ required: true, message: "Vui lòng chọn thời gian!" }]}>
                    <TimePicker.RangePicker style={{ width: "100%" }} format="HH:mm" />
                </Form.Item>

                <Form.Item name="reason" label="Lý do tăng ca" rules={[{ required: true, message: "Vui lòng nhập lý do!" }]}>
                    <TextArea rows={3} placeholder="Mô tả lý do..." />
                </Form.Item>

                <Form.Item name="taskDescription" label="Nội dung công việc">
                    <TextArea rows={3} placeholder="Mô tả công việc thực hiện..." />
                </Form.Item>

                <Button type="primary" htmlType="submit" className="w-full h-10 rounded-lg bg-blue-600 hover:bg-blue-700 mt-2" loading={loading}>
                    Gửi yêu cầu
                </Button>
            </Form>
        </Card>
    );
};

export default OvertimeRequestForm;
