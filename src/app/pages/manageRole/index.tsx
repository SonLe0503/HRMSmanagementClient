import { useEffect, useState } from "react";
import { Table, Button, Tag, Space, Card, Switch, message, Typography } from "antd";
import { PlusOutlined, SafetyCertificateOutlined } from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "../../../store";
import { fetchAllRoles, changeRoleStatus, selectRoles, selectRoleLoading } from "../../../store/roleSlide";
import Condition from "./Condition";
import AddRoleModal from "./modal/AddRoleModal";

const { Title } = Typography;

const ManageRole = () => {
    const dispatch = useAppDispatch();
    const roles = useAppSelector(selectRoles);
    const loading = useAppSelector(selectRoleLoading);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [statusFilter, setStatusFilter] = useState<boolean | null>(null);

    useEffect(() => {
        dispatch(fetchAllRoles());
    }, [dispatch]);

    const handleAdd = () => {
        setIsAddModalOpen(true);
    };

    const handleToggleStatus = (record: any) => {
        dispatch(changeRoleStatus({ id: record.roleId, isActive: !record.isActive })).then((res: any) => {
            if (!res.error) {
                message.success("Role status updated");
            } else {
                message.error(res.payload || "Failed to update status");
            }
        });
    };

    const handleSuccess = () => {
        setIsAddModalOpen(false);
        dispatch(fetchAllRoles());
    };

    const filteredRoles = roles.filter((role) => {
        const matchesSearch = role.roleName.toLowerCase().includes(searchText.toLowerCase()) ||
            (role.description && role.description.toLowerCase().includes(searchText.toLowerCase()));
        const matchesStatus = statusFilter !== null ? role.isActive === statusFilter : true;

        return matchesSearch && matchesStatus;
    });

    const columns = [
        {
            title: "ID",
            dataIndex: "roleId",
            key: "roleId",
            width: 70,
        },
        {
            title: "Role Name",
            dataIndex: "roleName",
            key: "roleName",
            render: (text: string) => (
                <Space>
                    <SafetyCertificateOutlined />
                    {text}
                </Space>
            ),
        },
        {
            title: "Description",
            dataIndex: "description",
            key: "description",
        },
        {
            title: "Status",
            dataIndex: "isActive",
            key: "isActive",
            render: (isActive: boolean) => (
                <Tag color={isActive ? "green" : "red"}>
                    {isActive ? "ACTIVE" : "INACTIVE"}
                </Tag>
            ),
        },
        {
            title: "Action",
            key: "action",
            render: (_: any, record: any) => (
                <Switch
                    checked={record.isActive}
                    onChange={() => handleToggleStatus(record)}
                />
            ),
        },
    ];

    return (
        <div className="p-2">
            <Card
                title={
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Title level={4} style={{ margin: 0 }}>Manage Roles</Title>
                        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                            Add Role
                        </Button>
                    </div>
                }
            >
                <Condition
                    searchText={searchText}
                    setSearchText={setSearchText}
                    statusFilter={statusFilter}
                    setStatusFilter={setStatusFilter}
                />

                <Table
                    columns={columns}
                    dataSource={filteredRoles}
                    rowKey="roleId"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                />
            </Card>

            <AddRoleModal
                open={isAddModalOpen}
                onCancel={() => setIsAddModalOpen(false)}
                onSuccess={handleSuccess}
            />
        </div>
    );
};

export default ManageRole;
