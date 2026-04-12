import { useEffect } from "react";
import { Table, Button, Card, Typography, Tag, Row, Col, Statistic, Spin } from "antd";
import { EyeOutlined, ArrowUpOutlined, ArrowDownOutlined } from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "../../../store";
import { fetchAvailableResults, fetchPerformanceSummary, selectAvailableResults, selectPerformanceSummary, selectEvaluationResultLoading } from "../../../store/evaluationResultSlide";
import { useNavigate } from "react-router-dom";
import URL from "../../../constants/url";

const { Title } = Typography;

const MyEvaluationResults = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const resultsList = useAppSelector(selectAvailableResults);
    const summary = useAppSelector(selectPerformanceSummary);
    const loading = useAppSelector(selectEvaluationResultLoading);
    const currentUser = Number(useAppSelector((state: any) => state.auth.infoLogin?.employeeId || state.auth.infoLogin?.userId));

    useEffect(() => {
        if (currentUser) {
            dispatch(fetchAvailableResults(currentUser));
            dispatch(fetchPerformanceSummary(currentUser));
        }
    }, [dispatch, currentUser]);

    const columns = [
        { title: "Cycle Name", dataIndex: "cycleName", key: "cycleName" },
        { title: "Period", key: "period",
            render: (_: any, record: any) => `${record.evaluationPeriodStart} - ${record.evaluationPeriodEnd}`
        },
        { title: "Completed On", dataIndex: "completionDate", key: "completionDate" },
        { title: "Overall Rating", dataIndex: "overallRating", key: "overallRating", render: (val: number) => val ? <b>{val.toFixed(1)}</b> : "-" },
        { title: "Status", dataIndex: "status", key: "status",
            render: (status: string) => <Tag color={status === 'Completed' || status === 'Acknowledged' ? 'green' : 'orange'}>{status}</Tag>
        },
        { title: "Action", key: "action",
            render: (_: any, record: any) => (
                <Button 
                    type="primary" 
                    icon={<EyeOutlined />} 
                    onClick={() => navigate(URL.ViewEvaluationResultDetail.replace(':id', record.evaluationId.toString()))}
                >
                    View Result
                </Button>
            )
        }
    ];

    if (loading && !summary) return <Spin size="large" style={{ margin: "50px auto", display: "block" }} />;

    return (
        <div className="p-4">
            <Title level={3}>My Evaluation Results</Title>
            
            {summary && (
                <Row gutter={16} style={{ marginBottom: 24 }}>
                    <Col span={6}>
                        <Card>
                            <Statistic 
                                title="Current Overall Rating" 
                                value={summary.currentOverallRating || 0} 
                                precision={1} 
                                suffix="/ 5.0"
                            />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card>
                            <Statistic 
                                title="Previous Rating" 
                                value={summary.previousOverallRating || 0} 
                                precision={1} 
                            />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card>
                            <Statistic 
                                title="Trend" 
                                value={Math.abs(summary.change || 0)} 
                                precision={1} 
                                valueStyle={{ color: summary.trendDirection === 'Up' ? '#3f8600' : (summary.trendDirection === 'Down' ? '#cf1322' : '#000') }}
                                prefix={summary.trendDirection === 'Up' ? <ArrowUpOutlined /> : (summary.trendDirection === 'Down' ? <ArrowDownOutlined /> : null)}
                                suffix="pt"
                            />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card>
                            <Statistic title="Total Evaluations" value={summary.totalEvaluations} />
                        </Card>
                    </Col>
                </Row>
            )}

            <Card>
                <Table 
                    columns={columns} 
                    dataSource={resultsList || []} 
                    rowKey="evaluationId" 
                    pagination={{ pageSize: 10 }}
                    size="middle"
                />
            </Card>
        </div>
    );
};
export default MyEvaluationResults;
