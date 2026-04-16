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
        { title: "Team Size", value: stats?.teamSize, icon: <TeamOutlined />, color: "#1890ff", desc: "Total direct reports" },
        { title: "Present Today", value: stats?.presentToday, icon: <CheckCircleOutlined />, color: "#52c41a", desc: "Currently at work" },
        { title: "On Leave Today", value: stats?.onLeaveToday, icon: <CalendarOutlined />, color: "#faad14", desc: "Team members on leave" },
        { title: "Team Attendance Rate", value: `${stats?.teamAttendanceRate ?? 0}%`, icon: <LineChartOutlined />, color: "#722ed1", desc: "Average for selected period" },
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
                        <Title level={2} style={{ margin: 0 }}>Manager Overview Dashboard</Title>
                        <Text type="secondary">Team performance and operational efficiency tracker</Text>
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
                                    <Card title={<Space><ClockCircleOutlined />Pending Leave Requests</Space>} bordered={false} style={{ borderRadius: '12px' }}>
                                        <List
                                            dataSource={managerData?.pendingLeaveRequests || []}
                                            renderItem={(request) => (
                                                <List.Item extra={<Button type="link">Review</Button>}>
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
                                    <Card title={<Space><CalendarOutlined />Upcoming Team Leaves</Space>} bordered={false} style={{ borderRadius: '12px' }}>
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
                                <Card title="Tasks & Performance" bordered={false} style={{ borderRadius: '12px' }}>
                                    <Space direction="vertical" style={{ width: '100%' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Text>Active Tasks:</Text><Text strong>{managerData?.taskPerformance.activeTasks}</Text>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Text>Overdue Tasks:</Text><Text type="danger" strong>{managerData?.taskPerformance.overdueTasks}</Text>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Text>Completion Rate:</Text><Text strong>{managerData?.taskPerformance.completionRate}%</Text>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Text>Pending Evaluations:</Text><Text strong>{managerData?.taskPerformance.pendingEvaluations}</Text>
                                        </div>
                                    </Space>
                                </Card>
                            </motion.div>
                        </Col>
                    </Row>

                    <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
                        <Col span={12}>
                             <motion.div variants={item}>
                                <Card title="Recent Team Activities" bordered={false} style={{ borderRadius: '12px' }}>
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
                                <Card title="Upcoming Team Milestones" bordered={false} style={{ borderRadius: '12px' }}>
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