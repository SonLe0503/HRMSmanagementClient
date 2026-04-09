import { Typography, Row, Col, Tabs, Card } from "antd";
import AttendanceTodayCard from "./components/AttendanceTodayCard";
import MyAttendanceHistoryTable from "./components/MyAttendanceHistoryTable";
import MyScheduleTable from "./components/MyScheduleTable";
import { ClockCircleOutlined, HistoryOutlined, CalendarOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const MyAttendance = () => {
    const items = [
        {
            key: '1',
            label: (
                <div className="flex items-center gap-2 px-2">
                    <ClockCircleOutlined />
                    Hôm Nay
                </div>
            ),
            children: (
                <Row gutter={[24, 24]}>
                    <Col xs={24} lg={10}>
                        <AttendanceTodayCard />
                    </Col>
                    <Col xs={24} lg={14}>
                        <Card title="Giao dịch chấm công" bordered={false} className="shadow-sm">
                             <Text type="secondary">Các hoạt động check-in/out gần đây nhất của bạn sẽ hiển thị tại đây.</Text>
                             <MyAttendanceHistoryTable />
                        </Card>
                    </Col>
                </Row>
            ),
        },
        {
            key: '2',
            label: (
                <div className="flex items-center gap-2 px-2">
                    <CalendarOutlined />
                    Lịch Làm Việc
                </div>
            ),
            children: <MyScheduleTable />,
        },
        {
            key: '3',
            label: (
                <div className="flex items-center gap-2 px-2">
                    <HistoryOutlined />
                    Lịch Sử Chấm Công
                </div>
            ),
            children: <MyAttendanceHistoryTable />,
        },
    ];

    return (
        <div className="p-6 bg-gray-50/50 min-h-screen">
            <div className="mb-6">
                <Title level={2} className="m-0 font-bold text-gray-800">Chấm công của tôi</Title>
                <div className="flex items-center gap-2 text-gray-500 mt-2">
                    <ClockCircleOutlined />
                    <span>Hệ thống chấm công bằng nhận diện khuôn mặt</span>
                </div>
            </div>

            <Tabs 
                defaultActiveKey="1" 
                items={items} 
                className="custom-tabs" 
                size="large"
            />

        </div>
    );
};

export default MyAttendance;
