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
            title: "Kích hoạt đợt đánh giá",
            content: "Bạn có chắc chắn muốn kích hoạt đợt đánh giá này?",
            onOk: () => {
                dispatch(activateCycle(id))
                    .unwrap()
                    .then(() => {
                        message.success("Kích hoạt đợt đánh giá thành công");
                        dispatch(fetchAllCycles());
                    })
                    .catch((err) => {
                        message.error(err?.message || "Kích hoạt đợt đánh giá thất bại");
                    });
            }
        });
    };

    const handleCloseCycle = (id: number) => {
        Modal.confirm({
            title: "Đóng đợt đánh giá",
            content: "Bạn có chắc chắn muốn đóng đợt đánh giá này?",
            onOk: () => {
                dispatch(closeCycle({ id, dto: {} }))
                    .unwrap()
                    .then(() => {
                        message.success("Đóng đợt đánh giá thành công");
                        dispatch(fetchAllCycles());
                    })
                    .catch((err) => {
                        message.error(err?.message || "Đóng đợt đánh giá thất bại");
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
            title: "Tên đợt đánh giá",
            dataIndex: "cycleName",
            key: "cycleName",
            render: (name: string) => <div style={{ fontWeight: 500 }}>{name}</div>,
        },
        {
            title: "Loại",
            dataIndex: "cycleType",
            key: "cycleType",
            width: 120,
            render: (type: string) => <Tag>{type}</Tag>
        },
        {
            title: "Thời gian",
            key: "period",
            width: 250,
            render: (_: any, record: any) => (
                <Text type="secondary">
                    {record.evaluationPeriodStart} đến {record.evaluationPeriodEnd}
                </Text>
            )
        },
        {
            title: "Số nhân viên",
            dataIndex: "employeeCount",
            key: "employeeCount",
            width: 100,
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            width: 120,
            render: (status: string) => (
                <Tag color={getStatusColor(status)}>{status}</Tag>
            )
        },
        {
            title: "Thao tác",
            key: "action",
            width: 150,
            render: (_: any, record: any) => (
                <Space size="middle">
                    {record.status === "Draft" && (
                        <Tooltip title="Kích hoạt đợt đánh giá">
                            <Button 
                                type="primary"
                                size="small"
                                icon={<PlayCircleOutlined />} 
                                onClick={() => handleActivateCycle(record.cycleId)}
                            />
                        </Tooltip>
                    )}
                    {record.status === "Active" && (
                        <Tooltip title="Đóng đợt đánh giá">
                            <Button 
                                danger
                                size="small"
                                icon={<StopOutlined />} 
                                onClick={() => handleCloseCycle(record.cycleId)}
                            />
                        </Tooltip>
                    )}
                    <Tooltip title="Xem tổng quan">
                        <Button 
                            size="small"
                            icon={<InfoCircleOutlined />} 
                            onClick={() => message.info("Tính năng xem tổng quan sắp có")}
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
                        <Title level={4} style={{ margin: 0 }}>Đợt đánh giá</Title>
                        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsAddModalOpen(true)}>
                            Tạo đợt đánh giá mới
                        </Button>
                    </div>
                }
            >
                <div className="mb-4">
                    <Input.Search
                        placeholder="Tìm kiếm đợt đánh giá..."
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
