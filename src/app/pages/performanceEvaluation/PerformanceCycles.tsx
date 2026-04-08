import { useEffect, useState } from "react";
import { Table, Button, Card, Space, Input, message, Tooltip, Typography, Tag, Modal } from "antd";
import { PlusOutlined, PlayCircleOutlined, StopOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "../../../store";
import { 
    fetchAllCycles, 
    selectCycles, 
    selectCycleLoading, 
    activateCycle, 
    closeCycle 
} from "../../../store/evaluationCycleSlide";
import AddCycleModal from "./modal/AddCycleModal";

const { Title, Text } = Typography;

const PerformanceCycles = () => {
    const dispatch = useAppDispatch();
    const cycles = useAppSelector(selectCycles);
    const loading = useAppSelector(selectCycleLoading);
    
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [searchText, setSearchText] = useState("");

    useEffect(() => {
        dispatch(fetchAllCycles());
    }, [dispatch]);

    const handleActivateCycle = (id: number) => {
        Modal.confirm({
            title: "Activate Cycle",
            content: "Are you sure you want to activate this evaluation cycle?",
            onOk: () => {
                dispatch(activateCycle(id))
                    .unwrap()
                    .then(() => {
                        message.success("Cycle activated successfully");
                        dispatch(fetchAllCycles());
                    })
                    .catch((err) => {
                        message.error(err?.message || "Failed to activate cycle");
                    });
            }
        });
    };

    const handleCloseCycle = (id: number) => {
        Modal.confirm({
            title: "Close Cycle",
            content: "Are you sure you want to close this evaluation cycle?",
            onOk: () => {
                dispatch(closeCycle({ id, dto: {} }))
                    .unwrap()
                    .then(() => {
                        message.success("Cycle closed successfully");
                        dispatch(fetchAllCycles());
                    })
                    .catch((err) => {
                        message.error(err?.message || "Failed to close cycle");
                    });
            }
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Active": return "green";
            case "Draft": return "blue";
            case "Cancelled": return "red";
            default: return "default";
        }
    };

    const filteredCycles = (cycles || []).filter((c) => {
        const query = searchText.toLowerCase();
        return c.cycleName.toLowerCase().includes(query) || c.cycleType.toLowerCase().includes(query);
    });

    const columns = [
        {
            title: "Cycle Name",
            dataIndex: "cycleName",
            key: "cycleName",
            render: (name: string) => <div style={{ fontWeight: 500 }}>{name}</div>,
        },
        {
            title: "Type",
            dataIndex: "cycleType",
            key: "cycleType",
            width: 120,
            render: (type: string) => <Tag>{type}</Tag>
        },
        {
            title: "Period",
            key: "period",
            width: 250,
            render: (_: any, record: any) => (
                <Text type="secondary">
                    {record.evaluationPeriodStart} to {record.evaluationPeriodEnd}
                </Text>
            )
        },
        {
            title: "Employees",
            dataIndex: "employeeCount",
            key: "employeeCount",
            width: 100,
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            width: 120,
            render: (status: string) => (
                <Tag color={getStatusColor(status)}>{status}</Tag>
            )
        },
        {
            title: "Action",
            key: "action",
            width: 150,
            render: (_: any, record: any) => (
                <Space size="middle">
                    {record.status === "Draft" && (
                        <Tooltip title="Activate Cycle">
                            <Button 
                                type="primary"
                                size="small"
                                icon={<PlayCircleOutlined />} 
                                onClick={() => handleActivateCycle(record.cycleId)}
                            />
                        </Tooltip>
                    )}
                    {record.status === "Active" && (
                        <Tooltip title="Close Cycle">
                            <Button 
                                danger
                                size="small"
                                icon={<StopOutlined />} 
                                onClick={() => handleCloseCycle(record.cycleId)}
                            />
                        </Tooltip>
                    )}
                    <Tooltip title="View Summary">
                        <Button 
                            size="small"
                            icon={<InfoCircleOutlined />} 
                            onClick={() => message.info("Summary view coming soon")}
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <div className="p-4">
            <Card
                title={
                    <div className="flex justify-between items-center">
                        <Title level={4} style={{ margin: 0 }}>Evaluation Cycles</Title>
                        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsAddModalOpen(true)}>
                            Create New Cycle
                        </Button>
                    </div>
                }
            >
                <div className="mb-4">
                    <Input.Search
                        placeholder="Search cycles..."
                        allowClear
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        style={{ width: 300 }}
                    />
                </div>

                <Table
                    columns={columns}
                    dataSource={filteredCycles}
                    rowKey="cycleId"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                    size="middle"
                />
            </Card>

            <AddCycleModal
                open={isAddModalOpen}
                onCancel={() => setIsAddModalOpen(false)}
                onSuccess={() => {
                    setIsAddModalOpen(false);
                    dispatch(fetchAllCycles());
                }}
            />
        </div>
    );
};

export default PerformanceCycles;
