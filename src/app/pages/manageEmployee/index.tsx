import { useEffect, useState } from "react";
import { Table, Button, Tag, Space, Card, Select, message, Typography, Tooltip } from "antd";
import { PlusOutlined, EditOutlined, EyeOutlined } from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "../../../store";
import {
    fetchAllEmployees,
    updateEmployeeStatus,
    selectEmployees,
    selectEmployeeLoading,
} from "../../../store/employeeSlide";
import type { IEmployeeDetail, IEmployeeList } from "../../../store/employeeSlide";
import Condition from "./Condition";
import AddEmployeeModal from "./modal/AddEmployeeModal";
import EditEmployeeModal from "./modal/EditEmployeeModal";
import ViewEmployeeModal from "./modal/ViewEmployeeModal";
import { fetchEmployeeById } from "../../../store/employeeSlide";

const { Title } = Typography;

const STATUS_COLOR: Record<string, string> = {
    Active: "green",
    Inactive: "default",
    Resigned: "red",
    Terminated: "red",
    "On Leave": "orange",
};

const EMPLOYMENT_STATUS_OPTIONS = ["Active", "Inactive", "On Leave", "Resigned", "Terminated"].map((v) => ({
    label: v,
    value: v,
}));

const ManageEmployee = () => {
    const dispatch = useAppDispatch();
    const employees = useAppSelector(selectEmployees);
    const loading = useAppSelector(selectEmployeeLoading);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<IEmployeeDetail | null>(null);
    const [viewingEmployeeId, setViewingEmployeeId] = useState<number | null>(null);

    const [searchText, setSearchText] = useState("");
    const [statusFilter, setStatusFilter] = useState<string | null>(null);
    const [genderFilter, setGenderFilter] = useState<string | null>(null);

    useEffect(() => {
        dispatch(fetchAllEmployees());
    }, [dispatch]);

    const handleEdit = async (record: IEmployeeList) => {
        const result = await dispatch(fetchEmployeeById(record.employeeId));
        if (fetchEmployeeById.fulfilled.match(result)) {
            setEditingEmployee(result.payload as IEmployeeDetail);
            setIsEditModalOpen(true);
        } else {
            message.error("Không thể tải thông tin nhân viên!");
        }
    };

    const handleView = (id: number) => {
        setViewingEmployeeId(id);
        setIsViewModalOpen(true);
    };

    const handleStatusChange = (record: IEmployeeList, newStatus: string) => {
        dispatch(updateEmployeeStatus({ id: record.employeeId, status: newStatus }))
            .unwrap()
            .then(() => {
                message.success(`Cập nhật trạng thái thành "${newStatus}"`);
                dispatch(fetchAllEmployees());
            })
            .catch((err: any) => {
                const msg = typeof err === "string" ? err : err?.message || "Cập nhật trạng thái thất bại!";
                message.error(msg);
            });
    };

    const handleSuccess = () => {
        setIsAddModalOpen(false);
        setIsEditModalOpen(false);
        dispatch(fetchAllEmployees());
    };

    const filteredEmployees = employees.filter((e) => {
        const matchesSearch =
            e.fullName.toLowerCase().includes(searchText.toLowerCase()) ||
            e.employeeCode.toLowerCase().includes(searchText.toLowerCase()) ||
            e.email.toLowerCase().includes(searchText.toLowerCase());
        const matchesStatus = statusFilter ? e.employmentStatus === statusFilter : true;
        const matchesGender = genderFilter ? e.gender === genderFilter : true;
        return matchesSearch && matchesStatus && matchesGender;
    });

    const columns = [
        {
            title: "Mã NV",
            dataIndex: "employeeCode",
            key: "employeeCode",
            width: 100,
        },
        {
            title: "Họ và tên",
            dataIndex: "fullName",
            key: "fullName",
            width: 160,
        },
        {
            title: "Email",
            dataIndex: "email",
            key: "email",
            width: 200,
        },
        {
            title: "Số điện thoại",
            dataIndex: "phone",
            key: "phone",
            width: 130,
            render: (v: string | null) => v ?? "—",
        },
        {
            title: "Giới tính",
            dataIndex: "gender",
            key: "gender",
            width: 100,
            render: (v: string | null) => v ?? "—",
        },
        {
            title: "Phòng ban",
            dataIndex: "departmentName",
            key: "departmentName",
            width: 150,
        },
        {
            title: "Chức vụ",
            dataIndex: "positionName",
            key: "positionName",
            width: 150,
        },
        {
            title: "Trạng thái",
            dataIndex: "employmentStatus",
            key: "employmentStatus",
            width: 140,
            render: (status: string, record: IEmployeeList) => (
                <Select
                    size="small"
                    value={status}
                    options={EMPLOYMENT_STATUS_OPTIONS}
                    style={{ width: 130 }}
                    onChange={(newStatus) => handleStatusChange(record, newStatus)}
                    onClick={(e) => e.stopPropagation()}
                    // Render the current tag but dropdown allows change
                    labelRender={({ value }) => (
                        <Tag color={STATUS_COLOR[value as string] ?? "default"} style={{ margin: 0 }}>
                            {value as string}
                        </Tag>
                    )}
                />
            ),
        },
        {
            title: "Thao tác",
            key: "action",
            width: 100,
            render: (_: any, record: IEmployeeList) => (
                <Space>
                    <Tooltip title="Xem chi tiết">
                        <Button
                            icon={<EyeOutlined />}
                            size="small"
                            onClick={() => handleView(record.employeeId)}
                        />
                    </Tooltip>
                    <Tooltip title="Chỉnh sửa">
                        <Button
                            type="primary"
                            icon={<EditOutlined />}
                            size="small"
                            onClick={() => handleEdit(record)}
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
                        <Title level={4} style={{ margin: 0 }}>Quản lý nhân viên</Title>
                        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsAddModalOpen(true)}>
                            Thêm nhân viên
                        </Button>
                    </div>
                }
            >
                <Condition
                    searchText={searchText}
                    setSearchText={setSearchText}
                    statusFilter={statusFilter}
                    setStatusFilter={setStatusFilter}
                    genderFilter={genderFilter}
                    setGenderFilter={setGenderFilter}
                />

                <Table
                    columns={columns}
                    dataSource={filteredEmployees}
                    rowKey="employeeId"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                    scroll={{ x: 1200 }}
                    size="middle"
                />
            </Card>

            <AddEmployeeModal
                open={isAddModalOpen}
                onCancel={() => setIsAddModalOpen(false)}
                onSuccess={handleSuccess}
            />

            <EditEmployeeModal
                open={isEditModalOpen}
                onCancel={() => setIsEditModalOpen(false)}
                onSuccess={handleSuccess}
                editingEmployee={editingEmployee}
            />

            <ViewEmployeeModal
                open={isViewModalOpen}
                onCancel={() => setIsViewModalOpen(false)}
                employeeId={viewingEmployeeId}
            />
        </div>
    );
};

export default ManageEmployee;
