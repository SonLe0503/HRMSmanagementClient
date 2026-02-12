import { useEffect, useState } from "react";
import { Table, Button, Tag, Space, Card, Switch, message, Typography, Row, Col, Statistic } from "antd";
import { PlusOutlined, EyeOutlined, NodeIndexOutlined, CheckCircleOutlined, ClockCircleOutlined, StopOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useAppDispatch, useAppSelector } from "../../../store";
import { fetchAllWorkflows, deleteWorkflow, updateWorkflow, selectWorkflows, selectWorkflowLoading } from "../../../store/workflowSlide";
import { fetchAllRoles } from "../../../store/roleSlide";
import { selectInfoLogin } from "../../../store/authSlide";
import Condition from "./Condition";
import AddWorkflowModal from "./modal/AddWorkflowModal";
import EditWorkflowModal from "./modal/EditWorkflowModal";

const { Title } = Typography;

const ManageWorkflow = () => {
    const dispatch = useAppDispatch();
    const workflows = useAppSelector(selectWorkflows);
    const loading = useAppSelector(selectWorkflowLoading);
    const user = useAppSelector(selectInfoLogin);

    const [searchText, setSearchText] = useState("");
    const [typeFilter, setTypeFilter] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<boolean | null>(null);
    const [actionLoading, setActionLoading] = useState<number | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingWorkflow, setEditingWorkflow] = useState<any>(null);

    const handleSuccess = () => {
        setIsAddModalOpen(false);
        setIsEditModalOpen(false);
        dispatch(fetchAllWorkflows());
    };

    const handleAdd = () => {
        setIsAddModalOpen(true);
    };

    const handleEdit = (record: any) => {
        setEditingWorkflow(record);
        setIsEditModalOpen(true);
    };

    useEffect(() => {
        dispatch(fetchAllWorkflows());
        dispatch(fetchAllRoles());
    }, [dispatch]);

    const handleToggle = (record: any) => {
        if (!user?.userId) {
            message.error("Session expired. Please login again.");
            return;
        }

        const id = record.workflowId;
        setActionLoading(id);

        const promise = record.isActive
            ? dispatch(deleteWorkflow(id))
            : dispatch(updateWorkflow({
                id,
                data: { ...record, isActive: true }
            }));

        promise
            .unwrap()
            .then(() => {
                message.success(`Workflow ${record.isActive ? 'deactivated' : 'activated'} successfully`);
            })
            .catch((err) => message.error(err))
            .finally(() => setActionLoading(null));
    };


    const filteredWorkflows = workflows.filter((w) => {
        const matchesSearch = w.workflowName.toLowerCase().includes(searchText.toLowerCase());
        const matchesType = typeFilter ? w.workflowType === typeFilter : true;
        const matchesStatus = statusFilter !== null ? w.isActive === statusFilter : true;
        return matchesSearch && matchesType && matchesStatus;
    });

    // Statistics
    const totalWorkflows = workflows.length;
    const activeWorkflows = workflows.filter(w => w.isActive).length;
    const inactiveWorkflows = totalWorkflows - activeWorkflows;
    const avgApprovalTime = "2.3 days"; // In real app, calculate from data

    const columns = [
        {
            title: "Workflow Name",
            dataIndex: "workflowName",
            key: "workflowName",
            render: (text: string) => (
                <Space>
                    <NodeIndexOutlined style={{ color: "#1890ff" }} />
                    <span style={{ fontWeight: 600 }}>{text}</span>
                </Space>
            ),
            sorter: (a: any, b: any) => a.workflowName.localeCompare(b.workflowName),
        },
        {
            title: "Type",
            dataIndex: "workflowType",
            key: "workflowType",
            render: (type: string) => (
                <Tag color="geekblue">{type.toUpperCase()}</Tag>
            ),
        },
        {
            title: "Stages",
            dataIndex: "workflowStages",
            key: "workflowStages",
            align: "center" as const,
            render: (stages: any[]) => stages?.length || 0,
        },
        {
            title: "Requests",
            dataIndex: "associatedRequests",
            key: "associatedRequests",
            align: "center" as const,
            render: (val: number) => val || 0,
        },
        {
            title: "Last Modified",
            dataIndex: "lastModifiedDate",
            key: "lastModifiedDate",
            render: (date: string) => dayjs(date).format("DD/MM/YYYY HH:mm"),
            sorter: (a: any, b: any) => dayjs(a.lastModifiedDate).unix() - dayjs(b.lastModifiedDate).unix(),
        },
        {
            title: "Status",
            dataIndex: "isActive",
            key: "isActive",
            render: (isActive: boolean) => (
                <Tag color={isActive ? "green" : "red"}>
                    {isActive ? "ACTIVE" : "INACTIVE"}
                </Tag>
            ),
        },
        {
            title: "Action",
            key: "action",
            width: 150,
            render: (_: any, record: any) => (
                <Space size="middle">
                    <Button
                        type="primary"
                        icon={<EyeOutlined />}
                        title="Edit Workflow"
                        onClick={() => handleEdit(record)}
                    />
                    <Switch
                        size="small"
                        checked={record.isActive}
                        loading={actionLoading === record.workflowId}
                        onChange={() => handleToggle(record)}
                    />
                </Space>
            ),
        },
    ];

    return (
        <div className="p-4">
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} md={6}>
                    <Card variant="borderless" className="shadow-sm">
                        <Statistic
                            title="Total Workflows"
                            value={totalWorkflows}
                            prefix={<NodeIndexOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card variant="borderless" className="shadow-sm">
                        <Statistic
                            title="Active"
                            value={activeWorkflows}
                            styles={{ content: { color: '#3f8600' } }}
                            prefix={<CheckCircleOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card variant="borderless" className="shadow-sm">
                        <Statistic
                            title="Inactive"
                            value={inactiveWorkflows}
                            styles={{ content: { color: '#cf1322' } }}
                            prefix={<StopOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card variant="borderless" className="shadow-sm">
                        <Statistic
                            title="Avg. Approval Time"
                            value={avgApprovalTime}
                            prefix={<ClockCircleOutlined />}
                        />
                    </Card>
                </Col>
            </Row>

            <Card
                title={
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Title level={4} style={{ margin: 0 }}>Workflow Management</Title>
                        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                            Create Workflow
                        </Button>
                    </div>
                }
            >
                <Condition
                    searchText={searchText}
                    setSearchText={setSearchText}
                    typeFilter={typeFilter}
                    setTypeFilter={setTypeFilter}
                    statusFilter={statusFilter}
                    setStatusFilter={setStatusFilter}
                />

                <Table
                    columns={columns}
                    dataSource={filteredWorkflows}
                    rowKey="workflowId"
                    loading={loading}
                    pagination={{ pageSize: 8 }}
                    scroll={{ x: 1100 }}
                    size="middle"
                />
            </Card>

            <AddWorkflowModal
                open={isAddModalOpen}
                onCancel={() => setIsAddModalOpen(false)}
                onSuccess={handleSuccess}
            />

            <EditWorkflowModal
                open={isEditModalOpen}
                onCancel={() => setIsEditModalOpen(false)}
                onSuccess={handleSuccess}
                editingWorkflow={editingWorkflow}
            />
        </div>
    );
};

export default ManageWorkflow;
