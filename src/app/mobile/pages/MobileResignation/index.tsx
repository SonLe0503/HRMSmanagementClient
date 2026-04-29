import { useEffect, useState } from "react";
import { Drawer, Popconfirm, Skeleton, Tag, message } from "antd";
import { PlusOutlined, InboxOutlined, WarningOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useAppDispatch, useAppSelector } from "../../../../store";
import {
    fetchMyResignationRequests, cancelResignationRequest,
    selectMyResignationRequests, selectResignationRequestLoading,
} from "../../../../store/resignationRequestSlide";
import MobilePageWrapper from "../../components/MobilePageWrapper";
import MobileCard from "../../components/MobileCard";
import ResignationRequestForm from "../../../pages/myResignationRequest/components/ResignationRequestForm";

const STATUS_MAP: Record<string, { label: string; color: string }> = {
    Pending:   { label: "Chờ duyệt", color: "orange"  },
    Approved:  { label: "Đã duyệt",  color: "success" },
    Rejected:  { label: "Từ chối",   color: "error"   },
    Cancelled: { label: "Đã hủy",    color: "default" },
};

const MobileResignation = () => {
    const dispatch = useAppDispatch();
    const requests = useAppSelector(selectMyResignationRequests);
    const loading = useAppSelector(selectResignationRequestLoading);
    const [formOpen, setFormOpen] = useState(false);

    useEffect(() => {
        dispatch(fetchMyResignationRequests());
    }, [dispatch]);

    const hasPending = requests.some((r: any) => r.status === "Pending");

    const handleCancel = (id: number) => {
        dispatch(cancelResignationRequest(id))
            .unwrap()
            .then(() => {
                message.success("Đã hủy đơn xin thôi việc.");
                dispatch(fetchMyResignationRequests());
            })
            .catch((err: any) => message.error(err?.message || "Không thể hủy đơn."));
    };

    return (
        <MobilePageWrapper title="Đơn xin thôi việc">
            {/* ── Pending alert ── */}
            {hasPending && (() => {
                const pendingReq = requests.find((r: any) => r.status === "Pending");
                return pendingReq ? (
                    <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 mb-4 flex gap-3">
                        <WarningOutlined className="text-orange-500 text-lg flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-orange-700 mb-1">Đang có đơn chờ duyệt</p>
                            <p className="text-xs text-orange-600">
                                Ngày nghỉ dự kiến: <strong>{dayjs(pendingReq.expectedLastWorkingDate).format("DD/MM/YYYY")}</strong>
                            </p>
                            <div className="mt-2">
                                <Popconfirm
                                    title="Hủy đơn xin thôi việc?"
                                    description="Bạn có chắc chắn muốn hủy đơn này không?"
                                    onConfirm={() => handleCancel(pendingReq.resignationRequestId)}
                                    okText="Hủy đơn"
                                    cancelText="Không"
                                    okButtonProps={{ danger: true }}
                                    placement="bottom"
                                >
                                    <button className="text-xs font-medium text-red-500">Hủy đơn</button>
                                </Popconfirm>
                            </div>
                        </div>
                    </div>
                ) : null;
            })()}

            {/* ── History list ── */}
            <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-gray-700">Lịch sử đơn</h2>
                <span className="text-xs text-gray-400">{requests.length} đơn</span>
            </div>

            {loading && !requests.length ? (
                [1, 2].map(i => <Skeleton key={i} active paragraph={{ rows: 2 }} className="mb-2" />)
            ) : requests.length === 0 ? (
                <MobileCard>
                    <div className="flex flex-col items-center py-8 text-gray-400">
                        <InboxOutlined style={{ fontSize: 40 }} />
                        <p className="mt-2 text-sm">Chưa có đơn xin thôi việc nào</p>
                    </div>
                </MobileCard>
            ) : (
                <MobileCard className="overflow-hidden p-0">
                    {requests.map((r: any) => {
                        const s = STATUS_MAP[r.status] ?? { label: r.status, color: "default" };
                        return (
                            <div key={r.resignationRequestId}
                                className="px-4 py-3 border-b border-gray-50 last:border-b-0">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-gray-800">
                                            Ngày nghỉ dự kiến: {dayjs(r.expectedLastWorkingDate).format("DD/MM/YYYY")}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            Nộp: {dayjs(r.submittedDate).format("DD/MM/YYYY")}
                                        </p>
                                        {r.reason && (
                                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{r.reason}</p>
                                        )}
                                        {r.status === "Rejected" && r.rejectionReason && (
                                            <p className="text-xs text-red-500 mt-1">
                                                Lý do từ chối: {r.rejectionReason}
                                            </p>
                                        )}
                                    </div>
                                    <Tag color={s.color} className="flex-shrink-0">{s.label}</Tag>
                                </div>
                            </div>
                        );
                    })}
                </MobileCard>
            )}

            {/* ── FAB — ẩn khi đang có đơn pending ── */}
            {!hasPending && (
                <button
                    className="fixed right-4 w-14 h-14 bg-red-600 text-white rounded-full shadow-lg flex items-center justify-center text-2xl active:scale-95 transition-transform z-50"
                    style={{ bottom: "calc(80px + env(safe-area-inset-bottom, 0px))" }}
                    onClick={() => setFormOpen(true)}
                >
                    <PlusOutlined />
                </button>
            )}

            {/* ── Create form drawer ── */}
            <Drawer
                title="Nộp đơn xin thôi việc"
                placement="bottom"
                height="90vh"
                open={formOpen}
                onClose={() => setFormOpen(false)}
                styles={{ body: { padding: "16px", overflowY: "auto" } }}
                destroyOnHidden
            >
                <ResignationRequestForm />
            </Drawer>
        </MobilePageWrapper>
    );
};

export default MobileResignation;
