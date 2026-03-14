import { useEffect, useState } from "react";
import { Table, Button, Card, Space, Input, Switch, message, Tooltip, Typography } from "antd";
import { PlusOutlined, EyeOutlined } from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "../../../store";
import { fetchAllPositions, selectPositions, selectPositionLoading, deactivatePosition, activatePosition } from "../../../store/positionSlide";
import AddPositionModal from "./modal/AddPositionModal";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

const ManagePosition = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const positions = useAppSelector(selectPositions);
    const loading = useAppSelector(selectPositionLoading);
    
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [togglingId, setTogglingId] = useState<number | null>(null);

    useEffect(() => {
        dispatch(fetchAllPositions());
    }, [dispatch]);

    const handleToggleStatus = (record: any) => {
        const action = record.isActive ? deactivatePosition(record.positionId) : activatePosition(record.positionId);
        const successMsg = record.isActive ? "Position deactivated successfully (MSG-100)" : "Position activated successfully";

        setTogglingId(record.positionId);
        dispatch(action)
            .unwrap()
            .then(() => {
                message.success(successMsg);
                dispatch(fetchAllPositions());
            })
            .catch((error: any) => {
                const msg = typeof error === 'string' ? error : error?.message || (record.isActive ? "Cannot deactivate position (MSG-101)" : "Cannot activate position");
                message.error(msg);
            })
            .finally(() => {
                setTogglingId(null);
            });
    };

    const filteredPositions = positions.filter((pos) => {
        const query = searchText.toLowerCase();
        return pos.positionName.toLowerCase().includes(query) || 
               pos.positionCode.toLowerCase().includes(query);
    });

    const columns = [
        {
            title: "Code",
            dataIndex: "positionCode",
            key: "positionCode",
            width: 100,
        },
        {
            title: "Name",
            dataIndex: "positionName",
            key: "positionName",
            width: 250,
            render: (name: string, record: any) => (
                <a onClick={() => navigate(`/hr/manage-position/${record.positionId}`)} style={{ fontWeight: 500 }}>
                    {name}
                </a>
            ),
        },
        {
            title: "Level",
            dataIndex: "level",
            key: "level",
            width: 100,
        },
        {
            title: "Employees",
            dataIndex: "employeeCount",
            key: "employeeCount",
            width: 100,
        },
        {
            title: "Status",
            dataIndex: "isActive",
            key: "isActive",
            width: 100,
            render: (isActive: boolean, record: any) => (
                 <Switch
                    size="small"
                    loading={togglingId === record.positionId}
                    checked={isActive}
                    onChange={() => handleToggleStatus(record)}
                 />
            ),
        },
        {
            title: "Action",
            key: "action",
            width: 80,
            render: (_: any, record: any) => (
                <Space size="middle">
                    <Tooltip title="View Detail">
                        <Button 
                            icon={<EyeOutlined />} 
                            onClick={() => navigate(`/hr/manage-position/${record.positionId}`)} 
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
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Title level={4} style={{ margin: 0 }}>Position Management</Title>
                        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsAddModalOpen(true)}>
                            Add New Position
                        </Button>
                    </div>
                }
            >
                <div style={{ marginBottom: 16 }}>
                    <Input.Search
                        placeholder="Search by Position Code or Name..."
                        allowClear
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        style={{ width: 300 }}
                    />
                </div>

                <Table
                    columns={columns}
                    dataSource={filteredPositions}
                    rowKey="positionId"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                    scroll={{ x: 800 }}
                    size="middle"
                    locale={{
                        emptyText: searchText ? (
                            <div style={{ padding: "20px 0" }}>
                                <Text type="secondary">
                                    No position found matching criteria (MSG-97)
                                </Text>
                            </div>
                        ) : "No data available"
                    }}
                />
            </Card>

            <AddPositionModal
                open={isAddModalOpen}
                onCancel={() => setIsAddModalOpen(false)}
            />
        </div>
    );
};

export default ManagePosition;
