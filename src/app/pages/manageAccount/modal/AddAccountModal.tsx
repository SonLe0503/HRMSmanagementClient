import { Modal, Form, Input, Select, Switch, message } from "antd";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { createUser, selectUserLoading } from "../../../../store/userSlide";
import { selectRoles } from "../../../../store/roleSlide";

interface AddAccountModalProps {
    open: boolean;
    onCancel: () => void;
    onSuccess: () => void;
}

const AddAccountModal = ({ open, onCancel, onSuccess }: AddAccountModalProps) => {
    const [form] = Form.useForm();
    const dispatch = useAppDispatch();
    const roles = useAppSelector(selectRoles);
    const loading = useAppSelector(selectUserLoading);

    const onFinish = (values: any) => {
        dispatch(createUser(values)).then((res: any) => {
            if (!res.error) {
                message.success("User created successfully");
                form.resetFields();
                onSuccess();
            } else {
                message.error(res.payload || "Failed to create user");
            }
        });
    };

    return (
        <Modal
            title="Add New User"
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
                initialValues={{ isActive: true }}
            >
                <Form.Item
                    name="username"
                    label="Username"
                    rules={[{ required: true, message: "Please input the username!" }]}
                >
                    <Input />
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

export default AddAccountModal;
