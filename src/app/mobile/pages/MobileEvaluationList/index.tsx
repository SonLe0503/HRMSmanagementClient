import { useEffect } from "react";
import { Tag, Skeleton } from "antd";
import { InboxOutlined, ArrowRightOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../../store";
import {
    fetchEvaluationsByEmployee,
    selectEvaluations,
    selectEvaluationLoading,
} from "../../../../store/evaluationSlide";
import { selectInfoLogin } from "../../../../store/authSlide";
import URL from "../../../../constants/url";
import MobilePageWrapper from "../../components/MobilePageWrapper";
import MobileCard from "../../components/MobileCard";

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
    "Not Started":          { label: "Chưa bắt đầu",     color: "default"        },
    "Self Evaluation":      { label: "Tự đánh giá",       color: "blue"           },
    "Manager Evaluation":   { label: "Quản lý đánh giá",  color: "orange"         },
    "Under Review":         { label: "Đang xem xét",      color: "purple"         },
    "Completed":            { label: "Hoàn thành",        color: "green"          },
    "Acknowledged":         { label: "Đã xác nhận",       color: "green"          },
};

const ACTION_STATUSES = ["Self Evaluation"];
const RESULT_STATUSES  = ["Completed", "Acknowledged"];

const MobileEvaluationList = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const evaluations = useAppSelector(selectEvaluations);
    const loading = useAppSelector(selectEvaluationLoading);
    const infoLogin = useAppSelector(selectInfoLogin);
    const employeeId = infoLogin?.employeeId;

    useEffect(() => {
        if (employeeId) {
            dispatch(fetchEvaluationsByEmployee(Number(employeeId)));
        }
    }, [dispatch, employeeId]);

    const handleTap = (ev: any) => {
        if (ACTION_STATUSES.includes(ev.status)) {
            navigate(URL.SubmitEvaluation.replace(":id", ev.evaluationId.toString()));
        } else if (RESULT_STATUSES.includes(ev.status)) {
            navigate(URL.ViewEvaluationResultDetail.replace(":id", ev.evaluationId.toString()));
        }
    };

    const isClickable = (status: string) =>
        ACTION_STATUSES.includes(status) || RESULT_STATUSES.includes(status);

    return (
        <MobilePageWrapper title="Đánh giá hiệu suất">
            <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-gray-700">Danh sách đánh giá</h2>
                <span className="text-xs text-gray-400">{evaluations.length} kỳ</span>
            </div>

            {loading && !evaluations.length ? (
                [1, 2, 3].map(i => <Skeleton key={i} active paragraph={{ rows: 1 }} className="mb-2" />)
            ) : evaluations.length === 0 ? (
                <MobileCard>
                    <div className="flex flex-col items-center py-8 text-gray-400">
                        <InboxOutlined style={{ fontSize: 40 }} />
                        <p className="mt-2 text-sm">Chưa có đánh giá nào</p>
                    </div>
                </MobileCard>
            ) : (
                <MobileCard className="overflow-hidden p-0">
                    {evaluations.map((ev: any) => {
                        const sc = STATUS_CONFIG[ev.status] ?? { label: ev.status, color: "default" };
                        const clickable = isClickable(ev.status);
                        return (
                            <div
                                key={ev.evaluationId}
                                className={`px-4 py-3 border-b border-gray-50 last:border-b-0 ${clickable ? "cursor-pointer active:bg-gray-50" : ""}`}
                                onClick={() => clickable && handleTap(ev)}
                            >
                                <div className="flex items-center justify-between gap-2 mb-1">
                                    <p className="text-sm font-semibold text-gray-800 flex-1 min-w-0 truncate">
                                        {ev.employeeName || `Đánh giá #${ev.evaluationId}`}
                                    </p>
                                    {clickable && <ArrowRightOutlined className="text-gray-300 text-xs flex-shrink-0" />}
                                </div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <Tag color={sc.color} className="text-xs m-0">{sc.label}</Tag>
                                    {ev.primaryEvaluatorName && (
                                        <span className="text-xs text-gray-400">
                                            Người đánh giá: {ev.primaryEvaluatorName}
                                        </span>
                                    )}
                                </div>
                                {ev.status === "Self Evaluation" && (
                                    <p className="text-xs text-blue-500 font-medium mt-1.5">
                                        Nhấn để thực hiện tự đánh giá →
                                    </p>
                                )}
                                {RESULT_STATUSES.includes(ev.status) && (
                                    <p className="text-xs text-green-600 font-medium mt-1.5">
                                        Nhấn để xem kết quả →
                                    </p>
                                )}
                            </div>
                        );
                    })}
                </MobileCard>
            )}
        </MobilePageWrapper>
    );
};

export default MobileEvaluationList;
