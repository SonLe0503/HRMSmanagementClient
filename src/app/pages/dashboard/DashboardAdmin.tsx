import { Row, Col, Card, Statistic, DatePicker, Typography, Space, List, Badge, Spin, Tooltip, Tag } from "antd";
import { 
    UserOutlined, TeamOutlined, ApartmentOutlined, FileTextOutlined, 
    CheckCircleOutlined, ClockCircleOutlined, RiseOutlined, 
    MonitorOutlined, WarningOutlined, DatabaseOutlined, RocketOutlined,
    GlobalOutlined, SafetyCertificateOutlined, CodeOutlined
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../store";
import { fetchAdminDashboardData, selectDashboardData, selectDashboardLoading } from "../../../store/dashboardSlide";
import dayjs from "dayjs";
import { motion } from "framer-motion";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const DashboardAdmin = () => {
    const dispatch = useAppDispatch();
    const data = useAppSelector(selectDashboardData);
    const loading = useAppSelector(selectDashboardLoading);
    const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([dayjs().subtract(30, 'day'), dayjs()]);

    useEffect(() => {
        dispatch(fetchAdminDashboardData({
            fromDate: dateRange[0].format("YYYY-MM-DD"),
            toDate: dateRange[1].format("YYYY-MM-DD")
        }));
    }, [dispatch, dateRange]);

    const stats = data?.statistics;

    const cards = [
        { title: "Total Users", value: stats?.totalUsers, icon: <UserOutlined />, color: "#1890ff", desc: "Total registered accounts" },
        { title: "Active Users", value: stats?.activeUsers, icon: <SafetyCertificateOutlined />, color: "#52c41a", desc: "Users active in last 30 days" },
        { title: "New Users", value: stats?.newUsers, icon: <RiseOutlined />, color: "#722ed1", desc: "Registered in selected period" },
        { title: "Total Employees", value: stats?.totalEmployees, icon: <TeamOutlined />, color: "#faad14", desc: "Active workforce size" },
        { title: "Total Departments", value: stats?.totalDepartments, icon: <ApartmentOutlined />, color: "#13c2c2", desc: "Organizational units" },
        { title: "Total Leave Requests", value: stats?.totalLeaveRequests, icon: <FileTextOutlined />, color: "#eb2f96", desc: "Submitted in period" },
        { title: "Pending Approvals", value: stats?.pendingApprovals, icon: <ClockCircleOutlined />, color: "#fa8c16", desc: "Requests awaiting action" },
        { title: "Attendance Rate", value: `${stats?.attendanceRate ?? 0}%`, icon: <CheckCircleOutlined />, color: "#2f54eb", desc: "Avg presence in period" },
        { title: "Overtime Hours", value: stats?.overtimeHours, icon: <RocketOutlined />, color: "#fa541c", desc: "Total OT hours approved" },
        { title: "System Uptime", value: stats?.systemUptime, icon: <MonitorOutlined />, color: "#a0d911", desc: "Time since last restart" },
        { title: "Error Rate", value: `${((stats?.errorRate ?? 0) * 100).toFixed(2)}%`, icon: <WarningOutlined />, color: "#f5222d", desc: "API request failure rate" },
        { title: "Database Size", value: stats?.databaseSize, icon: <DatabaseOutlined />, color: "#595959", desc: "Total storage utilized" },
        { title: "API Response Time", value: `${stats?.apiResponseTime}ms`, icon: <GlobalOutlined />, color: "#1890ff", desc: "Average server latency" },
    ];

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
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
                        <Title level={2} style={{ margin: 0 }}>Admin Overview Dashboard</Title>
                        <Text type="secondary">Real-time system analytics and operational health</Text>
                    </Col>
                    <Col>
                        <Space size="middle">
                            <Text strong>Period:</Text>
                            <RangePicker 
                                value={dateRange}
                                onChange={(dates) => {
                                    if (dates && dates[0] && dates[1]) setDateRange([dates[0], dates[1]]);
                                }}
                                style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
                            />
                        </Space>
                    </Col>
                </Row>
            </motion.div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '100px' }}>
                    <Spin size="large" tip="Orchestrating system data..." />
                </div>
            ) : (
                <motion.div variants={container} initial="hidden" animate="show">
                    <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
                        {cards.map((card, idx) => (
                            <Col xs={24} sm={12} md={8} lg={6} xl={4.8} key={idx} style={{ flex: card.title === "API Response Time" ? '0 0 20%' : undefined }}>
                                <motion.div variants={item}>
                                    <Tooltip title={card.desc} placement="top">
                                        <Card 
                                            bordered={false} 
                                            style={{ 
                                                borderRadius: '12px', 
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                                                borderLeft: `4px solid ${card.color}`
                                            }}
                                            hoverable
                                        >
                                            <Statistic
                                                title={<Text type="secondary" strong>{card.title}</Text>}
                                                value={card.value}
                                                prefix={card.icon}
                                                valueStyle={{ color: card.color, fontWeight: 'bold' }}
                                            />
                                            <div style={{ fontSize: '12px', marginTop: 8, color: '#8c8c8c' }}>{card.desc}</div>
                                        </Card>
                                    </Tooltip>
                                </motion.div>
                            </Col>
                        ))}
                    </Row>

                    <Row gutter={24}>
                        <Col span={12}>
                            <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.5 }}>
                                <Card 
                                    title={<Space><ClockCircleOutlined />Recent Activities</Space>} 
                                    bordered={false} 
                                    style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', minHeight: '400px' }}
                                >
                                    <List
                                        itemLayout="horizontal"
                                        dataSource={data?.recentActivities || []}
                                        renderItem={(item) => (
                                            <List.Item>
                                                <List.Item.Meta
                                                    avatar={<Badge status="processing" />}
                                                    title={item.description}
                                                    description={dayjs(item.timestamp).format("MMM DD, YYYY HH:mm")}
                                                />
                                            </List.Item>
                                        )}
                                        locale={{ emptyText: "No recent system logs" }}
                                    />
                                </Card>
                            </motion.div>
                        </Col>
                        <Col span={12}>
                            <Space direction="vertical" style={{ width: '100%' }} size={24}>
                                <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.6 }}>
                                    <Card 
                                        title={<Space><WarningOutlined />Alerts & Notifications</Space>} 
                                        bordered={false} 
                                        style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                                    >
                                        <List
                                            dataSource={data?.alerts || []}
                                            renderItem={(item) => (
                                                <List.Item>
                                                    <Space>
                                                        <Tag color={item.level === "Error" ? "error" : item.level === "Warning" ? "warning" : "info"}>
                                                            {item.level.toUpperCase()}
                                                        </Tag>
                                                        <Text>{item.message}</Text>
                                                    </Space>
                                                </List.Item>
                                            )}
                                        />
                                    </Card>
                                </motion.div>

                                <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.7 }}>
                                    <Card 
                                        title={<Space><CodeOutlined />Scheduled Tasks Status</Space>} 
                                        bordered={false} 
                                        style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                                    >
                                        <List
                                            dataSource={data?.scheduledTasks || []}
                                            renderItem={(item) => (
                                                <List.Item extra={<Badge status={item.status === "Completed" ? "success" : item.status === "Running" ? "processing" : "default"} text={item.status} />}>
                                                    <Text strong>{item.name}</Text>
                                                </List.Item>
                                            )}
                                        />
                                    </Card>
                                </motion.div>
                            </Space>
                        </Col>
                    </Row>
                </motion.div>
            )}
        </div>
    );
};

export default DashboardAdmin;