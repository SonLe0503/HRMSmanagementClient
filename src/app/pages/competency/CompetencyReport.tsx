import { useEffect, useState } from "react";
import { 
    Card, 
    Row, 
    Col, 
    Select, 
    Button, 
    Table, 
    Progress, 
    Tag, 
    Typography, 
    Space, 
    Empty, 
    Spin, 
    message
} from "antd";
import { 
    FilterOutlined, 
    DownloadOutlined, 
    PieChartOutlined, 
    RocketOutlined, 
    ArrowDownOutlined,
    EyeOutlined
} from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "../../../store";
import { 
    generateCompetencyReport, 
    selectCompetencyReport, 
    selectCompetencyLoading,
    exportCompetencyReport
} from "../../../store/competencySlide";
import type { CompetencyReportFilterDTO, CompetencyReportItemDTO } from "../../../store/competencySlide";
import { fetchActiveCycles, selectCycles } from "../../../store/evaluationCycleSlide";
import { fetchAllEmployees, selectEmployees } from "../../../store/employeeSlide";
import { selectInfoLogin } from "../../../store/authSlide";
import { EUserRole } from "../../../interface/app";
import DrilldownModal from "./modal/DrilldownModal";

const { Title, Text } = Typography;

const CompetencyReport = () => {
    const dispatch = useAppDispatch();
    const infoLogin = useAppSelector(selectInfoLogin);
    const role = infoLogin?.role;
    
    // Selectors
    const report = useAppSelector(selectCompetencyReport);
    const loading = useAppSelector(selectCompetencyLoading);
    const cycles = useAppSelector(selectCycles);
    const employees = useAppSelector(selectEmployees);
    
    // Local state for filters
    const [filter, setFilter] = useState<CompetencyReportFilterDTO>({
        scope: role === EUserRole.EMPLOYEE ? "Individual" : "Team",
        employeeId: role === EUserRole.EMPLOYEE ? (infoLogin?.userId ? Number(infoLogin.userId) : undefined) : undefined
    });
    
    const [drilldownModalOpen, setDrilldownModalOpen] = useState(false);
    const [selectedCriteria, setSelectedCriteria] = useState<CompetencyReportItemDTO | null>(null);

    useEffect(() => {
        dispatch(fetchActiveCycles());
        dispatch(fetchAllEmployees());
    }, [dispatch]);

    const handleGenerate = () => {
        if (filter.scope === "Individual" && !filter.employeeId) {
            message.warning("Vui lòng chọn nhân viên cho mục cá nhân");
            return;
        }
        dispatch(generateCompetencyReport(filter));
    };

    const handleExport = (format: "csv" | "excel" | "pdf") => {
        if (!report) return;
        dispatch(exportCompetencyReport({ filter, format }));
    };

    const columns = [
        {
            title: "Tiêu chí năng lực",
            dataIndex: "criteriaName",
            key: "criteriaName",
            render: (text: string, record: CompetencyReportItemDTO) => (
                <div>
                    <div style={{ fontWeight: 500 }}>{text}</div>
                    <div style={{ fontSize: "0.85em", color: "#666" }}>{record.criteriaCategory}</div>
                </div>
            )
        },
        {
            title: "Điểm Manager (TB)",
            dataIndex: "averageManagerRating",
            key: "averageManagerRating",
            align: 'center' as const,
            render: (val: number) => (
                <div style={{ width: 80, margin: "auto" }}>
                     <Progress percent={val * 20} size="small" steps={5} strokeColor="#1890ff" />
                     <div style={{ fontSize: 12 }}>{val}/5</div>
                </div>
            )
        },
        {
            title: "Tự đánh giá (TB)",
            dataIndex: "averageSelfRating",
            key: "averageSelfRating",
            align: 'center' as const,
            render: (val: number | null) => val ? (
                <div style={{ width: 80, margin: "auto" }}>
                    <Progress percent={val * 20} size="small" steps={5} strokeColor="#52c41a" />
                    <div style={{ fontSize: 12 }}>{val}/5</div>
                </div>
            ) : "—"
        },
        {
            title: "Gap (Self - Mgr)",
            dataIndex: "gap",
            key: "gap",
            align: 'center' as const,
            render: (val: number) => {
                const color = val > 0 ? "blue" : (val < -0.5 ? "error" : "warning");
                return <Tag color={color}>{val > 0 ? `+${val}` : val}</Tag>;
            }
        },
        {
            title: "Chi tiết",
            key: "action",
            align: 'center' as const,
            render: (_: any, record: CompetencyReportItemDTO) => (
                <Button 
                    type="text" 
                    icon={<EyeOutlined />} 
                    onClick={() => {
                        setSelectedCriteria(record);
                        setDrilldownModalOpen(true);
                    }} 
                />
            )
        }
    ];

    return (
        <div className="p-6">
            <Card className="mb-6 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <Title level={3} style={{ margin: 0 }}>Báo cáo Năng lực (Competency)</Title>
                    <Space>
                        <Button 
                            icon={<DownloadOutlined />} 
                            onClick={() => handleExport("excel")}
                            disabled={!report}
                        >
                            Export Excel
                        </Button>
                        <Button 
                            type="primary" 
                            icon={<DownloadOutlined />} 
                            onClick={() => handleExport("pdf")}
                            disabled={!report}
                        >
                            Export PDF
                        </Button>
                    </Space>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg flex flex-wrap gap-4 items-end">
                    <div className="w-56">
                        <Text strong>Đợt đánh giá</Text>
                        <Select 
                            style={{ width: "100%" }} 
                            placeholder="Chọn đợt"
                            onChange={(val) => setFilter({ ...filter, cycleId: val })}
                        >
                            {cycles.map(c => <Select.Option key={c.cycleId} value={c.cycleId}>{c.cycleName}</Select.Option>)}
                        </Select>
                    </div>

                    <div className="w-48">
                        <Text strong>Phạm vi (Scope)</Text>
                        <Select 
                            style={{ width: "100%" }} 
                            value={filter.scope}
                            onChange={(val) => setFilter({ ...filter, scope: val })}
                        >
                            <Select.Option value="Individual">Cá nhân</Select.Option>
                            {(role === EUserRole.ADMIN || role === EUserRole.HR || role === EUserRole.MANAGE) && <Select.Option value="Team">Nhóm (Của tôi)</Select.Option>}
                            {(role === EUserRole.ADMIN || role === EUserRole.HR) && <Select.Option value="Organization">Tổ chức</Select.Option>}
                        </Select>
                    </div>

                    {filter.scope === "Individual" && (
                        <div className="w-64">
                            <Text strong>Nhân viên</Text>
                            <Select 
                                style={{ width: "100%" }} 
                                showSearch
                                placeholder="Tìm nhân viên"
                                optionFilterProp="children"
                                disabled={role === EUserRole.EMPLOYEE}
                                value={filter.employeeId}
                                onChange={(val) => setFilter({ ...filter, employeeId: val })}
                            >
                                {employees.map(e => <Select.Option key={e.employeeId} value={e.employeeId}>{e.fullName} ({e.employeeCode})</Select.Option>)}
                            </Select>
                        </div>
                    )}

                    <Button type="primary" icon={<FilterOutlined />} onClick={handleGenerate} loading={loading}>
                        Tạo báo cáo
                    </Button>
                </div>
            </Card>

            {!report && !loading && (
                <Empty description="Vui lòng chọn bộ lọc và bấm 'Tạo báo cáo'" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}

            {loading && <div style={{ textAlign: "center", padding: "50px" }}><Spin size="large" tip="Đang phân tích dữ liệu..." /></div>}

            {report && (
                <Space orientation="vertical" size={24} style={{ width: "100%" }}>
                    <Row gutter={24}>
                        <Col span={12}>
                            <Card 
                                title={<Space><RocketOutlined className="text-blue-500" /> Điểm mạnh nổi bật</Space>}
                                className="h-full border-none shadow-sm"
                            >
                                {report.strengths.length > 0 ? (
                                    report.strengths.map(s => (
                                        <div key={s.criteriaId} className="flex justify-between items-center mb-4 last:mb-0">
                                            <Text strong>{s.criteriaName}</Text>
                                            <Tag color="success" style={{ minWidth: 40, textAlign: 'center' }}>{s.averageManagerRating}</Tag>
                                        </div>
                                    ))
                                ) : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />}
                            </Card>
                        </Col>
                        <Col span={12}>
                            <Card 
                                title={<Space><ArrowDownOutlined className="text-red-500" /> Tiêu chí cần phát triển</Space>}
                                className="h-full border-none shadow-sm"
                            >
                                {report.developmentGaps.length > 0 ? (
                                    report.developmentGaps.map(g => (
                                        <div key={g.criteriaId} className="flex justify-between items-center mb-4 last:mb-0">
                                            <Text strong>{g.criteriaName}</Text>
                                            <Tag color="warning" style={{ minWidth: 40, textAlign: 'center' }}>{g.averageManagerRating}</Tag>
                                        </div>
                                    ))
                                ) : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />}
                            </Card>
                        </Col>
                    </Row>

                    <Card title={<Space><PieChartOutlined /> Hồ sơ năng lực chi tiết</Space>} className="border-none shadow-sm">
                        <Table 
                            columns={columns} 
                            dataSource={report.competencyProfiles} 
                            rowKey="criteriaId"
                            pagination={false}
                            size="middle"
                        />
                    </Card>

                    {report.scope === "Team" && report.employeeComparisons.length > 0 && (
                        <Card title="So sánh hiệu suất trong Team" className="border-none shadow-sm">
                            <Table 
                                columns={[
                                    { title: "Nhân viên", dataIndex: "employeeName", key: "employeeName" },
                                    { 
                                        title: "Điểm trung bình", 
                                        dataIndex: "employeeAverageRating", 
                                        key: "employeeAverageRating",
                                        render: (val: number, record) => (
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1">
                                                    <Progress 
                                                        percent={val * 20} 
                                                        size="small" 
                                                        showInfo={false} 
                                                        strokeColor={val > record.teamAverageRating ? "#52c41a" : "#1890ff"} 
                                                    />
                                                </div>
                                                <Text strong>{val}</Text>
                                            </div>
                                        )
                                    },
                                    { title: "TB Nhóm", dataIndex: "teamAverageRating", key: "teamAverageRating" }
                                ]}
                                dataSource={report.employeeComparisons}
                                rowKey="employeeId"
                                pagination={{ pageSize: 5 }}
                            />
                        </Card>
                    )}
                </Space>
            )}

            <DrilldownModal 
                open={drilldownModalOpen} 
                criteria={selectedCriteria} 
                filter={filter}
                onClose={() => setDrilldownModalOpen(false)} 
            />
        </div>
    );
};

export default CompetencyReport;
