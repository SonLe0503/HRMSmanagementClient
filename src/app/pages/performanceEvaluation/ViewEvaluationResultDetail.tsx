import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Typography, Button, Divider, Row, Col, Spin, Table, Tag, Progress, Space, Modal, Input, message } from "antd";
import { useAppDispatch, useAppSelector } from "../../../store";
import { fetchEvaluationResultDetail, acknowledgeEvaluation, requestReview, selectResultDetail, selectEvaluationResultLoading } from "../../../store/evaluationResultSlide";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const ViewEvaluationResultDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const detail = useAppSelector(selectResultDetail);
    const loading = useAppSelector(selectEvaluationResultLoading);

    const [isAppealModalVisible, setIsAppealModalVisible] = useState(false);
    const [appealDisagreement, setAppealDisagreement] = useState("");
    const [appealExplanation, setAppealExplanation] = useState("");
    const [appealEvidence, setAppealEvidence] = useState("");

    const currentUser = Number(useAppSelector((state: any) => state.auth.infoLogin?.employeeId || state.auth.infoLogin?.userId));

    useEffect(() => {
        if (id) {
            dispatch(fetchEvaluationResultDetail(Number(id)));
        }
    }, [id, dispatch]);

    if (!detail || loading) return <Spin size="large" style={{ margin: "50px auto", display: "block" }} />;

    const handleAcknowledge = () => {
        Modal.confirm({
            title: "Xác nhận kết quả đánh giá",
            content: "Bằng việc xác nhận, bạn đồng ý rằng bạn đã xem qua và hiểu rõ điểm đánh giá của mình. Bạn sẽ không thể khiếu nại sau khi đã xác nhận.",
            onOk: () => {
                dispatch(acknowledgeEvaluation({ evaluationId: Number(id), acknowledgementComments: "Đã xác nhận bởi nhân viên." })).unwrap()
                    .then(() => {
                        message.success("Đã xác nhận phiếu đánh giá thành công!");
                        dispatch(fetchEvaluationResultDetail(Number(id)));
                    })
                    .catch((e: any) => message.error(e?.message || "Lỗi thao tác"));
            }
        });
    };

    const handleAppeal = () => {
        if (!appealDisagreement || !appealExplanation) {
            message.warning("Vui lòng điền đầy đủ các thông tin bắt buộc.");
            return;
        }
        dispatch(requestReview({
            evaluationId: Number(id),
            disagreementPoints: appealDisagreement,
            detailedExplanation: appealExplanation,
            supportingEvidence: appealEvidence
        })).unwrap()
            .then(() => {
                message.success("Yêu cầu khiếu nại đã được gửi thành công.");
                setIsAppealModalVisible(false);
                dispatch(fetchEvaluationResultDetail(Number(id)));
            })
            .catch((e: any) => message.error(e?.message || "Lỗi gửi khiếu nại"));
    };

    const isOwner = currentUser === detail?.employeeId;

    const columns = [
        { title: "Tiêu chí", dataIndex: "criteriaName", key: "criteriaName", width: '25%' },
        { title: "Trọng số", dataIndex: "weightage", key: "weight", render: (v: number) => `${v}%`, width: '10%' },
        { title: "Tự đánh giá", dataIndex: "selfRating", key: "selfRating",
            render: (v: number) => <Progress percent={v ? (v / 5) * 100 : 0} format={() => v ? v.toFixed(1) : '-'} status="normal" strokeColor="#1890ff" />
        },
        { title: "Quản lý định chuẩn", dataIndex: "managerRating", key: "managerRating",
            render: (v: number) => <Progress percent={v ? (v / 5) * 100 : 0} format={() => v ? v.toFixed(1) : '-'} status="success" strokeColor="#eb2f96" />
        },
        { title: "Lệch", dataIndex: "difference", key: "difference", 
            render: (v: number) => {
                if (!v && v !== 0) return "-";
                return <Tag color={v > 0 ? "green" : (v < 0 ? "red" : "default")}>{v > 0 ? '+' : ''}{v.toFixed(1)}</Tag>;
            }
        }
    ];

    return (
        <div className="p-4">
            <Card>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Title level={2} style={{ margin: 0 }}>Kết quả đánh giá: {detail.cycleName}</Title>
                    <Tag color={detail.status === 'Completed' || detail.status === 'Acknowledged' ? 'green' : 'orange'} style={{ fontSize: 16, padding: '4px 12px' }}>
                        {detail.status === 'Completed' ? 'Hoàn thành' : detail.status === 'Acknowledged' ? 'Đã xác nhận' : detail.status}
                    </Tag>
                </div>
                <Divider />
                <Row gutter={24} style={{ marginBottom: 24 }}>
                    <Col span={24}>
                        <Card size="small" title="Thông tin chung">
                            <p><Text type="secondary">Kỳ đánh giá:</Text> {detail.evaluationPeriodStart} tới {detail.evaluationPeriodEnd}</p>
                            <p><Text type="secondary">Người quản lý chấm:</Text> {detail.primaryEvaluatorName || "N/A"}</p>
                            <p><Text type="secondary">Hoàn thành vào:</Text> {detail.completionDate ? new Date(detail.completionDate).toLocaleString() : "N/A"}</p>
                            <p><Text type="secondary">Điểm tổng kết cuối cùng:</Text> <b style={{ fontSize: '18px' }}>{detail.overallRating?.toFixed(1) || "N/A"} / 5.0</b></p>
                        </Card>
                    </Col>
                </Row>
                <Title level={4}>Chi tiết điểm từng tiêu chí</Title>
                <Table 
                    columns={columns} 
                    dataSource={detail.criteriaResults || []} 
                    rowKey="criteriaId" 
                    pagination={false}
                    expandable={{
                        expandedRowRender: record => (
                            <div style={{ margin: 0, padding: 12, background: '#f5f5f5', borderRadius: 6 }}>
                                <Row gutter={16}>
                                    <Col span={12}><b>Nhận xét tự chấm:</b> <p>{record.selfComments || 'Không có'}</p></Col>
                                    <Col span={12}><b>Nhận xét từ Quản lý:</b> <p>{record.managerComments || 'Không có'}</p></Col>
                                </Row>
                            </div>
                        ),
                    }}
                />

                <Divider />
                <Space style={{ width: '100%', justifyContent: 'center', marginTop: 24 }}>
                    <Button size="large" onClick={() => navigate(-1)}>Quay lại danh sách</Button>
                    {isOwner && !detail.isAcknowledged && detail.status === 'Completed' && (
                        <>
                            <Button size="large" danger onClick={() => setIsAppealModalVisible(true)}>Chưa thoả đáng (Khiếu nại)</Button>
                            <Button size="large" type="primary" onClick={handleAcknowledge}>Xác nhận đồng ý kết quả</Button>
                        </>
                    )}
                </Space>
            </Card>

            <Modal
                title="Kháng cáo / Yêu cầu xem xét điểm"
                open={isAppealModalVisible}
                onOk={handleAppeal}
                onCancel={() => setIsAppealModalVisible(false)}
                okText="Gửi khiếu nại"
                cancelText="Hủy"
                okButtonProps={{ danger: true }}
            >
                <div>
                    <Text type="secondary">Nếu bạn không đồng tình với kết quả chấm điểm của quản lý, bạn có thể gửi yêu cầu xem xét lại (Appeal).</Text>
                </div>
                <div style={{ marginTop: 16 }}>
                    <Text strong>Các điểm chưa đồng tình, vô lý <Text type="danger">*</Text></Text>
                    <TextArea rows={2} value={appealDisagreement} onChange={e => setAppealDisagreement(e.target.value)} placeholder="Ví dụ: Đánh giá tiêu chí X chưa đúng thực tế năng lực..." />
                </div>
                <div style={{ marginTop: 16 }}>
                    <Text strong>Giải thích chi tiết (Lý lẽ) <Text type="danger">*</Text></Text>
                    <TextArea rows={4} value={appealExplanation} onChange={e => setAppealExplanation(e.target.value)} placeholder="Hãy trình bày rõ ràng bối cảnh, lý do vì sao bạn đánh giá mình cao hơn số điểm mà quản lý đã định chuẩn..." />
                </div>
                <div style={{ marginTop: 16 }}>
                    <Text strong>Tài liệu chứng minh (Links / Google Drive)</Text>
                    <TextArea rows={2} value={appealEvidence} onChange={e => setAppealEvidence(e.target.value)} placeholder="Dán các đường link Jira, GitHub, hay các bằng chứng chứng minh lập luận của bạn..." />
                </div>
            </Modal>
        </div>
    );
};
export default ViewEvaluationResultDetail;
