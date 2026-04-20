import { useEffect, useState } from "react";
import { Table, Button, Card, Space, Select, Tooltip, Typography, Tag } from "antd";
import { EyeOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "../../../store";
import { fetchActiveCycles, selectCycles } from "../../../store/evaluationCycleSlide";
import { 
    fetchEvaluationsByCycle, 
    fetchEvaluationsByEmployee, 
    fetchEvaluationsByEvaluator, 
    selectEvaluations, 
    selectEvaluationLoading 
} from "../../../store/evaluationSlide";
import { selectInfoLogin } from "../../../store/authSlide";
import { EUserRole } from "../../../interface/app";
import { useNavigate } from "react-router-dom";
import URL from "../../../constants/url";

const { Title } = Typography;

const EvaluationList = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const infoLogin = useAppSelector(selectInfoLogin);
    const userId = Number(infoLogin?.employeeId || infoLogin?.userId);
    const role = infoLogin?.role;
    
    const cycles = useAppSelector(selectCycles);
    const evaluations = useAppSelector(selectEvaluations);
    const loading = useAppSelector(selectEvaluationLoading);
    
    const [selectedCycleId, setSelectedCycleId] = useState<number | null>(null);

    useEffect(() => {
        dispatch(fetchActiveCycles());
        
        if (role === EUserRole.EMPLOYEE && userId) {
            dispatch(fetchEvaluationsByEmployee(Number(userId)));
        } else if (role === EUserRole.MANAGE && userId) {
             dispatch(fetchEvaluationsByEvaluator(Number(userId)));
        }
    }, [dispatch, role, userId]);

    const handleCycleChange = (id: number) => {
        setSelectedCycleId(id);
        dispatch(fetchEvaluationsByCycle(id));
    };

    const getStatusConfig = (status: string) => {
        switch (status) {
            case "Not Started": return { color: "default", text: "Chưa bắt đầu" };
            case "Self Evaluation": return { color: "blue", text: "Tự đánh giá" };
            case "Manager Evaluation": return { color: "orange", text: "Quản lý đánh giá" };
            case "Under Review": return { color: "purple", text: "Đang xem xét" };
            case "Completed": return { color: "green", text: "Hoàn thành" };
            case "Acknowledged": return { color: "green-inverse", text: "Đã xác nhận" };
            default: return { color: "default", text: status };
        }
    };

    const columns = [
        {
            title: "Nhân viên",
            dataIndex: "employeeName",
            key: "employeeName",
            render: (name: string, record: any) => (
                <div>
                   <div style={{ fontWeight: 500 }}>{name}</div>
                   <div style={{ fontSize: "0.85em", color: "#666" }}>{record.employeeDepartment}</div>
                </div>
            )
        },
        {
            title: "Người đánh giá",
            dataIndex: "primaryEvaluatorName",
            key: "primaryEvaluatorName",
            render: (name: string) => name || <Tag color="gray">Chưa phân công</Tag>
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            width: 150,
            render: (status: string) => {
                const config = getStatusConfig(status);
                return <Tag color={config.color} style={{ width: "100%", textAlign: "center" }}>{config.text}</Tag>;
            }
        },
        {
            title: "Hành động",
            key: "action",
            width: 120,
            render: (_: any, record: any) => (
                <Space size="middle">
                    <Tooltip title="Xem chi tiết">
                        <Button 
                            size="small"
                            icon={<EyeOutlined />} 
                            onClick={() => {
                                if (record.status === "Completed" || record.status === "Acknowledged") {
                                    navigate(URL.ViewEvaluationResultDetail.replace(':id', record.evaluationId.toString()));
                                } else {
                                    navigate(URL.SubmitEvaluation.replace(':id', record.evaluationId.toString()));
                                }
                            }}
                        />
                    </Tooltip>
                    {((record.status === "Not Started" && role === EUserRole.EMPLOYEE) ||
                      (record.status === "Self Evaluation" && role === EUserRole.MANAGE)) && (
                        <Tooltip title="Thực hiện đánh giá">
                            <Button 
                                type="primary"
                                size="small"
                                icon={<CheckCircleOutlined />} 
                                onClick={() => navigate(URL.SubmitEvaluation.replace(':id', record.evaluationId.toString()))}
                            />
                        </Tooltip>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <div className="p-4">
            <Card
                title={
                    <div className="flex justify-between items-center">
                        <Title level={4} style={{ margin: 0 }}>Danh sách phiếu đánh giá</Title>
                        {(role === EUserRole.ADMIN || role === EUserRole.HR) && (
                            <Select 
                                style={{ width: 250 }}
                                placeholder="Chọn đợt đánh giá"
                                onChange={handleCycleChange}
                                allowClear
                                value={selectedCycleId || undefined}
                            >
                                {(cycles || []).map(c => (
                                    <Select.Option key={c.cycleId} value={c.cycleId}>{c.cycleName}</Select.Option>
                                ))}
                            </Select>
                        )}
                    </div>
                }
            >
                <Table
                    columns={columns}
                    dataSource={evaluations}
                    rowKey="evaluationId"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                    size="middle"
                    locale={{ emptyText: "Không có dữ liệu đánh giá" }}
                />
            </Card>
        </div>
    );
};

export default EvaluationList;
