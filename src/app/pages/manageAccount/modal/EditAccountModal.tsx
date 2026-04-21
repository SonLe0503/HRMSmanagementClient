import { useEffect } from "react";
import { Modal, Form, Input, Select, Switch, message } from "antd";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { updateUser, selectUserLoading } from "../../../../store/userSlide";
import { selectRoles } from "../../../../store/roleSlide";
import { fetchAllEmployees, selectEmployees } from "../../../../store/employeeSlide";

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
    const employees = useAppSelector(selectEmployees);
    const loading = useAppSelector(selectUserLoading);

    useEffect(() => {
        if (open && employees.length === 0) {
            dispatch(fetchAllEmployees());
        }
    }, [open, employees.length, dispatch]);

    useEffect(() => {
        if (open && editingUser) {
            const roleIds = roles
                .filter((r) => editingUser.roles.includes(r.roleName))
                .map((r) => r.roleId);

            form.setFieldsValue({
                ...editingUser,
                roleId: roleIds.length > 0 ? roleIds[0] : undefined,
            });
        }
    }, [open, editingUser, roles, form]);

    const onFinish = (values: any) => {
        dispatch(updateUser({ id: editingUser.userId, data: values })).then((res: any) => {
            if (!res.error) {
                message.success("User updated successfully");
                onSuccess();
            } else {
                const error = res.payload;
                const msg = typeof error === 'string' ? error : error?.message || "Failed to update user";
                message.error(msg);
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
                    name="employeeId"
                    label="Employee"
                    rules={[{ required: true, message: "Please select an employee!" }]}
                >
                    <Select
                        showSearch
                        placeholder="Select an employee"
                        optionFilterProp="children"
                        onChange={(value) => {
                            const emp = employees.find(e => e.employeeId === value);
                            if (emp) {
                                form.setFieldsValue({ email: emp.email });
                            }
                        }}
                    >
                        {employees.map((emp) => (
                            <Select.Option key={emp.employeeId} value={emp.employeeId}>
                                {emp.fullName} ({emp.employeeCode})
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item
                    name="email"
                    label="Email"
                    rules={[
                        { required: true, message: "Please input the email!" },
                        { type: "email", message: "Please enter a valid email!" },
                    ]}
                >
                    <Input disabled />
                </Form.Item>

                <Form.Item
                    name="roleIds"
                    label="Role"
                    rules={[{ required: true, message: "Please select a role!" }]}
                >
                    <Select placeholder="Select a role">
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
