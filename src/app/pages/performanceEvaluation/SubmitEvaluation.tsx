import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Typography, Form, Input, Button, Rate, Divider, message, Row, Col, Space, Spin, Alert, Tag } from "antd";
import { LockOutlined, ClockCircleOutlined } from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "../../../store";
import { fetchEvaluationDetail, selectEvaluationDetail, submitSelfEvaluation, submitManagerEvaluation, saveEvaluationDraft, selectSubmitEvaluationLoading } from "../../../store/submitEvaluationSlide";
import dayjs from "dayjs";

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
        return <div className="p-4"><Card><Title level={4}>Bạn không có quyền truy cập phiếu đánh giá này.</Title></Card></div>;
    }

    // Time-gating logic
    const today = dayjs().format("YYYY-MM-DD");
    const selfEvalStart = evaluation.selfEvaluationStart;
    const selfEvalEnd = evaluation.selfEvaluationEnd;
    const managerEvalStart = evaluation.managerEvaluationStart;
    const managerEvalEnd = evaluation.managerEvaluationEnd;

    const isSelfEvalPeriodOpen = selfEvalStart && selfEvalEnd && today >= selfEvalStart && today <= selfEvalEnd;
    const isManagerEvalPeriodOpen = managerEvalStart && managerEvalEnd && today >= managerEvalStart && today <= managerEvalEnd;

    const canEditSelf = isSelfEvaluation && isSelfEvalPeriodOpen && (evaluation.status === 'Not Started' || evaluation.status === 'Self Evaluation');
    const canEditManager = isManagerEvaluation && isManagerEvalPeriodOpen && (evaluation.status === 'Not Started' || evaluation.status === 'Self Evaluation' || evaluation.status === 'Manager Evaluation');

    // Build time-gate alert messages
    const getTimeGateAlert = () => {
        if (isSelfEvaluation && !isSelfEvalPeriodOpen) {
            if (today < (selfEvalStart || "")) {
                return {
                    type: "warning" as const,
                    message: "Chưa đến giai đoạn Tự đánh giá",
                    description: `Bạn có thể bắt đầu tự đánh giá từ ngày ${dayjs(selfEvalStart).format("DD/MM/YYYY")} đến ${dayjs(selfEvalEnd).format("DD/MM/YYYY")}.`
                };
            }
            if (today > (selfEvalEnd || "")) {
                return {
                    type: "error" as const,
                    message: "Đã hết hạn Tự đánh giá",
                    description: `Giai đoạn tự đánh giá đã kết thúc vào ngày ${dayjs(selfEvalEnd).format("DD/MM/YYYY")}.`
                };
            }
        }
        if (isManagerEvaluation && !isManagerEvalPeriodOpen) {
            if (today < (managerEvalStart || "")) {
                return {
                    type: "warning" as const,
                    message: "Chưa đến giai đoạn Quản lý đánh giá",
                    description: `Bạn có thể đánh giá nhân viên từ ngày ${dayjs(managerEvalStart).format("DD/MM/YYYY")} đến ${dayjs(managerEvalEnd).format("DD/MM/YYYY")}.`
                };
            }
            if (today > (managerEvalEnd || "")) {
                return {
                    type: "error" as const,
                    message: "Đã hết hạn Quản lý đánh giá",
                    description: `Giai đoạn quản lý đánh giá đã kết thúc vào ngày ${dayjs(managerEvalEnd).format("DD/MM/YYYY")}.`
                };
            }
        }
        return null;
    };

    const timeGateAlert = getTimeGateAlert();

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
                .then(() => { message.success("Đã nộp bài tự đánh giá!"); navigate(-1); })
                .catch((e: any) => message.error(e?.message || "Lỗi khi nộp"));
        } else if (isManagerEvaluation && canEditManager) {
            dispatch(submitManagerEvaluation({ evaluationId: Number(id), ratings, overallRating: values.overallRating })).unwrap()
                .then(() => { message.success("Đã nộp đánh giá quản lý!"); navigate(-1); })
                .catch((e: any) => message.error(e?.message || "Lỗi khi nộp"));
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
            .then(() => message.success("Đã lưu bản nháp!"))
            .catch((e: any) => message.error(e?.message || "Lỗi khi lưu nháp"));
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
            <Card title={<Title level={3} style={{ margin: 0 }}>Phiếu đánh giá: {evaluation.employeeName}</Title>}>
                <Row gutter={16} style={{ marginBottom: 16 }}>
                    <Col span={6}><Text type="secondary">Phòng ban:</Text> <b>{evaluation.employeeDepartment}</b></Col>
                    <Col span={6}><Text type="secondary">Chức vụ:</Text> <b>{evaluation.employeePosition}</b></Col>
                    <Col span={6}><Text type="secondary">Trạng thái:</Text> <b>{evaluation.status}</b></Col>
                    <Col span={6}><Text type="secondary">Chu kỳ:</Text> <b>{evaluation.cycleName}</b></Col>
                </Row>

                {/* Timeline info */}
                <Row gutter={16} style={{ marginBottom: 16 }}>
                    <Col span={12}>
                        <Tag icon={isSelfEvalPeriodOpen ? <ClockCircleOutlined /> : <LockOutlined />} color={isSelfEvalPeriodOpen ? "green" : "default"}>
                            Tự đánh giá: {dayjs(selfEvalStart).format("DD/MM/YYYY")} → {dayjs(selfEvalEnd).format("DD/MM/YYYY")}
                        </Tag>
                    </Col>
                    <Col span={12}>
                        <Tag icon={isManagerEvalPeriodOpen ? <ClockCircleOutlined /> : <LockOutlined />} color={isManagerEvalPeriodOpen ? "green" : "default"}>
                            QL đánh giá: {dayjs(managerEvalStart).format("DD/MM/YYYY")} → {dayjs(managerEvalEnd).format("DD/MM/YYYY")}
                        </Tag>
                    </Col>
                </Row>

                {timeGateAlert && (
                    <Alert
                        type={timeGateAlert.type}
                        message={timeGateAlert.message}
                        description={timeGateAlert.description}
                        showIcon
                        style={{ marginBottom: 16 }}
                    />
                )}

                <Divider />
                <Form layout="vertical" form={form} onFinish={handleFinish} onValuesChange={handleValuesChange}>
                    {evaluation.ratings.map((r: any, idx: number) => (
                        <div key={r.criteriaId} style={{ marginBottom: 24, padding: 16, background: "#fafafa", borderRadius: 8 }}>
                            <Title level={5} style={{ marginTop: 0 }}>{idx + 1}. {r.criteriaName} (Trọng số: {r.weightage}%)</Title>
                            
                            <Row gutter={32}>
                                {/* Self Evaluation Column */}
                                <Col span={12}>
                                    <div style={{ padding: '8px', borderRight: '1px solid #e8e8e8' }}>
                                        <Title level={5} type="secondary" style={{ color: '#1890ff' }}>
                                            Tự đánh giá {!isSelfEvalPeriodOpen && isSelfEvaluation && <LockOutlined style={{ color: '#999' }} />}
                                        </Title>
                                        <Form.Item name={`selfRating_${r.criteriaId}`} label="Điểm (1-5)" rules={[{ required: !!(isSelfEvaluation && canEditSelf), message: "Bắt buộc" }]}>
                                            <Rate disabled={!canEditSelf} />
                                        </Form.Item>
                                        <Form.Item name={`selfComments_${r.criteriaId}`} label="Nhận xét">
                                            <TextArea disabled={!canEditSelf} rows={3} placeholder={canEditSelf ? "Nhập nhận xét tự đánh giá..." : "Chưa mở hoặc không có quyền"} />
                                        </Form.Item>
                                    </div>
                                </Col>
                                
                                {/* Manager Evaluation Column */}
                                <Col span={12}>
                                    <div style={{ padding: '8px' }}>
                                        <Title level={5} type="secondary" style={{ color: '#eb2f96' }}>
                                            Quản lý đánh giá {!isManagerEvalPeriodOpen && isManagerEvaluation && <LockOutlined style={{ color: '#999' }} />}
                                        </Title>
                                        <Form.Item name={`managerRating_${r.criteriaId}`} label="Điểm (1-5)" rules={[{ required: !!(isManagerEvaluation && canEditManager), message: "Bắt buộc" }]}>
                                            <Rate disabled={!canEditManager} />
                                        </Form.Item>
                                        <Form.Item name={`managerComments_${r.criteriaId}`} label="Nhận xét">
                                            <TextArea disabled={!canEditManager} rows={3} placeholder={canEditManager ? "Nhập đánh giá của quản lý..." : "Chưa mở hoặc không có quyền"} />
                                        </Form.Item>
                                    </div>
                                </Col>
                            </Row>

                            <Row>
                                <Col span={24}>
                                    <Form.Item name={`evidence_${r.criteriaId}`} label="Minh chứng / Tài liệu tham khảo">
                                        <Input disabled={(!canEditSelf && !canEditManager)} />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </div>
                    ))}

                    {isManagerEvaluation && (
                        <div style={{ padding: 16, background: "#f0f2f5", borderRadius: 8, marginBottom: 24 }}>
                            <Title level={4} style={{ marginTop: 0 }}>Đánh giá tổng thể</Title>
                            <Form.Item name="overallRating" label="Điểm tổng (1-5)" rules={[{ required: !!canEditManager, message: "Điểm tổng là bắt buộc!" }]}>
                                <Rate allowHalf disabled={!canEditManager} />
                            </Form.Item>
                        </div>
                    )}

                    <Divider />
                    <Space size="middle" style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button onClick={() => navigate(-1)}>Quay lại</Button>
                        {isManagerEvaluation && canEditManager && (
                            <Button onClick={handleSaveDraft} loading={loading}>Lưu nháp</Button>
                        )}
                        {(canEditSelf || canEditManager) && (
                            <Button type="primary" htmlType="submit" loading={loading}>
                                Nộp đánh giá
                            </Button>
                        )}
                    </Space>
                </Form>
            </Card>
        </div>
    );
};

export default SubmitEvaluation;
