import { Modal, Form, Input, Select, DatePicker, message, Row, Col } from "antd";
import { useAppDispatch } from "../../../../store";
import { createCycle } from "../../../../store/evaluationCycleSlide";
import { useState } from "react";

const { RangePicker } = DatePicker;

interface AddCycleModalProps {
    open: boolean;
    onCancel: () => void;
    onSuccess: () => void;
}

const AddCycleModal = ({ open, onCancel, onSuccess }: AddCycleModalProps) => {
    const dispatch = useAppDispatch();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            
            // Format dates from dayjs back to YYYY-MM-DD
            const formattedValues = {
                ...values,
                evaluationPeriodStart: values.evaluationPeriod[0].format("YYYY-MM-DD"),
                evaluationPeriodEnd: values.evaluationPeriod[1].format("YYYY-MM-DD"),
                selfEvaluationStart: values.selfEvaluationPeriod[0].format("YYYY-MM-DD"),
                selfEvaluationEnd: values.selfEvaluationPeriod[1].format("YYYY-MM-DD"),
                managerEvaluationStart: values.managerEvaluationPeriod[0].format("YYYY-MM-DD"),
                managerEvaluationEnd: values.managerEvaluationPeriod[1].format("YYYY-MM-DD"),
                reviewMeetingStart: values.reviewMeetingPeriod?.[0]?.format("YYYY-MM-DD"),
                reviewMeetingEnd: values.reviewMeetingPeriod?.[1]?.format("YYYY-MM-DD"),
            };

            setLoading(true);
            await dispatch(createCycle(formattedValues)).unwrap();
            message.success("Evaluation cycle created as Draft");
            form.resetFields();
            onSuccess();
        } catch (error: any) {
            message.error(error?.message || "Operation failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="Create New Performance Cycle"
            open={open}
            onOk={handleOk}
            onCancel={onCancel}
            confirmLoading={loading}
            width={800}
            destroyOnHidden
        >
            <Form form={form} layout="vertical">
                <Row gutter={16}>
                    <Col span={16}>
                        <Form.Item
                            name="cycleName"
                            label="Cycle Name"
                            rules={[{ required: true, message: "Required" }]}
                        >
                            <Input placeholder="e.g. Annual Performance Review 2026" />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            name="cycleType"
                            label="Type"
                            rules={[{ required: true, message: "Required" }]}
                        >
                            <Select placeholder="Select type">
                                <Select.Option value="Annual">Annual</Select.Option>
                                <Select.Option value="Semi-annual">Semi-annual</Select.Option>
                                <Select.Option value="Quarterly">Quarterly</Select.Option>
                                <Select.Option value="Probation">Probation</Select.Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="evaluationPeriod"
                            label="Evaluation Review Period"
                            rules={[{ required: true, message: "Required" }]}
                        >
                            <RangePicker style={{ width: "100%" }} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="selfEvaluationPeriod"
                            label="Self-Evaluation Period"
                            rules={[{ required: true, message: "Required" }]}
                        >
                            <RangePicker style={{ width: "100%" }} />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="managerEvaluationPeriod"
                            label="Manager Evaluation Period"
                            rules={[{ required: true, message: "Required" }]}
                        >
                            <RangePicker style={{ width: "100%" }} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="reviewMeetingPeriod"
                            label="Review Meeting Period (Optional)"
                        >
                            <RangePicker style={{ width: "100%" }} />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Modal>
    );
};

export default AddCycleModal;
