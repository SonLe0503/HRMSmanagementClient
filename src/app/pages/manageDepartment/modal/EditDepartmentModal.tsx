import { Modal, Form, Input, Select, message } from "antd";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { updateDepartment, selectDepartmentLoading } from "../../../../store/departmentSlide";
import { useEffect } from "react";
import { fetchDepartmentById } from "../../../../store/departmentSlide";
import { fetchAllEmployees, selectEmployees } from "../../../../store/employeeSlide";
import { fetchAllUsers, selectUsers } from "../../../../store/userSlide";
import { EUserRole } from "../../../../interface/app";

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
    const users = useAppSelector(selectUsers);

    useEffect(() => {
        if (open) {
            dispatch(fetchAllEmployees());
            dispatch(fetchAllUsers());
        }
    }, [open, dispatch]);

    const managerUserIds = users
        .filter(u => u.roles.includes(EUserRole.MANAGE))
        .map(u => u.employeeId);

    const managerOptions = employees
        .filter(e => managerUserIds.includes(e.employeeId))
        .map(e => ({
            label: `${e.fullName} (${e.employeeCode})`,
            value: e.employeeId,
        }));

    useEffect(() => {
        if (open && initialValues) {
            form.setFieldsValue(initialValues);
        }
    }, [open, initialValues, form]);

    const onFinish = (values: any) => {
        dispatch(updateDepartment({ id: departmentId, data: values })).then((res: any) => {
            if (!res.error) {
                message.success("Cập nhật phòng ban thành công");
                form.resetFields();
                onCancel();
                dispatch(fetchDepartmentById(departmentId));
            } else {
                const error = res.payload;
                const msg = typeof error === 'string' ? error : error?.message || "Cập nhật phòng ban thất bại";
                message.error(msg);
            }
        });
    };

    return (
        <Modal
            title="Chỉnh sửa phòng ban"
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
                    name="departmentName"
                    label="Tên phòng ban"
                    rules={[{ required: true, message: "Vui lòng nhập tên phòng ban!" }]}
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
                    name="managerId"
                    label="Quản lý"
                >
                    <Select
                        allowClear
                        placeholder="Chọn quản lý"
                        showSearch
                        options={managerOptions}
                        filterOption={(input, option) =>
                            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                        }
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default EditDepartmentModal;
