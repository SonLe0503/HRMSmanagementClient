import { Modal, Form, Input, Select, DatePicker, message, Row, Col, Alert, Steps } from "antd";
import { useAppDispatch } from "../../../../store";
import { createCycle } from "../../../../store/evaluationCycleSlide";
import { useState } from "react";
import { Dayjs } from "dayjs";

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

    // Track selected ranges for cascading constraints
    const evaluationPeriod = Form.useWatch("evaluationPeriod", form);
    const selfEvaluationPeriod = Form.useWatch("selfEvaluationPeriod", form);
    const managerEvaluationPeriod = Form.useWatch("managerEvaluationPeriod", form);

    const handleOk = async () => {
        try {
            const values = await form.validateFields();

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
            message.success("Chu kỳ đánh giá đã được tạo thành công (Draft)");
            form.resetFields();
            onSuccess();
        } catch (error: any) {
            message.error(error?.message || "Tạo chu kỳ thất bại");
        } finally {
            setLoading(false);
        }
    };

    // Cascade: disable dates BEFORE the end of the previous phase
    const disableSelfEvalDates = (current: Dayjs) => {
        if (!evaluationPeriod?.[1]) return false;
        // Self-eval must start on or after Evaluation Period End
        return current.isBefore(evaluationPeriod[1], "day");
    };

    const disableManagerEvalDates = (current: Dayjs) => {
        if (!selfEvaluationPeriod?.[1]) return false;
        // Manager eval must start on or after Self-Evaluation End
        return current.isBefore(selfEvaluationPeriod[1], "day");
    };

    const disableReviewMeetingDates = (current: Dayjs) => {
        if (!managerEvaluationPeriod?.[1]) return false;
        // Review meeting must start on or after Manager Evaluation End
        return current.isBefore(managerEvaluationPeriod[1], "day");
    };

    // Clear downstream fields when upstream changes
    const handleEvaluationPeriodChange = () => {
        form.setFieldsValue({
            selfEvaluationPeriod: undefined,
            managerEvaluationPeriod: undefined,
            reviewMeetingPeriod: undefined,
        });
    };

    const handleSelfEvalChange = () => {
        form.setFieldsValue({
            managerEvaluationPeriod: undefined,
            reviewMeetingPeriod: undefined,
        });
    };

    const handleManagerEvalChange = () => {
        form.setFieldsValue({
            reviewMeetingPeriod: undefined,
        });
    };

    // Determine current step for the visual timeline
    const currentStep = managerEvaluationPeriod ? 3
        : selfEvaluationPeriod ? 2
        : evaluationPeriod ? 1
        : 0;

    return (
        <Modal
            title="Tạo chu kỳ đánh giá hiệu suất"
            open={open}
            onOk={handleOk}
            onCancel={() => { form.resetFields(); onCancel(); }}
            confirmLoading={loading}
            width={800}
            destroyOnHidden
            okText="Tạo mới"
            cancelText="Hủy"
        >
            <Alert
                type="info"
                showIcon
                message="Quy trình đánh giá theo 4 giai đoạn tuần tự"
                description="Kỳ đánh giá → Nhân viên tự đánh giá → Quản lý đánh giá → Họp tổng kết. Mỗi giai đoạn phải bắt đầu sau khi giai đoạn trước kết thúc."
                style={{ marginBottom: 16 }}
            />

            <Steps
                size="small"
                current={currentStep}
                style={{ marginBottom: 24 }}
                items={[
                    { title: "Kỳ đánh giá", description: evaluationPeriod ? `${evaluationPeriod[0]?.format("DD/MM")} - ${evaluationPeriod[1]?.format("DD/MM")}` : "Chưa chọn" },
                    { title: "Tự đánh giá", description: selfEvaluationPeriod ? `${selfEvaluationPeriod[0]?.format("DD/MM")} - ${selfEvaluationPeriod[1]?.format("DD/MM")}` : "Chưa chọn" },
                    { title: "QL đánh giá", description: managerEvaluationPeriod ? `${managerEvaluationPeriod[0]?.format("DD/MM")} - ${managerEvaluationPeriod[1]?.format("DD/MM")}` : "Chưa chọn" },
                    { title: "Họp tổng kết" },
                ]}
            />

            <Form form={form} layout="vertical">
                <Row gutter={16}>
                    <Col span={16}>
                        <Form.Item
                            name="cycleName"
                            label="Tên chu kỳ"
                            rules={[{ required: true, message: "Vui lòng nhập tên chu kỳ" }]}
                        >
                            <Input placeholder="VD: Đánh giá hiệu suất năm 2026" />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            name="cycleType"
                            label="Loại chu kỳ"
                            rules={[{ required: true, message: "Chọn loại" }]}
                        >
                            <Select placeholder="Chọn loại">
                                <Select.Option value="Annual">Hằng năm</Select.Option>
                                <Select.Option value="Semi-annual">Nửa năm</Select.Option>
                                <Select.Option value="Quarterly">Hằng quý</Select.Option>
                                <Select.Option value="Probation">Thử việc</Select.Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                {/* Phase 1: Evaluation Period */}
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="evaluationPeriod"
                            label="① Kỳ đánh giá (khoảng thời gian làm việc được xét)"
                            rules={[{ required: true, message: "Bắt buộc" }]}
                            tooltip="Khoảng thời gian làm việc thực tế mà nhân viên được đánh giá"
                        >
                            <RangePicker
                                style={{ width: "100%" }}
                                format="DD/MM/YYYY"
                                onChange={handleEvaluationPeriodChange}
                            />
                        </Form.Item>
                    </Col>

                    {/* Phase 2: Self Evaluation */}
                    <Col span={12}>
                        <Form.Item
                            name="selfEvaluationPeriod"
                            label="② Tự đánh giá (nhân viên tự chấm)"
                            rules={[{ required: true, message: "Bắt buộc" }]}
                            tooltip="Nhân viên tự đánh giá bản thân. Phải bắt đầu sau khi Kỳ đánh giá kết thúc."
                        >
                            <RangePicker
                                style={{ width: "100%" }}
                                format="DD/MM/YYYY"
                                disabled={!evaluationPeriod}
                                disabledDate={disableSelfEvalDates}
                                onChange={handleSelfEvalChange}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    {/* Phase 3: Manager Evaluation */}
                    <Col span={12}>
                        <Form.Item
                            name="managerEvaluationPeriod"
                            label="③ Quản lý đánh giá (sau khi nhân viên tự chấm xong)"
                            rules={[{ required: true, message: "Bắt buộc" }]}
                            tooltip="Quản lý xem bài tự đánh giá và chấm điểm. Phải bắt đầu sau khi giai đoạn Tự đánh giá kết thúc."
                        >
                            <RangePicker
                                style={{ width: "100%" }}
                                format="DD/MM/YYYY"
                                disabled={!selfEvaluationPeriod}
                                disabledDate={disableManagerEvalDates}
                                onChange={handleManagerEvalChange}
                            />
                        </Form.Item>
                    </Col>

                    {/* Phase 4: Review Meeting */}
                    <Col span={12}>
                        <Form.Item
                            name="reviewMeetingPeriod"
                            label="④ Họp tổng kết (không bắt buộc)"
                            tooltip="Họp trực tiếp giữa nhân viên và quản lý để trao đổi kết quả. Phải sau khi Quản lý đánh giá kết thúc."
                        >
                            <RangePicker
                                style={{ width: "100%" }}
                                format="DD/MM/YYYY"
                                disabled={!managerEvaluationPeriod}
                                disabledDate={disableReviewMeetingDates}
                            />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Modal>
    );
};

export default AddCycleModal;
