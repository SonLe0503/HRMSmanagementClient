import { useEffect, useState } from "react";
import { Drawer, Popconfirm, Skeleton, message } from "antd";
import { PlusOutlined, InboxOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { fetchMyBalance, selectMyLeaveBalances } from "../../../../store/leaveBalanceSlide";
import {
    fetchMyLeaveRequests, cancelLeaveRequest,
    selectMyLeaveRequests, selectLeaveRequestLoading,
} from "../../../../store/leaveRequestSlide";
import { fetchActiveLeaveTypes } from "../../../../store/leaveTypeSlide";
import MobilePageWrapper from "../../components/MobilePageWrapper";
import MobileCard from "../../components/MobileCard";
import MobileStatCard from "../../components/MobileStatCard";
import MobileStatusBadge from "../../components/MobileStatusBadge";
import LeaveRequestForm from "../../../pages/myLeaveRequest/components/LeaveRequestForm";

const STATUS_VI: Record<string, string> = {
    Approved: "approved", Pending: "pending",
    Rejected: "rejected", Cancelled: "cancelled",
};

const MobileLeaveRequest = () => {
    const dispatch = useAppDispatch();
    const balances = useAppSelector(selectMyLeaveBalances);
    const requests = useAppSelector(selectMyLeaveRequests);
    const loading = useAppSelector(selectLeaveRequestLoading);
    const [formOpen, setFormOpen] = useState(false);

    useEffect(() => {
        dispatch(fetchMyBalance());
        dispatch(fetchMyLeaveRequests());
        dispatch(fetchActiveLeaveTypes());
    }, [dispatch]);

    const handleCancel = (id: number) => {
        dispatch(cancelLeaveRequest({ id, data: { reason: "Người dùng tự hủy yêu cầu" } }))
            .unwrap()
            .then(() => {
                message.success("Đã hủy yêu cầu thành công.");
                dispatch(fetchMyLeaveRequests());
                dispatch(fetchMyBalance());
            })
            .catch((err: any) => message.error(err?.message || "Không thể hủy yêu cầu."));
    };

    // Tổng hợp balance stats
    const totalDays = balances.reduce((s: number, b: any) => s + (b.totalEntitlement || 0), 0);
    const remaining = balances.reduce((s: number, b: any) => s + (b.remainingDays || 0), 0);
    const used = balances.reduce((s: number, b: any) => s + (b.usedDays || 0), 0);
    const pending = requests.filter((r: any) => r.status === "Pending").length;

    return (
        <MobilePageWrapper title="Nghỉ phép của tôi">
            {/* ── Balance stats ── */}
            {loading && !balances.length ? (
                <Skeleton active paragraph={{ rows: 2 }} className="mb-4" />
            ) : (
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <MobileStatCard label="Tổng ngày phép" value={totalDays} unit="ngày" color="blue" />
                    <MobileStatCard label="Còn lại" value={remaining} unit="ngày" color="green" />
                    <MobileStatCard label="Đã dùng" value={used} unit="ngày" color="orange" />
                    <MobileStatCard label="Chờ duyệt" value={pending} unit="đơn" color="gray" />
                </div>
            )}

            {/* ── Request list ── */}
            <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-gray-700">Lịch sử nghỉ phép</h2>
                <span className="text-xs text-gray-400">{requests.length} đơn</span>
            </div>

            {loading && !requests.length ? (
                [1, 2, 3].map(i => <Skeleton key={i} active paragraph={{ rows: 1 }} className="mb-2" />)
            ) : requests.length === 0 ? (
                <MobileCard>
                    <div className="flex flex-col items-center py-8 text-gray-400">
                        <InboxOutlined style={{ fontSize: 40 }} />
                        <p className="mt-2 text-sm">Chưa có đơn nghỉ phép nào</p>
                    </div>
                </MobileCard>
            ) : (
                <MobileCard className="overflow-hidden p-0">
                    {requests.map((r: any) => (
                        <div key={r.leaveRequestID}
                            className="px-4 py-3 border-b border-gray-50 last:border-b-0">
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-gray-800">{r.leaveTypeName}</p>
                                    <p className="text-xs text-gray-400 mt-0.5">
                                        {dayjs(r.startDate).format("DD/MM/YYYY")} – {dayjs(r.endDate).format("DD/MM/YYYY")}
                                        {" · "}{r.numberOfDays} ngày
                                    </p>
                                    {r.reason && (
                                        <p className="text-xs text-gray-500 mt-0.5 truncate">{r.reason}</p>
                                    )}
                                </div>
                                <MobileStatusBadge status={STATUS_VI[r.status] ?? r.status} />
                            </div>
                            {r.status === "Pending" && (
                                <div className="mt-2">
                                    <Popconfirm
                                        title="Hủy yêu cầu này?"
                                        onConfirm={() => handleCancel(r.leaveRequestID)}
                                        okText="Hủy đơn"
                                        cancelText="Không"
                                        placement="top"
                                    >
                                        <button className="text-xs text-red-500 font-medium">
                                            Hủy đơn
                                        </button>
                                    </Popconfirm>
                                </div>
                            )}
                        </div>
                    ))}
                </MobileCard>
            )}

            {/* ── FAB ── */}
            <button
                className="fixed bottom-24 right-4 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center text-2xl active:scale-95 transition-transform z-50"
                style={{ bottom: "calc(80px + env(safe-area-inset-bottom, 0px))" }}
                onClick={() => setFormOpen(true)}
            >
                <PlusOutlined />
            </button>

            {/* ── Create form drawer ── */}
            <Drawer
                title="Đăng ký nghỉ phép"
                placement="bottom"
                height="85vh"
                open={formOpen}
                onClose={() => setFormOpen(false)}
                styles={{ body: { padding: "16px", overflowY: "auto" } }}
                destroyOnHidden
            >
                <LeaveRequestForm />
            </Drawer>
        </MobilePageWrapper>
    );
};

export default MobileLeaveRequest;
