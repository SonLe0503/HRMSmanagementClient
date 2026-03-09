import { Modal, Form, Input, Select, DatePicker, InputNumber, message, Row, Col } from "antd";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { createEmployee, fetchAllEmployees, selectEmployeeLoading } from "../../../../store/employeeSlide";
import { selectInfoLogin } from "../../../../store/authSlide";
import dayjs from "dayjs";

interface AddEmployeeModalProps {
    open: boolean;
    onCancel: () => void;
    onSuccess: () => void;
}

const STATUS_OPTIONS = ["Active", "Inactive", "On Leave", "Resigned", "Terminated"].map(v => ({ label: v, value: v }));
const TYPE_OPTIONS = ["Full-Time", "Part-Time", "Contract", "Intern"].map(v => ({ label: v, value: v }));
const GENDER_OPTIONS = ["Male", "Female", "Other"].map(v => ({ label: v, value: v }));

const AddEmployeeModal = ({ open, onCancel, onSuccess }: AddEmployeeModalProps) => {
    const [form] = Form.useForm();
    const dispatch = useAppDispatch();
    const loading = useAppSelector(selectEmployeeLoading);
    const infoLogin = useAppSelector(selectInfoLogin);

    const onFinish = (values: any) => {
        const payload = {
            ...values,
            dateOfBirth: values.dateOfBirth ? values.dateOfBirth.format("YYYY-MM-DD") : null,
            joinDate: values.joinDate ? values.joinDate.format("YYYY-MM-DD") : null,
            departmentId: values.departmentId || null,
            positionId: values.positionId || null,
            managerId: values.managerId || null,
            baseSalary: values.baseSalary || 0,
            city: values.city || null,
            country: values.country || null,
            createdBy: infoLogin?.userId || null, // Thêm createdBy từ thông tin đăng nhập
        };
        dispatch(createEmployee(payload))
            .unwrap()
            .then(() => {
                message.success("Thêm nhân viên thành công!");
                form.resetFields();
                dispatch(fetchAllEmployees());
                onSuccess();
            })
            .catch((err: any) => {
                const errMsg = typeof err === "string" ? err : err?.message || "Thêm nhân viên thất bại!";
                message.error(errMsg);
                console.error("Create Employee Error:", err);
            });
    };

    return (
        <Modal title="Thêm nhân viên mới" open={open} onCancel={() => { form.resetFields(); onCancel(); }}
            onOk={() => form.submit()} confirmLoading={loading} width={800} destroyOnHidden>
            <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ employmentStatus: "Active", employmentType: "Full-time" }}>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="employeeCode" label="Mã nhân viên" rules={[{ required: true, message: "Vui lòng nhập mã" }, { max: 20 }]}>
                            <Input placeholder="VD: NV001" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="email" label="Email" rules={[{ required: true, message: "Vui lòng nhập email" }, { type: "email", message: "Email không hợp lệ" }]}>
                            <Input placeholder="example@company.com" />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="firstName" label="Họ" rules={[{ required: true, message: "Vui lòng nhập họ" }]}><Input /></Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="lastName" label="Tên" rules={[{ required: true, message: "Vui lòng nhập tên" }]}><Input /></Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="phone" label="Số điện thoại"><Input /></Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="gender" label="Giới tính">
                            <Select options={GENDER_OPTIONS} allowClear placeholder="Chọn giới tính" />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="dateOfBirth" label="Ngày sinh">
                            <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" disabledDate={d => d && d > dayjs().subtract(18, "year")} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="joinDate" label="Ngày vào làm" rules={[{ required: true, message: "Vui lòng chọn ngày" }]}>
                            <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="employmentStatus" label="Trạng thái" rules={[{ required: true }]}>
                            <Select options={STATUS_OPTIONS} placeholder="Chọn trạng thái" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="employmentType" label="Loại hình" rules={[{ required: true }]}>
                            <Select options={TYPE_OPTIONS} placeholder="Chọn loại hình" />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item name="departmentId" label="Phòng ban">
                            <InputNumber style={{ width: "100%" }} min={1} placeholder="ID" />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="positionId" label="Chức vụ">
                            <InputNumber style={{ width: "100%" }} min={1} placeholder="ID" />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="managerId" label="Quản lý">
                            <InputNumber style={{ width: "100%" }} min={1} placeholder="ID" />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={24}>
                        <Form.Item name="address" label="Địa chỉ cụ thể"><Input /></Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="city" label="Thành phố"><Input /></Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="country" label="Quốc gia"><Input /></Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={24}>
                        <Form.Item name="baseSalary" label="Lương cơ bản">
                            <InputNumber style={{ width: "100%" }} formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")} min={0} placeholder="VND" />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Modal>
    );
};

export default AddEmployeeModal;
