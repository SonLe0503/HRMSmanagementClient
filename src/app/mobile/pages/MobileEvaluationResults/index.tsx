import { useEffect } from "react";
import { Tag, Skeleton } from "antd";
import {
    TrophyOutlined, InboxOutlined,
    ArrowUpOutlined, ArrowDownOutlined, MinusOutlined, EyeOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../../store";
import {
    fetchAvailableResults, fetchPerformanceSummary,
    selectAvailableResults, selectPerformanceSummary, selectEvaluationResultLoading,
} from "../../../../store/evaluationResultSlide";
import { selectInfoLogin } from "../../../../store/authSlide";
import URL from "../../../../constants/url";
import MobilePageWrapper from "../../components/MobilePageWrapper";
import MobileCard from "../../components/MobileCard";

const ratingColor = (r?: number) => {
    if (!r) return "text-gray-400";
    if (r >= 4.5) return "text-green-600";
    if (r >= 3.5) return "text-blue-600";
    if (r >= 2.5) return "text-yellow-600";
    return "text-red-500";
};

const TrendIcon = ({ dir }: { dir?: string }) => {
    if (dir === "Up")   return <ArrowUpOutlined   className="text-green-500" />;
    if (dir === "Down") return <ArrowDownOutlined  className="text-red-500"  />;
    return <MinusOutlined className="text-gray-400" />;
};

const MobileEvaluationResults = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const results = useAppSelector(selectAvailableResults);
    const summary = useAppSelector(selectPerformanceSummary);
    const loading = useAppSelector(selectEvaluationResultLoading);
    const infoLogin = useAppSelector(selectInfoLogin);
    const employeeId = infoLogin?.employeeId ?? (
        infoLogin?.userId && !isNaN(Number(infoLogin.userId)) ? Number(infoLogin.userId) : undefined
    );

    useEffect(() => {
        if (employeeId) {
            dispatch(fetchAvailableResults(Number(employeeId)));
            dispatch(fetchPerformanceSummary(Number(employeeId)));
        }
    }, [dispatch, employeeId]);

    return (
        <MobilePageWrapper title="Kết quả đánh giá">
            {/* ── Summary card ── */}
            {loading && !summary ? (
                <Skeleton active paragraph={{ rows: 3 }} className="mb-4" />
            ) : summary ? (
                <MobileCard className="mb-4 bg-gradient-to-br from-indigo-600 to-indigo-700 text-white">
                    <div className="flex items-center gap-2 mb-3">
                        <TrophyOutlined className="text-yellow-300 text-lg" />
                        <p className="text-indigo-200 text-xs font-medium">Tổng quan hiệu suất</p>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <p className="text-indigo-200 text-xs mb-0.5">Điểm hiện tại</p>
                            <p className={`text-xl font-bold ${summary.currentOverallRating ? "text-white" : "text-indigo-300"}`}>
                                {summary.currentOverallRating?.toFixed(1) ?? "—"}
                            </p>
                        </div>
                        <div>
                            <p className="text-indigo-200 text-xs mb-0.5">Kỳ trước</p>
                            <p className="text-lg font-semibold text-indigo-200">
                                {summary.previousOverallRating?.toFixed(1) ?? "—"}
                            </p>
                        </div>
                        <div>
                            <p className="text-indigo-200 text-xs mb-0.5">Xu hướng</p>
                            <div className="flex items-center gap-1">
                                <TrendIcon dir={summary.trendDirection} />
                                {summary.change !== undefined && summary.change !== null && (
                                    <span className={`text-sm font-semibold ${summary.change > 0 ? "text-green-300" : summary.change < 0 ? "text-red-300" : "text-indigo-200"}`}>
                                        {summary.change > 0 ? "+" : ""}{summary.change.toFixed(1)}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-indigo-500">
                        <p className="text-indigo-200 text-xs">
                            Tổng số kỳ đánh giá: <span className="text-white font-semibold">{summary.totalEvaluations}</span>
                        </p>
                    </div>
                </MobileCard>
            ) : null}

            {/* ── Results list ── */}
            <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-gray-700">Lịch sử kết quả</h2>
                <span className="text-xs text-gray-400">{results.length} kỳ</span>
            </div>

            {loading && !results.length ? (
                [1, 2, 3].map(i => <Skeleton key={i} active paragraph={{ rows: 1 }} className="mb-2" />)
            ) : results.length === 0 ? (
                <MobileCard>
                    <div className="flex flex-col items-center py-8 text-gray-400">
                        <InboxOutlined style={{ fontSize: 40 }} />
                        <p className="mt-2 text-sm">Chưa có kết quả đánh giá nào</p>
                    </div>
                </MobileCard>
            ) : (
                <MobileCard className="overflow-hidden p-0">
                    {results.map((r) => (
                        <div
                            key={r.evaluationId}
                            className="flex items-center justify-between px-4 py-3 border-b border-gray-50 last:border-b-0 cursor-pointer active:bg-gray-50"
                            onClick={() => navigate(URL.ViewEvaluationResultDetail.replace(":id", r.evaluationId.toString()))}
                        >
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <p className="text-sm font-semibold text-gray-800 truncate">{r.cycleName}</p>
                                    {r.isNew && (
                                        <span className="flex-shrink-0 bg-blue-100 text-blue-600 text-xs px-1.5 py-0.5 rounded-full font-medium">Mới</span>
                                    )}
                                </div>
                                <p className="text-xs text-gray-400">
                                    {dayjs(r.evaluationPeriodStart).format("DD/MM/YYYY")} → {dayjs(r.evaluationPeriodEnd).format("DD/MM/YYYY")}
                                </p>
                            </div>
                            <div className="flex flex-col items-end gap-1 ml-3 flex-shrink-0">
                                {r.overallRating !== undefined && r.overallRating !== null ? (
                                    <span className={`text-lg font-bold ${ratingColor(r.overallRating)}`}>
                                        {r.overallRating.toFixed(1)}
                                    </span>
                                ) : (
                                    <EyeOutlined className="text-gray-300 text-base" />
                                )}
                                <Tag
                                    color={["Completed", "Acknowledged"].includes(r.status) ? "green" : "orange"}
                                    className="text-xs m-0"
                                >
                                    {r.status === "Completed" ? "Hoàn thành" : r.status === "Acknowledged" ? "Đã xác nhận" : r.status}
                                </Tag>
                            </div>
                        </div>
                    ))}
                </MobileCard>
            )}
        </MobilePageWrapper>
    );
};

export default MobileEvaluationResults;
