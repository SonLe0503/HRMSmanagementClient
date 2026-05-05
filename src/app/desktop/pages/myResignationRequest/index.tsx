import { Layout, Typography, Row, Col } from "antd";
import ResignationRequestForm from "./components/ResignationRequestForm";
import MyResignationRequestTable from "./components/MyResignationRequestTable";

const { Content } = Layout;
const { Title } = Typography;

const MyResignationRequest = () => {
    return (
        <Layout className="bg-transparent p-6 min-h-screen">
            <Content>
                <div className="mb-8">
                    <Title level={2} className="m-0 text-slate-800">Đơn xin thôi việc</Title>
                    <p className="text-slate-500 mt-2 text-lg">Nộp và theo dõi đơn xin thôi việc của bạn.</p>
                </div>

                <Row gutter={[24, 24]}>
                    <Col xs={24} lg={8}>
                        <ResignationRequestForm />
                    </Col>
                    <Col xs={24} lg={16}>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-full">
                            <Title level={4} className="mb-6 flex items-center">
                                <span className="w-1.5 h-6 bg-red-500 rounded-full mr-3"></span>
                                Lịch sử đơn thôi việc
                            </Title>
                            <MyResignationRequestTable />
                        </div>
                    </Col>
                </Row>
            </Content>
        </Layout>
    );
};

export default MyResignationRequest;
