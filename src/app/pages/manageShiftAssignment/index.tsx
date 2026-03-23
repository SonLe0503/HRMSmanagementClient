import { useEffect, useState } from "react";
import { Table, Button, Card, Space, Select, DatePicker, Typography, Tag, Avatar } from "antd";
import { UserOutlined, PlusOutlined, CalendarOutlined } from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "../../../store";
import { fetchShiftAssignments, selectAssignments, selectShiftAssignmentLoading, type IShiftAssignment } from "../../../store/shiftAssignmentSlide";
import { selectEmployees, fetchAllEmployees } from "../../../store/employeeSlide";
import AssignShiftModal from "./modal/AssignShiftModal";
import dayjs from "dayjs";

const { Title, Text } = Typography;

const ManageShiftAssignment = () => {
    const dispatch = useAppDispatch();
    const assignments = useAppSelector(selectAssignments);
    const loading = useAppSelector(selectShiftAssignmentLoading);
    const employees = useAppSelector(selectEmployees);
    
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs>(dayjs());
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | undefined>(undefined);

    useEffect(() => {
        dispatch(fetchAllEmployees());
    }, [dispatch]);

    useEffect(() => {
        dispatch(fetchShiftAssignments({ 
            date: selectedDate.format("YYYY-MM-DD"),
            employeeId: selectedEmployeeId
        }));
    }, [dispatch, selectedDate, selectedEmployeeId]);

    const handleDateChange = (date: dayjs.Dayjs | null) => {
        if (date) setSelectedDate(date);
    };

    const handleEmployeeChange = (val: number | undefined) => {
        setSelectedEmployeeId(val);
    };

    const columns = [
        {
            title: "Nhân viên",
            dataIndex: "employeeName",
            key: "employeeName",
            width: 250,
            render: (name: string, record: IShiftAssignment) => (
                <Space>
                    <Avatar icon={<UserOutlined />} className="bg-indigo-100 text-indigo-600" />
                    <div>
                        <div className="font-semibold text-gray-800">{name}</div>
                        <div className="text-xs text-gray-400">ID: {record.employeeId}</div>
                    </div>
                </Space>
            )
        },
        {
            title: "Phân ca cho ngày",
            dataIndex: "assignmentDate",
            key: "assignmentDate",
            width: 150,
            render: (date: string) => dayjs(date).format("DD/MM/YYYY")
        },
        {
            title: "Ca làm việc",
            key: "shiftName",
            width: 150,
            render: (_: any, record: IShiftAssignment) => {
                const name = record.shiftName || (record as any).shift?.shiftName;
                return <Tag color="blue" className="px-3 py-1 font-medium">{name || "N/A"}</Tag>
            }
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            width: 120,
            render: (status: string) => (
                <Tag color={status === "Active" ? "green" : "red"}>{status}</Tag>
            )
        },
        {
            title: "Ngày tạo",
            dataIndex: "createdDate",
            key: "createdDate",
            width: 150,
            render: (date: string) => <Text className="text-gray-500">{dayjs(date).format("DD/MM/YYYY HH:mm")}</Text>
        }
    ];

    return (
        <div className="p-4 bg-gray-50/50 min-h-full">
            <Card
                className="shadow-sm border-0 rounded-xl overflow-hidden"
                title={
                    <div className="flex justify-between items-center py-2">
                        <div>
                            <Title level={4} style={{ margin: 0 }} className="flex items-center gap-2">
                                <CalendarOutlined className="text-indigo-600" />
                                Phân Ca Làm Việc
                            </Title>
                            <Text type="secondary" className="text-sm">Giao ca làm việc cho nhân viên theo từng ngày</Text>
                        </div>
                        <Button 
                            type="primary" 
                            size="large"
                            icon={<PlusOutlined />} 
                            onClick={() => setIsAssignModalOpen(true)}
                            className="bg-indigo-600 hover:bg-indigo-700 rounded-lg h-10 px-6"
                        >
                            Phân Ca Mới
                        </Button>
                    </div>
                }
            >
                <div className="mb-6 flex flex-wrap gap-4 items-center">
                    <div className="flex items-center gap-2">
                        <Text strong>Chọn ngày:</Text>
                        <DatePicker 
                            value={selectedDate} 
                            onChange={handleDateChange} 
                            format="DD/MM/YYYY"
                            size="large"
                            className="w-48"
                        />
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <Text strong>Nhân viên:</Text>
                        <Select
                            allowClear
                            placeholder="Tất cả nhân viên"
                            size="large"
                            className="w-64"
                            onChange={handleEmployeeChange}
                            options={employees.map(e => ({ value: e.employeeId, label: e.fullName }))}
                        />
                    </div>
                </div>

                <Table
                    columns={columns}
                    dataSource={assignments}
                    rowKey="assignmentId"
                    loading={loading}
                    pagination={{ 
                        pageSize: 10,
                        showSizeChanger: true
                    }}
                    scroll={{ x: 1000 }}
                    size="middle"
                    className="assignment-table"
                    locale={{
                        emptyText: (
                            <div className="py-10 text-center">
                                <Text type="secondary">Chưa có bản ghi phân ca nào phù hợp</Text>
                            </div>
                        )
                    }}
                />
            </Card>

            <AssignShiftModal
                open={isAssignModalOpen}
                onCancel={() => setIsAssignModalOpen(false)}
                initialDate={selectedDate.format("YYYY-MM-DD")}
            />

            <style>{`
                .assignment-table .ant-table-thead > tr > th {
                    background-color: #f8fafc;
                    color: #475569;
                    font-weight: 600;
                    border-bottom: 2px solid #f1f5f9;
                }
            `}</style>
        </div>
    );
};

export default ManageShiftAssignment;
