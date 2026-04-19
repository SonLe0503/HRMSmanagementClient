import { Modal, Form, Input, InputNumber, message, Checkbox } from "antd";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { createPosition, selectPositionLoading } from "../../../../store/positionSlide";
import { useNavigate } from "react-router-dom";

interface AddPositionModalProps {
    open: boolean;
    onCancel: () => void;
}

const AddPositionModal = ({ open, onCancel }: AddPositionModalProps) => {
    const [form] = Form.useForm();
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const loading = useAppSelector(selectPositionLoading);

    const onFinish = (values: any) => {
        dispatch(createPosition(values)).then((res: any) => {
            if (!res.error) {
                message.success("Tạo chức vụ thành công");
                form.resetFields();
                onCancel();
                navigate(`/hr/manage-position/${res.payload.positionId}`);
            } else {
                const error = res.payload;
                const msg = typeof error === 'string' ? error : error?.message || "Tạo chức vụ thất bại";
                message.error(msg);
            }
        });
    };

    return (
        <Modal
            title="Thêm chức vụ mới"
            open={open}
            onCancel={() => {
                form.resetFields();
                onCancel();
            }}
            onOk={() => form.submit()}
            confirmLoading={loading}
            destroyOnHidden
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                initialValues={{ level: 1 }}
            >
                <Form.Item
                    name="positionCode"
                    label="Mã chức vụ"
                    rules={[{ required: true, message: "Vui lòng nhập mã chức vụ!" }]}
                >
                    <Input maxLength={20} />
                </Form.Item>

                <Form.Item
                    name="positionName"
                    label="Tên chức vụ"
                    rules={[{ required: true, message: "Vui lòng nhập tên chức vụ!" }]}
                >
                    <Input maxLength={100} />
                </Form.Item>

                <Form.Item
                    name="description"
                    label="Mô tả"
                >
                    <Input.TextArea maxLength={500} />
                </Form.Item>

                <Form.Item
                    name="level"
                    label="Cấp bậc"
                    rules={[{ required: true, message: "Vui lòng nhập cấp bậc (1-10)!" }]}
                >
                    <InputNumber min={1} max={10} style={{ width: '100%' }} />
                </Form.Item>

                <Form.Item
                    name="isTopLevel"
                    valuePropName="checked"
                >
                    <Checkbox>Là chức vụ quản lý cấp cao</Checkbox>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default AddPositionModal;
