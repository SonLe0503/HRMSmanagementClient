import { Modal, Input, Button, Form } from "antd";

interface RejectHRProcedureModalProps {
    open: boolean;
    onCancel: () => void;
    onSubmit: (reason: string) => void;
}

const RejectHRProcedureModal = ({ open, onCancel, onSubmit }: RejectHRProcedureModalProps) => {
    const [form] = Form.useForm();

    const handleFinish = (values: { reason: string }) => {
        onSubmit(values.reason);
        form.resetFields();
    };

    return (
        <Modal 
            title="Từ chối yêu cầu Thủ tục HR" 
            open={open} 
            onCancel={() => { form.resetFields(); onCancel(); }}
            footer={[
                <Button key="cancel" onClick={onCancel}>
                    Hủy
                </Button>,
                <Button key="submit" type="primary" danger onClick={() => form.submit()}>
                    Xác nhận từ chối
                </Button>,
            ]}
            destroyOnHidden
        >
            <Form form={form} layout="vertical" onFinish={handleFinish}>
                <Form.Item 
                    name="reason" 
                    label="Lý do từ chối" 
                    rules={[
                        { required: true, message: "Vui lòng nhập lý do từ chối (bắt buộc)" },
                        { min: 5, message: "Lý do phải có ít nhất 5 ký tự" }
                    ]}
                >
                    <Input.TextArea rows={4} placeholder="Nhập lý do từ chối thủ tục này..." />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default RejectHRProcedureModal;
