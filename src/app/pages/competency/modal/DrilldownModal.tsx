import { useEffect } from "react";
import { Modal, Table, Space, Tag, Typography, Button, Spin, Row, Col, Card } from "antd";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { 
    getCompetencyDrilldown, 
    selectCompetencyDrilldown, 
    selectCompetencyLoading,
    clearDrilldown
} from "../../../../store/competencySlide";
import type { CompetencyReportItemDTO, CompetencyReportFilterDTO } from "../../../../store/competencySlide";
import { UserOutlined, MessageOutlined } from "@ant-design/icons";

const { Text, Title } = Typography;

interface DrilldownModalProps {
    open: boolean;
    onClose: () => void;
    criteria: CompetencyReportItemDTO | null;
    filter: CompetencyReportFilterDTO;
}

const DrilldownModal = ({ open, onClose, criteria, filter }: DrilldownModalProps) => {
    const dispatch = useAppDispatch();
    const drilldown = useAppSelector(selectCompetencyDrilldown);
    const loading = useAppSelector(selectCompetencyLoading);

    useEffect(() => {
        if (open && criteria) {
            dispatch(getCompetencyDrilldown({
                criteriaId: criteria.criteriaId,
                cycleId: filter.cycleId,
                employeeId: filter.employeeId,
                departmentId: filter.departmentId
            }));
        } else if (!open) {
            dispatch(clearDrilldown());
        }
    }, [open, criteria, filter, dispatch]);

    const columns = [
        {
            title: "Nhân viên",
            key: "employee",
            render: (_: any, record: any) => (
                <Space>
                    <UserOutlined className="text-slate-400" />
                    <div>
                        <div style={{ fontWeight: 500 }}>{record.employeeName}</div>
                        <Text type="secondary" style={{ fontSize: 12 }}>{record.employeeCode}</Text>
                    </div>
                </Space>
            )
        },
        {
            title: "Tự đánh giá",
            dataIndex: "selfRating",
            key: "selfRating",
            align: 'center' as const,
            render: (val: number | null) => <Tag color={val ? "blue" : "default"}>{val ?? "—"}</Tag>
        },
        {
            title: "Manager đánh giá",
            dataIndex: "managerRating",
            key: "managerRating",
            align: 'center' as const,
            render: (val: number | null) => <Tag color={val ? "success" : "default"}>{val ?? "—"}</Tag>
        },
        {
            title: "Bình luận / Phản hồi",
            key: "comments",
            width: 300,
            render: (_: any, record: any) => (
                <div style={{ maxWidth: 280 }}>
                    {record.selfComments && (
                        <div className="mb-2">
                             <Tag icon={<MessageOutlined />} color="processing" style={{ fontSize: 11, marginBottom: 4 }}>Self</Tag>
                             <div className="text-slate-500 italic p-1 border-l-2 bg-slate-50">{record.selfComments}</div>
                        </div>
                    )}
                    {record.managerComments && (
                        <div>
                             <Tag icon={<MessageOutlined />} color="green" style={{ fontSize: 11, marginBottom: 4 }}>Manager</Tag>
                             <div className="text-slate-600 font-medium p-1 border-l-2 border-green-200 bg-green-50">{record.managerComments}</div>
                        </div>
                    )}
                    {!record.selfComments && !record.managerComments && "—"}
                </div>
            )
        }
    ];

    if (!criteria) return null;

    return (
        <Modal
            title={<Title level={4} style={{ margin: 0 }}>Chi tiết phân tích: {criteria.criteriaName}</Title>}
            open={open}
            onCancel={onClose}
            width={900}
            footer={[
                <Button key="close" type="primary" onClick={onClose}>Đóng</Button>
            ]}
        >
            <Spin spinning={loading}>
                <Row gutter={16} className="mb-6 mt-4">
                     <Col span={8}>
                        <Card size="small" className="bg-slate-50 border-none">
                            <Text type="secondary">Phân loại</Text>
                            <div className="text-lg font-bold">{criteria.criteriaCategory}</div>
                        </Card>
                     </Col>
                     <Col span={8}>
                        <Card size="small" className="bg-slate-50 border-none">
                            <Text type="secondary">Manager Avg</Text>
                            <div className="text-lg font-bold text-blue-600">{criteria.averageManagerRating} / 5</div>
                        </Card>
                     </Col>
                     <Col span={8}>
                        <Card size="small" className="bg-slate-50 border-none">
                            <Text type="secondary">Khoảng cách chênh lệch (Gap)</Text>
                            <div className={`text-lg font-bold ${criteria.gap > 0 ? "text-red-500" : "text-green-600"}`}>
                                {criteria.gap > 0 ? `+${criteria.gap}` : criteria.gap}
                            </div>
                        </Card>
                     </Col>
                </Row>

                <Table 
                    columns={columns} 
                    dataSource={drilldown?.details || []} 
                    rowKey="employeeId"
                    pagination={{ pageSize: 5 }}
                    size="small"
                    bordered
                />
            </Spin>
        </Modal>
    );
};

export default DrilldownModal;
