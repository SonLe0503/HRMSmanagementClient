import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Descriptions, Button, Tag, Space, Typography, Spin, message, Modal } from "antd";
import { ArrowLeftOutlined, EditOutlined, StopOutlined } from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "../../../store";
import { fetchDepartmentById, selectSelectedDepartment, selectDepartmentLoading, deactivateDepartment } from "../../../store/departmentSlide";
import EditDepartmentModal from "./modal/EditDepartmentModal";

const { Title } = Typography;

const DepartmentDetail = () => {
    const { id } = useParams();
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const department = useAppSelector(selectSelectedDepartment);
    const loading = useAppSelector(selectDepartmentLoading);
    
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    useEffect(() => {
        if (id) {
            dispatch(fetchDepartmentById(parseInt(id)));
        }
    }, [id, dispatch]);

    const handleDeactivate = () => {
        if (!department) return;
        Modal.confirm({
            title: "Confirm Deactivation",
            content: "Are you sure you want to deactivate this department?",
            onOk: () => {
                dispatch(deactivateDepartment(department.departmentId)).then((res: any) => {
                    if (!res.error) {
                        message.success("Department deactivated successfully (MSG-95)");
                        navigate("/hr/manage-department");
                    } else {
                        const error = res.payload;
                        const msg = typeof error === 'string' ? error : error?.message || "Cannot deactivate department (MSG-96)";
                        message.error(msg);
                    }
                });
            }
        });
    };

    if (loading && !department) {
        return <div style={{ textAlign: "center", padding: "50px" }}><Spin size="large" /></div>;
    }

    if (!department) {
        return <div style={{ padding: "20px" }}><Title level={4}>Department not found</Title></div>;
    }

    return (
        <div className="p-4">
            <Card
                title={
                    <Space>
                        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate("/hr/manage-department")}>
                            Back
                        </Button>
                        <Title level={4} style={{ margin: 0 }}>Department Details</Title>
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
                        {department.isActive && (
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
                    <Descriptions.Item label="Department Code">{department.departmentCode}</Descriptions.Item>
                    <Descriptions.Item label="Department Name">{department.departmentName}</Descriptions.Item>
                    <Descriptions.Item label="Status">
                        <Tag color={department.isActive ? "green" : "red"}>
                            {department.isActive ? "ACTIVE" : "INACTIVE"}
                        </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Parent Department">{department.parentDepartmentName || "—"}</Descriptions.Item>
                    <Descriptions.Item label="Manager">{department.managerName || "—"}</Descriptions.Item>
                    <Descriptions.Item label="Employee Count">{department.employeeCount}</Descriptions.Item>
                    <Descriptions.Item label="Description" span={2}>{department.description || "—"}</Descriptions.Item>
                </Descriptions>
            </Card>

            <EditDepartmentModal
                open={isEditModalOpen}
                onCancel={() => setIsEditModalOpen(false)}
                departmentId={department.departmentId}
                initialValues={{
                    departmentCode: department.departmentCode,
                    departmentName: department.departmentName,
                    description: department.description,
                    parentDepartmentId: department.parentDepartmentId,
                    managerId: department.managerId
                }}
            />
        </div>
    );
};

export default DepartmentDetail;
