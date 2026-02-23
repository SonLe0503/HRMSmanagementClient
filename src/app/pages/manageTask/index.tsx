import React, { useEffect, useState } from "react";
import { Table, Tag, Card, Typography, message, Space, Button, Tooltip, Modal, Descriptions } from "antd";
import {
    ClockCircleOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    EyeOutlined,
    PlusOutlined,
} from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "../../../store";
import {
    fetchAllTasks,
    selectTasks,
    selectTaskLoading,
    approveTask,
    rejectTask
} from "../../../store/taskSlide";
import { selectInfoLogin } from "../../../store/authSlide";
import { EUserRole } from "../../../interface/app";
import TaskCondition from "./TaskCondition";
import AddTaskModal from "./modal/AddTaskModal";
import dayjs from "dayjs";

const { Title, Text } = Typography;

const ManageTask: React.FC = () => {
    const dispatch = useAppDispatch();
    const tasks = useAppSelector(selectTasks);
    const loading = useAppSelector(selectTaskLoading);
    const infoLogin = useAppSelector(selectInfoLogin);

    const [searchText, setSearchText] = useState("");
    const [priorityFilter, setPriorityFilter] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<string | null>(null);

    const [selectedTask, setSelectedTask] = useState<any>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const currentUserId = Number(infoLogin?.userId);
    const isEmployee = infoLogin?.role === EUserRole.EMPLOYEE;
    const canCreateTask = infoLogin?.role && [EUserRole.ADMIN, EUserRole.MANAGE, EUserRole.HR].includes(infoLogin.role as any);

    useEffect(() => {
        dispatch(fetchAllTasks());
    }, [dispatch]);

    const handleViewDetail = (record: any) => {
        setSelectedTask(record);
        setIsDetailModalOpen(true);
    };

    const handleApprove = (id: number) => {
        dispatch(approveTask({ id, comments: "Approved via Task Management" }))
            .unwrap()
            .then(() => {
                message.success("Task approved successfully");
                dispatch(fetchAllTasks());
            })
            .catch((err) => message.error(err));
    };

    const handleReject = (id: number) => {
        Modal.confirm({
            title: 'Reject Task',
            content: (
                <div className="mt-2">
                    <Text>Are you sure you want to reject this task?</Text>
                </div>
            ),
            onOk: () => {
                dispatch(rejectTask({ id, reason: "Rejected via Task Management (Reason required min 10 chars)" }))
                    .unwrap()
                    .then(() => {
                        message.success("Task rejected successfully");
                        dispatch(fetchAllTasks());
                    })
                    .catch((err) => message.error(err));
            }
        });
    };

    const filteredTasks = tasks.filter((task) => {
        // Only show tasks assigned to me or created by me (for follow up)
        const isRelated = task.assignedTo === currentUserId || task.createdBy === currentUserId;
        if (!isRelated) return false;

        const matchesSearch =
            task.taskId.toString().includes(searchText) ||
            task.taskTitle.toLowerCase().includes(searchText.toLowerCase()) ||
            task.taskType.toLowerCase().includes(searchText.toLowerCase());

        const matchesPriority = priorityFilter ? task.priority === priorityFilter : true;
        const matchesStatus = statusFilter ? task.status === statusFilter : true;

        return matchesSearch && matchesPriority && matchesStatus;
    });

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'High': return 'red';
            case 'Medium': return 'orange';
            case 'Low': return 'blue';
            default: return 'default';
        }
    };

    const getStatusTag = (status: string) => {
        switch (status) {
            case 'Pending': return <Tag icon={<ClockCircleOutlined />} color="default">PENDING</Tag>;
            case 'InProgress': return <Tag icon={<ClockCircleOutlined />} color="processing">IN PROGRESS</Tag>;
            case 'Approved': return <Tag icon={<CheckCircleOutlined />} color="success">APPROVED</Tag>;
            case 'Rejected': return <Tag icon={<CloseCircleOutlined />} color="error">REJECTED</Tag>;
            case 'Cancelled': return <Tag icon={<CloseCircleOutlined />} color="default">CANCELLED</Tag>;
            default: return <Tag>{status}</Tag>;
        }
    };

    const columns = [
        {
            title: "Task ID",
            dataIndex: "taskId",
            key: "taskId",
            width: 90,
            sorter: (a: any, b: any) => a.taskId - b.taskId,
        },
        {
            title: "Type",
            dataIndex: "taskType",
            key: "taskType",
            width: 150,
        },
        {
            title: "Description",
            dataIndex: "taskTitle",
            key: "taskTitle",
            ellipsis: true,
        },
        {
            title: "Assigned To",
            dataIndex: "assignedUsername",
            key: "assignedUsername",
            render: (text: string) => text || "Unassigned",
        },
        {
            title: "Priority",
            dataIndex: "priority",
            key: "priority",
            width: 100,
            render: (priority: string) => (
                <Tag color={getPriorityColor(priority)}>{priority.toUpperCase()}</Tag>
            ),
            sorter: (a: any, b: any) => a.priority.localeCompare(b.priority),
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            width: 120,
            render: (status: string) => getStatusTag(status),
        },
        !isEmployee && {
            title: "Task Role",
            key: "taskRole",
            width: 120,
            render: (_: any, record: any) => (
                record.assignedTo === currentUserId
                    ? <Tag color="orange">ASSIGNED TO ME</Tag>
                    : <Tag color="default">FOLLOW UP</Tag>
            )
        },
        {
            title: "Due Date",
            dataIndex: "dueDate",
            key: "dueDate",
            width: 120,
            render: (date: string, record: any) => {
                if (!date) return "-";
                const isOverdue = dayjs(date).isBefore(dayjs(), 'day') &&
                    ['Pending', 'InProgress'].includes(record.status);
                return (
                    <Text style={{ color: isOverdue ? '#ff4d4f' : 'inherit', fontWeight: isOverdue ? 'bold' : 'normal' }}>
                        {dayjs(date).format("YYYY-MM-DD")}
                    </Text>
                );
            },
            sorter: (a: any, b: any) => dayjs(a.dueDate).unix() - dayjs(b.dueDate).unix(),
        },
        {
            title: "Action",
            key: "action",
            fixed: "right" as const,
            width: 100,
            render: (_: any, record: any) => (
                <Space>
                    <Tooltip title="View Details">
                        <Button
                            type="text"
                            icon={<EyeOutlined />}
                            onClick={() => handleViewDetail(record)}
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <div className="p-4">
            <div className="mb-4" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <Title level={3}>{isEmployee ? "Công việc được giao" : "Quản lý công việc"}</Title>
                    <Text type="secondary">
                        {isEmployee ? "Danh sách các công việc bạn cần thực hiện." : "Quản lý các công việc và yêu cầu phê duyệt trong hệ thống."}
                    </Text>
                </div>
                {canCreateTask && (
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsAddModalOpen(true)}>
                        Create Task
                    </Button>
                )}
            </div>

            <Card>
                <TaskCondition
                    searchText={searchText}
                    setSearchText={setSearchText}
                    priorityFilter={priorityFilter}
                    setPriorityFilter={setPriorityFilter}
                    statusFilter={statusFilter}
                    setStatusFilter={setStatusFilter}
                />

                <Table
                    columns={columns.filter(Boolean) as any}
                    dataSource={filteredTasks}
                    rowKey="taskId"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                    scroll={{ x: 1300 }}
                    size="middle"
                    rowClassName={(record) => {
                        const isOverdue = record.dueDate &&
                            dayjs(record.dueDate).isBefore(dayjs(), 'day') &&
                            ['Pending', 'InProgress'].includes(record.status);
                        return isOverdue ? 'overdue-row' : '';
                    }}
                />
            </Card>

            <Modal
                title={`Task Details: #${selectedTask?.taskId}`}
                open={isDetailModalOpen}
                onCancel={() => setIsDetailModalOpen(false)}
                footer={[
                    <Button key="back" onClick={() => setIsDetailModalOpen(false)}>
                        Close
                    </Button>,
                    (selectedTask?.status === 'Pending' || selectedTask?.status === 'InProgress') &&
                    selectedTask?.assignedTo === currentUserId && (
                        <>
                            <Button
                                key="reject"
                                danger
                                onClick={() => {
                                    setIsDetailModalOpen(false);
                                    handleReject(selectedTask.taskId);
                                }}
                            >
                                Reject
                            </Button>
                            <Button
                                key="approve"
                                type="primary"
                                onClick={() => {
                                    setIsDetailModalOpen(false);
                                    handleApprove(selectedTask.taskId);
                                }}
                            >
                                Approve
                            </Button>
                        </>
                    )
                ]}
                width={700}
            >
                {selectedTask && (
                    <Descriptions bordered column={2}>
                        <Descriptions.Item label="Title" span={2}>{selectedTask.taskTitle}</Descriptions.Item>
                        <Descriptions.Item label="Type">{selectedTask.taskType}</Descriptions.Item>
                        <Descriptions.Item label="Priority">
                            <Tag color={getPriorityColor(selectedTask.priority)}>{selectedTask.priority}</Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Status">{getStatusTag(selectedTask.status)}</Descriptions.Item>
                        <Descriptions.Item label="Assigned To">{selectedTask.assignedUsername || "N/A"}</Descriptions.Item>
                        <Descriptions.Item label="Due Date">
                            {selectedTask.dueDate ? dayjs(selectedTask.dueDate).format("YYYY-MM-DD") : "N/A"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Created Date">
                            {dayjs(selectedTask.createdDate).format("YYYY-MM-DD HH:mm")}
                        </Descriptions.Item>
                        <Descriptions.Item label="Description" span={2}>
                            {selectedTask.taskDescription || "No description provided."}
                        </Descriptions.Item>
                        {selectedTask.completedDate && (
                            <Descriptions.Item label="Completed Date" span={2}>
                                {dayjs(selectedTask.completedDate).format("YYYY-MM-DD HH:mm")}
                            </Descriptions.Item>
                        )}
                        {selectedTask.completionNotes && (
                            <Descriptions.Item label="Notes/Reason" span={2}>
                                {selectedTask.completionNotes}
                            </Descriptions.Item>
                        )}
                    </Descriptions>
                )}
            </Modal>

            <AddTaskModal
                open={isAddModalOpen}
                onCancel={() => setIsAddModalOpen(false)}
            />

            <style>{`
                .overdue-row {
                    background-color: #fff1f0 !important;
                }
                .overdue-row:hover > td {
                    background-color: #ffccc7 !important;
                }
                .overdue-row td {
                    border-bottom: 1px solid #ff4d4f44 !important;
                }
            `}</style>
        </div>
    );
};

export default ManageTask;
