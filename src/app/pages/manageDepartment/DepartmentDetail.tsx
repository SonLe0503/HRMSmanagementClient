import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Descriptions, Button, Tag, Space, Typography, Spin, message, Modal, Table, Tooltip } from "antd";
import { ArrowLeftOutlined, EditOutlined, StopOutlined, UserOutlined, EyeOutlined } from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "../../../store";
import { fetchDepartmentById, selectSelectedDepartment, selectDepartmentLoading, deactivateDepartment } from "../../../store/departmentSlide";
import EditDepartmentModal from "./modal/EditDepartmentModal";
import type { ColumnsType } from "antd/es/table";
import type { IDepartmentEmployee } from "../../../store/departmentSlide";

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

    const initialValues = useMemo(() => {
        if (!department) return {};
        return {
            departmentCode: department.departmentCode,
            departmentName: department.departmentName,
            description: department.description,
            managerId: department.managerId
        };
    }, [department]);

    const employeeColumns: ColumnsType<IDepartmentEmployee> = [
        {
            title: 'Employee Code',
            dataIndex: 'employeeCode',
            key: 'employeeCode',
            width: 150,
        },
        {
            title: 'Full Name',
            dataIndex: 'fullName',
            key: 'fullName',
            render: (text, record) => (
                <a onClick={() => navigate(`/hr/manage-employee/${record.employeeId}`)} style={{ fontWeight: 500 }}>
                    {text}
                </a>
            ),
        },
        {
            title: 'Position',
            dataIndex: 'positionName',
            key: 'positionName',
            render: (text) => text || "—",
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Phone',
            dataIndex: 'phone',
            key: 'phone',
            render: (text) => text || "—",
        },
        {
            title: 'Gender',
            dataIndex: 'gender',
            key: 'gender',
            render: (text) => text || "—",
        },
        {
            title: 'Status',
            dataIndex: 'employmentStatus',
            key: 'employmentStatus',
            render: (status) => (
                <Tag color={status === 'Active' ? 'green' : 'orange'}>
                    {status.toUpperCase()}
                </Tag>
            ),
        },
        {
            title: 'Action',
            key: 'action',
            width: 100,
            render: (_, record) => (
                <Tooltip title="View Detail">
                    <Button 
                        icon={<EyeOutlined />} 
                        onClick={() => navigate(`/hr/manage-employee/${record.employeeId}`)} 
                    />
                </Tooltip>
            ),
        },
    ];

    if (loading && !department) {
        return <div style={{ textAlign: "center", padding: "50px" }}><Spin size="large" /></div>;
    }

    if (!department) {
        return <div style={{ padding: "20px" }}><Title level={4}>Department not found</Title></div>;
    }

    return (
        <div className="p-4">
            <Card
                className="mb-4"
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
                    <Descriptions.Item label="Manager">{department.managerName || "—"}</Descriptions.Item>
                    <Descriptions.Item label="Employee Count">{department.employeeCount}</Descriptions.Item>
                    <Descriptions.Item label="Description" span={1}>{department.description || "—"}</Descriptions.Item>
                </Descriptions>
            </Card>
            <div style={{ height: "20px" }}></div>
            <Card 
                title={
                    <Space>
                        <UserOutlined />
                        <Title level={5} style={{ margin: 0 }}>Employees in Department</Title>
                    </Space>
                }
            >
                <Table 
                    columns={employeeColumns} 
                    dataSource={department.employees} 
                    rowKey="employeeId"
                    pagination={{ pageSize: 10 }}
                />
            </Card>

            <EditDepartmentModal
                open={isEditModalOpen}
                onCancel={() => setIsEditModalOpen(false)}
                departmentId={department.departmentId}
                initialValues={initialValues}
            />
        </div>
    );
};

export default DepartmentDetail;
