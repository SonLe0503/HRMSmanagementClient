import { Layout, Typography, Row, Col } from "antd";
import MyLeaveRequestTable from "./components/MyLeaveRequestTable";
import LeaveRequestForm from "./components/LeaveRequestForm";

const { Content } = Layout;
const { Title } = Typography;

const MyLeaveRequest = () => {
    return (
        <Layout className="bg-transparent p-6 min-h-screen">
            <Content>
                <div className="mb-6">
                    <Title level={2} className="m-0">Nghỉ phép của tôi</Title>
                    <p className="text-gray-500 mt-2">Đăng ký và theo dõi các yêu cầu nghỉ phép của bạn.</p>
                </div>

                <Row gutter={[24, 24]}>
                    <Col xs={24} lg={8}>
                        <LeaveRequestForm />
                    </Col>
                    <Col xs={24} lg={16}>
                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <Title level={4} className="mb-4">Lịch sử nghỉ phép</Title>
                            <MyLeaveRequestTable />
                        </div>
                    </Col>
                </Row>
            </Content>
        </Layout>
    );
};

export default MyLeaveRequest;
