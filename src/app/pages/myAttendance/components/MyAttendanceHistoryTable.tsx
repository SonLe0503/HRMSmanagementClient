import { useState, useEffect, useMemo } from "react";
import { Table, Button, Space, Select, Card, Tag, Tooltip, message, Form, Alert, Typography, Row, Col, Statistic, Divider } from "antd";
import {
    SearchOutlined, ReloadOutlined, ExclamationCircleOutlined,
    EditOutlined, ClockCircleOutlined, CheckCircleOutlined, CloseCircleOutlined, WarningOutlined,
    CalendarOutlined, ThunderboltOutlined
} from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "../../../../store";
import {
    fetchMyHistory, selectMyHistory, selectAttendanceLoading,
    submitExplanation, submitAbsentExplanation, type AttendanceResponseDto
} from "../../../../store/attendanceSlide";
import { fetchPayrollSettings, selectPayrollSettings } from "../../../../store/systemSettingSlide";
import dayjs from "dayjs";
import ExplanationModal from "../modal/ExplanationModal";

const { Text } = Typography;

// ─── Payroll Period Utilities ──────────────────────────────────────────────────

interface PayrollPeriod {
    label: string;
    value: string;        // fromDate dùng làm key duy nhất
    fromDate: string;     // YYYY-MM-DD
    toDate: string;       // YYYY-MM-DD
    displayLabel: string; // "Kỳ 03/2026 (05/03 → 04/04)"
}

function generatePayrollPeriods(cutOffDay: number): PayrollPeriod[] {
    const periods: PayrollPeriod[] = [];
    const today = dayjs();

    for (let i = 12; i >= -1; i--) {
        const base = today.subtract(i, "month");
        const periodStart = base.date(cutOffDay);
        const periodEnd = periodStart.add(1, "month").subtract(1, "day");

        const fromDate = periodStart.format("YYYY-MM-DD");
        const toDate = periodEnd.format("YYYY-MM-DD");
        const monthLabel = periodStart.format("MM/YYYY");

        periods.push({
            label: `Kỳ ${monthLabel}`,
            value: fromDate,
            fromDate,
            toDate,
            displayLabel: `Kỳ ${monthLabel}  (${periodStart.format("DD/MM")} → ${periodEnd.format("DD/MM/YYYY")})`
        });
    }

    return periods;
}

function getCurrentPeriod(periods: PayrollPeriod[]): PayrollPeriod | undefined {
    const today = dayjs().format("YYYY-MM-DD");
    return periods.find(p => today >= p.fromDate && today <= p.toDate);
}

// ──────────────────────────────────────────────────────────────────────────────

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
    const payrollSettings = useAppSelector(selectPayrollSettings);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<AttendanceResponseDto | null>(null);
    const [form] = Form.useForm();

    const cutOffDay = payrollSettings?.payrollCutOffDay ?? 1;
    const payrollPeriods = useMemo(() => generatePayrollPeriods(cutOffDay), [cutOffDay]);

    const [selectedPeriodKey, setSelectedPeriodKey] = useState<string>("");

    useEffect(() => {
        dispatch(fetchPayrollSettings());
    }, [dispatch]);

    // Khi payrollPeriods sẵn sàng → chọn kỳ hiện tại và fetch lần đầu
    useEffect(() => {
        if (payrollPeriods.length === 0) return;
        const current = getCurrentPeriod(payrollPeriods) ?? payrollPeriods[payrollPeriods.length - 2];
        if (!current) return;
        setSelectedPeriodKey(current.value);
        dispatch(fetchMyHistory({ fromDate: current.fromDate, toDate: current.toDate }));
    }, [payrollPeriods]);

    const selectedPeriod = useMemo(
        () => payrollPeriods.find(p => p.value === selectedPeriodKey),
        [payrollPeriods, selectedPeriodKey]
    );

    const handleSearch = () => {
        if (!selectedPeriod) return;
        dispatch(fetchMyHistory({ fromDate: selectedPeriod.fromDate, toDate: selectedPeriod.toDate }));
    };

    const handleCurrentPeriod = () => {
        const current = getCurrentPeriod(payrollPeriods);
        if (!current) return;
        setSelectedPeriodKey(current.value);
        dispatch(fetchMyHistory({ fromDate: current.fromDate, toDate: current.toDate }));
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

    // ─── Thống kê tổng hợp ────────────────────────────────────────────────────
    const summary = useMemo(() => {
        const totalRecords = records.length;
        const presentDays = records.filter(r =>
            r.status === "Present" || r.status === "Late" || r.status === "PaidLeave"
        ).length;
        const totalWorkingHours = records.reduce((sum, r) => sum + (r.workingHours ?? 0), 0);
        const totalOvertimeHours = records.reduce((sum, r) => sum + (r.payrollOvertimeHours ?? 0), 0);
        return { totalRecords, presentDays, totalWorkingHours, totalOvertimeHours };
    }, [records]);

    const requiredCount = records.filter(r =>
        r.explanationStatus === "Required" ||
        (r.location?.includes("[INVALID]") && !r.explanationStatus) ||
        ((r.status === "Absent" || r.status === "Incomplete") && !r.explanationStatus)
    ).length;

    const columns = [
        {
            title: "Ngày", dataIndex: "attendanceDate", key: "attendanceDate", width: 110,
            render: (v: string) => dayjs(v).format("DD/MM/YYYY")
        },
        {
            title: "Giờ vào", dataIndex: "checkInTime", key: "checkInTime", width: 90, align: 'center' as const,
            render: (v: string) => v ? dayjs(v).format("HH:mm:ss") : "—"
        },
        {
            title: "Giờ ra", dataIndex: "checkOutTime", key: "checkOutTime", width: 90, align: 'center' as const,
            render: (v: string) => v ? dayjs(v).format("HH:mm:ss") : "—"
        },
        {
            title: "Giờ công (h)", dataIndex: "workingHours", key: "workingHours", width: 120, align: 'center' as const,
            render: (val: number, record: AttendanceResponseDto) => {
                const blocked = ["Required", "Pending", "Rejected"].includes(record.explanationStatus || "") ||
                    (record.location?.includes("[INVALID]") && !record.explanationStatus) ||
                    ((record.status === "Absent" || record.status === "Incomplete") && !record.explanationStatus);
                return blocked
                    ? <Tooltip title="Giờ công bị tạm khóa chờ giải trình được duyệt"><Tag color="red">0 🔒</Tag></Tooltip>
                    : (val ?? "0");
            }
        },
        {
            title: "OT lương (h)", key: "overtime", width: 120, align: 'center' as const,
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
            title: "Trạng thái", dataIndex: "status", key: "status", width: 150,
            render: (s: string, record: AttendanceResponseDto) => (
                <Space size={4}>
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
            title: "Giải trình", key: "explanation", width: 150, align: 'center' as const,
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
            title: "Hành động", key: "action", width: 150, align: 'center' as const,
            render: (_: any, record: AttendanceResponseDto) => {
                let s = record.explanationStatus;
                if (record.location?.includes("[INVALID]") && !s) s = "Required";

                if ((record.status === "Absent" || record.status === "Incomplete") && !s) {
                    return (
                        <Button type="dashed" size="small" icon={<EditOutlined />} danger onClick={() => handleOpenExplanation(record)}>
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
        <Card title="Lịch sử chấm công của tôi" style={{ overflow: 'hidden' }}>
            {requiredCount > 0 && (
                <Alert
                    type="warning" showIcon icon={<ExclamationCircleOutlined />} className="!mb-4"
                    message={`Bạn có ${requiredCount} ngày chấm công cần giải trình. Giờ công những ngày này đang bị tạm khóa.`}
                />
            )}

            {/* ── Bộ lọc kỳ lương ── */}
            <Space className="mb-4" wrap style={{ rowGap: 8 }}>
                <Select
                    style={{ width: 'min(320px, 100%)' }}
                    value={selectedPeriodKey || undefined}
                    onChange={setSelectedPeriodKey}
                    options={payrollPeriods.map(p => ({ label: p.displayLabel, value: p.value }))}
                    suffixIcon={<CalendarOutlined />}
                    placeholder="Chọn kỳ lương"
                />
                <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch} loading={loading}>
                    Xem
                </Button>
                <Button icon={<ReloadOutlined />} onClick={handleCurrentPeriod}>
                    Kỳ hiện tại
                </Button>
            </Space>

            {/* ── Thông tin kỳ đang xem ── */}
            {selectedPeriod && (
                <div className="mb-4 text-sm text-slate-500 flex items-center gap-2">
                    <CalendarOutlined />
                    <span>
                        Đang xem: <strong>{selectedPeriod.displayLabel}</strong>
                        &nbsp;·&nbsp; Ngày chốt: <strong>ngày {cutOffDay} hàng tháng</strong>
                    </span>
                </div>
            )}

            {/* ── 4 thẻ thống kê ── */}
            {records.length > 0 && (
                <>
                    <Row gutter={[12, 12]} className="mb-4">
                        <Col xs={24} sm={12} md={6}>
                            <Card size="small" className="bg-blue-50 border-blue-200 text-center">
                                <Statistic
                                    title={<span className="text-blue-600 text-xs font-medium">Tổng bản ghi</span>}
                                    value={summary.totalRecords}
                                    suffix="ngày"
                                    valueStyle={{ color: '#1d4ed8', fontSize: 20 }}
                                    prefix={<CalendarOutlined />}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Card size="small" className="bg-green-50 border-green-200 text-center">
                                <Statistic
                                    title={<span className="text-green-600 text-xs font-medium">Ngày có mặt</span>}
                                    value={summary.presentDays}
                                    suffix="ngày"
                                    valueStyle={{ color: '#15803d', fontSize: 20 }}
                                    prefix={<CheckCircleOutlined />}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Card size="small" className="bg-indigo-50 border-indigo-200 text-center">
                                <Statistic
                                    title={<span className="text-indigo-600 text-xs font-medium">Tổng giờ công</span>}
                                    value={summary.totalWorkingHours}
                                    precision={1}
                                    suffix="h"
                                    valueStyle={{ color: '#4338ca', fontSize: 20 }}
                                    prefix={<ClockCircleOutlined />}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Card size="small" className="bg-orange-50 border-orange-200 text-center">
                                <Statistic
                                    title={<span className="text-orange-600 text-xs font-medium">Tổng giờ OT (tính lương)</span>}
                                    value={summary.totalOvertimeHours}
                                    precision={1}
                                    suffix="h"
                                    valueStyle={{ color: '#c2410c', fontSize: 20 }}
                                    prefix={<ThunderboltOutlined />}
                                />
                            </Card>
                        </Col>
                    </Row>
                    <Divider style={{ margin: '0 0 16px 0' }} />
                </>
            )}

            {/* ── Bảng dữ liệu ── */}
            <Table
                columns={columns}
                dataSource={records}
                rowKey={(r) => r.attendanceId > 0 ? r.attendanceId : `virtual-${r.attendanceDate}`}
                loading={loading}
                pagination={{ pageSize: 15 }}
                scroll={{ x: 980 }}
                bordered
                rowClassName={(r) => {
                    const isRequired = r.explanationStatus === "Required" ||
                        (r.location?.includes("[INVALID]") && !r.explanationStatus) ||
                        ((r.status === "Absent" || r.status === "Incomplete") && !r.explanationStatus);
                    if (isRequired) return "ant-table-row-danger";
                    if (r.explanationStatus === "Pending") return "ant-table-row-warning";
                    if (r.explanationStatus === "Rejected") return "ant-table-row-error";
                    return "";
                }}
                summary={() => records.length > 0 ? (
                    <Table.Summary fixed>
                        <Table.Summary.Row className="bg-slate-50 font-semibold">
                            <Table.Summary.Cell index={0} colSpan={3} align="right">
                                <span className="text-slate-600">Tổng cộng ({summary.totalRecords} bản ghi):</span>
                            </Table.Summary.Cell>
                            <Table.Summary.Cell index={3} align="center">
                                <Tag color="blue">{summary.totalWorkingHours.toFixed(1)}h</Tag>
                            </Table.Summary.Cell>
                            <Table.Summary.Cell index={4} align="center">
                                <Tag color="orange">{summary.totalOvertimeHours.toFixed(1)}h</Tag>
                            </Table.Summary.Cell>
                            <Table.Summary.Cell index={5} colSpan={3} />
                        </Table.Summary.Row>
                    </Table.Summary>
                ) : undefined}
            />

            {/* ── Modal giải trình ── */}
            <ExplanationModal
                open={modalOpen}
                loading={loading}
                selectedRecord={selectedRecord}
                form={form}
                onOk={handleSubmitExplanation}
                onCancel={() => setModalOpen(false)}
            />
        </Card>
    );
};

export default MyAttendanceHistoryTable;
