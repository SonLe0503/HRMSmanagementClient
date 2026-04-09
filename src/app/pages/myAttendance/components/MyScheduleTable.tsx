import { useEffect, useState } from "react";
import { Table, Card, Tag, Space, DatePicker, Button, Typography } from "antd";
import { SearchOutlined, ReloadOutlined, ClockCircleOutlined } from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { fetchMySchedule, selectMySchedule, selectShiftAssignmentLoading } from "../../../../store/shiftAssignmentSlide";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;
const { Text } = Typography;

const MyScheduleTable = () => {
    const dispatch = useAppDispatch();
    const schedule = useAppSelector(selectMySchedule);
    const loading = useAppSelector(selectShiftAssignmentLoading);

    const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null]>([
        dayjs().startOf('week'),
        dayjs().endOf('month')
    ]);

    const handleFetch = () => {
        const fromDate = dateRange[0]?.format("YYYY-MM-DD");
        const toDate = dateRange[1]?.format("YYYY-MM-DD");
        dispatch(fetchMySchedule({ fromDate, toDate }));
    };

    useEffect(() => {
        handleFetch();
    }, [dispatch]);

    const columns = [
        {
            title: "Ngày",
            dataIndex: "assignmentDate",
            key: "assignmentDate",
            render: (text: string) => (
                <Space>
                    <ClockCircleOutlined className="text-gray-400" />
                    <span className="font-medium">{dayjs(text).format("DD/MM/YYYY")}</span>
                    <Text type="secondary" className="text-xs">({dayjs(text).format("dddd")})</Text>
                </Space>
            )
        },
        {
            title: "Mã Ca",
            dataIndex: "shiftCode",
            key: "shiftCode",
            render: (code: string) => <Tag color="blue">{code}</Tag>
        },
        {
            title: "Tên Ca",
            dataIndex: "shiftName",
            key: "shiftName",
            render: (name: string) => <Text className="font-medium">{name}</Text>
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            render: (status: string) => (
                <Tag color={status === "Active" ? "success" : "default"}>
                    {status === "Active" ? "Đang áp dụng" : "Đã hủy"}
                </Tag>
            )
        }
    ];

    return (
        <Card title="Lịch làm việc của tôi" className="shadow-sm border-0 rounded-xl overflow-hidden">
            <Space className="mb-4 flex flex-wrap">
                <RangePicker 
                    value={dateRange}
                    onChange={(val) => setDateRange(val as any)}
                    format="DD/MM/YYYY"
                />
                <Button type="primary" icon={<SearchOutlined />} onClick={handleFetch} loading={loading}>
                    Xem lịch
                </Button>
                <Button icon={<ReloadOutlined />} onClick={() => {
                    setDateRange([dayjs().startOf('week'), dayjs().endOf('month')]);
                    dispatch(fetchMySchedule({ 
                        fromDate: dayjs().startOf('week').format("YYYY-MM-DD"), 
                        toDate: dayjs().endOf('month').format("YYYY-MM-DD") 
                    }));
                }}>
                    Làm mới
                </Button>
            </Space>

            <Table 
                columns={columns} 
                dataSource={schedule} 
                rowKey="assignmentId"
                loading={loading}
                pagination={{ pageSize: 10 }}
                locale={{ emptyText: "Không có lịch làm việc trong khoảng thời gian này" }}
            />
        </Card>
    );
};

export default MyScheduleTable;
