import { useEffect, useState } from "react";
import { Table, Button, Card, Space, Select, message, Tooltip, Typography, Tag, Modal, Form } from "antd";
import { UserAddOutlined, RobotOutlined, DeploymentUnitOutlined } from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "../../../store";
import { fetchActiveCycles, selectCycles } from "../../../store/evaluationCycleSlide";
import { fetchActiveTemplates, selectTemplates } from "../../../store/evaluationTemplateSlide";
import { fetchActiveEmployees, selectEmployees } from "../../../store/employeeSlide";
import {
    fetchAssignmentPreview,
    selectAssignmentPreview,
    selectEvaluationLoading,
    autoAssignEvaluators,
    assignEvaluators
} from "../../../store/evaluationSlide";

const { Title, Text } = Typography;

const EvaluatorAssignments = () => {
    const dispatch = useAppDispatch();
    const cycles = useAppSelector(selectCycles);
    const templates = useAppSelector(selectTemplates);
    const employeesList = useAppSelector(selectEmployees);
    const previewData = useAppSelector(selectAssignmentPreview);
    const loading = useAppSelector(selectEvaluationLoading);

    const [selectedCycleId, setSelectedCycleId] = useState<number | null>(null);
    const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);

    const [isManualModalVisible, setIsManualModalVisible] = useState(false);
    const [selectedEmployeeForManual, setSelectedEmployeeForManual] = useState<any>(null);
    const [form] = Form.useForm();

    useEffect(() => {
        dispatch(fetchActiveCycles());
        dispatch(fetchActiveTemplates());
        dispatch(fetchActiveEmployees());
    }, [dispatch]);

    const handleFetchPreview = () => {
        if (!selectedCycleId) {
            message.warning("Vui lòng chọn đợt đánh giá trước");
            return;
        }
        dispatch(fetchAssignmentPreview(selectedCycleId));
    };

    const handleAutoAssign = () => {
        if (!selectedCycleId || !selectedTemplateId) {
            message.warning("Vui lòng chọn đợt đánh giá và mẫu đánh giá");
            return;
        }
        Modal.confirm({
            title: "Tự động phân công người đánh giá",
            content: "Hệ thống sẽ phân công quản lý trực tiếp làm người đánh giá chính cho tất cả nhân viên đang hoạt động. Tiếp tục?",
            onOk: () => {
                dispatch(autoAssignEvaluators({
                    cycleId: selectedCycleId,
                    templateId: selectedTemplateId,
                    includeSecondaryEvaluator: false
                }))
                    .unwrap()
                    .then((res: any) => {
                        if (res.errors && res.errors.length > 0) {
                            message.warning(`Đã phân công ${res.successCount} nhân viên, nhưng thất bại ${res.failedCount}. Lỗi: ${res.errors[0].errorMessage}`);
                        } else if (res.successCount > 0) {
                            message.success(`Đã phân công ${res.successCount} nhân viên thành công`);
                        } else {
                            message.info("Không có nhân viên mới được phân công.");
                        }
                        dispatch(fetchAssignmentPreview(selectedCycleId));
                    })
                    .catch(err => message.error(err?.message || "Tự động phân công thất bại"));
            }
        });
    };

    const columns = [
        {
            title: "Nhân viên",
            dataIndex: "employeeName",
            key: "employeeName",
            render: (name: string, record: any) => (
                <div>
                    <div style={{ fontWeight: 500 }}>{name}</div>
                    <div style={{ fontSize: "0.85em", color: "#666" }}>{record.department}</div>
                </div>
            )
        },
        {
            title: "Người đánh giá chính đề xuất",
            dataIndex: "suggestedPrimaryEvaluatorName",
            key: "primary",
            render: (name: string) => name || <Tag color="gray">Không có</Tag>
        },
        {
            title: "Vấn đề",
            dataIndex: "issue",
            key: "issue",
            render: (issue: string) => issue ? <Tag color="red">{issue}</Tag> : <Tag color="green">Sẵn sàng</Tag>
        },
        {
            title: "Thao tác",
            key: "action",
            width: 100,
            render: (_: any, record: any) => (
                <Space size="middle">
                    <Tooltip title={record.isAssigned ? "Đã phân công" : "Phân công thủ công"}>
                        <Button
                            disabled={!selectedTemplateId || record.isAssigned}
                            size="small"
                            icon={<UserAddOutlined />}
                            onClick={() => {
                                setSelectedEmployeeForManual(record);
                                form.setFieldsValue({
                                    primaryEvaluatorId: record.suggestedPrimaryEvaluatorId || undefined
                                });
                                setIsManualModalVisible(true);
                            }}
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
                    <Title level={4} style={{ margin: 0 }}>Phân công người đánh giá</Title>
                }
            >
                <div style={{ display: "flex", gap: 16, marginBottom: 24, padding: 16, backgroundColor: "#f9f9f9", borderRadius: 8 }}>
                    <div style={{ flex: 1 }}>
                        <Text strong>Chọn đợt đánh giá đang hoạt động</Text>
                        <Select
                            style={{ width: "100%", marginTop: 8 }}
                            placeholder="Chọn đợt đánh giá"
                            onChange={(val) => {
                                setSelectedCycleId(val);
                                dispatch(fetchAssignmentPreview(val));
                            }}
                            value={selectedCycleId || undefined}
                        >
                            {(cycles || []).map(c => (
                                <Select.Option key={c.cycleId} value={c.cycleId}>{c.cycleName}</Select.Option>
                            ))}
                        </Select>
                    </div>
                    <div style={{ flex: 1 }}>
                        <Text strong>Áp dụng mẫu đánh giá</Text>
                        <Select
                            style={{ width: "100%", marginTop: 8 }}
                            placeholder="Chọn mẫu đánh giá"
                            onChange={(val) => setSelectedTemplateId(val)}
                        >
                            {(templates || []).map(t => (
                                <Select.Option key={t.templateId} value={t.templateId}>{t.templateName}</Select.Option>
                            ))}
                        </Select>
                    </div>
                    <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
                        <Button type="primary" ghost onClick={handleFetchPreview}>
                            Tải danh sách nhân viên
                        </Button>
                        <Button
                            type="primary"
                            icon={<RobotOutlined />}
                            onClick={handleAutoAssign}
                            disabled={!selectedCycleId || !selectedTemplateId}
                        >
                            Tự động phân công tất cả
                        </Button>
                        <Tooltip title="Tính năng phân công hàng loạt theo phòng ban sắp có">
                            <Button icon={<DeploymentUnitOutlined />} disabled />
                        </Tooltip>
                    </div>
                </div>

                <Table
                    columns={columns}
                    dataSource={previewData}
                    rowKey="employeeId"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                    size="middle"
                    locale={{ emptyText: "Chọn đợt đánh giá và nhấn Tải danh sách nhân viên để xem đề xuất" }}
                />
            </Card>

            <Modal
                title={`Phân công thủ công - ${selectedEmployeeForManual?.employeeName}`}
                open={isManualModalVisible}
                onOk={() => {
                    form.validateFields().then(values => {
                        if (!selectedCycleId || !selectedTemplateId || !selectedEmployeeForManual) return;
                        dispatch(assignEvaluators({
                            cycleId: selectedCycleId,
                            assignments: [{
                                employeeId: selectedEmployeeForManual.employeeId,
                                templateId: selectedTemplateId,
                                primaryEvaluatorId: values.primaryEvaluatorId
                            }]
                        })).unwrap().then((res: any) => {
                            if (res.errors && res.errors.length > 0) {
                                message.error(res.errors[0].errorMessage);
                            } else {
                                message.success("Phân công thành công");
                                setIsManualModalVisible(false);
                            }
                            dispatch(fetchAssignmentPreview(selectedCycleId));
                        }).catch(err => {
                            message.error(err?.message || "Phân công thất bại");
                        });
                    });
                }}
                onCancel={() => {
                    setIsManualModalVisible(false);
                    form.resetFields();
                }}
                destroyOnHidden
            >
                <Form layout="vertical" form={form}>
                    <Form.Item
                        label="Primary Evaluator"
                        name="primaryEvaluatorId"
                        rules={[{ required: true, message: "Please select primary evaluator" }]}
                    >
                        <Select
                            showSearch
                            optionFilterProp="children"
                            placeholder="Select primary evaluator"
                        >
                            {employeesList.map(emp => (
                                <Select.Option key={emp.employeeId} value={emp.employeeId}>
                                    {emp.fullName} ({emp.departmentName})
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default EvaluatorAssignments;
