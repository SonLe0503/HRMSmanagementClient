import { Button, Form, Input, DatePicker, TimePicker, message, Card, Typography, Radio } from "antd";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { createOvertimeRequest, selectOvertimeLoading, fetchMyOvertimeRequests } from "../../../../store/overtimeSlide";
import dayjs from "dayjs";

const { Title } = Typography;
const { TextArea } = Input;

const OvertimeRequestForm = () => {
    const [form] = Form.useForm();
    const dispatch = useAppDispatch();
    const loading = useAppSelector(selectOvertimeLoading);
    const otMode = Form.useWatch("otMode", form);

    const onFinish = (values: any) => {
        const overtimeDate = values.overtimeDate.format("YYYY-MM-DD");
        
        let startTime = null;
        let endTime = null;

        if (values.otMode === "AfterShift") {
            endTime = values.endTime?.format("HH:mm:ss");
        } else if (values.otMode === "BeforeShift") {
            startTime = values.startTime?.format("HH:mm:ss");
        } else {
            startTime = values.startTime?.format("HH:mm:ss");
            endTime = values.endTime?.format("HH:mm:ss");
        }

        const payload = {
            overtimeDate,
            startTime,
            endTime,
            otMode: values.otMode,
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

    const disabledDate = (current: any) => {
        // Can only select from 3 days ago until 30 days in future
        return current && (current < dayjs().subtract(3, 'day').startOf('day') || current > dayjs().add(30, 'day').endOf('day'));
    };

    return (
        <Card className="rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <Title level={4} className="mb-6 flex items-center">
                <span className="w-1.5 h-6 bg-blue-500 rounded-full mr-3"></span>
                Gửi yêu cầu tăng ca
            </Title>
            <Form 
                form={form} 
                layout="vertical" 
                onFinish={onFinish}
                initialValues={{ otMode: "AfterShift" }}
            >
                <Form.Item name="overtimeDate" label="Ngày tăng ca" rules={[{ required: true, message: "Vui lòng chọn ngày!" }]}>
                    <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" disabledDate={disabledDate} />
                </Form.Item>

                <Form.Item name="otMode" label="Chế độ tăng ca" rules={[{ required: true }]}>
                    <Radio.Group buttonStyle="solid" className="w-full flex">
                        <Radio.Button value="AfterShift" className="flex-1 text-center">Sau ca</Radio.Button>
                        <Radio.Button value="BeforeShift" className="flex-1 text-center">Trước ca</Radio.Button>
                        <Radio.Button value="FullRange" className="flex-1 text-center">Cả ngày/Nghỉ</Radio.Button>
                    </Radio.Group>
                </Form.Item>

                <div className="flex gap-4">
                    {(otMode === "BeforeShift" || otMode === "FullRange") && (
                        <Form.Item 
                            name="startTime" 
                            label="Giờ bắt đầu" 
                            className="flex-1"
                            rules={[{ required: true, message: "Chọn giờ bắt đầu!" }]}
                        >
                            <TimePicker style={{ width: "100%" }} format="HH:mm" />
                        </Form.Item>
                    )}
                    {(otMode === "AfterShift" || otMode === "FullRange") && (
                        <Form.Item 
                            name="endTime" 
                            label="Giờ kết thúc" 
                            className="flex-1"
                            rules={[{ required: true, message: "Chọn giờ kết thúc!" }]}
                        >
                            <TimePicker style={{ width: "100%" }} format="HH:mm" />
                        </Form.Item>
                    )}
                </div>

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
