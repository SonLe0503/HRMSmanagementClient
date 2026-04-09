import { Layout, Typography, Row, Col, Card, Statistic, Badge } from "antd";
import MyOvertimeRequestTable from "./components/MyOvertimeRequestTable";
import OvertimeRequestForm from "./components/OvertimeRequestForm";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../store";
import { fetchMyOvertimeRequests, selectMyOvertimeRequests } from "../../../store/overtimeSlide";

const { Content } = Layout;
const { Title } = Typography;

const MyOvertimeRequest = () => {
    const dispatch = useAppDispatch();
    const requests = useAppSelector(selectMyOvertimeRequests);

    useEffect(() => {
        dispatch(fetchMyOvertimeRequests());
    }, [dispatch]);

    const stats = {
        total: requests.length,
        approved: requests.filter(r => r.status === "Approved").length,
        pending: requests.filter(r => r.status === "Pending").length,
        rejected: requests.filter(r => r.status === "Rejected" || r.status === "Cancelled").length,
    };

    return (
        <Layout className="bg-transparent p-6 min-h-screen">
            <Content>
                <div className="mb-8">
                    <Title level={2} className="m-0 text-slate-800 font-bold">Làm thêm giờ của tôi</Title>
                    <p className="text-slate-500 mt-2 text-lg font-medium">Đăng ký và theo dõi các yêu cầu tăng ca của bạn.</p>
                </div>

                {/* Overtime Stats Section */}
                <Row gutter={[24, 24]} className="mb-8">
                    <Col xs={24} sm={12} md={6}>
                        <Card className="rounded-2xl border-none shadow-sm hover:shadow-md transition-shadow h-full bg-gradient-to-br from-white to-blue-50">
                            <Statistic
                                title={<span className="text-slate-500 font-semibold uppercase tracking-wider text-xs">Tổng số yêu cầu</span>}
                                value={stats.total}
                                valueStyle={{ color: '#2563eb', fontWeight: 800, fontSize: '2rem' }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card className="rounded-2xl border-none shadow-sm hover:shadow-md transition-shadow h-full bg-gradient-to-br from-white to-emerald-50 text-emerald-600">
                            <Statistic
                                title={<span className="text-slate-500 font-semibold uppercase tracking-wider text-xs">Đã phê duyệt</span>}
                                value={stats.approved}
                                valueStyle={{ color: '#059669', fontWeight: 800, fontSize: '2rem' }}
                            />
                            <div className="mt-2 flex items-center gap-1 opacity-80">
                                <Badge status="success" />
                                <span className="text-xs font-semibold">Hoàn tất</span>
                            </div>
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card className="rounded-2xl border-none shadow-sm hover:shadow-md transition-shadow h-full bg-gradient-to-br from-white to-orange-50 text-orange-600">
                            <Statistic
                                title={<span className="text-slate-500 font-semibold uppercase tracking-wider text-xs">Đang chờ duyệt</span>}
                                value={stats.pending}
                                valueStyle={{ color: '#d97706', fontWeight: 800, fontSize: '2rem' }}
                            />
                            <div className="mt-2 flex items-center gap-1 opacity-80">
                                <Badge status="warning" />
                                <span className="text-xs font-semibold">Xử lý...</span>
                            </div>
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card className="rounded-2xl border-none shadow-sm hover:shadow-md transition-shadow h-full bg-gradient-to-br from-white to-rose-50 text-rose-600">
                            <Statistic
                                title={<span className="text-slate-500 font-semibold uppercase tracking-wider text-xs">Đã từ chối/hủy</span>}
                                value={stats.rejected}
                                valueStyle={{ color: '#e11d48', fontWeight: 800, fontSize: '2rem' }}
                            />
                        </Card>
                    </Col>
                </Row>

                <Row gutter={[24, 24]}>
                    <Col xs={24} lg={8}>
                        <OvertimeRequestForm />
                    </Col>
                    <Col xs={24} lg={16}>
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 h-full backdrop-blur-xl bg-white/90">
                            <Title level={4} className="mb-8 flex items-center font-bold text-slate-800">
                                <span className="w-1.5 h-7 bg-blue-600 rounded-full mr-4 shadow-[0_0_12px_rgba(37,99,235,0.4)]"></span>
                                Lịch sử tăng ca
                            </Title>
                            <MyOvertimeRequestTable />
                        </div>
                    </Col>
                </Row>
            </Content>
        </Layout>
    );
};

export default MyOvertimeRequest;
