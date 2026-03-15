import { Modal, Form, Input, InputNumber, message } from "antd";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { updatePosition, selectPositionLoading, fetchPositionById } from "../../../../store/positionSlide";
import { useEffect } from "react";

interface EditPositionModalProps {
    open: boolean;
    onCancel: () => void;
    positionId: number;
    initialValues: any;
}

const EditPositionModal = ({ open, onCancel, positionId, initialValues }: EditPositionModalProps) => {
    const [form] = Form.useForm();
    const dispatch = useAppDispatch();
    const loading = useAppSelector(selectPositionLoading);

    useEffect(() => {
        if (open) {
            form.setFieldsValue(initialValues);
        }
    }, [open, initialValues, form]);

    const onFinish = (values: any) => {
        dispatch(updatePosition({ id: positionId, data: values })).then((res: any) => {
            if (!res.error) {
                message.success("Position updated successfully (MSG-99)");
                form.resetFields();
                onCancel();
                dispatch(fetchPositionById(positionId));
            } else {
                const error = res.payload;
                const msg = typeof error === 'string' ? error : error?.message || "Failed to update position";
                message.error(msg);
            }
        });
    };

    return (
        <Modal
            title="Edit Position"
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

export default EditPositionModal;
