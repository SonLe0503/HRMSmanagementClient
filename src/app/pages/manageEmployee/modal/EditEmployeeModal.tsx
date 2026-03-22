import { useEffect } from "react";
import { Modal, Form, Input, Select, DatePicker, InputNumber, message, Row, Col } from "antd";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { updateEmployee, fetchAllEmployees, selectEmployeeLoading } from "../../../../store/employeeSlide";
import type { IEmployeeDetail } from "../../../../store/employeeSlide";
import { selectInfoLogin } from "../../../../store/authSlide";
import { fetchActiveDepartments, selectActiveDepartments } from "../../../../store/departmentSlide";
import { fetchActivePositions, selectActivePositions } from "../../../../store/positionSlide";
import dayjs from "dayjs";

interface EditEmployeeModalProps {
    open: boolean;
    onCancel: () => void;
    onSuccess: () => void;
    editingEmployee: IEmployeeDetail | null;
}

// Đồng bộ với backend UpdateEmployeeDto
const STATUS_OPTIONS = ["Active", "Inactive", "On Leave", "Resigned", "Terminated", "Suspended"].map(v => ({ label: v, value: v }));
const TYPE_OPTIONS = ["Full-Time", "Part-Time", "Contract", "Intern"].map(v => ({ label: v, value: v }));
const GENDER_OPTIONS = ["Male", "Female", "Other"].map(v => ({ label: v, value: v }));

const EditEmployeeModal = ({ open, onCancel, onSuccess, editingEmployee }: EditEmployeeModalProps) => {
    const [form] = Form.useForm();
    const dispatch = useAppDispatch();
    const loading = useAppSelector(selectEmployeeLoading);
    const infoLogin = useAppSelector(selectInfoLogin);
    const activeDepartments = useAppSelector(selectActiveDepartments);
    const activePositions = useAppSelector(selectActivePositions);

    // Fetch danh sách phòng ban & chức vụ đang active khi modal mở
    useEffect(() => {
        if (open) {
            dispatch(fetchActiveDepartments());
            dispatch(fetchActivePositions());
        }
    }, [open, dispatch]);

    const departmentOptions = activeDepartments.map(d => ({
        label: d.departmentName,
        value: d.departmentId,
    }));

    const positionOptions = activePositions.map(p => ({
        label: p.positionName,
        value: p.positionId,
    }));

    useEffect(() => {
        if (editingEmployee && open) {
            form.setFieldsValue({
                employeeCode: editingEmployee.employeeCode,
                firstName: editingEmployee.firstName,
                lastName: editingEmployee.lastName,
                email: editingEmployee.email,
                phone: editingEmployee.phone,
                gender: editingEmployee.gender,
                address: editingEmployee.address,
                city: editingEmployee.city,
                country: editingEmployee.country,
                departmentId: editingEmployee.departmentId,
                positionId: editingEmployee.positionId,
                managerId: editingEmployee.managerId,
                employmentStatus: editingEmployee.employmentStatus,
                employmentType: editingEmployee.employmentType,
                baseSalary: editingEmployee.baseSalary,
                dateOfBirth: editingEmployee.dateOfBirth ? dayjs(editingEmployee.dateOfBirth) : null,
                joinDate: editingEmployee.joinDate ? dayjs(editingEmployee.joinDate) : null,
                resignationDate: editingEmployee.resignationDate ? dayjs(editingEmployee.resignationDate) : null,
            });
        }
    }, [editingEmployee, open, form]);

    const onFinish = (values: any) => {
        if (!editingEmployee) return;
        // Payload khớp đúng với UpdateEmployeeDto (không gửi employeeCode)
        const payload = {
            firstName: values.firstName,
            lastName: values.lastName,
            email: values.email,
            phone: values.phone || null,
            dateOfBirth: values.dateOfBirth ? values.dateOfBirth.format("YYYY-MM-DD") : null,
            gender: values.gender || null,
            address: values.address || null,
            city: values.city || null,
            country: values.country || null,
            departmentId: values.departmentId || null,
            positionId: values.positionId || null,
            managerId: values.managerId || null,
            joinDate: values.joinDate ? values.joinDate.format("YYYY-MM-DD") : null,
            resignationDate: values.resignationDate ? values.resignationDate.format("YYYY-MM-DD") : null,
            employmentStatus: values.employmentStatus,
            employmentType: values.employmentType,
            baseSalary: values.baseSalary ?? null,
            modifiedBy: infoLogin?.userId || null,
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
        <Modal
            title={`Chỉnh sửa: ${editingEmployee?.fullName ?? ""}`}
            open={open}
            onCancel={handleCancel}
            onOk={() => form.submit()}
            confirmLoading={loading}
            width={800}
            destroyOnHidden
        >
            <Form form={form} layout="vertical" onFinish={onFinish}>
                {/* Mã nhân viên chỉ hiển thị, không chỉnh sửa được */}
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="employeeCode" label="Mã nhân viên">
                            <Input disabled />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="email" label="Email" rules={[{ required: true, message: "Vui lòng nhập email" }, { type: "email", message: "Email không hợp lệ" }, { max: 100 }]}>
                            <Input />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="firstName" label="Họ" rules={[{ required: true, message: "Vui lòng nhập họ" }, { max: 50 }]}>
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="lastName" label="Tên" rules={[{ required: true, message: "Vui lòng nhập tên" }, { max: 50 }]}>
                            <Input />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="phone" label="Số điện thoại" rules={[{ max: 20 }]}>
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="gender" label="Giới tính">
                            <Select options={GENDER_OPTIONS} allowClear />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="dateOfBirth" label="Ngày sinh">
                            <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="joinDate" label="Ngày vào làm" rules={[{ required: true, message: "Vui lòng chọn ngày vào làm" }]}>
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
                        <Form.Item name="employmentStatus" label="Trạng thái" rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}>
                            <Select options={STATUS_OPTIONS} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="employmentType" label="Loại hình" rules={[{ required: true, message: "Vui lòng chọn loại hình" }]}>
                            <Select options={TYPE_OPTIONS} />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={8}>
                        {/* Bắt buộc chọn — hiển thị tên phòng ban từ API */}
                        <Form.Item name="departmentId" label="Phòng ban" rules={[{ required: true, message: "Vui lòng chọn phòng ban" }]}>
                            <Select
                                options={departmentOptions}
                                placeholder="Chọn phòng ban"
                                showSearch
                                filterOption={(input, option) =>
                                    (option?.label as string ?? "").toLowerCase().includes(input.toLowerCase())
                                }
                            />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        {/* Hiển thị tên chức vụ từ API */}
                        <Form.Item name="positionId" label="Chức vụ">
                            <Select
                                options={positionOptions}
                                placeholder="Chọn chức vụ"
                                allowClear
                                showSearch
                                filterOption={(input, option) =>
                                    (option?.label as string ?? "").toLowerCase().includes(input.toLowerCase())
                                }
                            />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="managerId" label="Quản lý (ID)">
                            <InputNumber style={{ width: "100%" }} min={1} />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="address" label="Địa chỉ" rules={[{ max: 200 }]}>
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item name="city" label="Thành phố" rules={[{ max: 50 }]}>
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item name="country" label="Quốc gia" rules={[{ max: 50 }]}>
                            <Input />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Modal>
    );
};

export default EditEmployeeModal;
