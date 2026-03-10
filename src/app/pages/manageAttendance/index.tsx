import { Card, Tabs, Typography } from "antd";
import { CalendarOutlined, TableOutlined } from "@ant-design/icons";
import ShiftSchedules from "./components/ShiftSchedules";
import AttendanceRecords from "./components/AttendanceRecords";

const { Title } = Typography;

const ManageAttendance = () => {
    const items = [
        {
            key: "1",
            label: (
                <span>
                    <CalendarOutlined />
                    Lịch làm việc
                </span>
            ),
            children: <ShiftSchedules />,
        },
        {
            key: "2",
            label: (
                <span>
                    <TableOutlined />
                    Dữ liệu chấm công
                </span>
            ),
            children: <AttendanceRecords />,
        },
    ];

    return (
        <div className="p-2">
            <Card>
                <Title level={4} style={{ marginBottom: 16 }}>Quản lý chấm công & Lịch làm việc</Title>
                <Tabs defaultActiveKey="1" items={items} />
            </Card>
        </div>
    );
};

export default ManageAttendance;
