import { useEffect, useState } from "react";
import { Table, Button, Tag, Space, Card, Switch, message, Typography } from "antd";
import { PlusOutlined, EditOutlined, UserOutlined } from "@ant-design/icons";
import { useSearchParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../store";
import { fetchAllUsers, activateUser, deactivateUser, selectUsers, selectUserLoading } from "../../../store/userSlide";
import { fetchAllRoles } from "../../../store/roleSlide";
import Condition from "./Condition";
import AddAccountModal from "./modal/AddAccountModal";
import EditAccountModal from "./modal/EditAccountModal";

const { Title } = Typography;

const ManageAccount = () => {
    const dispatch = useAppDispatch();
    const [searchParams] = useSearchParams();
    const users = useAppSelector(selectUsers);
    const loading = useAppSelector(selectUserLoading);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<any>(null);

    const [searchText, setSearchText] = useState("");
    const [roleFilter, setRoleFilter] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<boolean | null>(null);
    const [togglingUserId, setTogglingUserId] = useState<number | null>(null);

    useEffect(() => {
        dispatch(fetchAllUsers());
        dispatch(fetchAllRoles());

        const roleParam = searchParams.get("role");
        if (roleParam) {
            setRoleFilter(roleParam);
        }
    }, [dispatch, searchParams]);

    const handleAdd = () => {
        setIsAddModalOpen(true);
    };

    const handleEdit = (record: any) => {
        setEditingUser(record);
        setIsEditModalOpen(true);
    };

    const handleToggleStatus = (record: any) => {
        const action = record.isActive ? deactivateUser(record.userId) : activateUser(record.userId);
        const successMsg = record.isActive ? "Đã vô hiệu hóa tài khoản" : "Đã kích hoạt tài khoản";

        setTogglingUserId(record.userId);
        dispatch(action)
            .unwrap()
            .then(() => {
                message.success(successMsg);
            })
            .catch((error: any) => {
                const msg = typeof error === 'string' ? error : error?.message || "Đã xảy ra lỗi";
                message.error(msg);
            })
            .finally(() => {
                setTogglingUserId(null);
            });
    };

    const handleSuccess = () => {
        setIsAddModalOpen(false);
        setIsEditModalOpen(false);
        dispatch(fetchAllUsers());
    };

    const filteredUsers = users.filter((user) => {
        const matchesSearch = user.username.toLowerCase().includes(searchText.toLowerCase()) ||
            user.email.toLowerCase().includes(searchText.toLowerCase());
        const matchesRole = roleFilter ? user.roles.includes(roleFilter) : true;
        const matchesStatus = statusFilter !== null ? user.isActive === statusFilter : true;

        return matchesSearch && matchesRole && matchesStatus;
    });

    const columns = [
        {
            title: "Mã",
            dataIndex: "userId",
            key: "userId",
            width: 70,
        },
        {
            title: "Tên đăng nhập",
            dataIndex: "username",
            key: "username",
            render: (text: string) => (
                <Space>
                    <UserOutlined />
                    {text}
                </Space>
            ),
        },
        {
            title: "Email",
            dataIndex: "email",
            key: "email",
        },
        {
            title: "Vai trò",
            dataIndex: "roles",
            key: "roles",
            render: (roles: string[]) => (
                <>
                    {roles.map((role) => (
                        <Tag color="blue" key={role}>
                            {role.toUpperCase()}
                        </Tag>
                    ))}
                </>
            ),
        },
        {
            title: "Trạng thái",
            dataIndex: "isActive",
            key: "isActive",
            render: (isActive: boolean) => (
                <Tag color={isActive ? "green" : "red"}>
                    {isActive ? "HOẠT ĐỘNG" : "NGỪNG"}
                </Tag>
            ),
        },
        {
            title: "Thao tác",
            key: "action",
            render: (_: any, record: any) => (
                <Space size="middle">
                    <Button
                        type="primary"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                    />
                    <Switch
                        size="small"
                        loading={togglingUserId === record.userId}
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
                        <Title level={4} style={{ margin: 0 }}>Quản lý Tài khoản</Title>
                        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                            Thêm tài khoản
                        </Button>
                    </div>
                }
            >
                <Condition
                    searchText={searchText}
                    setSearchText={setSearchText}
                    roleFilter={roleFilter}
                    setRoleFilter={setRoleFilter}
                    statusFilter={statusFilter}
                    setStatusFilter={setStatusFilter}
                />

                <Table
                    columns={columns}
                    dataSource={filteredUsers}
                    rowKey="userId"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                    scroll={{ x: 1000 }}
                    size="middle"
                />
            </Card>

            <AddAccountModal
                open={isAddModalOpen}
                onCancel={() => setIsAddModalOpen(false)}
                onSuccess={handleSuccess}
            />

            <EditAccountModal
                open={isEditModalOpen}
                onCancel={() => setIsEditModalOpen(false)}
                onSuccess={handleSuccess}
                editingUser={editingUser}
            />
        </div>
    );
};

export default ManageAccount;