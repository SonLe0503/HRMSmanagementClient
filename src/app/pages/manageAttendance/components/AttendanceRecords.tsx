import { useState, useEffect } from "react";
import { Table, Button, Space, DatePicker, Select, Tag, Card, Tooltip } from "antd";
import { SearchOutlined, DownloadOutlined, EyeOutlined } from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { fetchAdminAttendance, selectAdminAttendance, selectAttendanceLoading } from "../../../../store/attendanceSlide";
import { fetchAllEmployees, selectEmployees } from "../../../../store/employeeSlide";
import dayjs from "dayjs";
import AttendanceDetailModal from "../modal/AttendanceDetailModal";

const { RangePicker } = DatePicker;

const AttendanceRecords = () => {
    const dispatch = useAppDispatch();
    const records = useAppSelector(selectAdminAttendance);
    const loading = useAppSelector(selectAttendanceLoading);
    const employees = useAppSelector(selectEmployees);

    const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null]>([dayjs().startOf('month'), dayjs()]);
    const [selectedEmployee, setSelectedEmployee] = useState<number | undefined>(undefined);
    const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<any>(null);

    useEffect(() => {
        handleSearch();
        dispatch(fetchAllEmployees());
    }, [dispatch]);

    const handleSearch = () => {
        dispatch(fetchAdminAttendance({
            date: dateRange[0]?.format("YYYY-MM-DD"), // Simplified for now, backend might need range
            deptId: undefined,
            status: statusFilter
        }));
    };

    const handleExport = () => {
        // Mock export
        console.log("Exporting records...");
    };

    const handleViewDetail = (record: any) => {
        setSelectedRecord(record);
        setIsDetailOpen(true);
    };

    const columns = [
        { title: "Mã NV", dataIndex: "employeeCode", key: "employeeCode" },
        { title: "Họ và tên", dataIndex: "fullName", key: "fullName" },
        { title: "Ngày", dataIndex: "date", key: "date" },
        { title: "Ca làm việc", dataIndex: "shiftName", key: "shiftName" },
        {
            title: "Giờ vào",
            dataIndex: "checkIn",
            key: "checkIn",
            render: (val: string) => val ? dayjs(val).format("HH:mm:ss") : "—"
        },
        {
            title: "Giờ ra",
            dataIndex: "checkOut",
            key: "checkOut",
            render: (val: string) => val ? dayjs(val).format("HH:mm:ss") : "—"
        },
        {
            title: "Số phút trễ",
            dataIndex: "lateMinutes",
            key: "lateMinutes",
            render: (val: number) => val > 0 ? <Tag color="red">{val} phút</Tag> : <Tag color="green">0</Tag>
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            render: (status: string) => {
                let color = "default";
                if (status === "Present") color = "green";
                if (status === "Late") color = "orange";
                if (status === "Absent") color = "red";
                return <Tag color={color}>{status}</Tag>;
            }
        },
        {
            title: "Thao tác",
            key: "action",
            render: (_: any, record: any) => (
                <Tooltip title="Xem chi tiết">
                    <Button icon={<EyeOutlined />} onClick={() => handleViewDetail(record)} />
                </Tooltip>
            )
        }
    ];

    return (
        <Space direction="vertical" style={{ width: "100%" }} size="large">
            <Card size="small" className="bg-light">
                <Space wrap>
                    <RangePicker
                        value={dateRange}
                        onChange={(val) => setDateRange(val as any)}
                        format="DD/MM/YYYY"
                    />
                    <Select
                        placeholder="Chọn nhân viên"
                        style={{ width: 200 }}
                        allowClear
                        showSearch
                        optionFilterProp="label"
                        value={selectedEmployee}
                        onChange={setSelectedEmployee}
                        options={employees.map(e => ({ label: e.fullName, value: e.employeeId }))}
                    />
                    <Select
                        placeholder="Trạng thái"
                        style={{ width: 150 }}
                        allowClear
                        value={statusFilter}
                        onChange={setStatusFilter}
                        options={[
                            { label: "Hiện diện", value: "Present" },
                            { label: "Đi muộn", value: "Late" },
                            { label: "Vắng mặt", value: "Absent" },
                        ]}
                    />
                    <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
                        Tìm kiếm
                    </Button>
                    <Button icon={<DownloadOutlined />} onClick={handleExport}>
                        Xuất Excel (MSG-21)
                    </Button>
                </Space>
            </Card>

            <Table
                columns={columns}
                dataSource={records}
                loading={loading}
                rowKey="attendanceId"
                pagination={{ pageSize: 10 }}
            />

            <AttendanceDetailModal
                open={isDetailOpen}
                onCancel={() => setIsDetailOpen(false)}
                record={selectedRecord}
            />
        </Space>
    );
};

export default AttendanceRecords;
