import { useEffect, useState } from "react";
import { Table, Button, Tag, Space, Card, Typography } from "antd";
import {
    FileProtectOutlined,
    EyeOutlined,
    DollarOutlined,
    CalendarOutlined,
    UsergroupAddOutlined,
    PlusOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useAppDispatch, useAppSelector } from "../../../store";
import {
    fetchAllPayrollPolicies,
    selectPayrollPolicies,
    selectPayrollPolicyLoading
} from "../../../store/payrollPolicySlice";
import Condition from "./Condition";
import ViewPayrollPolicyModal from "./modal/ViewPayrollPolicyModal";
import AddPayrollPolicyModal from "./modal/AddPayrollPolicyModal";

const { Title } = Typography;

const ManagePayrollPolicy = () => {
    const dispatch = useAppDispatch();
    const policies = useAppSelector(selectPayrollPolicies);
    const loading = useAppSelector(selectPayrollPolicyLoading);

    const [searchText, setSearchText] = useState("");
    const [typeFilter, setTypeFilter] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<boolean | null>(null);
    const [groupFilter, setGroupFilter] = useState<string | null>(null);

    const [selectedPolicy, setSelectedPolicy] = useState<any>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    useEffect(() => {
        dispatch(fetchAllPayrollPolicies());
    }, [dispatch]);

    const handleViewDetail = (record: any) => {
        setSelectedPolicy(record);
        setIsDetailOpen(true);
    };

    const handleAddSuccess = () => {
        setIsAddModalOpen(false);
        dispatch(fetchAllPayrollPolicies());
    };

    const filteredPolicies = policies.filter((p) => {
        const matchesSearch = p.policyName.toLowerCase().includes(searchText.toLowerCase());
        const matchesType = typeFilter ? p.policyType === typeFilter : true;
        const matchesStatus = statusFilter !== null ? p.isActive === statusFilter : true;
        const matchesGroup = groupFilter ? p.applicableEmployeeGroup === groupFilter : true;
        return matchesSearch && matchesType && matchesStatus && matchesGroup;
    });

    const columns = [
        {
            title: "Policy Name",
            dataIndex: "policyName",
            key: "policyName",
            render: (text: string) => (
                <Space>
                    <FileProtectOutlined style={{ color: "#1890ff" }} />
                    <span style={{ fontWeight: 600 }}>{text}</span>
                </Space>
            ),
            sorter: (a: any, b: any) => a.policyName.localeCompare(b.policyName),
        },
        {
            title: "Type",
            dataIndex: "policyType",
            key: "policyType",
            render: (type: string) => <Tag color="geekblue">{type.toUpperCase()}</Tag>,
        },
        {
            title: "Amount",
            dataIndex: "baseAmount",
            key: "baseAmount",
            render: (amount: number) => (
                <Space>
                    <DollarOutlined style={{ color: "#52c41a" }} />
                    {amount?.toLocaleString()}
                </Space>
            ),
            sorter: (a: any, b: any) => a.baseAmount - b.baseAmount,
        },
        {
            title: "Employee Group",
            dataIndex: "applicableEmployeeGroup",
            key: "applicableEmployeeGroup",
            render: (group: string) => (
                <Space>
                    <UsergroupAddOutlined />
                    {group}
                </Space>
            ),
        },
        {
            title: "Effective From",
            dataIndex: "effectiveStartDate",
            key: "effectiveStartDate",
            render: (date: string) => (
                <Space>
                    <CalendarOutlined />
                    {dayjs(date).format("DD/MM/YYYY")}
                </Space>
            ),
            sorter: (a: any, b: any) => dayjs(a.effectiveStartDate).unix() - dayjs(b.effectiveStartDate).unix(),
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
            width: 100,
            render: (_: any, record: any) => (
                <Button
                    type="primary"
                    icon={<EyeOutlined />}
                    onClick={() => handleViewDetail(record)}
                />
            ),
        },
    ];

    return (
        <div className="p-4">
            <Card
                title={
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Title level={4} style={{ margin: 0 }}>Payroll Policy Management</Title>
                        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsAddModalOpen(true)}>
                            Create Policy
                        </Button>
                    </div>
                }
            >
                <Condition
                    searchText={searchText}
                    setSearchText={setSearchText}
                    typeFilter={typeFilter}
                    setTypeFilter={setTypeFilter}
                    statusFilter={statusFilter}
                    setStatusFilter={setStatusFilter}
                    groupFilter={groupFilter}
                    setGroupFilter={setGroupFilter}
                />

                <Table
                    columns={columns}
                    dataSource={filteredPolicies}
                    rowKey="policyId"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                    scroll={{ x: 1000 }}
                    size="middle"
                />
            </Card>

            <ViewPayrollPolicyModal
                open={isDetailOpen}
                onCancel={() => {
                    setIsDetailOpen(false);
                    setSelectedPolicy(null);
                }}
                policy={selectedPolicy}
            />

            <AddPayrollPolicyModal
                open={isAddModalOpen}
                onCancel={() => setIsAddModalOpen(false)}
                onSuccess={handleAddSuccess}
            />
        </div>
    );
};

export default ManagePayrollPolicy;
