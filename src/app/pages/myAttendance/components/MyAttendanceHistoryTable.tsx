import { useState, useEffect } from "react";
import { Table, DatePicker, Button, Space, Card, Tag, Tooltip, Modal, Input, message, Form, Alert, Typography } from "antd";
import {
    SearchOutlined, ReloadOutlined, ExclamationCircleOutlined,
    EditOutlined, ClockCircleOutlined, CheckCircleOutlined, CloseCircleOutlined, WarningOutlined
} from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "../../../../store";
import {
    fetchMyHistory, selectMyHistory, selectAttendanceLoading,
    submitExplanation, submitAbsentExplanation, type AttendanceResponseDto
} from "../../../../store/attendanceSlide";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;
const { Text } = Typography;

const EXPLANATION_STATUS_CONFIG: Record<string, { color: string; label: string; icon: React.ReactNode }> = {
    Required: { color: "error",      label: "Cần giải trình",  icon: <WarningOutlined /> },
    Pending:  { color: "processing", label: "Đang chờ duyệt",  icon: <ClockCircleOutlined /> },
    Approved: { color: "success",    label: "Đã duyệt",        icon: <CheckCircleOutlined /> },
    Rejected: { color: "error",      label: "Bị từ chối",      icon: <CloseCircleOutlined /> },
};

const STATUS_COLOR: Record<string, string> = {
    Present: "success", Late: "warning", Absent: "error",
    Incomplete: "blue", PaidLeave: "cyan", UnpaidLeave: "purple",
    LateEarlyLeave: "orange"
};

const MyAttendanceHistoryTable = () => {
    const dispatch = useAppDispatch();
    const records = useAppSelector(selectMyHistory);
    const loading = useAppSelector(selectAttendanceLoading);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<AttendanceResponseDto | null>(null);
    const [form] = Form.useForm();

    const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null]>([
        dayjs().startOf('month'),
        dayjs()
    ]);

    useEffect(() => { handleSearch(); }, [dispatch]);

    const handleSearch = () => {
        const fromDate = dateRange[0]?.format("YYYY-MM-DD");
        const toDate = dateRange[1]?.format("YYYY-MM-DD");
        dispatch(fetchMyHistory({ fromDate, toDate }));
    };

    const handleReset = () => {
        setDateRange([dayjs().startOf('month'), dayjs()]);
        dispatch(fetchMyHistory({
            fromDate: dayjs().startOf('month').format("YYYY-MM-DD"),
            toDate: dayjs().format("YYYY-MM-DD")
        }));
    };

    const handleOpenExplanation = (record: AttendanceResponseDto) => {
        setSelectedRecord(record);
        form.resetFields();
        if (record.explanationMessage) form.setFieldValue("message", record.explanationMessage);
        setModalOpen(true);
    };

    const handleSubmitExplanation = async () => {
        try {
            const values = await form.validateFields();
            if (!selectedRecord) return;
            
            if (selectedRecord.attendanceId === 0) {
                await dispatch(submitAbsentExplanation({ attendanceDate: selectedRecord.attendanceDate, message: values.message })).unwrap();
            } else {
                await dispatch(submitExplanation({ attendanceId: selectedRecord.attendanceId, message: values.message })).unwrap();
            }
            
            message.success("Phiếu giải trình đã được gửi. Đang chờ Quản lý duyệt.");
            setModalOpen(false);
            handleSearch();
        } catch (error: any) {
            if (error?.errorFields) return;
            message.error(error?.message || "Gửi giải trình thất bại.");
        }
    };

    const requiredCount = records.filter(r => r.explanationStatus === "Required" || r.location?.includes("[INVALID]") && !r.explanationStatus || (r.status === "Absent" || r.status === "Incomplete") && !r.explanationStatus).length;

    const columns = [
        {
            title: "Ngày", dataIndex: "attendanceDate", key: "attendanceDate",
            render: (v: string) => dayjs(v).format("DD/MM/YYYY")
        },
        {
            title: "Check In", dataIndex: "checkInTime", key: "checkInTime",
            render: (v: string) => v ? dayjs(v).format("HH:mm:ss") : "—"
        },
        {
            title: "Check Out", dataIndex: "checkOutTime", key: "checkOutTime",
            render: (v: string) => v ? dayjs(v).format("HH:mm:ss") : "—"
        },
        {
            title: "Giờ công (h)", dataIndex: "workingHours", key: "workingHours", align: 'center' as const,
            render: (val: number, record: AttendanceResponseDto) => {
                const blocked = ["Required", "Pending", "Rejected"].includes(record.explanationStatus || "") || (record.location?.includes("[INVALID]") && !record.explanationStatus) || ((record.status === "Absent" || record.status === "Incomplete") && !record.explanationStatus);
                return blocked
                    ? <Tooltip title="Giờ công bị tạm khóa chờ giải trình được duyệt"><Tag color="red">0 🔒</Tag></Tooltip>
                    : (val ?? "0");
            }
        },
        {
            title: "OT tính lương (h)", key: "overtime", align: 'center' as const,
            render: (_: any, r: any) => {
                const payroll = r.payrollOvertimeHours || 0;
                return (
                    <Tooltip title={<div><p>Phê duyệt: {r.approvedOvertimeHours || 0}h</p><p>Thực tế: {r.actualOvertimeHours || 0}h</p><p className="font-bold">Tính lương: {payroll}h</p></div>}>
                        <Tag color={payroll > 0 ? "orange" : "default"}>{payroll}</Tag>
                    </Tooltip>
                );
            }
        },
        {
            title: "Trạng thái", dataIndex: "status", key: "status",
            render: (s: string, record: AttendanceResponseDto) => (
                <Space>
                    <Tag color={STATUS_COLOR[s] || "default"}>{s}</Tag>
                    {record.location?.includes("[INVALID]") && (
                        <Tooltip title="Vị trí check-in/out không hợp lệ">
                            <ExclamationCircleOutlined className="text-red-500" />
                        </Tooltip>
                    )}
                </Space>
            )
        },
        {
            title: "Giải trình", key: "explanation", align: 'center' as const,
            render: (_: any, record: AttendanceResponseDto) => {
                let { explanationStatus, explanationResponse, location, status } = record;
                if ((location?.includes("[INVALID]") || status === "Absent" || status === "Incomplete") && !explanationStatus) explanationStatus = "Required";

                if (!explanationStatus) return <Text type="secondary">—</Text>;
                const cfg = EXPLANATION_STATUS_CONFIG[explanationStatus];
                if (!cfg) return null;
                const tip = explanationStatus === "Rejected" && explanationResponse ? `Từ chối: ${explanationResponse}`
                    : explanationStatus === "Approved" && explanationResponse ? `Phản hồi: ${explanationResponse}` : undefined;
                return <Tooltip title={tip}><Tag color={cfg.color} icon={cfg.icon}>{cfg.label}</Tag></Tooltip>;
            }
        },
        {
            title: "Hành động", key: "action", align: 'center' as const,
            render: (_: any, record: AttendanceResponseDto) => {
                let s = record.explanationStatus;
                if (record.location?.includes("[INVALID]") && !s) s = "Required";

                if ((record.status === "Absent" || record.status === "Incomplete") && !s) {
                    return (
                        <Button
                            type="dashed"
                            size="small"
                            icon={<EditOutlined />}
                            danger
                            onClick={() => handleOpenExplanation(record)}
                        >
                            Giải trình ngay
                        </Button>
                    );
                }

                if (!s || s === "Approved") return null;
                const isPending = s === "Pending";
                return (
                    <Button
                        type={s === "Rejected" ? "primary" : "dashed"}
                        size="small"
                        icon={<EditOutlined />}
                        danger={s === "Required"}
                        disabled={isPending}
                        onClick={() => handleOpenExplanation(record)}
                    >
                        {isPending ? "Đang chờ duyệt" : s === "Rejected" ? "Giải trình lại" : "Giải trình ngay"}
                    </Button>
                );
            }
        }
    ];

    return (
        <Card title="Lịch sử chấm công của tôi">
            {requiredCount > 0 && (
                <Alert
                    type="warning" showIcon icon={<ExclamationCircleOutlined />} className="mb-4"
                    message={`Bạn có ${requiredCount} ngày chấm công cần giải trình. Giờ công những ngày này đang bị tạm khóa.`}
                />
            )}

            <Space className="mb-4">
                <RangePicker value={dateRange} onChange={(v) => setDateRange(v as any)} format="DD/MM/YYYY" allowClear={false} />
                <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch} loading={loading}>Tìm kiếm</Button>
                <Button icon={<ReloadOutlined />} onClick={handleReset}>Làm mới</Button>
            </Space>

            <Table
                columns={columns}
                dataSource={records}
                rowKey={(r) => r.attendanceId > 0 ? r.attendanceId : `virtual-${r.attendanceDate}`}
                loading={loading}
                pagination={{ pageSize: 15 }}
                bordered
                rowClassName={(r) => {
                    const isRequired = r.explanationStatus === "Required" || (r.location?.includes("[INVALID]") && !r.explanationStatus) || ((r.status === "Absent" || r.status === "Incomplete") && !r.explanationStatus);
                    if (isRequired) return "ant-table-row-danger";
                    if (r.explanationStatus === "Pending") return "ant-table-row-warning";
                    if (r.explanationStatus === "Rejected") return "ant-table-row-error";
                    return "";
                }}
            />

            <Modal
                title={<Space><ExclamationCircleOutlined style={{ color: "#fa8c16" }} /><span>Phiếu giải trình chấm công</span></Space>}
                open={modalOpen}
                onOk={handleSubmitExplanation}
                onCancel={() => setModalOpen(false)}
                okText="Gửi giải trình"
                cancelText="Hủy"
                confirmLoading={loading}
                destroyOnHidden
            >
                {selectedRecord && (
                    <Alert type="info" showIcon className="mb-4"
                        message={`Ngày: ${dayjs(selectedRecord.attendanceDate).format("DD/MM/YYYY")} — Trạng thái: ${selectedRecord.status}`}
                        description="Giờ công đang bị tạm khóa. Hãy nhập lý do để Quản lý xem xét."
                    />
                )}
                {selectedRecord?.explanationStatus === "Rejected" && selectedRecord.explanationResponse && (
                    <Alert type="error" showIcon className="mb-4" message={`Phiếu bị từ chối: "${selectedRecord.explanationResponse}"`} />
                )}
                <Form form={form} layout="vertical">
                    <Form.Item name="message" label="Lý do giải trình" rules={[{ required: true, message: "Vui lòng nhập lý do!" }]}>
                        <Input.TextArea rows={4} placeholder="Ví dụ: Tôi làm việc tại văn phòng đối tác, quên check-out do họp khẩn..." />
                    </Form.Item>
                </Form>
            </Modal>
        </Card>
    );
};

export default MyAttendanceHistoryTable;
