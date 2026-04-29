import { useEffect, useState } from "react";
import { Tag, Drawer, Button, Skeleton, message } from "antd";
import { InboxOutlined, ClockCircleOutlined, CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { fetchAllTasks, selectTasks, selectTaskLoading, approveTask, rejectTask } from "../../../../store/taskSlide";
import { selectInfoLogin } from "../../../../store/authSlide";
import MobilePageWrapper from "../../components/MobilePageWrapper";
import MobileCard from "../../components/MobileCard";

const PRIORITY_COLOR: Record<string, string> = {
    High: "red", Medium: "orange", Low: "blue",
};

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    Pending:    { label: "Chờ xử lý",      color: "default",    icon: <ClockCircleOutlined /> },
    InProgress: { label: "Đang thực hiện", color: "processing", icon: <ClockCircleOutlined /> },
    Approved:   { label: "Đã duyệt",       color: "success",    icon: <CheckCircleOutlined /> },
    Rejected:   { label: "Từ chối",        color: "error",      icon: <CloseCircleOutlined /> },
    Cancelled:  { label: "Đã hủy",         color: "default",    icon: <CloseCircleOutlined /> },
};

const FILTER_TABS = [
    { key: "all",        label: "Tất cả"    },
    { key: "InProgress", label: "Đang làm"  },
    { key: "Pending",    label: "Chờ xử lý" },
    { key: "Approved",   label: "Hoàn thành"},
];

const MobileManageTask = () => {
    const dispatch = useAppDispatch();
    const allTasks = useAppSelector(selectTasks);
    const loading = useAppSelector(selectTaskLoading);
    const infoLogin = useAppSelector(selectInfoLogin);
    const [activeFilter, setActiveFilter] = useState("all");
    const [selectedTask, setSelectedTask] = useState<any>(null);
    const [detailOpen, setDetailOpen] = useState(false);

    const currentUserId = Number(infoLogin?.userId);

    useEffect(() => {
        dispatch(fetchAllTasks());
    }, [dispatch]);

    // Only show tasks relevant to current user
    const myTasks = allTasks.filter(
        (t: any) => t.assignedTo === currentUserId || t.createdBy === currentUserId
    );

    const filteredTasks = activeFilter === "all"
        ? myTasks
        : myTasks.filter((t: any) => t.status === activeFilter);

    const isOverdue = (task: any) =>
        task.dueDate &&
        dayjs(task.dueDate).isBefore(dayjs(), "day") &&
        ["Pending", "InProgress"].includes(task.status);

    const handleApprove = (id: number) => {
        dispatch(approveTask({ id, comments: "Đã duyệt qua Mobile" }))
            .unwrap()
            .then(() => {
                message.success("Đã hoàn thành công việc!");
                setDetailOpen(false);
                dispatch(fetchAllTasks());
            })
            .catch((err: any) => message.error(err));
    };

    const handleReject = (id: number) => {
        dispatch(rejectTask({ id, reason: "Từ chối qua Mobile (lý do mặc định)" }))
            .unwrap()
            .then(() => {
                message.success("Đã từ chối công việc.");
                setDetailOpen(false);
                dispatch(fetchAllTasks());
            })
            .catch((err: any) => message.error(err));
    };

    const openDetail = (task: any) => {
        setSelectedTask(task);
        setDetailOpen(true);
    };

    return (
        <MobilePageWrapper title="Công việc của tôi">
            {/* ── Filter tabs ── */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-1 -mx-1 px-1">
                {FILTER_TABS.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveFilter(tab.key)}
                        className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                            activeFilter === tab.key
                                ? "bg-blue-600 text-white"
                                : "bg-white text-gray-500 border border-gray-200"
                        }`}
                    >
                        {tab.label}
                        {tab.key !== "all" && (
                            <span className="ml-1.5 opacity-70">
                                {myTasks.filter((t: any) => t.status === tab.key).length}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* ── Task list ── */}
            {loading && !myTasks.length ? (
                [1, 2, 3].map(i => <Skeleton key={i} active paragraph={{ rows: 2 }} className="mb-2" />)
            ) : filteredTasks.length === 0 ? (
                <MobileCard>
                    <div className="flex flex-col items-center py-8 text-gray-400">
                        <InboxOutlined style={{ fontSize: 40 }} />
                        <p className="mt-2 text-sm">Không có công việc nào</p>
                    </div>
                </MobileCard>
            ) : (
                <div className="flex flex-col gap-2">
                    {filteredTasks.map((task: any) => {
                        const sc = STATUS_CONFIG[task.status] ?? { label: task.status, color: "default", icon: null };
                        const overdue = isOverdue(task);
                        return (
                            <MobileCard
                                key={task.taskId}
                                onClick={() => openDetail(task)}
                                className={`${overdue ? "border border-red-200 bg-red-50" : ""}`}
                            >
                                <div className="flex items-start justify-between gap-2 mb-2">
                                    <p className={`text-sm font-semibold flex-1 min-w-0 ${overdue ? "text-red-700" : "text-gray-800"}`}>
                                        {task.taskTitle}
                                    </p>
                                    <Tag color={sc.color} className="flex-shrink-0 text-xs m-0">
                                        {sc.label}
                                    </Tag>
                                </div>
                                <div className="flex items-center gap-3 flex-wrap">
                                    <span className="text-xs text-gray-400">{task.taskType}</span>
                                    {task.priority && (
                                        <Tag color={PRIORITY_COLOR[task.priority] ?? "default"} className="text-xs m-0">
                                            {task.priority}
                                        </Tag>
                                    )}
                                    {task.dueDate && (
                                        <span className={`text-xs ${overdue ? "text-red-500 font-semibold" : "text-gray-400"}`}>
                                            {overdue ? "⚠ " : ""}Hạn: {dayjs(task.dueDate).format("DD/MM/YYYY")}
                                        </span>
                                    )}
                                </div>
                            </MobileCard>
                        );
                    })}
                </div>
            )}

            {/* ── Task detail drawer ── */}
            <Drawer
                title={`Công việc #${selectedTask?.taskId}`}
                placement="bottom"
                height="auto"
                open={detailOpen}
                onClose={() => setDetailOpen(false)}
                styles={{ body: { padding: "16px 20px 24px" } }}
                footer={
                    selectedTask &&
                    ["Pending", "InProgress"].includes(selectedTask.status) &&
                    selectedTask.assignedTo === currentUserId ? (
                        <div className="flex gap-3">
                            <Button
                                danger
                                block
                                onClick={() => handleReject(selectedTask.taskId)}
                            >
                                Từ chối
                            </Button>
                            <Button
                                type="primary"
                                block
                                onClick={() => handleApprove(selectedTask.taskId)}
                            >
                                Hoàn thành
                            </Button>
                        </div>
                    ) : null
                }
            >
                {selectedTask && (
                    <div className="space-y-3">
                        <div>
                            <p className="text-xs text-gray-400 mb-0.5">Tiêu đề</p>
                            <p className="text-sm font-semibold text-gray-800">{selectedTask.taskTitle}</p>
                        </div>
                        {selectedTask.taskDescription && (
                            <div>
                                <p className="text-xs text-gray-400 mb-0.5">Mô tả</p>
                                <p className="text-sm text-gray-700">{selectedTask.taskDescription}</p>
                            </div>
                        )}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <p className="text-xs text-gray-400 mb-0.5">Loại</p>
                                <p className="text-sm text-gray-700">{selectedTask.taskType}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 mb-0.5">Độ ưu tiên</p>
                                <Tag color={PRIORITY_COLOR[selectedTask.priority] ?? "default"} className="m-0 text-xs">
                                    {selectedTask.priority}
                                </Tag>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 mb-0.5">Trạng thái</p>
                                <Tag color={STATUS_CONFIG[selectedTask.status]?.color ?? "default"} className="m-0 text-xs">
                                    {STATUS_CONFIG[selectedTask.status]?.label ?? selectedTask.status}
                                </Tag>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 mb-0.5">Người thực hiện</p>
                                <p className="text-sm text-gray-700">{selectedTask.assignedUsername || "—"}</p>
                            </div>
                            {selectedTask.dueDate && (
                                <div>
                                    <p className="text-xs text-gray-400 mb-0.5">Hạn hoàn thành</p>
                                    <p className={`text-sm font-medium ${isOverdue(selectedTask) ? "text-red-500" : "text-gray-700"}`}>
                                        {dayjs(selectedTask.dueDate).format("DD/MM/YYYY")}
                                    </p>
                                </div>
                            )}
                            <div>
                                <p className="text-xs text-gray-400 mb-0.5">Ngày tạo</p>
                                <p className="text-sm text-gray-700">{dayjs(selectedTask.createdDate).format("DD/MM/YYYY")}</p>
                            </div>
                        </div>
                        {selectedTask.completionNotes && (
                            <div>
                                <p className="text-xs text-gray-400 mb-0.5">Ghi chú</p>
                                <p className="text-sm text-gray-700">{selectedTask.completionNotes}</p>
                            </div>
                        )}
                    </div>
                )}
            </Drawer>
        </MobilePageWrapper>
    );
};

export default MobileManageTask;
