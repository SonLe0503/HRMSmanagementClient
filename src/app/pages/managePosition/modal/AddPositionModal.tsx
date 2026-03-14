import { Modal, Form, Input, InputNumber, message } from "antd";
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
                message.success("Position created successfully (MSG-98)");
                form.resetFields();
                onCancel();
                navigate(`/hr/manage-position/${res.payload.positionId}`);
            } else {
                const error = res.payload;
                const msg = typeof error === 'string' ? error : error?.message || "Failed to create position";
                message.error(msg);
            }
        });
    };

    return (
        <Modal
            title="Add New Position"
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
                    label="Position Code"
                    rules={[{ required: true, message: "Please input the position code!" }]}
                >
                    <Input maxLength={20} />
                </Form.Item>

                <Form.Item
                    name="positionName"
                    label="Position Name"
                    rules={[{ required: true, message: "Please input the position name!" }]}
                >
                    <Input maxLength={100} />
                </Form.Item>

                <Form.Item
                    name="description"
                    label="Description"
                >
                    <Input.TextArea maxLength={500} />
                </Form.Item>

                <Form.Item
                    name="level"
                    label="Level"
                    rules={[{ required: true, message: "Please input the level (1-10)!" }]}
                >
                    <InputNumber min={1} max={10} style={{ width: '100%' }} />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default AddPositionModal;
