import { Row, Col, Card, Statistic, DatePicker, Typography, Space, List, Badge, Spin, Button, Calendar } from "antd";
import { 
    TeamOutlined, CheckCircleOutlined, ClockCircleOutlined, 
    CalendarOutlined , GiftOutlined, 
    LineChartOutlined
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../store";
import { fetchManagerDashboardData, selectManagerDashboardData, selectDashboardLoading } from "../../../store/dashboardSlide";
import dayjs from "dayjs";
import { motion } from "framer-motion";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const DashboardManage = () => {
    const dispatch = useAppDispatch();
    const managerData = useAppSelector(selectManagerDashboardData);
    const loading = useAppSelector(selectDashboardLoading);
    const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([dayjs().subtract(30, 'day'), dayjs()]);

    useEffect(() => {
        dispatch(fetchManagerDashboardData({
            fromDate: dateRange[0].format("YYYY-MM-DD"),
            toDate: dateRange[1].format("YYYY-MM-DD")
        }));
    }, [dispatch, dateRange]);

    const stats = managerData?.statistics;

    const cards = [
        { title: "Quy mô nhóm", value: stats?.teamSize, icon: <TeamOutlined />, color: "#1890ff", desc: "Tổng số nhân viên trực tiếp" },
        { title: "Có mặt hôm nay", value: stats?.presentToday, icon: <CheckCircleOutlined />, color: "#52c41a", desc: "Đang làm việc" },
        { title: "Nghỉ hôm nay", value: stats?.onLeaveToday, icon: <CalendarOutlined />, color: "#faad14", desc: "Thành viên đang nghỉ phép" },
        { title: "Tỉ lệ chuyên cần nhóm", value: `${stats?.teamAttendanceRate ?? 0}%`, icon: <LineChartOutlined />, color: "#722ed1", desc: "Trung bình trong kỳ đã chọn" },
    ];

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const item = {
        hidden: { y: 20, opacity: 0 },
        show: { y: 0, opacity: 1 }
    };

    return (
        <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
            <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
                    <Col>
                        <Title level={2} style={{ margin: 0 }}>Tổng quan Quản lý nhóm</Title>
                        <Text type="secondary">Hiệu suất nhóm và theo dõi hiệu quả vận hành</Text>
                    </Col>
                    <Col>
                        <Space size="middle">
                            <RangePicker 
                                value={dateRange}
                                onChange={(dates) => {
                                    if (dates && dates[0] && dates[1]) setDateRange([dates[0], dates[1]]);
                                }}
                            />
                        </Space>
                    </Col>
                </Row>
            </motion.div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '100px' }}>
                    <Spin size="large" tip="Aggregating team data..." />
                </div>
            ) : (
                <motion.div variants={container} initial="hidden" animate="show">
                    <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
                        {cards.map((card, idx) => (
                            <Col xs={24} sm={12} md={6} key={idx}>
                                <motion.div variants={item}>
                                    <Card bordered={false} hoverable style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                                        <Statistic
                                            title={<Text type="secondary" strong>{card.title}</Text>}
                                            value={card.value}
                                            prefix={card.icon}
                                            valueStyle={{ color: card.color, fontWeight: 'bold' }}
                                        />
                                        <Text type="secondary" style={{ fontSize: '12px' }}>{card.desc}</Text>
                                    </Card>
                                </motion.div>
                            </Col>
                        ))}
                    </Row>

                    <Row gutter={[24, 24]}>
                        <Col span={16}>
                             <Space direction="vertical" style={{ width: '100%' }} size={24}>
                                <motion.div variants={item}>
                                    <Card title={<Space><ClockCircleOutlined />Đơn nghỉ phép chờ duyệt</Space>} bordered={false} style={{ borderRadius: '12px' }}>
                                        <List
                                            dataSource={managerData?.pendingLeaveRequests || []}
                                            renderItem={(request) => (
                                                <List.Item extra={<Button type="link">Xem xét</Button>}>
                                                    <List.Item.Meta
                                                        title={request.employeeName}
                                                        description={`${request.leaveType} — ${request.days} day(s)`}
                                                    />
                                                </List.Item>
                                            )}
                                        />
                                    </Card>
                                </motion.div>
                                <motion.div variants={item}>
                                    <Card title={<Space><CalendarOutlined />Lịch nghỉ sắp tới của nhóm</Space>} bordered={false} style={{ borderRadius: '12px' }}>
                                        <List
                                            dataSource={managerData?.upcomingTeamLeaves || []}
                                            renderItem={(leave) => (
                                                <List.Item>
                                                    <List.Item.Meta
                                                        title={leave.employeeName}
                                                        description={`${leave.leaveType} (${leave.dateRange})`}
                                                    />
                                                </List.Item>
                                            )}
                                        />
                                    </Card>
                                </motion.div>
                             </Space>
                        </Col>
                        <Col span={8}>
                            <motion.div variants={item}>
                                <Card size="small" bordered={false} style={{ borderRadius: '12px', marginBottom: 24 }}>
                                    <Calendar fullscreen={false} />
                                </Card>
                            </motion.div>
                            <motion.div variants={item}>
                                <Card title="Công việc & Hiệu suất" bordered={false} style={{ borderRadius: '12px' }}>
                                    <Space direction="vertical" style={{ width: '100%' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Text>Công việc đang mở:</Text><Text strong>{managerData?.taskPerformance.activeTasks}</Text>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Text>Công việc quá hạn:</Text><Text type="danger" strong>{managerData?.taskPerformance.overdueTasks}</Text>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Text>Tỉ lệ hoàn thành:</Text><Text strong>{managerData?.taskPerformance.completionRate}%</Text>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Text>Đánh giá chờ xử lý:</Text><Text strong>{managerData?.taskPerformance.pendingEvaluations}</Text>
                                        </div>
                                    </Space>
                                </Card>
                            </motion.div>
                        </Col>
                    </Row>

                    <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
                        <Col span={12}>
                             <motion.div variants={item}>
                                <Card title="Hoạt động nhóm gần đây" bordered={false} style={{ borderRadius: '12px' }}>
                                    <List
                                        dataSource={managerData?.recentTeamActivities || []}
                                        renderItem={(activity) => (
                                            <List.Item>
                                                <List.Item.Meta
                                                    avatar={<Badge status="processing" />}
                                                    title={activity.description}
                                                    description={dayjs(activity.timestamp).format("DD/MM/YYYY HH:mm")}
                                                />
                                            </List.Item>
                                        )}
                                    />
                                </Card>
                             </motion.div>
                        </Col>
                        <Col span={12}>
                            <motion.div variants={item}>
                                <Card title="Cột mốc sắp tới của nhóm" bordered={false} style={{ borderRadius: '12px' }}>
                                    <List
                                        dataSource={managerData?.teamMilestones || []}
                                        renderItem={(m) => (
                                            <List.Item>
                                                <List.Item.Meta
                                                    avatar={<GiftOutlined />}
                                                    title={m.employeeName}
                                                    description={`${m.detail} — ${dayjs(m.date).format("MMMM DD")}`}
                                                />
                                            </List.Item>
                                        )}
                                    />
                                </Card>
                            </motion.div>
                        </Col>
                    </Row>
                </motion.div>
            )}
        </div>
    );
};

export default DashboardManage;