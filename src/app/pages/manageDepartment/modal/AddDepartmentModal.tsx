import { Modal, Form, Input, Select, message } from "antd";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { createDepartment, selectDepartmentLoading } from "../../../../store/departmentSlide";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { fetchAllEmployees, selectEmployees } from "../../../../store/employeeSlide";
import { fetchAllUsers, selectUsers } from "../../../../store/userSlide";
import { EUserRole } from "../../../../interface/app";

interface AddDepartmentModalProps {
    open: boolean;
    onCancel: () => void;
}

const AddDepartmentModal = ({ open, onCancel }: AddDepartmentModalProps) => {
    const [form] = Form.useForm();
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
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

    const onFinish = (values: any) => {
        dispatch(createDepartment(values)).then((res: any) => {
            if (!res.error) {
                message.success("Tạo phòng ban thành công");
                form.resetFields();
                onCancel();
                navigate(`/hr/manage-department/${res.payload.departmentId}`);
            } else {
                const error = res.payload;
                const msg = typeof error === 'string' ? error : error?.message || "Tạo phòng ban thất bại";
                message.error(msg);
            }
        });
    };

    return (
        <Modal
            title="Thêm phòng ban mới"
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
                    label="Mã phòng ban"
                    rules={[{ required: true, message: "Vui lòng nhập mã phòng ban!" }]}
                >
                    <Input maxLength={20} />
                </Form.Item>

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
                    <Select allowClear placeholder="Chọn quản lý" showSearch optionFilterProp="children">
                        {managerOptions.map(e => (
                            <Select.Option key={e.value} value={e.value}>{e.label}</Select.Option>
                        ))}
                    </Select>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default AddDepartmentModal;
