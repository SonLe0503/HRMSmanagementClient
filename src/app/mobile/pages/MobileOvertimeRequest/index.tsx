import { useEffect, useState } from "react";
import { Drawer, Modal, Skeleton, message } from "antd";
import { PlusOutlined, InboxOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useAppDispatch, useAppSelector } from "../../../../store";
import {
    fetchMyOvertimeRequests, cancelOvertimeRequest,
    selectMyOvertimeRequests, selectOvertimeLoading,
} from "../../../../store/overtimeSlide";
import MobilePageWrapper from "../../components/MobilePageWrapper";
import MobileCard from "../../components/MobileCard";
import MobileStatCard from "../../components/MobileStatCard";
import MobileStatusBadge from "../../components/MobileStatusBadge";
import OvertimeRequestForm from "../../../pages/myOvertimeRequest/components/OvertimeRequestForm";

const STATUS_VI: Record<string, string> = {
    Approved: "approved", Pending: "pending",
    Rejected: "rejected", Cancelled: "cancelled",
};

const OT_MODE_VI: Record<string, string> = {
    AfterShift: "Sau ca", BeforeShift: "Trước ca", FullRange: "Ngày nghỉ",
};

const MobileOvertimeRequest = () => {
    const dispatch = useAppDispatch();
    const requests = useAppSelector(selectMyOvertimeRequests);
    const loading = useAppSelector(selectOvertimeLoading);
    const [formOpen, setFormOpen] = useState(false);

    useEffect(() => {
        dispatch(fetchMyOvertimeRequests());
    }, [dispatch]);

    const stats = {
        total:    requests.length,
        approved: requests.filter((r: any) => r.status === "Approved").length,
        pending:  requests.filter((r: any) => r.status === "Pending").length,
        rejected: requests.filter((r: any) => r.status === "Rejected" || r.status === "Cancelled").length,
    };

    const handleCancel = (id: number) => {
        Modal.confirm({
            title: "Hủy yêu cầu tăng ca?",
            okText: "Hủy đơn",
            cancelText: "Không",
            okButtonProps: { danger: true },
            centered: true,
            onOk: () =>
                dispatch(cancelOvertimeRequest({ id, data: { reason: "Người dùng tự hủy" } }))
                    .unwrap()
                    .then(() => {
                        message.success("Đã hủy yêu cầu!");
                        dispatch(fetchMyOvertimeRequests());
                    })
                    .catch((err: any) => message.error(err?.message || "Hủy thất bại!")),
        });
    };

    return (
        <MobilePageWrapper title="Tăng ca của tôi">
            {/* ── Stats ── */}
            {loading && !requests.length ? (
                <Skeleton active paragraph={{ rows: 2 }} className="mb-4" />
            ) : (
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <MobileStatCard label="Tổng đơn"       value={stats.total}    color="blue"   />
                    <MobileStatCard label="Đã duyệt"       value={stats.approved} color="green"  />
                    <MobileStatCard label="Chờ duyệt"      value={stats.pending}  color="orange" />
                    <MobileStatCard label="Từ chối / Hủy"  value={stats.rejected} color="red"    />
                </div>
            )}

            {/* ── Request list ── */}
            <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-gray-700">Lịch sử tăng ca</h2>
                <span className="text-xs text-gray-400">{requests.length} đơn</span>
            </div>

            {loading && !requests.length ? (
                [1, 2, 3].map(i => <Skeleton key={i} active paragraph={{ rows: 1 }} className="mb-2" />)
            ) : requests.length === 0 ? (
                <MobileCard>
                    <div className="flex flex-col items-center py-8 text-gray-400">
                        <InboxOutlined style={{ fontSize: 40 }} />
                        <p className="mt-2 text-sm">Chưa có đơn tăng ca nào</p>
                    </div>
                </MobileCard>
            ) : (
                <MobileCard className="overflow-hidden p-0">
                    {requests.map((r: any) => (
                        <div key={r.overtimeRequestId}
                            className="px-4 py-3 border-b border-gray-50 last:border-b-0">
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-gray-800">
                                        {dayjs(r.overtimeDate).format("DD/MM/YYYY")}
                                        <span className="font-normal text-gray-400 ml-2">
                                            {r.startTime?.slice(0, 5)} – {r.endTime?.slice(0, 5)}
                                        </span>
                                    </p>
                                    <p className="text-xs text-gray-400 mt-0.5">
                                        {r.totalHours}h · {OT_MODE_VI[r.otMode] ?? r.otMode}
                                    </p>
                                    {r.reason && (
                                        <p className="text-xs text-gray-500 mt-0.5 truncate">{r.reason}</p>
                                    )}
                                </div>
                                <MobileStatusBadge status={STATUS_VI[r.status] ?? r.status} />
                            </div>
                            {r.status === "Pending" && (
                                <div className="mt-2">
                                    <button
                                        className="text-xs text-red-500 font-medium"
                                        onClick={() => handleCancel(r.overtimeRequestId)}
                                    >
                                        Hủy đơn
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </MobileCard>
            )}

            {/* ── FAB ── */}
            <button
                className="fixed right-4 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center text-2xl active:scale-95 transition-transform z-50"
                style={{ bottom: "calc(80px + env(safe-area-inset-bottom, 0px))" }}
                onClick={() => setFormOpen(true)}
            >
                <PlusOutlined />
            </button>

            {/* ── Create form drawer ── */}
            <Drawer
                title="Đăng ký tăng ca"
                placement="bottom"
                height="90vh"
                open={formOpen}
                onClose={() => setFormOpen(false)}
                styles={{ body: { padding: "16px", overflowY: "auto" } }}
                destroyOnHidden
            >
                <OvertimeRequestForm />
            </Drawer>
        </MobilePageWrapper>
    );
};

export default MobileOvertimeRequest;
