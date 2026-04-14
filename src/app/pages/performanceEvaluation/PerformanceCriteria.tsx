import { useEffect, useState } from "react";
import { Table, Button, Card, Space, Input, message, Tooltip, Typography, Tag, Modal, Form, Select } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "../../../store";
import { 
    fetchCriteriaByTemplate, 
    selectCriteria, 
    selectCriteriaLoading, 
    createCriterion, 
    updateCriterion, 
    deleteCriterion 
} from "../../../store/evaluationCriteriaSlide";
import { useParams, useNavigate } from "react-router-dom";

const { Title } = Typography;

const PerformanceCriteria = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { templateId } = useParams<{ templateId: string }>();
    const criteria = useAppSelector(selectCriteria);
    const loading = useAppSelector(selectCriteriaLoading);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState<any>(null);
    const [form] = Form.useForm();

    useEffect(() => {
        if (templateId) {
            dispatch(fetchCriteriaByTemplate(Number(templateId)));
        }
    }, [dispatch, templateId]);

    const totalWeightage = (criteria || []).reduce((acc, curr) => acc + curr.weightage, 0);
    const editingWeightage = editingRecord ? editingRecord.weightage : 0;
    const maxAllowedWeightage = 100 - totalWeightage + editingWeightage;

    const weightageOptions = Array.from({ length: maxAllowedWeightage }, (_, i) => ({
        value: i + 1,
        label: `${i + 1}%`
    }));

    const handleSave = async () => {
        try {
            const values = await form.validateFields();
            const tid = Number(templateId);
            
            if (editingRecord) {
                await dispatch(updateCriterion({ templateId: tid, id: editingRecord.criteriaId, dto: values })).unwrap();
                message.success("Criterion updated successfully");
            } else {
                await dispatch(createCriterion({ templateId: tid, dto: values })).unwrap();
                message.success("Criterion added successfully");
            }
            
            setIsModalOpen(false);
            form.resetFields();
            dispatch(fetchCriteriaByTemplate(tid));
        } catch (error: any) {
            message.error(error?.message || "Operation failed");
        }
    };

    const handleDelete = (id: number) => {
        Modal.confirm({
            title: "Xóa tiêu chí",
            content: "Bạn có chắc chắn muốn xóa tiêu chí này không?",
            okText: "Xóa",
            okType: "danger",
            onOk: () => {
                dispatch(deleteCriterion({ templateId: Number(templateId), id }))
                    .unwrap()
                    .then(() => {
                        message.success("Criterion deleted successfully");
                    })
                    .catch(e => message.error(e?.message || "Xóa thất bại"));
            }
        });
    };

    const columns = [
        {
            title: "Trình tự",
            dataIndex: "displayOrder",
            key: "displayOrder",
            width: 80,
            sorter: (a: any, b: any) => a.displayOrder - b.displayOrder,
        },
        {
            title: "Tên tiêu chí",
            dataIndex: "criteriaName",
            key: "criteriaName",
            render: (name: string) => <div style={{ fontWeight: 500 }}>{name}</div>,
        },
        {
            title: "Phân loại",
            dataIndex: "criteriaCategory",
            key: "criteriaCategory",
            render: (cat: string) => cat ? <Tag color="blue">{cat}</Tag> : "—"
        },
        {
            title: "Trọng số (%)",
            dataIndex: "weightage",
            key: "weightage",
            width: 120,
            render: (val: number) => <Tag color="blue">{val}%</Tag>
        },
        {
            title: "Thao tác",
            key: "action",
            width: 120,
            render: (_: any, record: any) => (
                <Space size="middle">
                    <Tooltip title="Chỉnh sửa">
                        <Button 
                            size="small"
                            icon={<EditOutlined />} 
                            onClick={() => {
                                setEditingRecord(record);
                                form.setFieldsValue(record);
                                setIsModalOpen(true);
                            }}
                        />
                    </Tooltip>
                    <Tooltip title="Xóa">
                        <Button 
                            danger
                            size="small"
                            icon={<DeleteOutlined />} 
                            onClick={() => handleDelete(record.criteriaId)}
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
                        <Space>
                            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} />
                            <Title level={4} style={{ margin: 0 }}>Quản lý tiêu chí</Title>
                        </Space>
                        <Space>
                            <Tag color={totalWeightage === 100 ? "green" : "orange"} style={{ fontSize: "1em", padding: "4px 12px" }}>
                                Tổng trọng số: {totalWeightage}% / 100%
                            </Tag>
                            <Button 
                                type="primary" 
                                icon={<PlusOutlined />} 
                                disabled={totalWeightage >= 100}
                                onClick={() => {
                                    setEditingRecord(null);
                                    form.resetFields();
                                    setIsModalOpen(true);
                                }}
                            >
                                Thêm tiêu chí
                            </Button>
                        </Space>
                    </div>
                }
            >
                <Table
                    columns={columns}
                    dataSource={criteria}
                    rowKey="criteriaId"
                    loading={loading}
                    pagination={false}
                    size="middle"
                />
            </Card>

            <Modal
                title={editingRecord ? "Chỉnh sửa tiêu chí" : "Thêm mới tiêu chí"}
                open={isModalOpen}
                onOk={handleSave}
                onCancel={() => setIsModalOpen(false)}
                destroyOnHidden
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="criteriaName"
                        label="Tên tiêu chí"
                        rules={[{ required: true, message: "Nhập tên tiêu chí" }]}
                    >
                        <Input placeholder="Ví dụ: Năng suất công việc, Kỹ năng làm việc nhóm..." />
                    </Form.Item>
                    <Form.Item
                        name="criteriaCategory"
                        label="Phân loại (Không bắt buộc)"
                    >
                        <Input placeholder="Ví dụ: Năng lực cốt lõi, Chuyên môn..." />
                    </Form.Item>
                    <div className="flex gap-4">
                        <Form.Item
                            name="weightage"
                            label="Trọng số (%)"
                            className="flex-1"
                            extra={`Bạn có thể phân bổ tối đa ${maxAllowedWeightage}%`}
                            rules={[
                                { required: true, message: "Cần nhập trọng số" },
                                { 
                                    validator: (_, value) => {
                                        if (value !== undefined && value > maxAllowedWeightage) {
                                            return Promise.reject(new Error(`Tối đa cho phép là ${maxAllowedWeightage}%`));
                                        }
                                        return Promise.resolve();
                                    }
                                }
                            ]}
                        >
                            <Select 
                                showSearch
                                placeholder="Chọn phần trăm"
                                options={weightageOptions}
                                style={{ width: "100%" }} 
                                optionFilterProp="label"
                            />
                        </Form.Item>
                    </div>
                    <Form.Item
                        name="description"
                        label="Mô tả chi tiết"
                    >
                        <Input.TextArea rows={3} placeholder="Mô tả tiêu chí để người đánh giá tham khảo" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default PerformanceCriteria;
