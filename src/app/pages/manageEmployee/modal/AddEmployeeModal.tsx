import { Modal, Form, Input, Select, DatePicker, InputNumber, message, Row, Col } from "antd";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { createEmployee, fetchAllEmployees, selectEmployeeLoading } from "../../../../store/employeeSlide";
import dayjs from "dayjs";

interface AddEmployeeModalProps {
    open: boolean;
    onCancel: () => void;
    onSuccess: () => void;
}

const EMPLOYMENT_STATUS_OPTIONS = ["Active", "Inactive", "On Leave", "Resigned", "Terminated"].map((v) => ({ label: v, value: v }));
const EMPLOYMENT_TYPE_OPTIONS = ["Full-time", "Part-time", "Contract", "Intern"].map((v) => ({ label: v, value: v }));
const GENDER_OPTIONS = ["Male", "Female", "Other"].map((v) => ({ label: v, value: v }));

const AddEmployeeModal = ({ open, onCancel, onSuccess }: AddEmployeeModalProps) => {
    const [form] = Form.useForm();
    const dispatch = useAppDispatch();
    const loading = useAppSelector(selectEmployeeLoading);

    const onFinish = (values: any) => {
        const payload = {
            ...values,
            dateOfBirth: values.dateOfBirth ? values.dateOfBirth.format("YYYY-MM-DD") : null,
            joinDate: values.joinDate ? values.joinDate.format("YYYY-MM-DD") : null,
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
                const msg = typeof err === "string" ? err : err?.message || "Thêm nhân viên thất bại!";
                message.error(msg);
            });
    };

    return (
        <Modal
            title="Thêm nhân viên mới"
            open={open}
            onCancel={() => { form.resetFields(); onCancel(); }}
            onOk={() => form.submit()}
            confirmLoading={loading}
            width={800}
            destroyOnHidden
        >
            <Form form={form} layout="vertical" onFinish={onFinish}>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="employeeCode" label="Mã nhân viên" rules={[{ required: true, message: "Vui lòng nhập mã nhân viên!" }, { max: 20 }]}>
                            <Input placeholder="VD: NV001" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="email" label="Email" rules={[{ required: true, message: "Vui lòng nhập email!" }, { type: "email", message: "Email không hợp lệ!" }]}>
                            <Input placeholder="example@company.com" />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="firstName" label="Họ" rules={[{ required: true, message: "Vui lòng nhập họ!" }]}>
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="lastName" label="Tên" rules={[{ required: true, message: "Vui lòng nhập tên!" }]}>
                            <Input />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="phone" label="Số điện thoại">
                            <Input placeholder="0xxxxxxxxx" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="gender" label="Giới tính">
                            <Select options={GENDER_OPTIONS} placeholder="Chọn giới tính" allowClear />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="dateOfBirth" label="Ngày sinh">
                            <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" placeholder="DD/MM/YYYY" disabledDate={(d) => d && d > dayjs().subtract(18, "year")} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="joinDate" label="Ngày vào làm" rules={[{ required: true, message: "Vui lòng chọn ngày vào làm!" }]}>
                            <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" placeholder="DD/MM/YYYY" />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="employmentStatus" label="Trạng thái" rules={[{ required: true, message: "Vui lòng chọn trạng thái!" }]}>
                            <Select options={EMPLOYMENT_STATUS_OPTIONS} placeholder="Chọn trạng thái" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="employmentType" label="Loại hình" rules={[{ required: true, message: "Vui lòng chọn loại hình!" }]}>
                            <Select options={EMPLOYMENT_TYPE_OPTIONS} placeholder="Chọn loại hình" />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item name="departmentId" label="Phòng ban">
                            <InputNumber style={{ width: "100%" }} placeholder="Department ID" min={1} />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="positionId" label="Chức vụ">
                            <InputNumber style={{ width: "100%" }} placeholder="Position ID" min={1} />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="managerId" label="Quản lý trực tiếp">
                            <InputNumber style={{ width: "100%" }} placeholder="Manager ID" min={1} />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="baseSalary" label="Lương cơ bản" rules={[{ type: "number", min: 0, message: "Lương không hợp lệ!" }]}>
                            <InputNumber style={{ width: "100%" }} placeholder="VND" formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")} min={0} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="address" label="Địa chỉ">
                            <Input />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="city" label="Thành phố">
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="country" label="Quốc gia">
                            <Input placeholder="Việt Nam" />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Modal>
    );
};

export default AddEmployeeModal;
