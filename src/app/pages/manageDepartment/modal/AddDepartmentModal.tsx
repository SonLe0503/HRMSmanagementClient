import { Modal, Form, Input, Select, message } from "antd";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { createDepartment, selectDepartmentLoading, fetchActiveDepartments, selectActiveDepartments } from "../../../../store/departmentSlide";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { fetchAllEmployees, selectEmployees } from "../../../../store/employeeSlide";

interface AddDepartmentModalProps {
    open: boolean;
    onCancel: () => void;
}

const AddDepartmentModal = ({ open, onCancel }: AddDepartmentModalProps) => {
    const [form] = Form.useForm();
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const loading = useAppSelector(selectDepartmentLoading);
    const activeDepartments = useAppSelector(selectActiveDepartments);
    const employees = useAppSelector(selectEmployees);

    useEffect(() => {
        if (open) {
            dispatch(fetchActiveDepartments());
            dispatch(fetchAllEmployees());
        }
    }, [open, dispatch]);

    const onFinish = (values: any) => {
        dispatch(createDepartment(values)).then((res: any) => {
            if (!res.error) {
                message.success("Department created successfully (MSG-93)");
                form.resetFields();
                onCancel();
                navigate(`/hr/manage-department/${res.payload.departmentId}`);
            } else {
                const error = res.payload;
                const msg = typeof error === 'string' ? error : error?.message || "Failed to create department";
                message.error(msg);
            }
        });
    };

    return (
        <Modal
            title="Add New Department"
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
                    name="departmentCode"
                    label="Department Code"
                    rules={[{ required: true, message: "Please input the department code!" }]}
                >
                    <Input maxLength={20} />
                </Form.Item>

                <Form.Item
                    name="departmentName"
                    label="Department Name"
                    rules={[{ required: true, message: "Please input the department name!" }]}
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
                    name="parentDepartmentId"
                    label="Parent Department"
                >
                    <Select allowClear placeholder="Select parent department" showSearch optionFilterProp="children">
                        {activeDepartments.map(d => (
                            <Select.Option key={d.departmentId} value={d.departmentId}>{d.departmentName}</Select.Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item
                    name="managerId"
                    label="Manager"
                >
                    <Select allowClear placeholder="Select manager" showSearch optionFilterProp="children">
                        {employees.map(e => (
                            <Select.Option key={e.employeeId} value={e.employeeId}>{e.fullName} ({e.employeeCode})</Select.Option>
                        ))}
                    </Select>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default AddDepartmentModal;
