import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Drawer, Input, Skeleton, Tag, message } from "antd";
import { ArrowLeftOutlined, TrophyOutlined, ArrowUpOutlined, ArrowDownOutlined, MinusOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useAppDispatch, useAppSelector } from "../../../../store";
import {
    fetchEvaluationResultDetail, acknowledgeEvaluation, requestReview,
    selectResultDetail, selectEvaluationResultLoading,
} from "../../../../store/evaluationResultSlide";
import { useAndroidBack } from "../../../../hooks/useAndroidBack";
import MobileCard from "../../components/MobileCard";

const { TextArea } = Input;

const RatingBar = ({ value, color }: { value?: number; color: string }) => {
    const pct = value ? (value / 5) * 100 : 0;
    return (
        <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                <div className={`h-2 rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
            </div>
            <span className="text-xs font-semibold text-gray-700 w-7 text-right">
                {value ? value.toFixed(1) : "—"}
            </span>
        </div>
    );
};

const MobileViewEvaluationResultDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const detail = useAppSelector(selectResultDetail);
    const loading = useAppSelector(selectEvaluationResultLoading);
    const currentUser = Number(
        useAppSelector((state: any) => state.auth.infoLogin?.employeeId || state.auth.infoLogin?.userId)
    );

    const [expandedIds, setExpandedIds] = useState<number[]>([]);
    const [appealOpen, setAppealOpen] = useState(false);
    const [disagreement, setDisagreement] = useState("");
    const [explanation, setExplanation] = useState("");
    const [evidence, setEvidence] = useState("");
    const [appealing, setAppealing] = useState(false);

    useAndroidBack(appealOpen, () => setAppealOpen(false));

    useEffect(() => {
        if (id) dispatch(fetchEvaluationResultDetail(Number(id)));
    }, [id, dispatch]);

    const toggleExpand = (cid: number) =>
        setExpandedIds(prev => prev.includes(cid) ? prev.filter(x => x !== cid) : [...prev, cid]);

    if (loading && !detail) {
        return (
            <div className="flex flex-col min-h-full">
                <div className="flex items-center gap-3 mb-4">
                    <button className="w-9 h-9 flex items-center justify-center rounded-xl bg-white" onClick={() => navigate(-1)}>
                        <ArrowLeftOutlined />
                    </button>
                    <h1 className="text-base font-bold text-gray-800">Kết quả đánh giá</h1>
                </div>
                {[1, 2, 3].map(i => <Skeleton key={i} active paragraph={{ rows: 3 }} className="mb-3" />)}
            </div>
        );
    }

    if (!detail) return null;

    const isOwner = currentUser === detail.employeeId;
    const canAcknowledge = isOwner && !detail.isAcknowledged && detail.status === "Completed";

    const handleAcknowledge = () => {
        dispatch(acknowledgeEvaluation({ evaluationId: Number(id), acknowledgementComments: "Đã xác nhận bởi nhân viên." }))
            .unwrap()
            .then(() => {
                message.success("Đã xác nhận phiếu đánh giá!");
                dispatch(fetchEvaluationResultDetail(Number(id)));
            })
            .catch((e: any) => message.error(e?.message || "Lỗi thao tác"));
    };

    const handleAppeal = async () => {
        if (!disagreement || !explanation) {
            message.warning("Vui lòng điền đầy đủ thông tin bắt buộc.");
            return;
        }
        setAppealing(true);
        try {
            await dispatch(requestReview({
                evaluationId: Number(id),
                disagreementPoints: disagreement,
                detailedExplanation: explanation,
                supportingEvidence: evidence,
            })).unwrap();
            message.success("Đã gửi khiếu nại thành công!");
            setAppealOpen(false);
            setDisagreement(""); setExplanation(""); setEvidence("");
            dispatch(fetchEvaluationResultDetail(Number(id)));
        } catch (e: any) {
            message.error(e?.message || "Lỗi gửi khiếu nại");
        } finally {
            setAppealing(false);
        }
    };

    const statusColor = ["Completed", "Acknowledged"].includes(detail.status) ? "green" : "orange";
    const statusLabel = detail.status === "Completed" ? "Hoàn thành" : detail.status === "Acknowledged" ? "Đã xác nhận" : detail.status;

    const ratingBg = (r?: number) => {
        if (!r) return "text-gray-400";
        if (r >= 4.5) return "text-green-600";
        if (r >= 3.5) return "text-blue-600";
        if (r >= 2.5) return "text-yellow-600";
        return "text-red-500";
    };

    const TrendIcon = () => {
        const dir = detail.comparison?.performanceTrend;
        if (dir === "Up")   return <ArrowUpOutlined   className="text-green-400 text-sm" />;
        if (dir === "Down") return <ArrowDownOutlined  className="text-red-400   text-sm" />;
        return <MinusOutlined className="text-gray-400 text-sm" />;
    };

    return (
        <div
            className="flex flex-col min-h-full"
            style={{ paddingBottom: canAcknowledge ? "calc(80px + 64px + env(safe-area-inset-bottom, 0px))" : undefined }}
        >
            {/* Back header */}
            <div className="flex items-center gap-3 mb-4">
                <button
                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-white text-gray-600 active:bg-gray-100 flex-shrink-0"
                    onClick={() => navigate(-1)}
                >
                    <ArrowLeftOutlined />
                </button>
                <h1 className="text-base font-bold text-gray-800 flex-1 truncate">Kết quả đánh giá</h1>
                <Tag color={statusColor} className="m-0 flex-shrink-0">{statusLabel}</Tag>
            </div>

            {/* Score card */}
            <MobileCard className="mb-3 bg-gradient-to-br from-indigo-600 to-indigo-700 text-white">
                <div className="flex items-center gap-2 mb-3">
                    <TrophyOutlined className="text-yellow-300 text-lg" />
                    <p className="text-indigo-200 text-xs font-medium truncate">{detail.cycleName}</p>
                </div>
                <div className="flex items-end gap-3">
                    <p className={`text-4xl font-bold ${ratingBg(detail.overallRating)} !text-white`}>
                        {detail.overallRating?.toFixed(1) ?? "—"}
                    </p>
                    <p className="text-indigo-300 text-lg mb-1">/ 5.0</p>
                    {detail.comparison && (
                        <div className="ml-auto flex items-center gap-1">
                            <TrendIcon />
                            {detail.comparison.ratingChange !== undefined && (
                                <span className={`text-sm font-semibold ${
                                    detail.comparison.ratingChange > 0  ? "text-green-300"  :
                                    detail.comparison.ratingChange < 0  ? "text-red-300"    : "text-indigo-300"
                                }`}>
                                    {detail.comparison.ratingChange > 0 ? "+" : ""}
                                    {detail.comparison.ratingChange.toFixed(1)}
                                </span>
                            )}
                        </div>
                    )}
                </div>
                {detail.comparison?.previousOverallRating !== undefined && (
                    <p className="text-indigo-300 text-xs mt-2">
                        Kỳ trước: {detail.comparison.previousOverallRating.toFixed(1)}
                    </p>
                )}
            </MobileCard>

            {/* Info rows */}
            <MobileCard className="mb-3">
                {[
                    { label: "Kỳ đánh giá",   value: `${dayjs(detail.evaluationPeriodStart).format("DD/MM/YYYY")} → ${dayjs(detail.evaluationPeriodEnd).format("DD/MM/YYYY")}` },
                    { label: "Người chấm",     value: detail.primaryEvaluatorName || "—" },
                    { label: "Hoàn thành",     value: detail.completionDate ? dayjs(detail.completionDate).format("DD/MM/YYYY") : "—" },
                ].map(item => (
                    <div key={item.label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                        <span className="text-xs text-gray-400">{item.label}</span>
                        <span className="text-xs font-medium text-gray-800 text-right max-w-[60%]">{item.value}</span>
                    </div>
                ))}
            </MobileCard>

            {/* Criteria list */}
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Chi tiết từng tiêu chí</h2>
            {(detail.criteriaResults || []).map((r) => {
                const expanded = expandedIds.includes(r.criteriaId);
                return (
                    <MobileCard key={r.criteriaId} className="mb-2">
                        <div className="cursor-pointer" onClick={() => toggleExpand(r.criteriaId)}>
                            <div className="flex items-start justify-between mb-3">
                                <p className="text-sm font-semibold text-gray-800 flex-1 pr-2">{r.criteriaName}</p>
                                <div className="flex items-center gap-1.5 flex-shrink-0">
                                    <span className="text-xs text-gray-400">{r.weightage}%</span>
                                    {r.difference !== undefined && r.difference !== null && (
                                        <Tag
                                            color={r.difference > 0 ? "green" : r.difference < 0 ? "red" : "default"}
                                            className="m-0 text-xs"
                                        >
                                            {r.difference > 0 ? "+" : ""}{r.difference.toFixed(1)}
                                        </Tag>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div>
                                    <p className="text-xs text-blue-500 mb-1">Tự đánh giá</p>
                                    <RatingBar value={r.selfRating} color="bg-blue-400" />
                                </div>
                                <div>
                                    <p className="text-xs text-pink-500 mb-1">Quản lý</p>
                                    <RatingBar value={r.managerRating} color="bg-pink-400" />
                                </div>
                            </div>
                            <p className="text-xs text-gray-400 mt-2 text-right">
                                {expanded ? "Thu gọn ▲" : "Xem nhận xét ▼"}
                            </p>
                        </div>

                        {expanded && (
                            <div className="mt-3 pt-3 border-t border-gray-100 space-y-3">
                                <div>
                                    <p className="text-xs font-semibold text-blue-500 mb-1">Nhận xét tự đánh giá</p>
                                    <p className="text-xs text-gray-700">{r.selfComments || "Không có nhận xét."}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-pink-500 mb-1">Nhận xét từ quản lý</p>
                                    <p className="text-xs text-gray-700">{r.managerComments || "Không có nhận xét."}</p>
                                </div>
                            </div>
                        )}
                    </MobileCard>
                );
            })}

            {/* Fixed action bar */}
            {canAcknowledge && (
                <div
                    className="fixed left-0 right-0 bg-white border-t border-gray-100 px-4 py-3 z-40 flex gap-3"
                    style={{ bottom: "calc(64px + env(safe-area-inset-bottom, 0px))" }}
                >
                    <Button
                        danger
                        block
                        size="large"
                        className="h-11 rounded-xl"
                        onClick={() => setAppealOpen(true)}
                    >
                        Khiếu nại
                    </Button>
                    <Button
                        type="primary"
                        block
                        size="large"
                        className="h-11 rounded-xl"
                        onClick={handleAcknowledge}
                    >
                        Xác nhận kết quả
                    </Button>
                </div>
            )}

            {/* Appeal drawer */}
            <Drawer
                title="Gửi khiếu nại"
                placement="bottom"
                height="90vh"
                open={appealOpen}
                onClose={() => setAppealOpen(false)}
                styles={{ body: { padding: "16px", overflowY: "auto" } }}
                destroyOnHidden
                footer={
                    <Button
                        danger
                        type="primary"
                        block
                        size="large"
                        loading={appealing}
                        className="rounded-xl h-12"
                        onClick={handleAppeal}
                    >
                        Gửi khiếu nại
                    </Button>
                }
            >
                <div className="space-y-5">
                    <p className="text-xs text-gray-500">
                        Nếu bạn không đồng tình với kết quả chấm điểm, hãy điền đầy đủ thông tin bên dưới để gửi yêu cầu xem xét lại.
                    </p>
                    <div>
                        <p className="text-sm font-medium text-gray-700 mb-1.5">
                            Điểm chưa đồng tình <span className="text-red-500">*</span>
                        </p>
                        <TextArea
                            rows={2}
                            value={disagreement}
                            onChange={e => setDisagreement(e.target.value)}
                            placeholder="Ví dụ: Tiêu chí X chưa phản ánh đúng thực tế năng lực..."
                        />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-700 mb-1.5">
                            Giải thích chi tiết <span className="text-red-500">*</span>
                        </p>
                        <TextArea
                            rows={4}
                            value={explanation}
                            onChange={e => setExplanation(e.target.value)}
                            placeholder="Trình bày bối cảnh, lý do tại sao bạn cho rằng điểm chưa chính xác..."
                        />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-700 mb-1.5">Tài liệu chứng minh</p>
                        <TextArea
                            rows={2}
                            value={evidence}
                            onChange={e => setEvidence(e.target.value)}
                            placeholder="Link Jira, GitHub, Google Drive..."
                        />
                    </div>
                </div>
            </Drawer>
        </div>
    );
};

export default MobileViewEvaluationResultDetail;
