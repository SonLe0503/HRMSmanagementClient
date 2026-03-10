import { useEffect } from "react";
import { Modal, Form, Input, Select, DatePicker, InputNumber, message, Row, Col } from "antd";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { updateEmployee, fetchAllEmployees, selectEmployeeLoading } from "../../../../store/employeeSlide";
import type { IEmployeeDetail } from "../../../../store/employeeSlide";
import dayjs from "dayjs";

interface EditEmployeeModalProps {
    open: boolean;
    onCancel: () => void;
    onSuccess: () => void;
    editingEmployee: IEmployeeDetail | null;
}

const STATUS_OPTIONS = ["Active", "Inactive", "On Leave", "Resigned", "Terminated"].map(v => ({ label: v, value: v }));
const TYPE_OPTIONS = ["Full-time", "Part-time", "Contract", "Intern"].map(v => ({ label: v, value: v }));
const GENDER_OPTIONS = ["Male", "Female", "Other"].map(v => ({ label: v, value: v }));

const EditEmployeeModal = ({ open, onCancel, onSuccess, editingEmployee }: EditEmployeeModalProps) => {
    const [form] = Form.useForm();
    const dispatch = useAppDispatch();
    const loading = useAppSelector(selectEmployeeLoading);

    useEffect(() => {
        if (editingEmployee && open) {
            form.setFieldsValue({
                ...editingEmployee,
                dateOfBirth: editingEmployee.dateOfBirth ? dayjs(editingEmployee.dateOfBirth) : null,
                joinDate: editingEmployee.joinDate ? dayjs(editingEmployee.joinDate) : null,
                resignationDate: editingEmployee.resignationDate ? dayjs(editingEmployee.resignationDate) : null,
            });
        }
    }, [editingEmployee, open, form]);

    const onFinish = (values: any) => {
        if (!editingEmployee) return;
        const payload = {
            ...values,
            dateOfBirth: values.dateOfBirth ? values.dateOfBirth.format("YYYY-MM-DD") : null,
            joinDate: values.joinDate ? values.joinDate.format("YYYY-MM-DD") : null,
            resignationDate: values.resignationDate ? values.resignationDate.format("YYYY-MM-DD") : null,
        };
        dispatch(updateEmployee({ id: editingEmployee.employeeId, data: payload }))
            .unwrap()
            .then(() => {
                message.success("Cập nhật nhân viên thành công!");
                dispatch(fetchAllEmployees());
                onSuccess();
            })
            .catch((err: any) => {
                message.error(typeof err === "string" ? err : err?.message || "Cập nhật thất bại!");
            });
    };

    const handleCancel = () => {
        if (form.isFieldsTouched()) {
            Modal.confirm({
                title: "Xác nhận hủy",
                content: "Bạn có chắc chắn muốn hủy bỏ các thay đổi không?",
                okText: "Đồng ý",
                cancelText: "Hủy",
                onOk: () => {
                    form.resetFields();
                    onCancel();
                },
            });
        } else {
            form.resetFields();
            onCancel();
        }
    };

    return (
        <Modal title={`Chỉnh sửa: ${editingEmployee?.fullName ?? ""}`} open={open}
            onCancel={handleCancel}
            onOk={() => form.submit()} confirmLoading={loading} width={800} destroyOnHidden>
            <Form form={form} layout="vertical" onFinish={onFinish}>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="employeeCode" label="Mã nhân viên" rules={[{ required: true }, { max: 20 }]}><Input /></Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="email" label="Email" rules={[{ required: true }, { type: "email" }]}><Input /></Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="firstName" label="Họ" rules={[{ required: true }]}><Input /></Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="lastName" label="Tên" rules={[{ required: true }]}><Input /></Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="phone" label="Số điện thoại"><Input /></Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="gender" label="Giới tính"><Select options={GENDER_OPTIONS} allowClear /></Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="dateOfBirth" label="Ngày sinh">
                            <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="joinDate" label="Ngày vào làm" rules={[{ required: true }]}>
                            <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="resignationDate" label="Ngày nghỉ việc">
                            <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="baseSalary" label="Lương cơ bản">
                            <InputNumber style={{ width: "100%" }} formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")} min={0} />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="employmentStatus" label="Trạng thái" rules={[{ required: true }]}>
                            <Select options={STATUS_OPTIONS} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="employmentType" label="Loại hình" rules={[{ required: true }]}>
                            <Select options={TYPE_OPTIONS} />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={8}><Form.Item name="departmentId" label="Phòng ban"><InputNumber style={{ width: "100%" }} min={1} /></Form.Item></Col>
                    <Col span={8}><Form.Item name="positionId" label="Chức vụ"><InputNumber style={{ width: "100%" }} min={1} /></Form.Item></Col>
                    <Col span={8}><Form.Item name="managerId" label="Quản lý"><InputNumber style={{ width: "100%" }} min={1} /></Form.Item></Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}><Form.Item name="address" label="Địa chỉ"><Input /></Form.Item></Col>
                    <Col span={6}><Form.Item name="city" label="Thành phố"><Input /></Form.Item></Col>
                    <Col span={6}><Form.Item name="country" label="Quốc gia"><Input /></Form.Item></Col>
                </Row>
            </Form>
        </Modal>
    );
};

export default EditEmployeeModal;
