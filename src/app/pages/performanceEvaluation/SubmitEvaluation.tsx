import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Typography, Form, Input, Button, Rate, Divider, message, Row, Col, Space, Spin } from "antd";
import { useAppDispatch, useAppSelector } from "../../../store";
import { fetchEvaluationDetail, selectEvaluationDetail, submitSelfEvaluation, submitManagerEvaluation, saveEvaluationDraft, selectSubmitEvaluationLoading } from "../../../store/submitEvaluationSlide";

const { Title, Text } = Typography;
const { TextArea } = Input;

const SubmitEvaluation = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const evaluation = useAppSelector(selectEvaluationDetail);
    const loading = useAppSelector(selectSubmitEvaluationLoading);
    const currentUser = Number(useAppSelector((state: any) => state.auth.infoLogin?.employeeId || state.auth.infoLogin?.userId));
    const [form] = Form.useForm();

    useEffect(() => {
        if (id) {
            dispatch(fetchEvaluationDetail(Number(id)));
        }
    }, [id, dispatch]);

    useEffect(() => {
        if (evaluation) {
            const initialValues: any = {};
            evaluation.ratings.forEach((r: any) => {
                initialValues[`selfRating_${r.criteriaId}`] = r.selfRating || 0;
                initialValues[`selfComments_${r.criteriaId}`] = r.selfComments || "";
                initialValues[`managerRating_${r.criteriaId}`] = r.managerRating || 0;
                initialValues[`managerComments_${r.criteriaId}`] = r.managerComments || "";
                initialValues[`evidence_${r.criteriaId}`] = r.evidence || "";
            });
            initialValues.overallRating = evaluation.overallRating || 0;
            form.setFieldsValue(initialValues);
        }
    }, [evaluation, form]);

    if (!evaluation || loading) return <Spin size="large" style={{ margin: "50px auto", display: "block" }} />;

    const isSelfEvaluation = currentUser === evaluation.employeeId;
    const isManagerEvaluation = currentUser === evaluation.primaryEvaluatorId || currentUser === evaluation.secondaryEvaluatorId;

    if (!isSelfEvaluation && !isManagerEvaluation) {
        return <div className="p-4"><Card><Title level={4}>Unauthorized: You are not assigned to this evaluation.</Title></Card></div>;
    }

    const canEditSelf = isSelfEvaluation && (evaluation.status === 'Not Started' || evaluation.status === 'Self Evaluation');
    const canEditManager = isManagerEvaluation && (evaluation.status === 'Not Started' || evaluation.status === 'Self Evaluation' || evaluation.status === 'Manager Evaluation');

    const handleFinish = (values: any) => {
        const ratings = evaluation.ratings.map((r: any) => ({
            criteriaId: r.criteriaId,
            selfRating: values[`selfRating_${r.criteriaId}`] || 0,
            selfComments: values[`selfComments_${r.criteriaId}`] || "",
            managerRating: values[`managerRating_${r.criteriaId}`] || 0,
            managerComments: values[`managerComments_${r.criteriaId}`] || "",
            evidence: values[`evidence_${r.criteriaId}`] || ""
        }));

        if (isSelfEvaluation && canEditSelf) {
            dispatch(submitSelfEvaluation({ evaluationId: Number(id), ratings })).unwrap()
                .then(() => { message.success("Self evaluation submitted!"); navigate(-1); })
                .catch((e: any) => message.error(e?.message || "Error submitting"));
        } else if (isManagerEvaluation && canEditManager) {
            dispatch(submitManagerEvaluation({ evaluationId: Number(id), ratings, overallRating: values.overallRating })).unwrap()
                .then(() => { message.success("Manager evaluation submitted!"); navigate(-1); })
                .catch((e: any) => message.error(e?.message || "Error submitting"));
        }
    };

    const handleSaveDraft = () => {
        const values = form.getFieldsValue();
        const ratings = evaluation.ratings.map((r: any) => ({
            criteriaId: r.criteriaId,
            managerRating: values[`managerRating_${r.criteriaId}`] || 0,
            managerComments: values[`managerComments_${r.criteriaId}`] || "",
            evidence: values[`evidence_${r.criteriaId}`] || ""
        }));
        dispatch(saveEvaluationDraft({ evaluationId: Number(id), ratings })).unwrap()
            .then(() => message.success("Draft saved!"))
            .catch((e: any) => message.error(e?.message || "Error saving draft"));
    };

    const handleValuesChange = (changedValues: any, allValues: any) => {
        if (isManagerEvaluation && canEditManager) {
            const hasManagerRatingChanged = Object.keys(changedValues).some(k => k.startsWith('managerRating_'));
            if (hasManagerRatingChanged && evaluation?.ratings) {
                let calculatedScore = 0;
                evaluation.ratings.forEach((r: any) => {
                    const ratingValue = allValues[`managerRating_${r.criteriaId}`] || 0;
                    calculatedScore += ratingValue * ((r.weightage || 0) / 100);
                });
                form.setFieldsValue({ overallRating: Number(calculatedScore.toFixed(1)) });
            }
        }
    };

    return (
        <div className="p-4">
            <Card title={<Title level={3} style={{ margin: 0 }}>Evaluation: {evaluation.employeeName}</Title>}>
                <Row gutter={16} style={{ marginBottom: 20 }}>
                    <Col span={8}><Text type="secondary">Department:</Text> <b>{evaluation.employeeDepartment}</b></Col>
                    <Col span={8}><Text type="secondary">Position:</Text> <b>{evaluation.employeePosition}</b></Col>
                    <Col span={8}><Text type="secondary">Status:</Text> <b>{evaluation.status}</b></Col>
                </Row>
                <Divider />
                <Form layout="vertical" form={form} onFinish={handleFinish} onValuesChange={handleValuesChange}>
                    {evaluation.ratings.map((r: any, idx: number) => (
                        <div key={r.criteriaId} style={{ marginBottom: 24, padding: 16, background: "#fafafa", borderRadius: 8 }}>
                            <Title level={5} style={{ marginTop: 0 }}>{idx + 1}. {r.criteriaName} (Weight: {r.weightage}%)</Title>
                            
                            <Row gutter={32}>
                                {/* Self Evaluation Column */}
                                <Col span={12}>
                                    <div style={{ padding: '8px', borderRight: '1px solid #e8e8e8' }}>
                                        <Title level={5} type="secondary" style={{ color: '#1890ff' }}>Self Evaluation</Title>
                                        <Form.Item name={`selfRating_${r.criteriaId}`} label="Rating (1-5)" rules={[{ required: isSelfEvaluation && canEditSelf, message: "Required" }]}>
                                            <Rate disabled={!canEditSelf} />
                                        </Form.Item>
                                        <Form.Item name={`selfComments_${r.criteriaId}`} label="Comments">
                                            <TextArea disabled={!canEditSelf} rows={3} placeholder={canEditSelf ? "Enter your self-assessment..." : "No comments"} />
                                        </Form.Item>
                                    </div>
                                </Col>
                                
                                {/* Manager Evaluation Column */}
                                <Col span={12}>
                                    <div style={{ padding: '8px' }}>
                                        <Title level={5} type="secondary" style={{ color: '#eb2f96' }}>Manager Evaluation</Title>
                                        <Form.Item name={`managerRating_${r.criteriaId}`} label="Rating (1-5)" rules={[{ required: isManagerEvaluation && canEditManager, message: "Required" }]}>
                                            <Rate disabled={!canEditManager} />
                                        </Form.Item>
                                        <Form.Item name={`managerComments_${r.criteriaId}`} label="Comments">
                                            <TextArea disabled={!canEditManager} rows={3} placeholder={canEditManager ? "Enter manager assessment..." : "No comments"} />
                                        </Form.Item>
                                    </div>
                                </Col>
                            </Row>

                            <Row>
                                <Col span={24}>
                                    <Form.Item name={`evidence_${r.criteriaId}`} label="Evidence / Supporting References">
                                        <Input disabled={(!canEditSelf && !canEditManager)} />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </div>
                    ))}

                    {isManagerEvaluation && (
                        <div style={{ padding: 16, background: "#f0f2f5", borderRadius: 8, marginBottom: 24 }}>
                            <Title level={4} style={{ marginTop: 0 }}>Overall Performance</Title>
                            <Form.Item name="overallRating" label="Overall Rating (1-5)" rules={[{ required: canEditManager, message: "Overall rating is required!" }]}>
                                <Rate allowHalf disabled={!canEditManager} />
                            </Form.Item>
                        </div>
                    )}

                    <Divider />
                    <Space size="middle" style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button onClick={() => navigate(-1)}>Cancel</Button>
                        {isManagerEvaluation && canEditManager && (
                            <Button onClick={handleSaveDraft} loading={loading}>Save Draft</Button>
                        )}
                        {(canEditSelf || canEditManager) && (
                            <Button type="primary" htmlType="submit" loading={loading}>
                                Submit Evaluation
                            </Button>
                        )}
                    </Space>
                </Form>
            </Card>
        </div>
    );
};

export default SubmitEvaluation;
