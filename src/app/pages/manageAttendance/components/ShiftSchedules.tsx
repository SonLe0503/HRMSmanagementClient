import { useState, useEffect } from "react";
import { Card, Button, Space, Select, Typography, Table, Badge, Tooltip } from "antd";
import { PlusOutlined, LeftOutlined, RightOutlined } from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { fetchWeeklySchedule, selectSchedules, selectAttendanceLoading } from "../../../../store/attendanceSlide";
import { fetchAllEmployees, selectEmployees } from "../../../../store/employeeSlide";
import dayjs from "dayjs";
import ShiftModal from "../modal/ShiftModal";

const { Title, Text } = Typography;

const ShiftSchedules = () => {
    const dispatch = useAppDispatch();
    const schedules = useAppSelector(selectSchedules);
    const loading = useAppSelector(selectAttendanceLoading);
    const employees = useAppSelector(selectEmployees);

    const [currentDate, setCurrentDate] = useState(dayjs());
    const [viewType, setViewType] = useState<"employee" | "department">("employee");
    const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
    const [editingShift, setEditingShift] = useState<any>(null);

    const weekDays = Array.from({ length: 7 }, (_, i) => currentDate.startOf("week").add(i, "day"));

    useEffect(() => {
        dispatch(fetchAllEmployees());
    }, [dispatch]);

    useEffect(() => {
        // In a real app, you might fetch all assignments for the week
        // and group them. For now, we'll use a mocked logic or 
        // dispatch individual fetches if needed.
    }, [currentDate, dispatch]);

    const handlePrevWeek = () => setCurrentDate(currentDate.subtract(1, "week"));
    const handleNextWeek = () => setCurrentDate(currentDate.add(1, "week"));
    const handleToday = () => setCurrentDate(dayjs());

    const handleCreateShift = () => {
        setEditingShift(null);
        setIsShiftModalOpen(true);
    };

    const handleEditShift = (shift: any) => {
        setEditingShift(shift);
        setIsShiftModalOpen(true);
    };

    // Columns: Employee + Days of week
    const columns: any[] = [
        {
            title: "Nhân viên",
            dataIndex: "fullName",
            key: "fullName",
            fixed: "left",
            width: 200,
            render: (text: string, record: any) => (
                <div>
                    <Text strong>{text}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: "12px" }}>{record.employeeCode}</Text>
                </div>
            )
        },
        ...weekDays.map(day => ({
            title: (
                <div style={{ textAlign: "center" }}>
                    <div>{day.format("ddd")}</div>
                    <div style={{ fontSize: "16px" }}>{day.format("DD/MM")}</div>
                </div>
            ),
            dataIndex: day.format("YYYY-MM-DD"),
            key: day.format("YYYY-MM-DD"),
            width: 150,
            render: (shifts: any[]) => {
                if (!shifts || shifts.length === 0) return null;
                return shifts.map((s, idx) => (
                    <Tooltip title={`${s.startTime} - ${s.endTime}`} key={idx}>
                        <div
                            style={{
                                backgroundColor: "#e6f7ff",
                                border: "1px solid #91d5ff",
                                borderRadius: "4px",
                                padding: "4px 8px",
                                cursor: "pointer",
                                marginBottom: "4px"
                            }}
                            onClick={() => handleEditShift(s)}
                        >
                            <Badge status="processing" text={s.shiftName} />
                        </div>
                    </Tooltip>
                ));
            }
        }))
    ];

    // Mocking data structure for the grid
    const dataSource = employees.map(emp => {
        const row: any = { ...emp };
        weekDays.forEach(day => {
            const dateStr = day.format("YYYY-MM-DD");
            // Here you would filter assignments for this employee on this date
            row[dateStr] = [];
        });
        return row;
    });

    return (
        <Space direction="vertical" style={{ width: "100%" }} size="middle">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Space>
                    <Button icon={<LeftOutlined />} onClick={handlePrevWeek} />
                    <Button onClick={handleToday}>Hôm nay</Button>
                    <Button icon={<RightOutlined />} onClick={handleNextWeek} />
                    <Title level={5} style={{ margin: 0, marginLeft: 8 }}>
                        Tháng {currentDate.format("MM, YYYY")}
                    </Title>
                </Space>
                <Space>
                    <Select
                        value={viewType}
                        onChange={setViewType}
                        options={[
                            { label: "Theo nhân viên", value: "employee" },
                            { label: "Theo phòng ban", value: "department" }
                        ]}
                    />
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateShift}>
                        Tạo lịch (2.3.2)
                    </Button>
                </Space>
            </div>

            <Card bodyStyle={{ padding: 0 }}>
                <Table
                    columns={columns}
                    dataSource={dataSource}
                    scroll={{ x: 1200 }}
                    bordered
                    pagination={false}
                    size="small"
                    loading={loading}
                    rowKey="employeeId"
                />
            </Card>

            <ShiftModal
                open={isShiftModalOpen}
                onCancel={() => setIsShiftModalOpen(false)}
                editingShift={editingShift}
                currentDate={currentDate}
            />
        </Space>
    );
};

export default ShiftSchedules;
