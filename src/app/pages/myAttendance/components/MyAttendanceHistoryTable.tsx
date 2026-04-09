import { useState, useEffect } from "react";
import { Table, DatePicker, Button, Space, Card, Tag } from "antd";
import { SearchOutlined, ReloadOutlined } from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { fetchMyHistory, selectMyHistory, selectAttendanceLoading } from "../../../../store/attendanceSlide";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;

const MyAttendanceHistoryTable = () => {
    const dispatch = useAppDispatch();
    const records = useAppSelector(selectMyHistory);
    const loading = useAppSelector(selectAttendanceLoading);

    const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null]>([
        dayjs().startOf('month'),
        dayjs()
    ]);

    useEffect(() => {
        handleSearch();
    }, [dispatch]);

    const handleSearch = () => {
        const fromDate = dateRange[0] ? dateRange[0].format("YYYY-MM-DD") : undefined;
        const toDate = dateRange[1] ? dateRange[1].format("YYYY-MM-DD") : undefined;
        dispatch(fetchMyHistory({ fromDate, toDate }));
    };

    const handleReset = () => {
        setDateRange([dayjs().startOf('month'), dayjs()]);
        dispatch(fetchMyHistory({
            fromDate: dayjs().startOf('month').format("YYYY-MM-DD"),
            toDate: dayjs().format("YYYY-MM-DD")
        }));
    };

    const columns = [
        {
            title: "Ngày",
            dataIndex: "attendanceDate",
            key: "attendanceDate",
            render: (text: string) => dayjs(text).format("DD/MM/YYYY")
        },
        {
            title: "Check In",
            dataIndex: "checkInTime",
            key: "checkInTime",
            render: (val: string) => val ? dayjs(val).format("HH:mm:ss") : "—"
        },
        {
            title: "Check Out",
            dataIndex: "checkOutTime",
            key: "checkOutTime",
            render: (val: string) => val ? dayjs(val).format("HH:mm:ss") : "—"
        },
        {
            title: "Giờ làm việc (h)",
            dataIndex: "workingHours",
            key: "workingHours",
            align: 'center' as const,
            render: (val: number) => val ?? "0"
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            render: (status: string) => {
                let color = "default";
                if (status === "Present") color = "success";
                if (status === "Late") color = "warning";
                if (status === "Absent") color = "error";
                if (status === "Incomplete") color = "blue";
                return <Tag color={color}>{status}</Tag>;
            }
        },
        {
            title: "Ghi chú",
            dataIndex: "remarks",
            key: "remarks",
            render: (val: string) => val || "—"
        }
    ];

    return (
        <Card title="Lịch sử chấm công của tôi">
            <Space className="mb-4">
                <RangePicker 
                    value={dateRange}
                    onChange={(val) => setDateRange(val as any)}
                    format="DD/MM/YYYY"
                    allowClear={false}
                />
                <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch} loading={loading}>
                    Tìm kiếm
                </Button>
                <Button icon={<ReloadOutlined />} onClick={handleReset}>
                    Làm mới
                </Button>
            </Space>

            <Table 
                columns={columns} 
                dataSource={records} 
                rowKey="attendanceId" 
                loading={loading}
                pagination={{ pageSize: 15 }}
                bordered
            />
        </Card>
    );
};

export default MyAttendanceHistoryTable;
