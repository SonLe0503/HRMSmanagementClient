import { useEffect, useState } from "react";
import { Table, Button, Card, Space, Select, message, Tooltip, Typography, Tag, Modal, Form } from "antd";
import { UserAddOutlined, RobotOutlined, DeploymentUnitOutlined } from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "../../../store";
import { fetchActiveCycles, selectCycles } from "../../../store/evaluationCycleSlide";
import { fetchActiveTemplates, selectTemplates } from "../../../store/evaluationTemplateSlide";
import { fetchAllEmployees, selectEmployees } from "../../../store/employeeSlide";
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
        dispatch(fetchAllEmployees());
    }, [dispatch]);

    const handleFetchPreview = () => {
        if (!selectedCycleId) {
            message.warning("Please select a cycle first");
            return;
        }
        dispatch(fetchAssignmentPreview(selectedCycleId));
    };

    const handleAutoAssign = () => {
        if (!selectedCycleId || !selectedTemplateId) {
            message.warning("Please select a cycle and a template");
            return;
        }
        Modal.confirm({
            title: "Auto-Assign Evaluators",
            content: "System will assign direct managers as primary evaluators for all active employees. Proceed?",
            onOk: () => {
                dispatch(autoAssignEvaluators({
                    cycleId: selectedCycleId,
                    templateId: selectedTemplateId,
                    includeSecondaryEvaluator: false
                }))
                    .unwrap()
                    .then((res: any) => {
                        if (res.errors && res.errors.length > 0) {
                            message.warning(`Assigned ${res.successCount} employees, but failed for ${res.failedCount}. Error: ${res.errors[0].errorMessage}`);
                        } else if (res.successCount > 0) {
                            message.success(`Assigned ${res.successCount} employees successfully`);
                        } else {
                            message.info("No new employees were assigned.");
                        }
                        dispatch(fetchAssignmentPreview(selectedCycleId));
                    })
                    .catch(err => message.error(err?.message || "Failed to auto-assign"));
            }
        });
    };

    const columns = [
        {
            title: "Employee",
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
            title: "Suggested Primary",
            dataIndex: "suggestedPrimaryEvaluatorName",
            key: "primary",
            render: (name: string) => name || <Tag color="gray">None</Tag>
        },
        {
            title: "Issues",
            dataIndex: "issue",
            key: "issue",
            render: (issue: string) => issue ? <Tag color="red">{issue}</Tag> : <Tag color="green">Ready</Tag>
        },
        {
            title: "Action",
            key: "action",
            width: 100,
            render: (_: any, record: any) => (
                <Space size="middle">
                    <Tooltip title="Assign Manually">
                        <Button
                            disabled={!selectedTemplateId}
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
                    <Title level={4} style={{ margin: 0 }}>Evaluator Assignments</Title>
                }
            >
                <div style={{ display: "flex", gap: 16, marginBottom: 24, padding: 16, backgroundColor: "#f9f9f9", borderRadius: 8 }}>
                    <div style={{ flex: 1 }}>
                        <Text strong>Select Active Cycle</Text>
                        <Select
                            style={{ width: "100%", marginTop: 8 }}
                            placeholder="Select cycle"
                            onChange={(val) => setSelectedCycleId(val)}
                        >
                            {(cycles || []).map(c => (
                                <Select.Option key={c.cycleId} value={c.cycleId}>{c.cycleName}</Select.Option>
                            ))}
                        </Select>
                    </div>
                    <div style={{ flex: 1 }}>
                        <Text strong>Apply Template</Text>
                        <Select
                            style={{ width: "100%", marginTop: 8 }}
                            placeholder="Select template"
                            onChange={(val) => setSelectedTemplateId(val)}
                        >
                            {(templates || []).map(t => (
                                <Select.Option key={t.templateId} value={t.templateId}>{t.templateName}</Select.Option>
                            ))}
                        </Select>
                    </div>
                    <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
                        <Button type="primary" ghost onClick={handleFetchPreview}>
                            Load Employees
                        </Button>
                        <Button
                            type="primary"
                            icon={<RobotOutlined />}
                            onClick={handleAutoAssign}
                            disabled={!selectedCycleId || !selectedTemplateId}
                        >
                            Auto Assign All
                        </Button>
                        <Tooltip title="Bulk assign by Department coming soon">
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
                    locale={{ emptyText: "Select a cycle and click Load Employees to see suggestions" }}
                />
            </Card>

            <Modal
                title={`Manual Assignment - ${selectedEmployeeForManual?.employeeName}`}
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
                                message.success("Assigned successfully");
                                setIsManualModalVisible(false);
                            }
                            dispatch(fetchAssignmentPreview(selectedCycleId));
                        }).catch(err => {
                            message.error(err?.message || "Failed to assign");
                        });
                    });
                }}
                onCancel={() => {
                    setIsManualModalVisible(false);
                    form.resetFields();
                }}
                destroyOnClose
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
