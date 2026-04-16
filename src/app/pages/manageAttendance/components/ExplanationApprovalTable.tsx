import { useState, useEffect } from "react";
import { Table, Button, Space, Card, Tag, Modal, Input, message, Form, Alert, Badge, Typography, TimePicker, Row, Col, Tooltip } from "antd";
import {
    ReloadOutlined, CheckCircleOutlined, CloseCircleOutlined,
    FileTextOutlined, ClockCircleOutlined
} from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "../../../../store";
import {
    searchAttendance, approveExplanation, selectAdminAttendance,
    selectAttendanceLoading, type AttendanceResponseDto
} from "../../../../store/attendanceSlide";
import dayjs from "dayjs";

const { Text, Paragraph } = Typography;

const ExplanationApprovalTable = () => {
    const dispatch = useAppDispatch();
    const allRecords = useAppSelector(selectAdminAttendance);
    const loading = useAppSelector(selectAttendanceLoading);

    const [modalOpen, setModalOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<AttendanceResponseDto | null>(null);
    const [form] = Form.useForm();

    // Filter only records that need attention (Pending)
    const pendingRecords = allRecords.filter(r => r.explanationStatus === "Pending");

    useEffect(() => {
        // Load last 90 days attendance to catch pending explanations
        dispatch(searchAttendance({
            fromDate: dayjs().subtract(90, 'day').format("YYYY-MM-DD"),
            toDate: dayjs().format("YYYY-MM-DD"),
        }));
    }, [dispatch]);

    const handleRefresh = () => {
        dispatch(searchAttendance({
            fromDate: dayjs().subtract(90, 'day').format("YYYY-MM-DD"),
            toDate: dayjs().format("YYYY-MM-DD"),
        }));
    };

    const handleOpenReview = (record: AttendanceResponseDto) => {
        setSelectedRecord(record);
        form.resetFields();
        setModalOpen(true);
    };

    const handleDecision = async (isApproved: boolean) => {
        try {
            const values = await form.validateFields();
            if (!selectedRecord) return;
            await dispatch(approveExplanation({
                attendanceId: selectedRecord.attendanceId,
                isApproved,
                responseMessage: values.response,
                manualCheckInTime: values.manualCheckInTime ? values.manualCheckInTime.format("HH:mm:ss") : undefined,
                manualCheckOutTime: values.manualCheckOutTime ? values.manualCheckOutTime.format("HH:mm:ss") : undefined,
            })).unwrap();
            message.success(isApproved ? "Đã duyệt giải trình. Giờ công được khôi phục." : "Đã từ chối giải trình.");
            setModalOpen(false);
            handleRefresh();
        } catch (error: any) {
            if (error?.errorFields) return;
            message.error(error?.message || "Xử lý thất bại.");
        }
    };

    const columns = [
        {
            title: "Nhân viên", dataIndex: "employeeName", key: "employeeName",
            render: (v: string) => <Text strong>{v}</Text>
        },
        {
            title: "Ngày", dataIndex: "attendanceDate", key: "attendanceDate",
            render: (v: string) => dayjs(v).format("DD/MM/YYYY")
        },
        {
            title: "Check In", dataIndex: "checkInTime", key: "checkInTime",
            render: (v: string) => v ? dayjs(v).format("HH:mm:ss") : <Tag color="red">Không có</Tag>
        },
        {
            title: "Check Out", dataIndex: "checkOutTime", key: "checkOutTime",
            render: (v: string) => v ? dayjs(v).format("HH:mm:ss") : <Tag color="red">Không có</Tag>
        },
        {
            title: "Trạng thái", dataIndex: "status", key: "status",
            render: (s: string) => {
                const MAP: Record<string, string> = { Present: "success", Late: "warning", Absent: "error", Incomplete: "blue" };
                return <Tag color={MAP[s] || "default"}>{s}</Tag>;
            }
        },
        {
            title: "Nội dung giải trình", dataIndex: "explanationMessage", key: "explanationMessage",
            render: (v: string) => v
                ? <Paragraph ellipsis={{ rows: 2, expandable: true }} style={{ marginBottom: 0 }}>{v}</Paragraph>
                : <Text type="secondary">—</Text>
        },
        {
            title: "Hành động", key: "action", align: "center" as const,
            render: (_: any, record: AttendanceResponseDto) => {
                const isToday = dayjs(record.attendanceDate).isSame(dayjs(), 'day') || dayjs(record.attendanceDate).isAfter(dayjs(), 'day');
                
                return (
                    <Tooltip title={isToday ? "Giải trình cho ngày hiện tại chỉ có thể duyệt vào ngày mai để tránh lỗi chấm công." : ""}>
                        <Button 
                            type="primary" 
                            size="small" 
                            icon={<FileTextOutlined />} 
                            onClick={() => handleOpenReview(record)}
                            disabled={isToday}
                        >
                            Xem xét
                        </Button>
                    </Tooltip>
                );
            }
        }
    ];

    return (
        <Card
            title={
                <Space>
                    <ClockCircleOutlined style={{ color: "#fa8c16" }} />
                    <span>Giải trình chấm công chờ duyệt</span>
                    <Badge count={pendingRecords.length} showZero color="#fa8c16" />
                </Space>
            }
            extra={<Button icon={<ReloadOutlined />} onClick={handleRefresh} loading={loading}>Làm mới</Button>}
        >
            {pendingRecords.length === 0 && !loading && (
                <Alert type="success" showIcon message="Không có phiếu giải trình nào đang chờ duyệt." />
            )}

            {pendingRecords.length > 0 && (
                <Table
                    columns={columns}
                    dataSource={pendingRecords}
                    rowKey="attendanceId"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                    bordered
                />
            )}

            <Modal
                title={<Space><FileTextOutlined /><span>Xem xét phiếu giải trình</span></Space>}
                open={modalOpen}
                onCancel={() => setModalOpen(false)}
                footer={
                    <Space>
                        <Button onClick={() => setModalOpen(false)}>Hủy</Button>
                        <Button danger icon={<CloseCircleOutlined />} onClick={() => handleDecision(false)}>Từ chối</Button>
                        <Button type="primary" icon={<CheckCircleOutlined />} onClick={() => handleDecision(true)}>Duyệt & Khôi phục giờ công</Button>
                    </Space>
                }
                width={600}
                destroyOnHidden
            >
                {selectedRecord && (
                    <>
                        <Alert
                            type="info" showIcon className="mb-4"
                            message={`${selectedRecord.employeeName} — ${dayjs(selectedRecord.attendanceDate).format("DD/MM/YYYY")}`}
                            description={`Check-in: ${selectedRecord.checkInTime ? dayjs(selectedRecord.checkInTime).format("HH:mm") : "Không có"} | Check-out: ${selectedRecord.checkOutTime ? dayjs(selectedRecord.checkOutTime).format("HH:mm") : "Không có"} | Trạng thái: ${selectedRecord.status}`}
                        />
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                            <Text type="secondary" className="block mb-1 text-xs uppercase tracking-wide">Lý do nhân viên giải trình:</Text>
                            <Text>{selectedRecord.explanationMessage}</Text>
                        </div>
                    </>
                )}
                <Form form={form} layout="vertical">
                    <Row gutter={16}>
                        {selectedRecord && !selectedRecord.checkInTime && (
                            <Col span={12}>
                                <Form.Item name="manualCheckInTime" label="Giờ Check-in bổ sung (nếu duyệt)" help="Bổ sung giờ Check-in để hệ thống tính công">
                                    <TimePicker format="HH:mm" className="w-full" />
                                </Form.Item>
                            </Col>
                        )}
                        {selectedRecord && !selectedRecord.checkOutTime && (
                            <Col span={12}>
                                <Form.Item name="manualCheckOutTime" label="Giờ Check-out bổ sung (nếu duyệt)" help="Bổ sung giờ Check-out để hệ thống tính công">
                                    <TimePicker format="HH:mm" className="w-full" />
                                </Form.Item>
                            </Col>
                        )}
                    </Row>
                    <Form.Item
                        name="response"
                        label="Phản hồi của Quản lý (tùy chọn)"
                    >
                        <Input.TextArea rows={3} placeholder="Nhập ghi chú hoặc lý do từ chối (nếu có)..." />
                    </Form.Item>
                </Form>
            </Modal>
        </Card>
    );
};

export default ExplanationApprovalTable;
