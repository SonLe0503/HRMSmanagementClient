import { Modal, Form, Input, Select, message } from "antd";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { createRole, selectRoleLoading } from "../../../../store/roleSlide";
import { EUserRole } from "../../../../interface/app";

interface AddRoleModalProps {
    open: boolean;
    onCancel: () => void;
    onSuccess: () => void;
}

const AddRoleModal = ({ open, onCancel, onSuccess }: AddRoleModalProps) => {
    const [form] = Form.useForm();
    const dispatch = useAppDispatch();
    const loading = useAppSelector(selectRoleLoading);

    const onFinish = (values: any) => {
        dispatch(createRole(values))
            .unwrap()
            .then(() => {
                message.success("Role created successfully");
                form.resetFields();
                onSuccess();
            })
            .catch((error: any) => {
                const msg = typeof error === 'string' ? error : error?.message || "Failed to create role";
                message.error(msg);
            });
    };

    return (
        <Modal
            title="Add New Role"
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
                    name="roleName"
                    label="Role Name"
                    rules={[{ required: true, message: "Please select the role name!" }]}
                >
                    <Select placeholder="Select a role">
                        {Object.values(EUserRole).map((role) => (
                            <Select.Option key={role} value={role}>
                                {role}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item
                    name="description"
                    label="Description"
                >
                    <Input.TextArea rows={4} />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default AddRoleModal;
