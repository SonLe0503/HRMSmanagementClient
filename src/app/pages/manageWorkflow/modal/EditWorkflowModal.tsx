import { useState, useEffect } from "react";
import { Modal, Form, Input, Select, Steps, Button, Space, Divider, message, Row, Col, InputNumber, Spin } from "antd";
import {
    InfoCircleOutlined,
    NodeIndexOutlined,
    PlusOutlined,
    DeleteOutlined,
    FileSearchOutlined,
    UserOutlined,
    TeamOutlined,
    DeploymentUnitOutlined
} from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { updateWorkflow, selectWorkflowLoading } from "../../../../store/workflowSlide";
import { fetchStagesByWorkflow, selectStages, createStage, updateStage, deleteStage } from "../../../../store/workflowstageSlide";
import { createApprover, updateApprover, deleteApprover } from "../../../../store/stageapproveSlice";
import { selectRoles } from "../../../../store/roleSlide";
import { fetchAllUsers, selectUsers } from "../../../../store/userSlide";
import { selectInfoLogin } from "../../../../store/authSlide";

interface EditWorkflowModalProps {
    open: boolean;
    onCancel: () => void;
    onSuccess: () => void;
    editingWorkflow: any;
}

const EditWorkflowModal = ({ open, onCancel, onSuccess, editingWorkflow }: EditWorkflowModalProps) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [form] = Form.useForm();
    const dispatch = useAppDispatch();
    const workflowLoading = useAppSelector(selectWorkflowLoading);
    const stages = useAppSelector(selectStages);
    const roles = useAppSelector(selectRoles);
    const users = useAppSelector(selectUsers);
    const user = useAppSelector(selectInfoLogin);
    const [messageApi, contextHolder] = message.useMessage();

    const [loadingData, setLoadingData] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (open && editingWorkflow) {
            setLoadingData(true);
            dispatch(fetchAllUsers());
            dispatch(fetchStagesByWorkflow(editingWorkflow.workflowId))
                .unwrap()
                .then((fetchedStages) => {
                    // Map fetched stages into form format
                    const mappedStages = fetchedStages.map((s: any) => {
                        const approver = s.workflowStageApprovers?.[0];
                        let approverType = "role";
                        let approverValue = "";

                        if (approver) {
                            // Backend Schema: 1: User, 2: Role, 3: Dynamic
                            if (approver.approverType === 1) {
                                approverType = "specific";
                                approverValue = approver.userId;
                            } else if (approver.approverType === 2) {
                                approverType = "role";
                                const role = roles.find(r => r.roleId === approver.roleId);
                                approverValue = role ? role.roleName : approver.roleId;
                            } else if (approver.approverType === 3 || approver.isDynamic) {
                                approverType = "dynamic";
                                approverValue = approver.dynamicRule;
                            }
                        }

                        return {
                            stageId: s.stageId,
                            stageName: s.stageName,
                            approvalType: s.approvalType.toLowerCase(),
                            timeout: s.timeoutHours,
                            approverType,
                            approverValue,
                            approverId: approver?.id 
                        };
                    });

                    form.setFieldsValue({
                        ...editingWorkflow,
                        stages: mappedStages
                    });
                })
                .finally(() => setLoadingData(false));
        }
    }, [open, editingWorkflow, form, dispatch, roles]);

    const next = async () => {
        try {
            let fieldsToValidate: string[] = [];
            if (currentStep === 0) {
                fieldsToValidate = ["workflowName", "workflowType"];
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
            messageApi.error("Session expired");
            return;
        }

        setSubmitting(true);
        try {
            // 1. Update Workflow Header
            await dispatch(updateWorkflow({
                id: editingWorkflow.workflowId,
                data: {
                    WorkflowName: values.workflowName,
                    WorkflowType: values.workflowType,
                    Description: values.description,
                    IsActive: values.isActive,
                }
            })).unwrap();

            // 2. Handle Stages (This is a simplified sync logic)
            // In a real app, we'd compare old and new stages to see what to delete/add/update.
            // For this implementation, we assume we update existing ones and add new ones.
            // Note: Delete functionality in Edit is tricky without comparing with 'stages' from Redux.

            // Delete removed stages (Safely delete approvers first)
            const currentStages = stages as any[];
            const submittedStageIds = values.stages?.map((s: any) => s.stageId).filter(Boolean) || [];

            const stagesToDelete = currentStages.filter(s => !submittedStageIds.includes(s.stageId));
            for (const stage of stagesToDelete) {
                // Remove all approvers of this stage first
                if (stage.workflowStageApprovers) {
                    for (const approver of stage.workflowStageApprovers) {
                        await dispatch(deleteApprover(approver.id)).unwrap();
                    }
                }
                // Then remove the stage itself
                await dispatch(deleteStage(stage.stageId)).unwrap();
            }

            if (values.stages && values.stages.length > 0) {
                for (let i = 0; i < values.stages.length; i++) {
                    const stageData = values.stages[i];
                    let mappedApprovalType = "Single";
                    if (stageData.approvalType === "any") mappedApprovalType = "Any";
                    if (stageData.approvalType === "all") mappedApprovalType = "All";

                    const stagePayload = {
                        StageOrder: i + 1,
                        StageName: stageData.stageName,
                        ApprovalType: mappedApprovalType,
                        TimeoutHours: stageData.timeout || 0,
                        IsAutoApprove: false
                    };

                    let stageId = stageData.stageId;
                    if (stageId) {
                        // Update existing stage
                        await dispatch(updateStage({ id: stageId, data: stagePayload })).unwrap();
                    } else {
                        // Create new stage
                        const newStage = await dispatch(createStage({ ...stagePayload, WorkflowId: editingWorkflow.workflowId })).unwrap();
                        stageId = newStage.stageId;
                    }

                    // 3. Handle Approver for this stage
                    // 3. Handle Approver for this stage
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
                        ApproverType: Number(approverTypeNum),
                        UserId: approverTypeNum === 1 && userId !== null ? Number(userId) : null,
                        RoleId: approverTypeNum === 2 && roleId !== null ? Number(roleId) : null,
                        IsDynamic: approverTypeNum === 3,
                        DynamicRule: dynamicRule || null
                    };

                    if (stageData.approverId) {
                        // Update existing approver
                        await dispatch(updateApprover({ id: stageData.approverId, data: approverPayload })).unwrap();
                    } else {
                        // Add new approver
                        await dispatch(createApprover({ ...approverPayload, StageId: Number(stageId) })).unwrap();
                    }
                }
            }

            messageApi.success("Workflow updated successfully");
            handleCancel();
            onSuccess();
        } catch (err: any) {
            console.error("Workflow update error:", err);
            const msg = typeof err === 'string' ? err : err?.message || err?.data || err || "Failed to update workflow structure";
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
                    <Form.Item name="workflowName" label="Workflow Name" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="workflowType" label="Workflow Type" rules={[{ required: true }]}>
                        <Select disabled>
                            <Select.Option value="Leave">Leave</Select.Option>
                            <Select.Option value="Overtime">Overtime</Select.Option>
                            <Select.Option value="Attendance">Attendance</Select.Option>
                            <Select.Option value="Payroll">Payroll</Select.Option>
                            <Select.Option value="Performance">Performance</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="description" label="Description">
                        <Input.TextArea rows={3} />
                    </Form.Item>
                </div>
            ),
        },
        {
            title: "Stages",
            icon: <NodeIndexOutlined />,
            content: (
                <div style={{ marginTop: 24 }}>
                    <Form.List name="stages">
                        {(fields, { add, remove }) => (
                            <>
                                {fields.map(({ key, name, ...restField }, index) => (
                                    <div key={key} style={{ background: "#fafafa", padding: 16, marginBottom: 16, borderRadius: 8, border: "1px solid #f0f0f0" }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                                            <span style={{ fontWeight: 600 }}>Stage {index + 1}</span>
                                            <Button type="text" danger icon={<DeleteOutlined />} onClick={() => remove(name)} />
                                        </div>
                                        <Form.Item {...restField} name={[name, "stageId"]} hidden><Input /></Form.Item>
                                        <Form.Item {...restField} name={[name, "approverId"]} hidden><Input /></Form.Item>

                                        <Row gutter={16}>
                                            <Col span={12}>
                                                <Form.Item {...restField} name={[name, "stageName"]} label="Stage Name" rules={[{ required: true }]}>
                                                    <Input />
                                                </Form.Item>
                                            </Col>
                                            <Col span={12}>
                                                <Form.Item {...restField} name={[name, "approvalType"]} label="Approval Type" initialValue="single">
                                                    <Select>
                                                        <Select.Option value="single">Single</Select.Option>
                                                        <Select.Option value="any">Any</Select.Option>
                                                        <Select.Option value="all">All</Select.Option>
                                                    </Select>
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                        <Row gutter={16}>
                                            <Col span={12}>
                                                <Form.Item {...restField} name={[name, "approverType"]} label="Approver Assignment" initialValue="role">
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
                                                            <Form.Item {...restField} name={[name, "approverValue"]} label="Value" rules={[{ required: true }]}>
                                                                <Select>
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
                                        <Form.Item {...restField} name={[name, "timeout"]} label="Timeout (Hours)" initialValue={3}>
                                            <InputNumber min={1} style={{ width: "100%" }} />
                                        </Form.Item>
                                    </div>
                                ))}
                                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>Add Stage</Button>
                            </>
                        )}
                    </Form.List>
                </div>
            ),
        },
        {
            title: "Review Changes",
            icon: <FileSearchOutlined />,
            content: (
                <Form.Item noStyle shouldUpdate>
                    {() => (
                        <div style={{ marginTop: 24 }}>
                            <div style={{ background: "#fffbe6", border: "1px solid #ffe58f", padding: 16, borderRadius: 8 }}>
                                <p><strong>Workflow:</strong> {form.getFieldValue("workflowName")}</p>
                                <p><strong>Total Stages:</strong> {form.getFieldValue("stages")?.length || 0}</p>
                            </div>
                            <Divider />
                            <p>Are you sure you want to save these changes? Existing pending requests might be affected depending on your system logic.</p>
                        </div>
                    )}
                </Form.Item>
            ),
        },
    ];

    return (
        <Modal
            title={editingWorkflow ? `Edit Workflow: ${editingWorkflow.workflowName}` : "Edit Workflow"}
            open={open}
            onCancel={handleCancel}
            footer={null}
            width={800}
            destroyOnHidden
        >
            {contextHolder}
            {loadingData ? (
                <div style={{ textAlign: "center", padding: "50px 0" }}><Spin tip="Loading workflow details..." /></div>
            ) : (
                <>
                    <Steps current={currentStep} items={steps.map(s => ({ title: s.title, icon: s.icon }))} size="small" style={{ marginBottom: 24 }} />
                    <Form form={form} layout="vertical" onFinish={onFinish}>
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
                                {currentStep > 0 && <Button onClick={prev}>Back</Button>}
                                {currentStep < steps.length - 1 ? (
                                    <Button type="primary" onClick={next}>Next</Button>
                                ) : (
                                    <Button type="primary" onClick={() => form.submit()} loading={workflowLoading || submitting}>Save Changes</Button>
                                )}
                            </Space>
                        </div>
                    </Form>
                </>
            )}
        </Modal>
    );
};

export default EditWorkflowModal;
