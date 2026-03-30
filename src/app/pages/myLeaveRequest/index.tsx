import { Layout, Typography, Row, Col, Card, Statistic, Badge } from "antd";
import MyLeaveRequestTable from "./components/MyLeaveRequestTable";
import LeaveRequestForm from "./components/LeaveRequestForm";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../store";
import { fetchMyBalance, selectMyLeaveBalances } from "../../../store/leaveBalanceSlide";

const { Content } = Layout;
const { Title } = Typography;

const MyLeaveRequest = () => {
    const dispatch = useAppDispatch();
    const balances = useAppSelector(selectMyLeaveBalances);

    useEffect(() => {
        dispatch(fetchMyBalance());
    }, [dispatch]);

    return (
        <Layout className="bg-transparent p-6 min-h-screen">
            <Content>
                <div className="mb-8">
                    <Title level={2} className="m-0 text-slate-800">Nghỉ phép của tôi</Title>
                    <p className="text-slate-500 mt-2 text-lg">Đăng ký và theo dõi các yêu cầu nghỉ phép của bạn.</p>
                </div>

                {/* Balance Section */}
                <Row gutter={[24, 24]} className="mb-8">
                    {(balances || []).map((item: any) => (
                        <Col xs={24} sm={12} md={6} key={item.leaveTypeId}>
                            <Card className="rounded-2xl border-none shadow-sm hover:shadow-md transition-shadow h-full bg-gradient-to-br from-white to-slate-50">
                                <Statistic
                                    title={<span className="text-slate-500 font-medium">{item.leaveTypeName}</span>}
                                    value={item.remainingDays}
                                    suffix={<span className="text-sm text-slate-400">/ {item.totalEntitlement}</span>}
                                    valueStyle={{ color: '#1e293b', fontWeight: 700 }}
                                />
                                <div className="mt-2">
                                    <Badge status="processing" text={`Đã dùng: ${item.usedDays}`} className="text-xs text-slate-400" />
                                </div>
                            </Card>
                        </Col>
                    ))}
                </Row>

                <Row gutter={[24, 24]}>
                    <Col xs={24} lg={8}>
                        <LeaveRequestForm />
                    </Col>
                    <Col xs={24} lg={16}>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-full">
                            <Title level={4} className="mb-6 flex items-center">
                                <span className="w-1.5 h-6 bg-blue-500 rounded-full mr-3"></span>
                                Lịch sử nghỉ phép
                            </Title>
                            <MyLeaveRequestTable />
                        </div>
                    </Col>
                </Row>
            </Content>
        </Layout>
    );
};

export default MyLeaveRequest;
