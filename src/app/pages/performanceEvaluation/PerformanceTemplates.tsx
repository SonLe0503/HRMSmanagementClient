import { useEffect, useState } from "react";
import { Table, Button, Card, Space, Input, Switch, message, Tooltip, Typography, Tag } from "antd";
import { PlusOutlined, SettingOutlined } from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "../../../store";
import { 
    fetchAllTemplates, 
    selectTemplates, 
    selectTemplateLoading, 
    deactivateTemplate, 
    activateTemplate 
} from "../../../store/evaluationTemplateSlide";
import AddTemplateModal from "./modal/AddTemplateModal";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;

const PerformanceTemplates = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const templates = useAppSelector(selectTemplates);
    const loading = useAppSelector(selectTemplateLoading);
    
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [togglingId, setTogglingId] = useState<number | null>(null);

    useEffect(() => {
        dispatch(fetchAllTemplates());
    }, [dispatch]);

    const handleToggleStatus = (record: any) => {
        const action = record.isActive ? deactivateTemplate(record.templateId) : activateTemplate(record.templateId);
        const successMsg = record.isActive ? "Vô hiệu hóa mẫu thành công" : "Kích hoạt mẫu thành công";

        setTogglingId(record.templateId);
        dispatch(action)
            .unwrap()
            .then(() => {
                message.success(successMsg);
                dispatch(fetchAllTemplates());
            })
            .catch((error: any) => {
                message.error(error?.message || "Thao tác thất bại");
            })
            .finally(() => {
                setTogglingId(null);
            });
    };

    const filteredTemplates = templates.filter((t) => {
        const query = searchText.toLowerCase();
        return t.templateName.toLowerCase().includes(query);
    });

    const columns = [
        {
            title: "Tên mẫu",
            dataIndex: "templateName",
            key: "templateName",
            render: (name: string) => (
                <div style={{ fontWeight: 500 }}>
                    {name}
                </div>
            ),
        },
        {
            title: "Số tiêu chí",
            dataIndex: "criteriaCount",
            key: "criteriaCount",
            width: 150,
            render: (count: number) => (
                <Tag color={count > 0 ? "blue" : "orange"}>
                    {count} Tiêu chí
                </Tag>
            )
        },
        {
            title: "Trạng thái",
            dataIndex: "isActive",
            key: "isActive",
            width: 120,
            render: (isActive: boolean, record: any) => (
                 <Switch
                    size="small"
                    loading={togglingId === record.templateId}
                    checked={isActive}
                    onChange={() => handleToggleStatus(record)}
                 />
            ),
        },
        {
            title: "Thao tác",
            key: "action",
            width: 150,
            render: (_: any, record: any) => (
                <Space size="middle">
                    <Tooltip title="Quản lý tiêu chí">
                        <Button 
                            type="primary"
                            ghost
                            icon={<SettingOutlined />} 
                            onClick={() => navigate(`/performance/templates/${record.templateId}/criteria`)} 
                        >
                            Tiêu chí
                        </Button>
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
                        <Title level={4} style={{ margin: 0 }}>Mẫu đánh giá</Title>
                        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsAddModalOpen(true)}>
                            Thêm mẫu mới
                        </Button>
                    </div>
                }
            >
                <div className="mb-4">
                    <Input.Search
                        placeholder="Tìm kiếm theo tên mẫu..."
                        allowClear
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        style={{ width: 300 }}
                    />
                </div>

                <Table
                    columns={columns}
                    dataSource={filteredTemplates}
                    rowKey="templateId"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                    size="middle"
                />
            </Card>

            <AddTemplateModal
                open={isAddModalOpen}
                onCancel={() => setIsAddModalOpen(false)}
                onSuccess={() => {
                    setIsAddModalOpen(false);
                    dispatch(fetchAllTemplates());
                }}
            />
        </div>
    );
};

export default PerformanceTemplates;
