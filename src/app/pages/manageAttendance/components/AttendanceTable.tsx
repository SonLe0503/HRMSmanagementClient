import { useState, useEffect } from "react";
import { Table, Button, Space, DatePicker, Select, Tag, Card, Tooltip, message } from "antd";
import { SearchOutlined, EditOutlined, EyeOutlined, PlusOutlined, LockOutlined, UnlockOutlined, HistoryOutlined, ExclamationCircleOutlined, ReloadOutlined, TeamOutlined } from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { searchAttendance, selectAdminAttendance, selectAttendanceLoading, lockAttendance, unlockAttendance } from "../../../../store/attendanceSlide";
import { fetchAllEmployees, selectEmployees } from "../../../../store/employeeSlide";
import { selectInfoLogin } from "../../../../store/authSlide";
import { EUserRole } from "../../../../interface/app";
import dayjs from "dayjs";
import AttendanceDetailModal from "../modal/AttendanceDetailModal";
import ManualAdjustModal from "../modal/ManualAdjustModal";
import ManualCreateModal from "../modal/ManualCreateModal";
import AttendanceLogsModal from "../modal/AttendanceLogsModal";

const { RangePicker } = DatePicker;

const AttendanceTable = () => {
    const dispatch = useAppDispatch();
    const records = useAppSelector(selectAdminAttendance);
    const loading = useAppSelector(selectAttendanceLoading);
    const allEmployees = useAppSelector(selectEmployees);
    const infoLogin = useAppSelector(selectInfoLogin);

    const employees = infoLogin?.role === EUserRole.MANAGE
        ? allEmployees.filter(e => e.managerId === infoLogin.employeeId)
        : allEmployees;

    const allowedEmployeeIds = infoLogin?.role === EUserRole.MANAGE
        ? new Set(employees.map(e => e.employeeId))
        : null;

    const managerProfile = infoLogin?.role === EUserRole.MANAGE
        ? allEmployees.find(e => e.employeeId === infoLogin.employeeId)
        : null;

    const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null]>([dayjs().startOf('month'), dayjs()]);
    const [selectedEmployee, setSelectedEmployee] = useState<number | undefined>(undefined);
    const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
    const [refreshing, setRefreshing] = useState(false);

    // Modals config
    const [detailModal, setDetailModal] = useState({ open: false, employeeId: 0, employeeName: "", date: "" });
    const [adjustModal, setAdjustModal] = useState({ open: false, record: null as any });
    const [createModal, setCreateModal] = useState(false);
    const [logsModal, setLogsModal] = useState({ open: false, employeeId: 0, employeeName: "", date: "" });

    useEffect(() => {
        handleSearch();
        dispatch(fetchAllEmployees());
    }, [dispatch]);

    const handleSearch = () => {
        dispatch(searchAttendance({
            fromDate: dateRange[0]?.format("YYYY-MM-DD"),
            toDate: dateRange[1]?.format("YYYY-MM-DD"),
            employeeId: selectedEmployee,
            status: statusFilter
        }));
    };

    const handleRefresh = async () => {
        const defaultFrom = dayjs().startOf('month');
        const defaultTo = dayjs();
        setDateRange([defaultFrom, defaultTo]);
        setSelectedEmployee(undefined);
        setStatusFilter(undefined);
        setRefreshing(true);
        await Promise.all([
            dispatch(fetchAllEmployees()),
            dispatch(searchAttendance({
                fromDate: defaultFrom.format("YYYY-MM-DD"),
                toDate: defaultTo.format("YYYY-MM-DD"),
                employeeId: undefined,
                status: undefined
            }))
        ]);
        setRefreshing(false);
    };

    const handleToday = () => {
        setDateRange([dayjs(), dayjs()]);
        dispatch(searchAttendance({
            fromDate: dayjs().format("YYYY-MM-DD"),
            toDate: dayjs().format("YYYY-MM-DD"),
            employeeId: selectedEmployee,
            status: statusFilter
        }));
    };

    const handleToggleLock = async (record: any) => {
        try {
            if (record.isLocked) {
                await dispatch(unlockAttendance(record.attendanceId)).unwrap();
                message.success("Đã mở khóa bản ghi chấm công.");
            } else {
                await dispatch(lockAttendance(record.attendanceId)).unwrap();
                message.success("Đã khóa bản ghi chấm công.");
            }
        } catch (err: any) {
            message.error(typeof err === "string" ? err : "Thao tác thất bại.");
        }
    };

    const columns = [
        { title: "Mã NV", dataIndex: "employeeId", key: "employeeId", width: 75, align: 'center' as const },
        { title: "Họ và tên", dataIndex: "employeeName", key: "employeeName", width: 160, ellipsis: true },
        { title: "Ngày", dataIndex: "attendanceDate", key: "attendanceDate", width: 105, render: (val: string) => dayjs(val).format("DD/MM/YYYY") },
        { title: "Giờ vào", dataIndex: "checkInTime", key: "checkInTime", width: 90, align: 'center' as const, render: (val: string) => val ? dayjs(val).format("HH:mm:ss") : "—" },
        { title: "Giờ ra", dataIndex: "checkOutTime", key: "checkOutTime", width: 90, align: 'center' as const, render: (val: string) => val ? dayjs(val).format("HH:mm:ss") : "—" },
        { title: "Tổng h", dataIndex: "workingHours", key: "workingHours", width: 75, align: 'center' as const, render: (val: number) => val ?? "0" },
        {
            title: "OT (h)",
            dataIndex: "payrollOvertimeHours",
            key: "overtime",
            width: 75,
            align: 'center' as const,
            render: (_: any, record: any) => {
                const payroll = record.payrollOvertimeHours || 0;
                const actual = record.actualOvertimeHours || 0;
                const approved = record.approvedOvertimeHours || 0;

                return (
                    <Tooltip title={
                        <div style={{ fontSize: '12px' }}>
                            <p>Đã duyệt: {approved}h</p>
                            <p>Làm thực: {actual}h</p>
                            <p className="border-t mt-1 pt-1 font-bold">Tính lương: {payroll}h</p>
                        </div>
                    }>
                        <Tag color={payroll > 0 ? "orange" : "default"} style={{ margin: 0 }}>
                            {payroll}
                        </Tag>
                    </Tooltip>
                );
            }
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            width: 155,
            render: (status: string, record: any) => {
                let color = "default";
                if (status === "Present") color = "success";
                if (status === "Late") color = "warning";
                if (status === "Absent") color = "error";
                if (status === "Incomplete") color = "blue";
                if (status === "PaidLeave") color = "cyan";
                if (status === "UnpaidLeave") color = "purple";
                
                const isInvalidLocation = record.location?.includes("[INVALID]");
                return (
                    <Space direction="vertical" size={2}>
                        <Space size={4}>
                            <Tag color={color} style={{ margin: 0 }}>{status}</Tag>
                            {isInvalidLocation && (
                                <Tooltip title="Vị trí check-in/out không hợp lệ">
                                    <ExclamationCircleOutlined className="text-red-500" />
                                </Tooltip>
                            )}
                        </Space>
                        {record.isManualAdjusted && <Tag color="gold" style={{ fontSize: '10px', margin: 0 }}>Adjusted</Tag>}
                    </Space>
                );
            }
        },
        {
            title: "Ghi chú",
            dataIndex: "remarks",
            key: "remarks",
            width: 140,
            ellipsis: true,
            render: (val: string) => {
                if (!val) return "—";
                return (
                    <Tooltip title={val}>
                        <span style={{ display: 'block', maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{val}</span>
                    </Tooltip>
                );
            }
        },
        {
            title: "Khóa",
            dataIndex: "isLocked",
            key: "isLocked",
            width: 65,
            align: 'center' as const,
            render: (locked: boolean, record: any) => {
                const isVirtual = !record.attendanceId || record.attendanceId === 0;
                if (isVirtual) return <Tooltip title="Bản ghi ảo, không thể khóa">—</Tooltip>;
                return (
                    <Tooltip title={locked ? "Bản ghi đã khóa (Click để mở)" : "Bản ghi đang mở (Click để khóa)"}>
                        <Button
                            type="text"
                            danger={locked}
                            icon={locked ? <LockOutlined /> : <UnlockOutlined />}
                            onClick={() => handleToggleLock(record)}
                        />
                    </Tooltip>
                );
            }
        },
        {
            title: "Thao tác",
            key: "action",
            width: 110,
            align: 'center' as const,
            render: (_: any, record: any) => (
                <Space size="small">
                    <Tooltip title="Xem chi tiết">
                        <Button type="primary" size="small" icon={<EyeOutlined />} onClick={() => setDetailModal({ open: true, employeeId: record.employeeId, employeeName: record.employeeName, date: record.attendanceDate })} />
                    </Tooltip>
                    <Tooltip title="Điều chỉnh thủ công">
                        <Button 
                            size="small" 
                            icon={<EditOutlined />} 
                            disabled={record.isLocked || record.attendanceId === 0}
                            onClick={() => setAdjustModal({ open: true, record })}
                        />
                    </Tooltip>
                    <Tooltip title="Lịch sử (Logs)">
                        <Button 
                            className="text-gray-500"
                            size="small" 
                            icon={<HistoryOutlined />} 
                            onClick={() => setLogsModal({ open: true, employeeId: record.employeeId, employeeName: record.employeeName, date: record.attendanceDate })}
                        />
                    </Tooltip>
                </Space>
            )
        }
    ];

    return (
        <Card className="shadow-sm" style={{ overflow: 'hidden' }}>
            {managerProfile && (
                <div style={{ marginBottom: 16, padding: '10px 14px', background: '#f0f5ff', borderRadius: 6, border: '1px solid #d6e4ff', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <TeamOutlined style={{ color: '#1677ff', fontSize: 16 }} />
                    <span style={{ fontWeight: 600, color: '#1677ff' }}>Phòng ban của bạn:</span>
                    <Tag color="blue" style={{ margin: 0, fontSize: 13 }}>
                        {managerProfile.departmentName || "Chưa phân công"}
                    </Tag>
                    <span style={{ color: '#555' }}>
                        Đang quản lý <strong>{employees.length}</strong> nhân viên
                    </span>
                </div>
            )}
            <div style={{ marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid #f0f0f0' }}>
                <Space wrap style={{ rowGap: 8 }}>
                    <RangePicker
                        value={dateRange}
                        onChange={(val) => setDateRange(val as any)}
                        format="DD/MM/YYYY"
                    />
                    <Select
                        placeholder="Tất cả nhân viên"
                        style={{ width: 200 }}
                        allowClear
                        showSearch
                        optionFilterProp="label"
                        value={selectedEmployee}
                        onChange={setSelectedEmployee}
                        options={employees.map(e => ({ label: `${e.employeeId} - ${e.fullName}`, value: e.employeeId }))}
                    />
                    <Select
                        placeholder="Trạng thái"
                        style={{ width: 180 }}
                        allowClear
                        value={statusFilter}
                        onChange={setStatusFilter}
                        options={[
                            { label: "Hiện diện (Present)", value: "Present" },
                            { label: "Đi muộn (Late)", value: "Late" },
                            { label: "Vắng mặt (Absent)", value: "Absent" },
                            { label: "Chưa hoàn tất", value: "Incomplete" },
                            { label: "Nghỉ phép có lương", value: "PaidLeave" },
                            { label: "Nghỉ phép không lương", value: "UnpaidLeave" },
                        ]}
                    />
                    <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
                        Lọc
                    </Button>
                    <Button onClick={handleToday}>
                        Hôm nay
                    </Button>
                    <Button icon={<ReloadOutlined />} onClick={handleRefresh} loading={refreshing}>
                        Làm mới
                    </Button>
                    <Button type="primary" danger icon={<PlusOutlined />} onClick={() => setCreateModal(true)}>
                        Tạo chấm công Manual
                    </Button>
                </Space>
            </div>

            <Table
                columns={columns}
                dataSource={allowedEmployeeIds ? records.filter(r => allowedEmployeeIds.has(r.employeeId)) : records}
                loading={loading}
                rowKey={(record) => record.attendanceId > 0 ? record.attendanceId : `virtual-${record.attendanceDate}-${record.employeeId}`}
                pagination={{ pageSize: 15 }}
                scroll={{ x: 1150 }}
                bordered
            />

            <AttendanceDetailModal
                open={detailModal.open}
                employeeId={detailModal.employeeId}
                employeeName={detailModal.employeeName}
                date={detailModal.date}
                onClose={() => setDetailModal({ ...detailModal, open: false })}
            />

            <ManualAdjustModal
                open={adjustModal.open}
                record={adjustModal.record}
                onClose={() => setAdjustModal({ open: false, record: null })}
            />

            <ManualCreateModal
                open={createModal}
                onClose={() => setCreateModal(false)}
            />

            <AttendanceLogsModal
                open={logsModal.open}
                employeeId={logsModal.employeeId}
                employeeName={logsModal.employeeName}
                date={logsModal.date}
                onClose={() => setLogsModal({ ...logsModal, open: false })}
            />
        </Card>
    );
};

export default AttendanceTable;
