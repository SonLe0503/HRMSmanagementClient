import { Modal, Form, Input, Select, message } from "antd";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { updateDepartment, selectDepartmentLoading } from "../../../../store/departmentSlide";
import { useEffect } from "react";
import { fetchDepartmentById } from "../../../../store/departmentSlide";
import { fetchAllEmployees, selectEmployees } from "../../../../store/employeeSlide";

interface EditDepartmentModalProps {
    open: boolean;
    onCancel: () => void;
    departmentId: number;
    initialValues: any;
}

const EditDepartmentModal = ({ open, onCancel, departmentId, initialValues }: EditDepartmentModalProps) => {
    const [form] = Form.useForm();
    const dispatch = useAppDispatch();
    const loading = useAppSelector(selectDepartmentLoading);
    const employees = useAppSelector(selectEmployees);

    useEffect(() => {
        if (open) {
            dispatch(fetchAllEmployees());
        }
    }, [open, dispatch]);

    useEffect(() => {
        if (open && initialValues) {
            form.setFieldsValue(initialValues);
        }
    }, [open, initialValues, form]);

    const onFinish = (values: any) => {
        dispatch(updateDepartment({ id: departmentId, data: values })).then((res: any) => {
            if (!res.error) {
                message.success("Department updated successfully (MSG-94)");
                form.resetFields();
                onCancel();
                dispatch(fetchDepartmentById(departmentId));
            } else {
                const error = res.payload;
                const msg = typeof error === 'string' ? error : error?.message || "Failed to update department";
                message.error(msg);
            }
        });
    };

    return (
        <Modal
            title="Edit Department"
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
                    name="managerId"
                    label="Manager"
                >
                    <Select disabled allowClear placeholder="Select manager" showSearch optionFilterProp="children">
                        {employees.map(e => (
                            <Select.Option key={e.employeeId} value={e.employeeId}>{e.fullName} ({e.employeeCode})</Select.Option>
                        ))}
                    </Select>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default EditDepartmentModal;
