import { Layout, Typography, Row, Col } from "antd";
import AttendanceTodayCard from "./components/AttendanceTodayCard";
import MyAttendanceHistoryTable from "./components/MyAttendanceHistoryTable";

const { Content } = Layout;
const { Title } = Typography;

const MyAttendance = () => {
    return (
        <Layout className="bg-transparent p-6 min-h-screen">
            <Content>
                <div className="mb-6">
                    <Title level={2} className="m-0">Chấm công của tôi</Title>
                    <p className="text-gray-500 mt-2">Xem thông tin chấm công hôm nay và lịch sử của bạn.</p>
                </div>

                <Row gutter={[24, 24]}>
                    <Col xs={24} lg={8}>
                        <AttendanceTodayCard />
                    </Col>
                    <Col xs={24} lg={16}>
                        <MyAttendanceHistoryTable />
                    </Col>
                </Row>
            </Content>
        </Layout>
    );
};

export default MyAttendance;
