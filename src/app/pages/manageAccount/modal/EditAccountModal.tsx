import { useEffect } from "react";
import { Modal, Form, Input, Select, Switch, message } from "antd";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { updateUser, selectUserLoading } from "../../../../store/userSlide";
import { selectRoles } from "../../../../store/roleSlide";

interface EditAccountModalProps {
    open: boolean;
    onCancel: () => void;
    onSuccess: () => void;
    editingUser: any;
}

const EditAccountModal = ({ open, onCancel, onSuccess, editingUser }: EditAccountModalProps) => {
    const [form] = Form.useForm();
    const dispatch = useAppDispatch();
    const roles = useAppSelector(selectRoles);
    const loading = useAppSelector(selectUserLoading);

    useEffect(() => {
        if (open && editingUser) {
            const roleIds = roles
                .filter((r) => editingUser.roles.includes(r.roleName))
                .map((r) => r.roleId);

            form.setFieldsValue({
                ...editingUser,
                roleIds: roleIds,
            });
        }
    }, [open, editingUser, roles, form]);

    const onFinish = (values: any) => {
        dispatch(updateUser({ id: editingUser.userId, data: values })).then((res: any) => {
            if (!res.error) {
                message.success("User updated successfully");
                onSuccess();
            } else {
                message.error(res.payload || "Failed to update user");
            }
        });
    };

    return (
        <Modal
            title="Edit User"
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
                    name="username"
                    label="Username"
                >
                    <Input disabled />
                </Form.Item>

                <Form.Item
                    name="email"
                    label="Email"
                    rules={[
                        { required: true, message: "Please input the email!" },
                        { type: "email", message: "Please enter a valid email!" },
                    ]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    name="roleIds"
                    label="Roles"
                    rules={[{ required: true, message: "Please select at least one role!" }]}
                >
                    <Select mode="multiple" placeholder="Select roles">
                        {roles.map((role) => (
                            <Select.Option key={role.roleId} value={role.roleId}>
                                {role.roleName}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item name="isActive" label="Active Status" valuePropName="checked">
                    <Switch />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default EditAccountModal;
