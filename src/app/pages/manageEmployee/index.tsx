import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Table, Button, Tag, Space, Card, Select, message, Typography, Tooltip } from "antd";
import { PlusOutlined, EditOutlined, EyeOutlined } from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "../../../store";
import {
    fetchAllEmployees, updateEmployeeStatus,
    selectEmployees, selectEmployeeLoading,
} from "../../../store/employeeSlide";
import type { IEmployeeList, IEmployeeDetail } from "../../../store/employeeSlide";
import { fetchEmployeeById } from "../../../store/employeeSlide";
import Condition from "./Condition";
import AddEmployeeModal from "./modal/AddEmployeeModal";
import EditEmployeeModal from "./modal/EditEmployeeModal";

const { Title } = Typography;

const STATUS_COLOR: Record<string, string> = {
    Active: "green",
    Inactive: "default",
    Resigned: "red",
    Terminated: "red",
    "On Leave": "orange",
};

const STATUS_OPTIONS = ["Active", "Inactive", "On Leave", "Resigned", "Terminated"].map(v => ({ label: v, value: v }));

const ManageEmployee = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const employees = useAppSelector(selectEmployees);
    const loading = useAppSelector(selectEmployeeLoading);

    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<IEmployeeDetail | null>(null);
    const [searchText, setSearchText] = useState("");
    const [statusFilter, setStatusFilter] = useState<string | null>(null);
    const [genderFilter, setGenderFilter] = useState<string | null>(null);

    useEffect(() => { dispatch(fetchAllEmployees()); }, [dispatch]);

    const handleEdit = async (record: IEmployeeList) => {
        const result = await dispatch(fetchEmployeeById(record.employeeId));
        if (fetchEmployeeById.fulfilled.match(result)) {
            setEditingEmployee(result.payload as IEmployeeDetail);
            setIsEditOpen(true);
        } else {
            message.error("Không thể tải thông tin nhân viên!");
        }
    };

    const handleStatusChange = (record: IEmployeeList, newStatus: string) => {
        dispatch(updateEmployeeStatus({ id: record.employeeId, status: newStatus }))
            .unwrap()
            .then(() => {
                message.success(`Đã cập nhật trạng thái thành "${newStatus}"`);
                dispatch(fetchAllEmployees());
            })
            .catch((err: any) => {
                message.error(typeof err === "string" ? err : "Cập nhật trạng thái thất bại!");
            });
    };

    const filtered = employees.filter(e => {
        const q = searchText.toLowerCase();
        const matchSearch = e.fullName.toLowerCase().includes(q) ||
            e.employeeCode.toLowerCase().includes(q) ||
            e.email.toLowerCase().includes(q);
        const matchStatus = statusFilter ? e.employmentStatus === statusFilter : true;
        const matchGender = genderFilter ? e.gender === genderFilter : true;
        return matchSearch && matchStatus && matchGender;
    });

    const columns = [
        { title: "Mã NV", dataIndex: "employeeCode", key: "employeeCode", width: 100 },
        {
            title: "Họ và tên", dataIndex: "fullName", key: "fullName", width: 170,
            render: (name: string, record: IEmployeeList) => (
                <a onClick={() => navigate(`/hr/manage-employee/${record.employeeId}`)} style={{ fontWeight: 500 }}>
                    {name}
                </a>
            ),
        },
        { title: "Email", dataIndex: "email", key: "email", width: 200 },
        { title: "Điện thoại", dataIndex: "phone", key: "phone", width: 130, render: (v: any) => v ?? "—" },
        { title: "Giới tính", dataIndex: "gender", key: "gender", width: 100, render: (v: any) => v ?? "—" },
        { title: "Phòng ban", dataIndex: "departmentName", key: "departmentName", width: 150 },
        { title: "Chức vụ", dataIndex: "positionName", key: "positionName", width: 150 },
        {
            title: "Trạng thái", dataIndex: "employmentStatus", key: "employmentStatus", width: 150,
            render: (status: string, record: IEmployeeList) => (
                <Select
                    size="small"
                    value={status}
                    options={STATUS_OPTIONS}
                    style={{ width: 140 }}
                    onChange={v => handleStatusChange(record, v)}
                    onClick={e => e.stopPropagation()}
                    labelRender={({ value }) => (
                        <Tag color={STATUS_COLOR[value as string] ?? "default"} style={{ margin: 0 }}>
                            {value as string}
                        </Tag>
                    )}
                />
            ),
        },
        {
            title: "Thao tác", key: "action", width: 110,
            render: (_: any, record: IEmployeeList) => (
                <Space>
                    <Tooltip title="Xem chi tiết">
                        <Button icon={<EyeOutlined />}
                            onClick={() => navigate(`/hr/manage-employee/${record.employeeId}`)} />
                    </Tooltip>
                    <Tooltip title="Chỉnh sửa">
                        <Button type="primary" icon={<EditOutlined />}
                            onClick={() => handleEdit(record)} />
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
                        <Title level={4} style={{ margin: 0 }}>Quản lý nhân viên</Title>
                        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsAddOpen(true)}>
                            Thêm nhân viên
                        </Button>
                    </div>
                }
            >
                <Condition
                    searchText={searchText} setSearchText={setSearchText}
                    statusFilter={statusFilter} setStatusFilter={setStatusFilter}
                    genderFilter={genderFilter} setGenderFilter={setGenderFilter}
                />
                <Table
                    columns={columns} dataSource={filtered} rowKey={(record) => record.employeeId || (record as any).id}
                    loading={loading} pagination={{ pageSize: 10 }}
                    scroll={{ x: 1200 }} size="middle"
                    locale={{
                        emptyText: searchText ? (
                            <div style={{ padding: "20px 0" }}>
                                <Typography.Text type="secondary">
                                    Không tìm thấy nhân viên nào khớp với từ khóa "{searchText}" (MSG-01)
                                </Typography.Text>
                            </div>
                        ) : "Không có dữ liệu nhân viên"
                    }}
                />
            </Card>

            <AddEmployeeModal open={isAddOpen} onCancel={() => setIsAddOpen(false)}
                onSuccess={() => { setIsAddOpen(false); dispatch(fetchAllEmployees()); }} />

            <EditEmployeeModal open={isEditOpen} onCancel={() => setIsEditOpen(false)}
                onSuccess={() => { setIsEditOpen(false); dispatch(fetchAllEmployees()); }}
                editingEmployee={editingEmployee} />
        </div>
    );
};

export default ManageEmployee;
