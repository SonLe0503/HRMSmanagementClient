import { useEffect, useState } from "react";
import { Table, Button, Card, Space, Input, Switch, message, Tooltip, Typography, Tag } from "antd";
import { PlusOutlined, EditOutlined, ClockCircleOutlined, SettingOutlined } from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "../../../store";
import { fetchAllShifts, selectShifts, selectShiftLoading, toggleShiftActive, type IShift } from "../../../store/shiftSlide";
import AddShiftModal from "./modal/AddShiftModal";
import EditShiftModal from "./modal/EditShiftModal";

const { Title, Text } = Typography;

const ManageShift = () => {
    const dispatch = useAppDispatch();
    const shifts = useAppSelector(selectShifts);
    const loading = useAppSelector(selectShiftLoading);
    
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedShift, setSelectedShift] = useState<IShift | null>(null);
    const [searchText, setSearchText] = useState("");
    const [togglingId, setTogglingId] = useState<number | null>(null);

    useEffect(() => {
        dispatch(fetchAllShifts());
    }, [dispatch]);

    const handleToggleStatus = (record: IShift) => {
        setTogglingId(record.shiftId);
        dispatch(toggleShiftActive(record.shiftId))
            .unwrap()
            .then(() => {
                message.success("Cập nhật trạng thái ca làm việc thành công.");
                dispatch(fetchAllShifts());
            })
            .catch((error: any) => {
                message.error(error.message || "Không thể cập nhật trạng thái.");
            })
            .finally(() => {
                setTogglingId(null);
            });
    };

    const handleEdit = (record: IShift) => {
        setSelectedShift(record);
        setIsEditModalOpen(true);
    };

    const filteredShifts = shifts.filter((shift) => {
        const query = searchText.toLowerCase();
        return shift.shiftName.toLowerCase().includes(query) || 
               shift.shiftCode.toLowerCase().includes(query);
    });

    const columns = [
        {
            title: "Mã Ca",
            dataIndex: "shiftCode",
            key: "shiftCode",
            width: 100,
            render: (code: string) => <Tag color="blue" className="font-semibold">{code}</Tag>
        },
        {
            title: "Tên Ca",
            dataIndex: "shiftName",
            key: "shiftName",
            width: 180,
            render: (name: string) => <Text className="font-medium text-gray-800">{name}</Text>
        },
        {
            title: "Thời gian",
            key: "time",
            width: 180,
            render: (_: any, record: IShift) => (
                <div className="flex items-center gap-2">
                    <ClockCircleOutlined className="text-gray-400" />
                    <span>{record.startTime.substring(0, 5)} - {record.endTime.substring(0, 5)}</span>
                    {record.isOvernight && <Tag color="orange" className="text-[10px]">Qua đêm</Tag>}
                </div>
            )
        },
        {
            title: "Giờ công",
            dataIndex: "workingHours",
            key: "workingHours",
            width: 100,
            align: 'center' as const,
            render: (val: number) => <Tag color="purple">{val}h</Tag>
        },
        {
            title: "Loại ca",
            dataIndex: "shiftType",
            key: "shiftType",
            width: 120,
            render: (type: string) => {
                let color = "blue";
                if (type === "Flexible") color = "cyan";
                if (type === "Night") color = "purple";
                if (type === "Morning") color = "orange";
                if (type === "Afternoon") color = "gold";
                return <Tag color={color}>{type}</Tag>
            }
        },
        {
            title: "Trạng thái",
            dataIndex: "isActive",
            key: "isActive",
            width: 100,
            render: (isActive: boolean, record: IShift) => (
                 <Switch
                    loading={togglingId === record.shiftId}
                    checked={isActive}
                    onChange={() => handleToggleStatus(record)}
                 />
            ),
        },
        {
            title: "Thao tác",
            key: "action",
            width: 100,
            render: (_: any, record: IShift) => (
                <Space size="middle">
                    <Tooltip title="Chỉnh sửa">
                        <Button 
                            className="bg-sky-50 text-sky-600 border-sky-100 hover:bg-sky-100"
                            icon={<EditOutlined />} 
                            onClick={() => handleEdit(record)} 
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <div className="p-4 bg-gray-50/50 min-h-full">
            <Card
                className="shadow-sm border-0 rounded-xl overflow-hidden"
                title={
                    <div className="flex justify-between items-center py-2">
                        <div>
                            <Title level={4} style={{ margin: 0 }} className="flex items-center gap-2">
                                <SettingOutlined className="text-indigo-600" />
                                Quản Lý Ca Làm Việc
                            </Title>
                            <Text type="secondary" className="text-sm">Thiết lập giờ giấc và quy định chấm công cho nhân viên</Text>
                        </div>
                        <Button 
                            type="primary" 
                            size="large"
                            icon={<PlusOutlined />} 
                            onClick={() => setIsAddModalOpen(true)}
                            className="bg-indigo-600 hover:bg-indigo-700 rounded-lg h-10 px-6"
                        >
                            Thêm Ca Mới
                        </Button>
                    </div>
                }
            >
                <div className="mb-6 flex justify-between gap-4">
                    <Input.Search
                        placeholder="Tìm theo mã hoặc tên ca..."
                        allowClear
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        className="max-w-md custom-search"
                        size="large"
                    />
                </div>

                <Table
                    columns={columns}
                    dataSource={filteredShifts}
                    rowKey="shiftId"
                    loading={loading}
                    pagination={{ 
                        pageSize: 10,
                        showSizeChanger: true,
                        pageSizeOptions: ['10', '20', '50']
                    }}
                    scroll={{ x: 1000 }}
                    size="middle"
                    className="shift-table"
                    locale={{
                        emptyText: searchText ? (
                            <div className="py-10 text-center">
                                <Text type="secondary">Không tìm thấy ca làm việc phù hợp</Text>
                            </div>
                        ) : "Chưa có dữ liệu"
                    }}
                />
            </Card>

            <AddShiftModal
                open={isAddModalOpen}
                onCancel={() => setIsAddModalOpen(false)}
            />

            <EditShiftModal
                open={isEditModalOpen}
                onCancel={() => {
                    setIsEditModalOpen(false);
                    setSelectedShift(null);
                }}
                shift={selectedShift}
            />

            <style>{`
                .shift-table .ant-table-thead > tr > th {
                    background-color: #f8fafc;
                    color: #475569;
                    font-weight: 600;
                    border-bottom: 2px solid #f1f5f9;
                }
                .shift-table .ant-table-row:hover {
                    cursor: default;
                }
                .custom-search .ant-input-wrapper .ant-input {
                    border-radius: 8px 0 0 8px;
                }
                .custom-search .ant-input-group-addon .ant-btn {
                    border-radius: 0 8px 8px 0 !important;
                }
            `}</style>
        </div>
    );
};

export default ManageShift;
