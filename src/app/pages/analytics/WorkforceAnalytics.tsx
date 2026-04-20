import { useEffect, useState } from "react";
import { 
    Card, 
    Row, 
    Col, 
    Statistic, 
    Select, 
    DatePicker, 
    Button, 
    Space, 
    Typography, 
    Divider, 
    Table, 
    Progress, 
    Tag, 
    Empty, 
    Spin, 
    message, 
    Drawer, 
    List, 
    Badge 
} from "antd";
import { 
    TeamOutlined, 
    UserDeleteOutlined, 
    RiseOutlined, 
    FilterOutlined, 
    SaveOutlined, 
    ScheduleOutlined, 
    BulbOutlined, 
    DownloadOutlined,
    RocketOutlined
} from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "../../../store";
import { 
    generateWorkforceAnalytics, 
    getWorkforceAIInsights, 
    selectWorkforceAnalytics, 
    selectWorkforceAIInsights, 
    selectWorkforceLoading, 
    selectWorkforceError, 
    selectWorkforceSuccessMessage,
    clearSuccessMessage
} from "../../../store/workforceAnalyticsSlide";
import type { WorkforceAnalyticsRequestDTO } from "../../../store/workforceAnalyticsSlide";
import { fetchActiveDepartments, selectActiveDepartments } from "../../../store/departmentSlide";
import { fetchAllEmployees } from "../../../store/employeeSlide";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const WorkforceAnalytics = () => {
    const dispatch = useAppDispatch();
    
    // Selectors
    const analytics = useAppSelector(selectWorkforceAnalytics);
    const aiInsights = useAppSelector(selectWorkforceAIInsights);
    const loading = useAppSelector(selectWorkforceLoading);
    const error = useAppSelector(selectWorkforceError);
    const successMsg = useAppSelector(selectWorkforceSuccessMessage);
    const departments = useAppSelector(selectActiveDepartments);
    
    // Local State
    const [filter, setFilter] = useState<WorkforceAnalyticsRequestDTO>({
        timePeriod: "monthly",
        organizationLevel: "company",
        employeeGroup: "all",
        comparisonPeriod: "none"
    });
    const [showAIInsights, setShowAIInsights] = useState(false);

    useEffect(() => {
        dispatch(fetchActiveDepartments());
        dispatch(fetchAllEmployees());
    }, [dispatch]);

    useEffect(() => {
        if (successMsg) {
            message.success(successMsg);
            dispatch(clearSuccessMessage());
        }
        if (error) {
            message.error(error);
        }
    }, [successMsg, error, dispatch]);

    const handleGenerate = () => {
        dispatch(generateWorkforceAnalytics(filter));
    };

    const handleGetAIInsights = () => {
        dispatch(getWorkforceAIInsights(filter));
        setShowAIInsights(true);
    };

    const renderStatistic = (title: string, value: any, icon: any, suffix?: string, precision?: number) => (
        <Card className="shadow-sm border-none bg-slate-50">
            <Statistic 
                title={<Space>{icon} {title}</Space>} 
                value={value} 
                precision={precision}
                suffix={suffix}
                valueStyle={{ color: '#1890ff', fontWeight: 'bold' }}
            />
        </Card>
    );

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <Title level={3} style={{ margin: 0 }}>Phân tích & Thống kê Nhân lực</Title>
                <Space>
                    <Button icon={<SaveOutlined />}>Lưu bộ lọc</Button>
                    <Button icon={<ScheduleOutlined />}>Lên lịch báo cáo</Button>
                    <Button 
                        type="primary" 
                        danger 
                        icon={<BulbOutlined />} 
                        onClick={handleGetAIInsights}
                        disabled={!analytics}
                    >
                        Phân tích AI
                    </Button>
                </Space>
            </div>

            <Card className="mb-6 shadow-sm">
                <div className="flex flex-wrap gap-4 items-end">
                    <div className="w-48">
                        <Text strong>Khoảng thời gian</Text>
                        <Select 
                            style={{ width: '100%' }} 
                            value={filter.timePeriod}
                            onChange={(val) => setFilter({ ...filter, timePeriod: val })}
                        >
                            <Select.Option value="monthly">Theo tháng</Select.Option>
                            <Select.Option value="quarterly">Theo quý</Select.Option>
                            <Select.Option value="yearly">Theo năm</Select.Option>
                            <Select.Option value="custom">Tùy chọn</Select.Option>
                        </Select>
                    </div>

                    {filter.timePeriod === "custom" && (
                        <div className="w-64">
                            <Text strong>Tùy chọn ngày</Text>
                            <RangePicker 
                                style={{ width: '100%' }}
                                onChange={(dates) => {
                                    setFilter({
                                        ...filter,
                                        startDate: dates?.[0]?.format("YYYY-MM-DD"),
                                        endDate: dates?.[1]?.format("YYYY-MM-DD")
                                    });
                                }}
                            />
                        </div>
                    )}

                    <div className="w-48">
                        <Text strong>Cấp bậc tổ chức</Text>
                        <Select 
                            style={{ width: '100%' }} 
                            value={filter.organizationLevel}
                            onChange={(val) => setFilter({ ...filter, organizationLevel: val })}
                        >
                            <Select.Option value="company">Toàn công ty</Select.Option>
                            <Select.Option value="department">Phòng ban</Select.Option>
                            <Select.Option value="team">Nhóm (Manager)</Select.Option>
                        </Select>
                    </div>

                    {filter.organizationLevel === "department" && (
                        <div className="w-48">
                            <Text strong>Phòng ban</Text>
                            <Select 
                                style={{ width: '100%' }} 
                                placeholder="Chọn phòng ban"
                                onChange={(val) => setFilter({ ...filter, departmentId: val })}
                            >
                                {departments.map(d => <Select.Option key={d.departmentId} value={d.departmentId}>{d.departmentName}</Select.Option>)}
                            </Select>
                        </div>
                    )}

                    <Button type="primary" icon={<FilterOutlined />} onClick={handleGenerate} loading={loading}>
                        Phân tích dữ liệu
                    </Button>
                </div>
            </Card>

            {!analytics && !loading && (
                <Empty description="Vui lòng chọn tiêu chí để bắt đầu phân tích" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}

            {loading && (
                <div style={{ textAlign: 'center', padding: '100px 0' }}>
                    <Spin size="large" tip="Công cụ AI đang phân tích dữ liệu..." />
                </div>
            )}

            {analytics && (
                <Space orientation="vertical" size={24} style={{ width: '100%' }}>
                    {/* Header Statistics */}
                    <Row gutter={16}>
                        <Col span={6}>
                            {renderStatistic("Tổng nhân sự", analytics.headcountAnalytics.totalHeadcount, <TeamOutlined />)}
                        </Col>
                        <Col span={6}>
                            {renderStatistic("Tỉ lệ nghỉ việc", analytics.attritionAnalytics.overallTurnoverRate, <UserDeleteOutlined />, "%", 2)}
                        </Col>
                        <Col span={6}>
                            {renderStatistic("Tỉ lệ hiện diện", analytics.engagementProductivity.averageAttendanceRate, <RiseOutlined />, "%", 1)}
                        </Col>
                        <Col span={6}>
                            {renderStatistic("Nhân viên xuất sắc", analytics.talentAnalytics.highPerformerCount, <BulbOutlined />)}
                        </Col>
                    </Row>

                    <Row gutter={24}>
                        {/* Section Left */}
                        <Col span={12}>
                            <Card title="Phân phối Headcount theo phòng ban" className="shadow-sm h-full">
                                {analytics.headcountAnalytics.headcountByDepartment.map((item: any) => (
                                    <div key={item.Department} className="mb-4">
                                        <div className="flex justify-between mb-1">
                                            <Text strong>{item.Department}</Text>
                                            <Text>{item.Count} nhân sự</Text>
                                        </div>
                                        <Progress 
                                            percent={(item.Count / analytics.headcountAnalytics.totalHeadcount) * 100} 
                                            showInfo={false}
                                            strokeColor="#1890ff"
                                        />
                                    </div>
                                ))}
                            </Card>
                        </Col>

                        {/* Section Right */}
                        <Col span={12}>
                            <Card title="Nhân khẩu học (Giới tính & Độ tuổi)" className="shadow-sm h-full">
                                <Title level={5}>Giới tính</Title>
                                <div className="flex gap-4 mb-6">
                                    {analytics.demographicsAnalytics.genderDistribution.map((g: any) => (
                                        <Badge 
                                            key={g.Gender} 
                                            count={`${g.Gender}: ${g.Count}`} 
                                            style={{ backgroundColor: g.Gender === "Male" ? "#1890ff" : "#eb2f96" }} 
                                        />
                                    ))}
                                </div>
                                <Divider />
                                <Title level={5}>Độ tuổi</Title>
                                {analytics.demographicsAnalytics.ageDistribution.map((a: any) => (
                                    <div key={a.Band} className="flex items-center gap-4 mb-2">
                                        <Text style={{ width: 60 }}>{a.Band}</Text>
                                        <div className="flex-1">
                                            <Progress percent={a.Count * 20} showInfo={false} size="small" />
                                        </div>
                                        <Text type="secondary">{a.Count}</Text>
                                    </div>
                                ))}
                            </Card>
                        </Col>
                    </Row>

                    <Row gutter={24}>
                        <Col span={16}>
                        <Card title="Hiệu suất nhân tài (Talent Matrix)" className="shadow-sm">
                            <Table 
                                columns={[
                                    { title: "Mức xếp loại", dataIndex: "Rating", key: "Rating", render: (r) => <Tag color="blue">{r} Sao</Tag> },
                                    { title: "Số lượng nhân viên", dataIndex: "Count", key: "Count" },
                                    { 
                                        title: "Tỉ lệ (%)", 
                                        key: "ratio", 
                                        render: (_, record: any) => <Progress size="small" percent={(record.Count / analytics.headcountAnalytics.totalHeadcount) * 100} /> 
                                    }
                                ]}
                                dataSource={analytics.talentAnalytics.performanceRatingDistribution}
                                pagination={false}
                                size="small"
                                rowKey="Rating"
                            />
                        </Card>
                        </Col>
                        <Col span={8}>
                            <Card title="Tuyển dụng & Nghỉ việc" className="shadow-sm h-full">
                                <div className="text-center p-4">
                                     <Statistic title="Tuyển mới" value={analytics.headcountAnalytics.newHires} valueStyle={{ color: '#52c41a' }} />
                                     <Divider />
                                     <Statistic title="Nghỉ việc" value={analytics.headcountAnalytics.terminations} valueStyle={{ color: '#f5222d' }} />
                                </div>
                            </Card>
                        </Col>
                    </Row>
                </Space>
            )}

            {/* AI Insights Drawer */}
            <Drawer
                title={<Space><BulbOutlined /> Phân tích AI & Dự báo Nhân lực</Space>}
                size="large"
                onClose={() => setShowAIInsights(false)}
                open={showAIInsights}
                extra={
                    <Button type="primary" size="small" icon={<DownloadOutlined />}>Tải báo cáo phân tích</Button>
                }
            >
                {aiInsights ? (
                    <div className="flex flex-col gap-6">
                        <section>
                            <Title level={5} className="text-red-500">Rủi ro biến động nhân sự (Attrition Risks)</Title>
                            <List 
                                dataSource={aiInsights.attritionRisks}
                                renderItem={(item: any) => (
                                    <List.Item>
                                        <List.Item.Meta 
                                            avatar={<Badge status="error" />}
                                            title={item.RiskLevel + " Risk"}
                                            description={item.Group}
                                        />
                                    </List.Item>
                                )}
                            />
                        </section>

                        <section>
                            <Title level={5} className="text-blue-500">Tư vấn định biên (Headcount Recommendations)</Title>
                            <List 
                                dataSource={aiInsights.headcountRecommendations}
                                renderItem={(item: any) => (
                                    <List.Item>
                                        <Card size="small" className="w-full bg-blue-50 border-blue-100">
                                            <Text strong>{item.Department}</Text>: {item.Recommendation}
                                        </Card>
                                    </List.Item>
                                )}
                            />
                        </section>

                        <section>
                            <Title level={5} className="text-green-500">Dự báo tuyển dụng (Hiring Forecasts)</Title>
                            <List 
                                dataSource={aiInsights.hiringForecasts}
                                renderItem={(item: any) => (
                                    <List.Item>
                                        <Space>
                                            <Tag color="cyan">{item.Quarter}</Tag>
                                            <Text>{item.Forecast}</Text>
                                        </Space>
                                    </List.Item>
                                )}
                            />
                        </section>

                        <section className="bg-slate-50 p-4 rounded-lg">
                            <Title level={5}>Gợi ý duy trì nhân tài (Retention Suggestions)</Title>
                            <List 
                                dataSource={aiInsights.retentionSuggestions}
                                renderItem={(item: any) => (
                                    <List.Item>
                                        <Space align="start">
                                            <RocketOutlined className="text-orange-500 mt-1" />
                                            <Text>{item.Suggestion}</Text>
                                        </Space>
                                    </List.Item>
                                )}
                            />
                        </section>
                    </div>
                ) : <Spin tip="Đang chạy mô hình AI..." />}
            </Drawer>
        </div>
    );
};

export default WorkforceAnalytics;
