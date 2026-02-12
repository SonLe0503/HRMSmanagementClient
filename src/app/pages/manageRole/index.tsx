import { useEffect, useState } from "react";
import { Table, Button, Tag, Space, Card, Switch, message, Typography, Tooltip } from "antd";
import { PlusOutlined, SafetyCertificateOutlined, CalendarOutlined, TeamOutlined, EyeOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import URL from "../../../constants/url";
import { useAppDispatch, useAppSelector } from "../../../store";
import { fetchAllRoles, changeRoleStatus, selectRoles, selectRoleLoading } from "../../../store/roleSlide";
import Condition from "./Condition";
import AddRoleModal from "./modal/AddRoleModal";

const { Title } = Typography;

const ManageRole = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const roles = useAppSelector(selectRoles);
    const loading = useAppSelector(selectRoleLoading);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [statusFilter, setStatusFilter] = useState<boolean | null>(null);
    const [togglingRoleId, setTogglingRoleId] = useState<number | null>(null);
    const [viewingRoleId, setViewingRoleId] = useState<number | null>(null);

    useEffect(() => {
        dispatch(fetchAllRoles());
    }, [dispatch]);

    const handleAdd = () => {
        setIsAddModalOpen(true);
    };

    const handleToggleStatus = (record: any) => {
        setTogglingRoleId(record.roleId);
        dispatch(changeRoleStatus({ id: record.roleId, isActive: !record.isActive }))
            .unwrap()
            .then(() => {
                message.success("Role status updated");
            })
            .catch((error: any) => {
                const msg = typeof error === 'string' ? error : error?.message || "Failed to update status";
                message.error(msg);
            })
            .finally(() => {
                setTogglingRoleId(null);
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
            title: "User Count",
            dataIndex: "userCount",
            key: "userCount",
            render: (count: number) => (
                <Space>
                    <TeamOutlined />
                    {count}
                </Space>
            ),
        },
        {
            title: "Last Modified",
            dataIndex: "lastModifiedDate",
            key: "lastModifiedDate",
            render: (date: string) => (
                <Space>
                    <CalendarOutlined />
                    {dayjs(date).format("DD/MM/YYYY HH:mm")}
                </Space>
            ),
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
            width: 150,
            render: (_: any, record: any) => (
                <Space size="middle">
                    <Tooltip title="View Users">
                        <Button
                            type="primary"
                            icon={<EyeOutlined />}
                            loading={viewingRoleId === record.roleId}
                            onClick={() => {
                                setViewingRoleId(record.roleId);
                                setTimeout(() => {
                                    navigate(`${URL.ManageUser}?role=${record.roleName}`);
                                    setViewingRoleId(null);
                                }, 500);
                            }}
                        />
                    </Tooltip>
                    <Switch
                        size="small"
                        loading={togglingRoleId === record.roleId}
                        checked={record.isActive}
                        onChange={() => handleToggleStatus(record)}
                    />
                </Space>
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
