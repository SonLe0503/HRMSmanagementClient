import { Modal, Form, Input, message } from "antd";
import { useAppDispatch } from "../../../../store";
import { createTemplate } from "../../../../store/evaluationTemplateSlide";
import { useState } from "react";

interface AddTemplateModalProps {
    open: boolean;
    onCancel: () => void;
    onSuccess: () => void;
}

const AddTemplateModal = ({ open, onCancel, onSuccess }: AddTemplateModalProps) => {
    const dispatch = useAppDispatch();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);
            await dispatch(createTemplate(values)).unwrap();
            message.success("Template created successfully");
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
            title="Add New Evaluation Template"
            open={open}
            onOk={handleOk}
            onCancel={onCancel}
            confirmLoading={loading}
            destroyOnClose
        >
            <Form form={form} layout="vertical">
                <Form.Item
                    name="templateName"
                    label="Template Name"
                    rules={[{ required: true, message: "Please input template name!" }]}
                >
                    <Input placeholder="Enter template name" />
                </Form.Item>
                <Form.Item
                    name="description"
                    label="Description"
                >
                    <Input.TextArea rows={4} placeholder="Enter template description" />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default AddTemplateModal;
