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
            message.success("Tạo mẫu đánh giá thành công");
            form.resetFields();
            onSuccess();
        } catch (error: any) {
            message.error(error?.message || "Thao tác thất bại");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="Thêm mẫu đánh giá mới"
            open={open}
            onOk={handleOk}
            onCancel={onCancel}
            confirmLoading={loading}
            destroyOnHidden
        >
            <Form form={form} layout="vertical">
                <Form.Item
                    name="templateName"
                    label="Tên mẫu"
                    rules={[{ required: true, message: "Vui lòng nhập tên mẫu!" }]}
                >
                    <Input placeholder="Nhập tên mẫu" />
                </Form.Item>
                <Form.Item
                    name="description"
                    label="Mô tả"
                >
                    <Input.TextArea rows={4} placeholder="Nhập mô tả mẫu đánh giá" />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default AddTemplateModal;
