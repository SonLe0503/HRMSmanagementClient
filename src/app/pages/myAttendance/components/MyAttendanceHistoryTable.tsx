import { useState, useEffect } from "react";
import { Table, DatePicker, Button, Space, Card, Tag, Tooltip, Modal, Input, message, Form } from "antd";
import { SearchOutlined, ReloadOutlined, ExclamationCircleOutlined, EditOutlined } from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { fetchMyHistory, selectMyHistory, selectAttendanceLoading, addLocationReason } from "../../../../store/attendanceSlide";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;

const MyAttendanceHistoryTable = () => {
    const dispatch = useAppDispatch();
    const records = useAppSelector(selectMyHistory);
    const loading = useAppSelector(selectAttendanceLoading);
    const [reasonModalOpen, setReasonModalOpen] = useState(false);
    const [selectedAttendanceId, setSelectedAttendanceId] = useState<number | null>(null);
    const [form] = Form.useForm();

    const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null]>([
        dayjs().startOf('month'),
        dayjs()
    ]);

    useEffect(() => {
        handleSearch();
    }, [dispatch]);

    const handleSearch = () => {
        const fromDate = dateRange[0] ? dateRange[0].format("YYYY-MM-DD") : undefined;
        const toDate = dateRange[1] ? dateRange[1].format("YYYY-MM-DD") : undefined;
        dispatch(fetchMyHistory({ fromDate, toDate }));
    };

    const handleReset = () => {
        setDateRange([dayjs().startOf('month'), dayjs()]);
        dispatch(fetchMyHistory({
            fromDate: dayjs().startOf('month').format("YYYY-MM-DD"),
            toDate: dayjs().format("YYYY-MM-DD")
        }));
    };

    const handleOpenReason = (attendanceId: number) => {
        setSelectedAttendanceId(attendanceId);
        form.resetFields();
        setReasonModalOpen(true);
    };

    const handleSubmitReason = async () => {
        try {
            const values = await form.validateFields();
            if (selectedAttendanceId) {
                await dispatch(addLocationReason({ 
                    attendanceId: selectedAttendanceId, 
                    reason: values.reason 
                })).unwrap();
                message.success("Cập nhật lý do thành công");
                setReasonModalOpen(false);
                handleSearch();
            }
        } catch (error: any) {
            if (error?.errorFields) return; // validation error
            message.error(error?.message || "Cập nhật lý do thất bại");
        }
    };

    const columns = [
        {
            title: "Ngày",
            dataIndex: "attendanceDate",
            key: "attendanceDate",
            render: (text: string) => dayjs(text).format("DD/MM/YYYY")
        },
        {
            title: "Check In",
            dataIndex: "checkInTime",
            key: "checkInTime",
            render: (val: string) => val ? dayjs(val).format("HH:mm:ss") : "—"
        },
        {
            title: "Check Out",
            dataIndex: "checkOutTime",
            key: "checkOutTime",
            render: (val: string) => val ? dayjs(val).format("HH:mm:ss") : "—"
        },
        {
            title: "Giờ làm việc (h)",
            dataIndex: "workingHours",
            key: "workingHours",
            align: 'center' as const,
            render: (val: number) => val ?? "0"
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            render: (status: string, record: any) => {
                let color = "default";
                if (status === "Present") color = "success";
                if (status === "Late") color = "warning";
                if (status === "Absent") color = "error";
                if (status === "Incomplete") color = "blue";
                if (status === "PaidLeave") color = "cyan";
                if (status === "UnpaidLeave") color = "purple";
                
                const isInvalidLocation = record.location?.includes("[INVALID]");

                return (
                    <Space>
                        <Tag color={color}>{status}</Tag>
                        {isInvalidLocation && (
                            <Tooltip title="Vị trí check-in/out không hợp lệ">
                                <ExclamationCircleOutlined className="text-red-500" />
                            </Tooltip>
                        )}
                    </Space>
                );
            }
        },
        {
            title: "Ghi chú",
            dataIndex: "remarks",
            key: "remarks",
            render: (val: string) => val || "—"
        },
        {
            title: "Hành động",
            key: "action",
            align: 'center' as const,
            render: (_: any, record: any) => {
                const isInvalidLocation = record.location?.includes("[INVALID]");
                const hasReason = record.remarks?.includes("Lý do sai vị trí");
                if (isInvalidLocation) {
                    return (
                        <Button 
                            type={hasReason ? "default" : "dashed"} 
                            size="small" 
                            icon={<EditOutlined />}
                            onClick={() => handleOpenReason(record.attendanceId)}
                            danger={!hasReason}
                        >
                            {hasReason ? "Cập nhật lại" : "Giải trình"}
                        </Button>
                    );
                }
                return null;
            }
        }
    ];

    return (
        <Card title="Lịch sử chấm công của tôi">
            <Space className="mb-4">
                <RangePicker 
                    value={dateRange}
                    onChange={(val) => setDateRange(val as any)}
                    format="DD/MM/YYYY"
                    allowClear={false}
                />
                <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch} loading={loading}>
                    Tìm kiếm
                </Button>
                <Button icon={<ReloadOutlined />} onClick={handleReset}>
                    Làm mới
                </Button>
            </Space>

            <Table 
                columns={columns} 
                dataSource={records} 
                rowKey={(record) => record.attendanceId > 0 ? record.attendanceId : `virtual-${record.attendanceDate}`} 
                loading={loading}
                pagination={{ pageSize: 15 }}
                bordered
            />

            <Modal
                title="Giải trình vị trí chấm công"
                open={reasonModalOpen}
                onOk={handleSubmitReason}
                onCancel={() => setReasonModalOpen(false)}
                okText="Gửi lý do"
                cancelText="Hủy"
            >
                <Form form={form} layout="vertical">
                    <Form.Item 
                        name="reason" 
                        label="Lý do không nằm trong vùng văn phòng"
                        rules={[{ required: true, message: "Vui lòng nhập lý do!" }]}
                    >
                        <Input.TextArea rows={4} placeholder="Ví dụ: Gặp trực tiếp khách hàng tại văn phòng đối tác..." />
                    </Form.Item>
                </Form>
            </Modal>
        </Card>
    );
};

export default MyAttendanceHistoryTable;
