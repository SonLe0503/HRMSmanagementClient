import { useState, useEffect } from "react";
import { Table, Button, Space, DatePicker, Select, Tag, Card, Tooltip } from "antd";
import { SearchOutlined, EditOutlined, EyeOutlined, PlusOutlined, LockOutlined, UnlockOutlined, HistoryOutlined } from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { searchAttendance, selectAdminAttendance, selectAttendanceLoading, lockAttendance, unlockAttendance } from "../../../../store/attendanceSlide";
import { fetchAllEmployees, selectEmployees } from "../../../../store/employeeSlide";
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
    const employees = useAppSelector(selectEmployees);

    const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null]>([dayjs().startOf('month'), dayjs()]);
    const [selectedEmployee, setSelectedEmployee] = useState<number | undefined>(undefined);
    const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
    
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
        if (record.isLocked) {
            await dispatch(unlockAttendance(record.attendanceId));
        } else {
            await dispatch(lockAttendance(record.attendanceId));
        }
    };

    const columns = [
        { title: "Mã NV", dataIndex: "employeeId", key: "employeeId", width: 80, align: 'center' as const },
        { title: "Họ và tên", dataIndex: "employeeName", key: "employeeName" },
        { title: "Ngày", dataIndex: "attendanceDate", key: "attendanceDate", render: (val: string) => dayjs(val).format("DD/MM/YYYY") },
        { title: "Giờ vào", dataIndex: "checkInTime", key: "checkInTime", render: (val: string) => val ? dayjs(val).format("HH:mm:ss") : "—" },
        { title: "Giờ ra", dataIndex: "checkOutTime", key: "checkOutTime", render: (val: string) => val ? dayjs(val).format("HH:mm:ss") : "—" },
        { title: "Tổng h", dataIndex: "workingHours", key: "workingHours", align: 'center' as const, render: (val: number) => val ?? "0" },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            render: (status: string, record: any) => {
                let color = "default";
                if (status === "Present") color = "success";
                if (status === "Late") color = "warning";
                if (status === "Absent") color = "error";
                if (status === "Incomplete") color = "blue";
                
                return (
                    <Space direction="vertical" size="small">
                        <Tag color={color}>{status}</Tag>
                        {record.isManualAdjusted && <Tag color="gold" style={{ fontSize: '10px' }}>Adjusted</Tag>}
                    </Space>
                );
            }
        },
        {
            title: "Khóa",
            dataIndex: "isLocked",
            key: "isLocked",
            align: 'center' as const,
            render: (locked: boolean, record: any) => (
                <Tooltip title={locked ? "Bản ghi đã khóa (Click để mở)" : "Bản ghi đang mở (Click để khóa)"}>
                    <Button 
                        type="text" 
                        danger={locked}
                        icon={locked ? <LockOutlined /> : <UnlockOutlined />} 
                        onClick={() => handleToggleLock(record)}
                    />
                </Tooltip>
            )
        },
        {
            title: "Thao tác",
            key: "action",
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
                            disabled={record.isLocked}
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
        <Card className="shadow-sm">
            <div className="flex flex-wrap items-center justify-between mb-6 gap-4 border-b pb-4">
                <Space wrap>
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
                        style={{ width: 150 }}
                        allowClear
                        value={statusFilter}
                        onChange={setStatusFilter}
                        options={[
                            { label: "Hiện diện (Present)", value: "Present" },
                            { label: "Đi muộn (Late)", value: "Late" },
                            { label: "Vắng mặt (Absent)", value: "Absent" },
                            { label: "Chưa hoàn tất", value: "Incomplete" },
                        ]}
                    />
                    <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
                        Lọc
                    </Button>
                    <Button onClick={handleToday}>
                        Hôm nay
                    </Button>
                </Space>

                <Button type="primary" danger icon={<PlusOutlined />} onClick={() => setCreateModal(true)}>
                    Tạo chấm công Manual
                </Button>
            </div>

            <Table
                columns={columns}
                dataSource={records}
                loading={loading}
                rowKey="attendanceId"
                pagination={{ pageSize: 15 }}
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
