import { useState, useEffect } from "react";
import { Modal, Form, Input, Select, Steps, Button, Space, Divider, message, Switch, InputNumber, Row, Col } from "antd";
import {
    InfoCircleOutlined,
    PlusOutlined,
    DeleteOutlined,
    UserOutlined,
    TeamOutlined,
    DeploymentUnitOutlined,
    FileSearchOutlined,
    NodeIndexOutlined
} from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { createWorkflow, selectWorkflowLoading } from "../../../../store/workflowSlide";
import { createStage } from "../../../../store/workflowstageSlide";
import { createApprover } from "../../../../store/stageapproveSlice";
import { selectRoles } from "../../../../store/roleSlide";
import { selectInfoLogin } from "../../../../store/authSlide";
import { fetchAllUsers, selectUsers } from "../../../../store/userSlide";

interface AddWorkflowModalProps {
    open: boolean;
    onCancel: () => void;
    onSuccess: () => void;
}

const AddWorkflowModal = ({ open, onCancel, onSuccess }: AddWorkflowModalProps) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [form] = Form.useForm();
    const dispatch = useAppDispatch();
    const loading = useAppSelector(selectWorkflowLoading);
    const roles = useAppSelector(selectRoles);
    const users = useAppSelector(selectUsers);
    const user = useAppSelector(selectInfoLogin);
    const [submitting, setSubmitting] = useState(false);
    const [messageApi, contextHolder] = message.useMessage();

    useEffect(() => {
        if (open) {
            dispatch(fetchAllUsers());
        }
    }, [open, dispatch]);

    const next = async () => {
        try {
            let fieldsToValidate: string[] = [];
            if (currentStep === 0) {
                fieldsToValidate = ["workflowName", "workflowType", "isActive"];
            } else if (currentStep === 1) {
                fieldsToValidate = ["stages"];
            }

            await form.validateFields(fieldsToValidate);
            setCurrentStep(currentStep + 1);
        } catch (error) {
            console.error("Validation failed:", error);
        }
    };

    const prev = () => {
        setCurrentStep(currentStep - 1);
    };

    const handleCancel = () => {
        form.resetFields();
        setCurrentStep(0);
        onCancel();
    };

    const onFinish = async (values: any) => {
        if (!user?.userId) {
            messageApi.error("User session not found");
            return;
        }

        setSubmitting(true);
        try {
            // 1. Create Workflow Header
            const workflowPayload = {
                WorkflowName: values.workflowName,
                WorkflowType: values.workflowType,
                Description: values.description,
                IsActive: values.isActive ?? true,
            };

            const workflowResult = await dispatch(createWorkflow(workflowPayload)).unwrap();

            const workflowId = workflowResult.workflowId;
            if (values.stages && values.stages.length > 0) {
                for (let i = 0; i < values.stages.length; i++) {
                    const stageData = values.stages[i];
                    let mappedApprovalType = "Single";
                    if (stageData.approvalType === "any") mappedApprovalType = "Any";
                    if (stageData.approvalType === "all") mappedApprovalType = "All";

                    const stagePayload = {
                        WorkflowId: workflowId,
                        StageOrder: i + 1,
                        StageName: stageData.stageName,
                        ApprovalType: mappedApprovalType,
                        TimeoutHours: stageData.timeout || 0,
                        IsAutoApprove: false
                    };

                    const stageResult = await dispatch(createStage(stagePayload)).unwrap();
                    const stageId = stageResult.stageId;

                    // 3. Create Approver for this stage
                    // Backend Enum: 1: User, 2: Role, 3: Dynamic
                    let approverTypeNum = 1;
                    let userId = null;
                    let roleId = null;
                    let dynamicRule = null;

                    if (stageData.approverType === "specific") {
                        approverTypeNum = 1;
                        userId = stageData.approverValue;
                    } else if (stageData.approverType === "role") {
                        approverTypeNum = 2;
                        const role = roles.find(r => r.roleName === stageData.approverValue);
                        roleId = role ? role.roleId : null;
                    } else if (stageData.approverType === "dynamic") {
                        approverTypeNum = 3;
                        dynamicRule = stageData.approverValue;
                    }

                    const approverPayload = {
                        StageId: Number(stageId),
                        ApproverType: Number(approverTypeNum),
                        UserId: approverTypeNum === 1 && userId !== null ? Number(userId) : null,
                        RoleId: approverTypeNum === 2 && roleId !== null ? Number(roleId) : null,
                        IsDynamic: approverTypeNum === 3,
                        DynamicRule: dynamicRule || null
                    };

                    await dispatch(createApprover(approverPayload)).unwrap();
                }
            }

            messageApi.success("Workflow and stages created successfully");
            handleCancel();
            onSuccess();
        } catch (err: any) {
            console.error("Workflow creation error:", err);
            const msg = typeof err === 'string' ? err : err?.message || err?.data || err || "Failed to create workflow structure";
            messageApi.error(msg);
        } finally {
            setSubmitting(false);
        }
    };

    const steps = [
        {
            title: "Basic Info",
            icon: <InfoCircleOutlined />,
            content: (
                <div style={{ marginTop: 24 }}>
                    <Form.Item
                        name="workflowName"
                        label="Workflow Name"
                        rules={[{ required: true, message: "Please input the workflow name!" }]}
                    >
                        <Input placeholder="e.g., Annual Leave Approval" />
                    </Form.Item>
                    <Form.Item
                        name="workflowType"
                        label="Workflow Type"
                        rules={[{ required: true, message: "Please select a type!" }]}
                    >
                        <Select placeholder="Select type">
                            <Select.Option value="Leave">Leave</Select.Option>
                            <Select.Option value="Overtime">Overtime</Select.Option>
                            <Select.Option value="Attendance">Attendance</Select.Option>
                            <Select.Option value="Payroll">Payroll</Select.Option>
                            <Select.Option value="Performance">Performance</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item
                        name="description"
                        label="Description"
                    >
                        <Input.TextArea rows={3} placeholder="Describe the purpose of this workflow" />
                    </Form.Item>
                    <Form.Item
                        name="isActive"
                        label="Initial Status"
                        valuePropName="checked"
                    >
                        <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
                    </Form.Item>
                </div>
            ),
        },
        {
            title: "Stage Definition",
            icon: <NodeIndexOutlined />,
            content: (
                <div style={{ marginTop: 24 }}>
                    <Form.List
                        name="stages"
                        initialValue={[{ stageName: "First Approval", approvalType: "single" }]}
                    >
                        {(fields, { add, remove }) => (
                            <>
                                {fields.map(({ key, name, ...restField }, index) => (
                                    <div key={key} style={{ background: "#fafafa", padding: 16, marginBottom: 16, borderRadius: 8, border: "1px solid #f0f0f0" }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                                            <span style={{ fontWeight: 600 }}>Stage {index + 1}</span>
                                            {fields.length > 1 && (
                                                <Button type="text" danger icon={<DeleteOutlined />} onClick={() => remove(name)} />
                                            )}
                                        </div>
                                        <Row gutter={16}>
                                            <Col span={12}>
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, "stageName"]}
                                                    label="Stage Name"
                                                    rules={[{ required: true, message: "Missing stage name" }]}
                                                >
                                                    <Input placeholder="e.g., Manager Review" />
                                                </Form.Item>
                                            </Col>
                                            <Col span={12}>
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, "approvalType"]}
                                                    label="Approval Type"
                                                    rules={[{ required: true }]}
                                                >
                                                    <Select>
                                                        <Select.Option value="single">Single Approver</Select.Option>
                                                        <Select.Option value="any">Any from group</Select.Option>
                                                        <Select.Option value="all">All required</Select.Option>
                                                    </Select>
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                        <Row gutter={16}>
                                            <Col span={12}>
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, "approverType"]}
                                                    label="Approver Assignment"
                                                    initialValue="role"
                                                >
                                                    <Select>
                                                        <Select.Option value="role"><TeamOutlined /> Role based</Select.Option>
                                                        <Select.Option value="dynamic"><DeploymentUnitOutlined /> Dynamic (Org Chart)</Select.Option>
                                                        <Select.Option value="specific"><UserOutlined /> Specific User</Select.Option>
                                                    </Select>
                                                </Form.Item>
                                            </Col>
                                            <Col span={12}>
                                                <Form.Item noStyle shouldUpdate={(prev, curr) =>
                                                    prev.stages?.[name]?.approverType !== curr.stages?.[name]?.approverType
                                                }>
                                                    {() => {
                                                        const approverType = form.getFieldValue(['stages', name, 'approverType']);
                                                        return (
                                                            <Form.Item
                                                                {...restField}
                                                                name={[name, "approverValue"]}
                                                                label="Value"
                                                                rules={[{ required: true, message: "Required" }]}
                                                            >
                                                                <Select placeholder="Select option">
                                                                    {approverType === "role" && roles.map(r => (
                                                                        <Select.Option key={r.roleId} value={r.roleName}>{r.roleName}</Select.Option>
                                                                    ))}
                                                                    {approverType === "specific" && users.map(u => (
                                                                        <Select.Option key={u.userId} value={u.userId}>{u.username}</Select.Option>
                                                                    ))}
                                                                    {approverType === "dynamic" && (
                                                                        <>
                                                                            <Select.Option value="DIRECT_MANAGER">Direct Manager</Select.Option>
                                                                            <Select.Option value="DEPT_HEAD">Department Head</Select.Option>
                                                                            <Select.Option value="HR_MANAGER">HR Manager</Select.Option>
                                                                        </>
                                                                    )}
                                                                </Select>
                                                            </Form.Item>
                                                        );
                                                    }}
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                        <Form.Item
                                            {...restField}
                                            name={[name, "timeout"]}
                                            label="Timeout (Hours)"
                                            initialValue={3}
                                        >
                                            <InputNumber min={1} style={{ width: "100%" }} />
                                        </Form.Item>
                                    </div>
                                ))}
                                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                    Add Stage
                                </Button>
                            </>
                        )}
                    </Form.List>
                </div>
            ),
        },
        {
            title: "Finalize",
            icon: <FileSearchOutlined />,
            content: (
                <Form.Item noStyle shouldUpdate>
                    {() => (
                        <div style={{ marginTop: 24, textAlign: "center" }}>
                            <NodeIndexOutlined style={{ fontSize: 48, color: "#1890ff", marginBottom: 16 }} />
                            <h3>Ready to create workflow</h3>
                            <p style={{ color: "#8c8c8c" }}>
                                Please review all configurations. This will create the workflow header, all defined stages, and assign the specified approvers.
                            </p>
                            <Divider />
                            <div style={{ textAlign: "left", background: "#f5f5f5", padding: 16, borderRadius: 8 }}>
                                <p><strong>Workflow:</strong> {form.getFieldValue("workflowName")}</p>
                                <p><strong>Type:</strong> {form.getFieldValue("workflowType")}</p>
                                <p><strong>Stages Defined:</strong> {form.getFieldValue("stages")?.length || 0}</p>
                                <p><strong>Initial Status:</strong> {form.getFieldValue("isActive") ? "Active" : "Inactive"}</p>
                            </div>
                        </div>
                    )}
                </Form.Item>
            ),
        }
    ];

    return (
        <Modal
            title="Create New Approval Workflow"
            open={open}
            onCancel={handleCancel}
            footer={null}
            width={800}
            destroyOnHidden
        >
            {contextHolder}
            <Steps
                current={currentStep}
                items={steps.map(item => ({ title: item.title, icon: item.icon }))}
                size="small"
                style={{ marginBottom: 24 }}
            />

            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                initialValues={{ isActive: true }}
            >
                <div style={{ minHeight: 400 }}>
                    {steps.map((step, idx) => (
                        <div key={idx} style={{ display: idx === currentStep ? 'block' : 'none' }}>
                            {step.content}
                        </div>
                    ))}
                </div>

                <Divider />

                <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <Button onClick={handleCancel}>Cancel</Button>
                    <Space>
                        {currentStep > 0 && (
                            <Button onClick={prev}>Back</Button>
                        )}
                        {currentStep < steps.length - 1 && (
                            <Button type="primary" onClick={next}>
                                Next
                            </Button>
                        )}
                        {currentStep === steps.length - 1 && (
                            <Button type="primary" onClick={() => form.submit()} loading={loading || submitting}>
                                Create Workflow
                            </Button>
                        )}
                    </Space>
                </div>
            </Form>
        </Modal>
    );
};

export default AddWorkflowModal;
