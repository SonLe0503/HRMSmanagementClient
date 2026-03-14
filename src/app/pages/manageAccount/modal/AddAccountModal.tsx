import { useEffect } from "react";
import { Modal, Form, Input, Select, Switch, message } from "antd";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { createUser, selectUserLoading } from "../../../../store/userSlide";
import { selectRoles } from "../../../../store/roleSlide";
import { fetchAllEmployees, selectEmployees } from "../../../../store/employeeSlide";

interface AddAccountModalProps {
    open: boolean;
    onCancel: () => void;
    onSuccess: () => void;
}

const AddAccountModal = ({ open, onCancel, onSuccess }: AddAccountModalProps) => {
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

    const onFinish = (values: any) => {
        dispatch(createUser(values)).then((res: any) => {
            if (!res.error) {
                message.success("User created successfully");
                form.resetFields();
                onSuccess();
            } else {
                const error = res.payload;
                const msg = typeof error === 'string' ? error : error?.message || "Failed to create user";
                message.error(msg);
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
                    <Input disabled placeholder="Email will be auto-filled" />
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
