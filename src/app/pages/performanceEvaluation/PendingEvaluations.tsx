import { useEffect } from "react";
import { Table, Button, Card, Typography, Tag, Tooltip, Alert } from "antd";
import { EditOutlined, FileSearchOutlined, LockOutlined, ClockCircleOutlined } from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "../../../store";
import { fetchPendingEvaluations, selectPendingEvaluations, selectSubmitEvaluationLoading } from "../../../store/submitEvaluationSlide";
import { useNavigate } from "react-router-dom";
import URL from "../../../constants/url";
import dayjs from "dayjs";

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

    const today = dayjs().format("YYYY-MM-DD");

    const columns = [
        { title: "Nhân viên", dataIndex: "employeeName", key: "employeeName", 
            render: (name: string, record: any) => <div><b>{name}</b><br/><Text type="secondary">{record.employeeDepartment}</Text></div>
        },
        { title: "Chức vụ", dataIndex: "employeePosition", key: "employeePosition" },
        { title: "Hạn chót", dataIndex: "deadline", key: "deadline",
            render: (d: string) => dayjs(d).format("DD/MM/YYYY")
        },
        { title: "Trạng thái", dataIndex: "status", key: "status",
            render: (status: string) => <Tag color={status === 'Not Started' ? 'default' : status === 'Completed' ? 'green' : 'processing'}>{status}</Tag>
        },
        { title: "NV tự đánh giá", dataIndex: "selfEvaluationCompleted", key: "selfEval",
            render: (done: boolean) => done ? <Tag color="green">Đã hoàn thành</Tag> : <Tag color="red">Chưa</Tag>
        },
        { title: "Giai đoạn QL đánh giá", key: "managerPeriod",
            render: (_: any, record: any) => {
                const start = dayjs(record.managerEvaluationStart).format("DD/MM");
                const end = dayjs(record.managerEvaluationEnd).format("DD/MM");
                const isActive = today >= record.managerEvaluationStart && today <= record.managerEvaluationEnd;
                return (
                    <Tag color={isActive ? "green" : "default"} icon={isActive ? <ClockCircleOutlined /> : <LockOutlined />}>
                        {start} → {end}
                    </Tag>
                );
            }
        },
        { title: "Thao tác", key: "action",
            render: (_: any, record: any) => {
                const isCompleted = record.status === 'Completed' || record.status === 'Acknowledged';
                const managerEvalOpen = today >= record.managerEvaluationStart && today <= record.managerEvaluationEnd;

                if (isCompleted) {
                    return (
                        <Button 
                            icon={<FileSearchOutlined />} 
                            onClick={() => navigate(URL.SubmitEvaluation.replace(':id', record.evaluationId.toString()))}
                        >
                            Xem kết quả
                        </Button>
                    );
                }

                if (!managerEvalOpen) {
                    const startDate = dayjs(record.managerEvaluationStart).format("DD/MM/YYYY");
                    return (
                        <Tooltip title={`Giai đoạn Quản lý đánh giá bắt đầu từ ${startDate}`}>
                            <Button disabled icon={<LockOutlined />}>
                                Chưa đến thời gian
                            </Button>
                        </Tooltip>
                    );
                }

                return (
                    <Button 
                        type="primary" 
                        icon={<EditOutlined />} 
                        onClick={() => navigate(URL.SubmitEvaluation.replace(':id', record.evaluationId.toString()))}
                    >
                        Đánh giá
                    </Button>
                );
            }
        }
    ];

    return (
        <div className="p-4">
            <Card title={<Title level={4} style={{ margin: 0 }}>Phiếu đánh giá chờ xử lý (Dành cho Quản lý)</Title>}>
                <Alert
                    type="info"
                    showIcon
                    message="Bạn chỉ có thể đánh giá nhân viên trong giai đoạn Quản lý đánh giá đã được thiết lập trong chu kỳ."
                    style={{ marginBottom: 16 }}
                />
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
