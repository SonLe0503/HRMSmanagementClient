import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Descriptions, Button, Tag, Space, Typography, Spin, message, Modal } from "antd";
import { ArrowLeftOutlined, EditOutlined, StopOutlined } from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "../../../store";
import { fetchPositionById, selectSelectedPosition, selectPositionLoading, deactivatePosition } from "../../../store/positionSlide";
import EditPositionModal from "./modal/EditPositionModal";

const { Title } = Typography;

const PositionDetail = () => {
    const { id } = useParams();
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const position = useAppSelector(selectSelectedPosition);
    const loading = useAppSelector(selectPositionLoading);
    
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    useEffect(() => {
        if (id) {
            dispatch(fetchPositionById(parseInt(id)));
        }
    }, [id, dispatch]);

    const handleDeactivate = () => {
        if (!position) return;
        Modal.confirm({
            title: "Confirm Deactivation",
            content: "Are you sure you want to deactivate this position?",
            onOk: () => {
                dispatch(deactivatePosition(position.positionId)).then((res: any) => {
                    if (!res.error) {
                        message.success("Position deactivated successfully (MSG-100)");
                        navigate("/hr/manage-position");
                    } else {
                        const error = res.payload;
                        const msg = typeof error === 'string' ? error : error?.message || "Cannot deactivate position (MSG-101)";
                        message.error(msg);
                    }
                });
            }
        });
    };

    if (loading && !position) {
        return <div style={{ textAlign: "center", padding: "50px" }}><Spin size="large" /></div>;
    }

    if (!position) {
        return <div style={{ padding: "20px" }}><Title level={4}>Position not found</Title></div>;
    }

    return (
        <div className="p-4">
            <Card
                title={
                    <Space>
                        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate("/hr/manage-position")}>
                            Back
                        </Button>
                        <Title level={4} style={{ margin: 0 }}>Position Details</Title>
                    </Space>
                }
                extra={
                    <Space>
                        <Button 
                            type="primary" 
                            icon={<EditOutlined />} 
                            onClick={() => setIsEditModalOpen(true)}
                        >
                            Edit
                        </Button>
                        {position.isActive && (
                            <Button 
                                danger 
                                icon={<StopOutlined />} 
                                onClick={handleDeactivate}
                            >
                                Deactivate
                            </Button>
                        )}
                    </Space>
                }
            >
                <Descriptions bordered column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}>
                    <Descriptions.Item label="Position Code">{position.positionCode}</Descriptions.Item>
                    <Descriptions.Item label="Position Name">{position.positionName}</Descriptions.Item>
                    <Descriptions.Item label="Level">{position.level}</Descriptions.Item>
                    <Descriptions.Item label="Status">
                        <Tag color={position.isActive ? "green" : "red"}>
                            {position.isActive ? "ACTIVE" : "INACTIVE"}
                        </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Employee Count" span={2}>{position.employeeCount}</Descriptions.Item>
                    <Descriptions.Item label="Description" span={2}>{position.description || "—"}</Descriptions.Item>
                </Descriptions>
            </Card>

            <EditPositionModal
                open={isEditModalOpen}
                onCancel={() => setIsEditModalOpen(false)}
                positionId={position.positionId}
                initialValues={{
                    positionCode: position.positionCode,
                    positionName: position.positionName,
                    description: position.description,
                    level: position.level
                }}
            />
        </div>
    );
};

export default PositionDetail;
