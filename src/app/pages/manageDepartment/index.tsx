import { useEffect, useState } from "react";
import { Table, Button, Card, Space, Input, Switch, message, Tooltip, Typography } from "antd";
import { PlusOutlined, EyeOutlined } from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "../../../store";
import { fetchAllDepartments, selectDepartments, selectDepartmentLoading, deactivateDepartment, activateDepartment } from "../../../store/departmentSlide";
import AddDepartmentModal from "./modal/AddDepartmentModal";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

const ManageDepartment = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const departments = useAppSelector(selectDepartments);
    const loading = useAppSelector(selectDepartmentLoading);
    
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [togglingId, setTogglingId] = useState<number | null>(null);

    useEffect(() => {
        dispatch(fetchAllDepartments());
    }, [dispatch]);

    const handleToggleStatus = (record: any) => {
        const action = record.isActive ? deactivateDepartment(record.departmentId) : activateDepartment(record.departmentId);
        const successMsg = record.isActive ? "Department deactivated successfully (MSG-95)" : "Department activated successfully";

        setTogglingId(record.departmentId);
        dispatch(action)
            .unwrap()
            .then(() => {
                message.success(successMsg);
                dispatch(fetchAllDepartments());
            })
            .catch((error: any) => {
                const msg = typeof error === 'string' ? error : error?.message || (record.isActive ? "Cannot deactivate department (MSG-96)" : "Cannot activate department");
                message.error(msg);
            })
            .finally(() => {
                setTogglingId(null);
            });
    };

    const filteredDepartments = departments.filter((dept) => {
        const query = searchText.toLowerCase();
        return dept.departmentName.toLowerCase().includes(query) || 
               dept.departmentCode.toLowerCase().includes(query);
    });

    const columns = [
        {
            title: "Code",
            dataIndex: "departmentCode",
            key: "departmentCode",
            width: 100,
        },
        {
            title: "Name",
            dataIndex: "departmentName",
            key: "departmentName",
            width: 200,
            render: (name: string, record: any) => (
                <a onClick={() => navigate(`/hr/manage-department/${record.departmentId}`)} style={{ fontWeight: 500 }}>
                    {name}
                </a>
            ),
        },
        {
            title: "Parent Department",
            dataIndex: "parentDepartmentName",
            key: "parentDepartmentName",
            width: 200,
            render: (val: string) => val || "—"
        },
        {
            title: "Manager",
            dataIndex: "managerName",
            key: "managerName",
            width: 200,
            render: (val: string) => val || "—"
        },
        {
            title: "Employees",
            dataIndex: "employeeCount",
            key: "employeeCount",
            width: 100,
        },
        {
            title: "Status",
            dataIndex: "isActive",
            key: "isActive",
            width: 100,
            render: (isActive: boolean, record: any) => (
                 <Switch
                    size="small"
                    loading={togglingId === record.departmentId}
                    checked={isActive}
                    onChange={() => handleToggleStatus(record)}
                 />
            ),
        },
        {
            title: "Action",
            key: "action",
            width: 80,
            render: (_: any, record: any) => (
                <Space size="middle">
                    <Tooltip title="View Detail">
                        <Button 
                            icon={<EyeOutlined />} 
                            onClick={() => navigate(`/hr/manage-department/${record.departmentId}`)} 
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <div className="p-2">
            <Card
                title={
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Title level={4} style={{ margin: 0 }}>Department Management</Title>
                        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsAddModalOpen(true)}>
                            Add New Department
                        </Button>
                    </div>
                }
            >
                <div style={{ marginBottom: 16 }}>
                    <Input.Search
                        placeholder="Search by Department Code or Name..."
                        allowClear
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        style={{ width: 300 }}
                    />
                </div>

                <Table
                    columns={columns}
                    dataSource={filteredDepartments}
                    rowKey="departmentId"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                    scroll={{ x: 1000 }}
                    size="middle"
                    locale={{
                        emptyText: searchText ? (
                            <div style={{ padding: "20px 0" }}>
                                <Text type="secondary">
                                    No department found matching criteria (MSG-92)
                                </Text>
                            </div>
                        ) : "No data available"
                    }}
                />
            </Card>

            <AddDepartmentModal
                open={isAddModalOpen}
                onCancel={() => setIsAddModalOpen(false)}
            />
        </div>
    );
};

export default ManageDepartment;
