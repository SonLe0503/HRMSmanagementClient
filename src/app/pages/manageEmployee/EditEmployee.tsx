import { Form, Input, Select, DatePicker, InputNumber, message, Row, Col, Card, Button, Typography, Space, Spin } from "antd";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeftOutlined, SaveOutlined } from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "../../../store";
import { updateEmployee, fetchEmployeeById, fetchAllEmployees, selectEmployeeLoading, selectEmployees } from "../../../store/employeeSlide";
import type { IEmployeeDetail } from "../../../store/employeeSlide";
import { selectInfoLogin } from "../../../store/authSlide";
import { fetchActiveDepartments, selectActiveDepartments } from "../../../store/departmentSlide";
import { fetchActivePositions, selectActivePositions } from "../../../store/positionSlide";
import { fetchAllUsers, selectUsers } from "../../../store/userSlide";
import { EUserRole } from "../../../interface/app";
import URL from "../../../constants/url";
import dayjs from "dayjs";

const { Title } = Typography;

const STATUS_OPTIONS = ["Active", "Inactive", "On Leave", "Resigned", "Terminated", "Suspended"].map(v => ({ label: v, value: v }));
const TYPE_OPTIONS = ["Full-Time", "Part-Time", "Contract", "Intern"].map(v => ({ label: v, value: v }));
const GENDER_OPTIONS = ["Male", "Female", "Other"].map(v => ({ label: v, value: v }));

const EditEmployee = () => {
    const { id } = useParams<{ id: string }>();
    const [form] = Form.useForm();
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const loading = useAppSelector(selectEmployeeLoading);
    const infoLogin = useAppSelector(selectInfoLogin);
    const activeDepartments = useAppSelector(selectActiveDepartments);
    const activePositions = useAppSelector(selectActivePositions);
    const employees = useAppSelector(selectEmployees);
    const users = useAppSelector(selectUsers);

    const [editingEmployee, setEditingEmployee] = useState<IEmployeeDetail | null>(null);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            setFetching(true);
            try {
                if (id) {
                    const result = await dispatch(fetchEmployeeById(Number(id))).unwrap();
                    setEditingEmployee(result as IEmployeeDetail);
                }
                await Promise.all([
                    dispatch(fetchActiveDepartments()),
                    dispatch(fetchActivePositions()),
                    dispatch(fetchAllEmployees()),
                    dispatch(fetchAllUsers())
                ]);
            } catch (error) {
                message.error("Không thể tải dữ liệu nhân viên!");
                navigate(URL.ManageEmployee);
            } finally {
                setFetching(false);
            }
        };
        loadData();
    }, [id, dispatch, navigate]);

    useEffect(() => {
        if (editingEmployee) {
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
    }, [editingEmployee, form]);

    const departmentOptions = activeDepartments.map(d => ({
        label: d.departmentName,
        value: d.departmentId,
    }));

    const positionOptions = activePositions.map(p => ({
        label: p.positionName,
        value: p.positionId,
    }));

    const managerUserIds = users
        .filter(u => u.roles.includes(EUserRole.MANAGE) || u.roles.includes(EUserRole.ADMIN))
        .map(u => u.employeeId);

    const managerOptions = employees
        .filter(e => managerUserIds.includes(e.employeeId))
        .map(e => ({
            label: `${e.fullName} (${e.employeeCode})`,
            value: e.employeeId,
        }));

    const onFinish = (values: any) => {
        if (!editingEmployee || !id) return;
        const payload: any = {
            employeeCode: editingEmployee.employeeCode,
            firstName: values.firstName,
            lastName: values.lastName,
            email: values.email,
            phone: values.phone || null,
            dateOfBirth: values.dateOfBirth ? values.dateOfBirth.format("YYYY-MM-DD") : null,
            gender: values.gender || null,
            address: values.address || null,
            city: values.city || null,
            country: values.country || null,
            modifiedBy: infoLogin?.userId ? Number(infoLogin.userId) : null,
            departmentId: values.departmentId || null,
            positionId: values.positionId || null,
            managerId: values.managerId || null,
            joinDate: values.joinDate ? values.joinDate.format("YYYY-MM-DD") : null,
            resignationDate: values.resignationDate ? values.resignationDate.format("YYYY-MM-DD") : null,
            employmentStatus: values.employmentStatus,
            employmentType: values.employmentType,
            baseSalary: values.baseSalary ?? null,
        };

        dispatch(updateEmployee({ id: Number(id), data: payload }))
            .unwrap()
            .then(() => {
                message.success("Cập nhật nhân viên thành công!");
                navigate(URL.ManageEmployee);
            })
            .catch((err: any) => {
                const errMsg = typeof err === "string" ? err : err?.message || "Cập nhật thất bại!";
                message.error(errMsg);
            });
    };

    if (fetching) {
        return (
            <div style={{ display: "flex", justifyContent: "center", padding: "100px" }}>
                <Spin size="large" tip="Đang tải dữ liệu nhân viên..." />
            </div>
        );
    }

    return (
        <div className="p-4" style={{ maxWidth: 1000, margin: "0 auto" }}>
            <Space className="mb-4" align="center" style={{ marginBottom: 20 }}>
                <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
                    Quay lại
                </Button>
                <Title level={3} style={{ margin: 0 }}>Chỉnh sửa nhân viên: {editingEmployee?.fullName}</Title>
            </Space>

            <Form 
                form={form} 
                layout="vertical" 
                onFinish={onFinish}
            >
                <Card title="Thông tin cá nhân" className="mb-4" style={{ marginBottom: 20 }}>
                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item name="employeeCode" label="Mã nhân viên">
                                <Input disabled />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="firstName" label="Họ" rules={[{ required: true, message: "Vui lòng nhập họ" }, { max: 50 }]}>
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="lastName" label="Tên" rules={[{ required: true, message: "Vui lòng nhập tên" }, { max: 50 }]}>
                                <Input />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="email" label="Email" rules={[{ required: true, message: "Vui lòng nhập email" }, { type: "email", message: "Email không hợp lệ" }, { max: 100 }]}>
                                <Input placeholder="example@company.com" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item 
                                name="phone" 
                                label="Số điện thoại" 
                                rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}
                            >
                                <Input placeholder="09xxxxxxxx" maxLength={20} />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="gender" label="Giới tính">
                                <Select options={GENDER_OPTIONS} allowClear placeholder="Chọn giới tính" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="dateOfBirth" label="Ngày sinh">
                                <DatePicker
                                    style={{ width: "100%" }}
                                    format="DD/MM/YYYY"
                                    disabledDate={d => d && d > dayjs().subtract(18, "year")}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item name="address" label="Địa chỉ cụ thể" rules={[{ max: 200 }]}>
                                <Input />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="city" label="Thành phố" rules={[{ max: 50 }]}><Input /></Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="country" label="Quốc gia" rules={[{ max: 50 }]}><Input /></Form.Item>
                        </Col>
                    </Row>
                </Card>

                <Card title="Thông tin công việc" className="mb-4" style={{ marginBottom: 20 }}>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item 
                                name="joinDate" 
                                label="Ngày vào làm" 
                                dependencies={['dateOfBirth']}
                                rules={[
                                    { required: true, message: "Vui lòng chọn ngày vào làm" },
                                    ({ getFieldValue }) => ({
                                        validator(_, value) {
                                            const dob = getFieldValue('dateOfBirth');
                                            if (!value || !dob) {
                                                return Promise.resolve();
                                            }
                                            if (value.isBefore(dob.add(18, 'year'), 'day')) {
                                                return Promise.reject(new Error('Nhân viên phải đủ ít nhất 18 tuổi tại thời điểm vào làm'));
                                            }
                                            return Promise.resolve();
                                        },
                                    }),
                                ]}
                            >
                                <DatePicker
                                    style={{ width: "100%" }}
                                    format="DD/MM/YYYY"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="resignationDate" label="Ngày nghỉ việc">
                                <DatePicker
                                    style={{ width: "100%" }}
                                    format="DD/MM/YYYY"
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="baseSalary" label="Lương cơ bản">
                                <InputNumber
                                    style={{ width: "100%" }}
                                    formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                    min={0}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="employmentStatus" label="Trạng thái" rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}>
                                <Select options={STATUS_OPTIONS} placeholder="Chọn trạng thái" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="employmentType" label="Loại hình" rules={[{ required: true, message: "Vui lòng chọn loại hình" }]}>
                                <Select options={TYPE_OPTIONS} placeholder="Chọn loại hình" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item name="departmentId" label="Phòng ban">
                                <Select
                                    options={departmentOptions}
                                    placeholder="Chọn phòng ban"
                                    allowClear
                                    showSearch
                                    filterOption={(input, option) =>
                                        (option?.label as string ?? "").toLowerCase().includes(input.toLowerCase())
                                    }
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
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
                            <Form.Item name="managerId" label="Quản lý">
                                <Select
                                    options={managerOptions}
                                    placeholder="Chọn quản lý"
                                    allowClear
                                    showSearch
                                    filterOption={(input, option) =>
                                        (option?.label as string ?? "").toLowerCase().includes(input.toLowerCase())
                                    }
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                </Card>

                <div style={{ textAlign: "right", marginTop: 24 }}>
                    <Space>
                        <Button onClick={() => navigate(-1)}>Hủy bỏ</Button>
                        <Button type="primary" icon={<SaveOutlined />} loading={loading} onClick={() => form.submit()}>
                            Lưu thay đổi
                        </Button>
                    </Space>
                </div>
            </Form>
        </div>
    );
};

export default EditEmployee;
