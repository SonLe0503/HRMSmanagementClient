import { useEffect } from "react";
import { Table, Button, Card, Typography, Tag } from "antd";
import { EditOutlined, FileSearchOutlined } from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "../../../store";
import { fetchPendingEvaluations, selectPendingEvaluations, selectSubmitEvaluationLoading } from "../../../store/submitEvaluationSlide";
import { useNavigate } from "react-router-dom";
import URL from "../../../constants/url";

const { Title, Text } = Typography;

const PendingEvaluations = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const pendingList = useAppSelector(selectPendingEvaluations);
    const loading = useAppSelector(selectSubmitEvaluationLoading);
    const currentUser = Number(useAppSelector((state: any) => state.auth.infoLogin?.employeeId || state.auth.infoLogin?.userId));

    useEffect(() => {
        if (currentUser) {
            dispatch(fetchPendingEvaluations(currentUser));
        }
    }, [dispatch, currentUser]);

    const columns = [
        { title: "Employee", dataIndex: "employeeName", key: "employeeName", 
            render: (name: string, record: any) => <div><b>{name}</b><br/><Text type="secondary">{record.employeeDepartment}</Text></div>
        },
        { title: "Position", dataIndex: "employeePosition", key: "employeePosition" },
        { title: "Deadline", dataIndex: "deadline", key: "deadline" },
        { title: "Status", dataIndex: "status", key: "status",
            render: (status: string) => <Tag color={status === 'Not Started' ? 'default' : 'processing'}>{status}</Tag>
        },
        { title: "Self Eval Done", dataIndex: "selfEvaluationCompleted", key: "selfEval",
            render: (done: boolean) => done ? <Tag color="green">Yes</Tag> : <Tag color="red">No</Tag>
        },
        { title: "Action", key: "action",
            render: (_: any, record: any) => (
                <Button 
                    type="primary" 
                    icon={record.status === 'Completed' ? <FileSearchOutlined /> : <EditOutlined />} 
                    onClick={() => navigate(URL.SubmitEvaluation.replace(':id', record.evaluationId.toString()))}
                >
                    Evaluate
                </Button>
            )
        }
    ];

    return (
        <div className="p-4">
            <Card title={<Title level={4} style={{ margin: 0 }}>Pending Evaluations (For Manager)</Title>}>
                <Table 
                    columns={columns} 
                    dataSource={pendingList || []} 
                    loading={loading} 
                    rowKey="evaluationId" 
                    pagination={{ pageSize: 10 }}
                    size="middle"
                />
            </Card>
        </div>
    );
};
export default PendingEvaluations;
