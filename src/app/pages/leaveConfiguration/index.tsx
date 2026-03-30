import { Layout, Typography, Row, Col, Card, Form, Select, Input, InputNumber, Button, Table, message, DatePicker, Tag, Space, Popconfirm, Tooltip } from "antd";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../store";
import { 
    fetchAllLeaveTypes, 
    selectLeaveTypes, 
    deleteLeaveType, 
    selectLeaveTypeLoading 
} from "../../../store/leaveTypeSlide";
import { 
    adjustLeaveBalance, 
    fetchAllBalances,
    selectAllLeaveBalances,
    selectLeaveBalanceLoading, 
    selectLeaveBalanceLastResponse, 
    clearLastResponse 
} from "../../../store/leaveBalanceSlide";
import { fetchAllEmployees, selectEmployees } from "../../../store/employeeSlide";
import dayjs from "dayjs";
import { 
    EditOutlined, 
    DeleteOutlined, 
    PlusOutlined, 
    SafetyCertificateOutlined, 
    CalendarOutlined, 
    SolutionOutlined,
    UserOutlined,
    HistoryOutlined,
    PlusCircleOutlined,
    EyeOutlined
} from "@ant-design/icons";
import LeaveTypeModal from "./LeaveTypeModal";
import CreateBalanceModal from "./CreateBalanceModal";
import EmployeeBalanceDetailsModal from "./EmployeeBalanceDetailsModal";

const { Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

const LeaveConfiguration = () => {
    const dispatch = useAppDispatch();
    const leaveTypes = useAppSelector(selectLeaveTypes);
    const employees = useAppSelector(selectEmployees);
    const allBalances = useAppSelector(selectAllLeaveBalances);
    const leaveBalanceLoading = useAppSelector(selectLeaveBalanceLoading);
    const leaveTypeLoading = useAppSelector(selectLeaveTypeLoading);
    const lastResponse = useAppSelector(selectLeaveBalanceLastResponse);
    
    const [adjustmentForm] = Form.useForm();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isBalanceModalVisible, setIsBalanceModalVisible] = useState(false);
    const [detailsModalVisible, setDetailsModalVisible] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<{ id: number; name: string } | null>(null);
    const [editingLeaveType, setEditingLeaveType] = useState<any | null>(null);

    useEffect(() => {
        dispatch(fetchAllLeaveTypes());
        dispatch(fetchAllEmployees());
        dispatch(fetchAllBalances());
    }, [dispatch]);

    useEffect(() => {
        if (lastResponse) {
            message.success(lastResponse.message || "Thực hiện thành công.");
            adjustmentForm.resetFields();
            dispatch(fetchAllBalances()); // Refresh balance list
            dispatch(clearLastResponse());
        }
    }, [lastResponse, dispatch, adjustmentForm]);

    const onFinishAdjustment = async (values: any) => {
        const payload = {
            employeeId: values.employeeId,
            leaveTypeId: values.leaveTypeId,
            adjustmentType: values.adjustmentType,
            numberOfDays: values.numberOfDays,
            reason: values.reason,
            effectiveDate: values.effectiveDate.format("YYYY-MM-DD")
        };
        await dispatch(adjustLeaveBalance(payload));
    };

    const handleAddLeaveType = () => {
        setEditingLeaveType(null);
        setIsModalVisible(true);
    };

    const handleEditLeaveType = (leaveType: any) => {
        setEditingLeaveType(leaveType);
        setIsModalVisible(true);
    };

    const handleDeleteLeaveType = async (id: number) => {
        try {
            await dispatch(deleteLeaveType(id)).unwrap();
            message.success("Đã ngừng hoạt động loại phép này.");
        } catch (err: any) {
            message.error(err.message || "Không thể xóa loại phép này.");
        }
    };

    const leaveTypeColumns = [
        { 
            title: "Mã loại", 
            dataIndex: "leaveTypeCode", 
            key: "leaveTypeCode",
            render: (text: string) => <Tag color="blue" className="font-mono">{text}</Tag>
        },
        { 
            title: "Tên loại phép", 
            dataIndex: "leaveTypeName", 
            key: "leaveTypeName",
            className: "font-semibold text-slate-700"
        },
        { 
            title: "Tự hưởng (năm)", 
            dataIndex: "annualEntitlement", 
            key: "annualEntitlement",
            align: 'center' as const,
            render: (val: number) => <strong>{val}</strong>
        },
        { 
            title: "Có lương", 
            dataIndex: "isPaid", 
            key: "isPaid",
            align: 'center' as const,
            render: (paid: boolean) => paid ? <Tag color="success">Có</Tag> : <Tag color="default">Không</Tag>
        },
        { 
            title: "Phê duyệt", 
            dataIndex: "requiresApproval", 
            key: "requiresApproval",
            align: 'center' as const,
            render: (req: boolean) => req ? <Tag color="processing">Cần</Tag> : <Tag color="default">Không</Tag>
        },
        { 
            title: "Trạng thái", 
            dataIndex: "isActive", 
            key: "isActive",
            align: 'center' as const,
            render: (active: boolean) => active ? <Tag color="cyan">Hoạt động</Tag> : <Tag color="error">Ngừng</Tag>
        },
        {
            title: "Hành động",
            key: "action",
            align: 'center' as const,
            render: (_: any, record: any) => (
                <Space size="middle">
                    <Tooltip title="Chỉnh sửa">
                        <Button 
                            type="text" 
                            icon={<EditOutlined />} 
                            onClick={() => handleEditLeaveType(record)}
                            className="text-indigo-600 hover:text-indigo-800"
                        />
                    </Tooltip>
                    <Popconfirm
                        title="Bạn có chắc chắn muốn ngừng hoạt động loại phép này?"
                        onConfirm={() => handleDeleteLeaveType(record.leaveTypeId)}
                        okText="Có"
                        cancelText="Hủy"
                    >
                        <Tooltip title="Ngừng hoạt động">
                            <Button 
                                type="text" 
                                icon={<DeleteOutlined />} 
                                className="text-red-600 hover:text-red-800"
                            />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            )
        }
    ];

    const balanceColumns = [
        {
            title: "Nhân viên",
            key: "employee",
            render: (_: any, record: any) => (
                <Space>
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                        <UserOutlined />
                    </div>
                    <div>
                        <div className="font-semibold text-slate-700">{record.employeeName}</div>
                        <div className="text-xs text-slate-400">ID: {record.employeeId}</div>
                    </div>
                </Space>
            )
        },
        {
            title: "Loại phép",
            dataIndex: "leaveTypeName",
            key: "leaveTypeName",
            render: (text: string) => <Tag className="border-none bg-slate-100/80 text-slate-600 font-medium">{text}</Tag>
        },
        {
            title: "Tổng hưởng",
            dataIndex: "totalEntitlement",
            key: "totalEntitlement",
            align: 'center' as const,
        },
        {
            title: "Đã dùng",
            dataIndex: "usedDays",
            key: "usedDays",
            align: 'center' as const,
            render: (val: number) => <span className="text-amber-600 font-medium">{val}</span>
        },
        {
            title: "Còn lại",
            dataIndex: "remainingDays",
            key: "remainingDays",
            align: 'center' as const,
            render: (val: number) => <span className="text-emerald-600 font-bold">{val}</span>
        },
        {
            title: "Năm",
            dataIndex: "year",
            key: "year",
            align: 'center' as const,
        },
        {
            title: "Cập nhật lần cuối",
            dataIndex: "lastUpdated",
            key: "lastUpdated",
            render: (date: string) => <span className="text-slate-400 text-xs">{dayjs(date).format("DD/MM/YYYY HH:mm")}</span>
        },
        {
            title: "Hành động",
            key: "action",
            align: "center" as const,
            render: (_: any, record: any) => (
                <Tooltip title="Xem chi tiết các loại phép">
                    <Button 
                        type="text" 
                        icon={<EyeOutlined />} 
                        onClick={() => {
                            setSelectedEmployee({ id: record.employeeId, name: record.employeeName });
                            setDetailsModalVisible(true);
                        }}
                        className="text-blue-500 hover:text-blue-700"
                    />
                </Tooltip>
            )
        }
    ];

    return (
        <Layout className="bg-transparent p-6 min-h-screen">
            <Content>
                <div className="mb-8 flex justify-between items-end">
                    <div>
                        <Title level={2} className="m-0 text-slate-800 font-bold">Cấu hình Nghỉ phép</Title>
                        <p className="text-slate-500 mt-2 text-lg">Quản lý các loại phép, quy tắc và điều chỉnh số dư nghỉ phép.</p>
                    </div>
                    <Button 
                        type="primary" 
                        icon={<PlusOutlined />} 
                        onClick={handleAddLeaveType}
                        className="h-10 px-6 rounded-lg font-semibold shadow-lg shadow-blue-200"
                    >
                        Thêm Loại Phép
                    </Button>
                </div>

                <Row gutter={[24, 24]}>
                    <Col xs={24} xl={8}>
                        <Card 
                            title={
                                <Space>
                                    <SolutionOutlined className="text-blue-500" />
                                    <span>Điều chỉnh số dư ngày nghỉ</span>
                                </Space>
                            }
                            className="shadow-xl border-none rounded-2xl bg-white/70 backdrop-blur-lg overflow-hidden"
                            headStyle={{ borderBottom: '1px solid #f1f5f9' }}
                        >
                            <Form form={adjustmentForm} layout="vertical" onFinish={onFinishAdjustment}>
                                <Form.Item name="employeeId" label="Nhân viên" rules={[{ required: true, message: "Chọn nhân viên" }]}>
                                    <Select 
                                        showSearch 
                                        placeholder="Chọn nhân viên" 
                                        optionFilterProp="children"
                                        className="rounded-lg h-10 w-full"
                                    >
                                        {(employees || []).map((e: any) => (
                                            <Option key={e.employeeId} value={e.employeeId}>
                                                {e.firstName} {e.lastName} ({e.employeeCode})
                                            </Option>
                                        ))}
                                    </Select>
                                </Form.Item>

                                <Form.Item name="leaveTypeId" label="Loại phép" rules={[{ required: true, message: "Chọn loại phép" }]}>
                                    <Select placeholder="Chọn loại phép" className="h-10 w-full">
                                        {(leaveTypes || []).filter((lt: any) => lt.isActive).map((lt: any) => (
                                            <Option key={lt.leaveTypeId} value={lt.leaveTypeId}>
                                                {lt.leaveTypeName}
                                            </Option>
                                        ))}
                                    </Select>
                                </Form.Item>

                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Form.Item name="adjustmentType" label="Thao tác" rules={[{ required: true }]}>
                                            <Select placeholder="Thao tác" className="h-10 w-full">
                                                <Option value="Add">Cộng thêm (+)</Option>
                                                <Option value="Deduct">Trừ đi (-)</Option>
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item name="numberOfDays" label="Số ngày" rules={[{ required: true }]}>
                                            <InputNumber min={0.5} step={0.5} className="w-full h-10 flex items-center rounded-lg" />
                                        </Form.Item>
                                    </Col>
                                </Row>

                                <Form.Item name="effectiveDate" label="Ngày hiệu lực" rules={[{ required: true }]} initialValue={dayjs()}>
                                    <DatePicker className="w-full h-10 rounded-lg" />
                                </Form.Item>

                                <Form.Item name="reason" label="Lý do điều chỉnh" rules={[{ required: true }]}>
                                    <Input.TextArea rows={3} placeholder="Nhập lý do điều chỉnh..." className="rounded-lg" />
                                </Form.Item>

                                <Button 
                                    type="primary" 
                                    htmlType="submit" 
                                    block 
                                    loading={leaveBalanceLoading} 
                                    className="h-12 text-md font-semibold mt-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 border-none hover:opacity-90 shadow-md"
                                >
                                    Thực hiện điều chỉnh
                                </Button>
                            </Form>
                        </Card>

                        <Card 
                            className="mt-6 shadow-xl border-none rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white overflow-hidden"
                            bodyStyle={{ padding: '24px' }}
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <Title level={4} style={{ color: 'white', marginBottom: '8px' }}>Chính sách tự động</Title>
                                    <Text style={{ color: 'rgba(255,255,255,0.8)' }}>Cấu hình quy tắc tích lũy ngày phép hàng tháng.</Text>
                                </div>
                                <SafetyCertificateOutlined style={{ fontSize: '32px', opacity: 0.5 }} />
                            </div>
                            <Button className="mt-6 bg-white/20 border-white/30 text-white hover:bg-white/30 h-10 rounded-lg" disabled>
                                Đang phát triển
                            </Button>
                        </Card>
                    </Col>

                    <Col xs={24} xl={16}>
                        <Space direction="vertical" size={24} className="w-full">
                            <Card 
                                title={
                                    <Space>
                                        <CalendarOutlined className="text-indigo-500" />
                                        <span>Danh sách Loại Nghỉ phép</span>
                                    </Space>
                                }
                                className="shadow-xl border-none rounded-2xl bg-white/70 backdrop-blur-lg overflow-hidden"
                                headStyle={{ borderBottom: '1px solid #f1f5f9' }}
                            >
                                <Table 
                                    columns={leaveTypeColumns} 
                                    dataSource={leaveTypes || []} 
                                    rowKey="leaveTypeId"
                                    pagination={{ pageSize: 5 }}
                                    loading={leaveTypeLoading}
                                    className="custom-table"
                                />
                            </Card>

                            <Card 
                                title={
                                    <div className="flex justify-between items-center w-full">
                                        <Space>
                                            <HistoryOutlined className="text-emerald-500" />
                                            <span>Danh sách Số dư Nghỉ phép của Nhân viên</span>
                                        </Space>
                                        <Button 
                                            size="small" 
                                            icon={<PlusCircleOutlined />} 
                                            onClick={() => setIsBalanceModalVisible(true)}
                                            className="text-emerald-600 hover:text-emerald-700 bg-emerald-50 border-emerald-100 rounded-md font-medium"
                                        >
                                            Khởi tạo số dư
                                        </Button>
                                    </div>
                                }
                                className="shadow-xl border-none rounded-2xl bg-white/70 backdrop-blur-lg overflow-hidden"
                                headStyle={{ borderBottom: '1px solid #f1f5f9' }}
                            >
                                <Table 
                                    columns={balanceColumns} 
                                    dataSource={allBalances || []} 
                                    rowKey="balanceId"
                                    pagination={{ pageSize: 5 }}
                                    loading={leaveBalanceLoading}
                                    className="custom-table"
                                />
                            </Card>
                        </Space>
                    </Col>
                </Row>
            </Content>

            <LeaveTypeModal 
                visible={isModalVisible} 
                onClose={() => {
                    setIsModalVisible(false);
                    dispatch(fetchAllLeaveTypes()); // Refresh list
                }} 
                editingLeaveType={editingLeaveType} 
            />

            <CreateBalanceModal
                visible={isBalanceModalVisible}
                onClose={(refresh) => {
                    setIsBalanceModalVisible(false);
                    if (refresh) dispatch(fetchAllBalances());
                }}
            />

            <EmployeeBalanceDetailsModal
                visible={detailsModalVisible}
                onClose={() => setDetailsModalVisible(false)}
                employee={selectedEmployee}
            />

            <style>{`
                .ant-card-head {
                    padding: 18px 24px;
                }
                .ant-card-head-title {
                    font-size: 1.1rem;
                    font-weight: 700 !important;
                    color: #1e293b !important;
                }
                .custom-table .ant-table-thead > tr > th {
                    background: #f8fafc;
                    color: #64748b;
                    font-weight: 600;
                    border-bottom: 2px solid #f1f5f9;
                    padding: 16px;
                }
                .custom-table .ant-table-tbody > tr > td {
                    padding: 16px;
                }
                .custom-table .ant-table-row:hover {
                    cursor: pointer;
                }
                .ant-btn-primary {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
            `}</style>
        </Layout>
    );
};

export default LeaveConfiguration;


