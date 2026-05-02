import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Form, Input, Button, Rate, Alert, Skeleton, Tag, message } from "antd";
import { ArrowLeftOutlined, LockOutlined, ClockCircleOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useAppDispatch, useAppSelector } from "../../../../store";
import {
    fetchEvaluationDetail, selectEvaluationDetail, selectSubmitEvaluationLoading,
    submitSelfEvaluation, submitManagerEvaluation, saveEvaluationDraft,
} from "../../../../store/submitEvaluationSlide";
import MobileCard from "../../components/MobileCard";

const { TextArea } = Input;

const STATUS_MAP: Record<string, { label: string; color: string }> = {
    "Not Started":        { label: "Chưa bắt đầu",    color: "default" },
    "Self Evaluation":    { label: "Tự đánh giá",      color: "blue"    },
    "Manager Evaluation": { label: "QL đánh giá",      color: "orange"  },
    "Under Review":       { label: "Đang xem xét",     color: "purple"  },
    "Completed":          { label: "Hoàn thành",       color: "green"   },
    "Acknowledged":       { label: "Đã xác nhận",      color: "green"   },
};

const MobileSubmitEvaluation = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const evaluation = useAppSelector(selectEvaluationDetail);
    const loading = useAppSelector(selectSubmitEvaluationLoading);
    const currentUser = Number(
        useAppSelector((state: any) => state.auth.infoLogin?.employeeId || state.auth.infoLogin?.userId)
    );
    const [form] = Form.useForm();

    useEffect(() => {
        if (id) dispatch(fetchEvaluationDetail(Number(id)));
    }, [id, dispatch]);

    useEffect(() => {
        if (!evaluation) return;
        const vals: any = {};
        evaluation.ratings.forEach((r: any) => {
            vals[`selfRating_${r.criteriaId}`]     = r.selfRating     || 0;
            vals[`selfComments_${r.criteriaId}`]   = r.selfComments   || "";
            vals[`managerRating_${r.criteriaId}`]  = r.managerRating  || 0;
            vals[`managerComments_${r.criteriaId}`]= r.managerComments|| "";
            vals[`evidence_${r.criteriaId}`]       = r.evidence       || "";
        });
        vals.overallRating = evaluation.overallRating || 0;
        form.setFieldsValue(vals);
    }, [evaluation, form]);

    if (loading && !evaluation) {
        return (
            <div className="flex flex-col min-h-full">
                <div className="flex items-center gap-3 mb-4">
                    <button className="w-9 h-9 flex items-center justify-center rounded-xl bg-white" onClick={() => navigate(-1)}>
                        <ArrowLeftOutlined />
                    </button>
                    <h1 className="text-base font-bold text-gray-800">Đánh giá hiệu suất</h1>
                </div>
                {[1, 2, 3].map(i => <Skeleton key={i} active paragraph={{ rows: 3 }} className="mb-3" />)}
            </div>
        );
    }

    if (!evaluation) return null;

    const isSelf = currentUser === evaluation.employeeId;
    const isMgr  = currentUser === evaluation.primaryEvaluatorId || currentUser === evaluation.secondaryEvaluatorId;

    if (!isSelf && !isMgr) {
        return (
            <div className="flex flex-col min-h-full">
                <div className="flex items-center gap-3 mb-4">
                    <button className="w-9 h-9 flex items-center justify-center rounded-xl bg-white" onClick={() => navigate(-1)}>
                        <ArrowLeftOutlined />
                    </button>
                    <h1 className="text-base font-bold text-gray-800">Đánh giá hiệu suất</h1>
                </div>
                <MobileCard>
                    <p className="text-sm text-red-500 text-center py-8">
                        Bạn không có quyền truy cập phiếu đánh giá này.
                    </p>
                </MobileCard>
            </div>
        );
    }

    const today = dayjs().format("YYYY-MM-DD");
    const selfStart = evaluation.selfEvaluationStart;
    const selfEnd   = evaluation.selfEvaluationEnd;
    const mgrStart  = evaluation.managerEvaluationStart;
    const mgrEnd    = evaluation.managerEvaluationEnd;

    const isSelfOpen = selfStart && selfEnd && today >= selfStart && today <= selfEnd;
    const isMgrOpen  = mgrStart  && mgrEnd  && today >= mgrStart  && today <= mgrEnd;

    const canEditSelf = !!(isSelf && isSelfOpen && ["Not Started", "Self Evaluation"].includes(evaluation.status));
    const canEditMgr  = !!(isMgr  && isMgrOpen  && ["Not Started", "Self Evaluation", "Manager Evaluation"].includes(evaluation.status));

    const getAlert = () => {
        if (isSelf && !isSelfOpen) {
            const before = today < (selfStart || "");
            return {
                type: before ? "warning" as const : "error" as const,
                message: before ? "Chưa đến giai đoạn tự đánh giá" : "Đã hết hạn tự đánh giá",
                description: before
                    ? `Bắt đầu từ ${dayjs(selfStart).format("DD/MM/YYYY")}`
                    : `Đã kết thúc vào ${dayjs(selfEnd).format("DD/MM/YYYY")}`,
            };
        }
        if (isMgr && !isMgrOpen) {
            const before = today < (mgrStart || "");
            return {
                type: before ? "warning" as const : "error" as const,
                message: before ? "Chưa đến giai đoạn quản lý đánh giá" : "Đã hết hạn quản lý đánh giá",
                description: before
                    ? `Bắt đầu từ ${dayjs(mgrStart).format("DD/MM/YYYY")}`
                    : `Đã kết thúc vào ${dayjs(mgrEnd).format("DD/MM/YYYY")}`,
            };
        }
        return null;
    };
    const alert = getAlert();

    const handleValuesChange = (_: any, all: any) => {
        if (!isMgr || !canEditMgr) return;
        let total = 0;
        evaluation.ratings.forEach((r: any) => {
            total += (all[`managerRating_${r.criteriaId}`] || 0) * ((r.weightage || 0) / 100);
        });
        form.setFieldsValue({ overallRating: Number(total.toFixed(1)) });
    };

    const handleFinish = (values: any) => {
        const ratings = evaluation.ratings.map((r: any) => ({
            criteriaId:      r.criteriaId,
            selfRating:      values[`selfRating_${r.criteriaId}`]     || 0,
            selfComments:    values[`selfComments_${r.criteriaId}`]   || "",
            managerRating:   values[`managerRating_${r.criteriaId}`]  || 0,
            managerComments: values[`managerComments_${r.criteriaId}`]|| "",
            evidence:        values[`evidence_${r.criteriaId}`]       || "",
        }));
        if (isSelf && canEditSelf) {
            dispatch(submitSelfEvaluation({ evaluationId: Number(id), ratings }))
                .unwrap()
                .then(() => { message.success("Đã nộp bài tự đánh giá!"); navigate(-1); })
                .catch((e: any) => message.error(e?.message || "Lỗi khi nộp"));
        } else if (isMgr && canEditMgr) {
            dispatch(submitManagerEvaluation({ evaluationId: Number(id), ratings, overallRating: values.overallRating }))
                .unwrap()
                .then(() => { message.success("Đã nộp đánh giá!"); navigate(-1); })
                .catch((e: any) => message.error(e?.message || "Lỗi khi nộp"));
        }
    };

    const handleDraft = () => {
        const values = form.getFieldsValue();
        const ratings = evaluation.ratings.map((r: any) => ({
            criteriaId:      r.criteriaId,
            managerRating:   values[`managerRating_${r.criteriaId}`]  || 0,
            managerComments: values[`managerComments_${r.criteriaId}`]|| "",
            evidence:        values[`evidence_${r.criteriaId}`]       || "",
        }));
        dispatch(saveEvaluationDraft({ evaluationId: Number(id), ratings }))
            .unwrap()
            .then(() => message.success("Đã lưu bản nháp!"))
            .catch((e: any) => message.error(e?.message || "Lỗi lưu nháp"));
    };

    const sc = STATUS_MAP[evaluation.status] ?? { label: evaluation.status, color: "default" };
    const hasAction = canEditSelf || canEditMgr;

    return (
        <div className="flex flex-col min-h-full" style={{ paddingBottom: hasAction ? "calc(80px + 64px + env(safe-area-inset-bottom, 0px))" : undefined }}>
            {/* Back header */}
            <div className="flex items-center gap-3 mb-4">
                <button
                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-white text-gray-600 active:bg-gray-100 flex-shrink-0"
                    onClick={() => navigate(-1)}
                >
                    <ArrowLeftOutlined />
                </button>
                <h1 className="text-base font-bold text-gray-800 flex-1 truncate">
                    {isSelf ? "Tự đánh giá" : "Đánh giá nhân viên"}
                </h1>
                <Tag color={sc.color} className="m-0 flex-shrink-0">{sc.label}</Tag>
            </div>

            {/* Info card */}
            <MobileCard className="mb-3">
                <p className="text-sm font-semibold text-gray-800 mb-1">{evaluation.employeeName}</p>
                <p className="text-xs text-gray-400 mb-3">{evaluation.cycleName} · {evaluation.employeeDepartment}</p>
                <div className="flex gap-2 flex-wrap">
                    <Tag
                        icon={isSelfOpen ? <ClockCircleOutlined /> : <LockOutlined />}
                        color={isSelfOpen ? "green" : "default"}
                        className="text-xs m-0"
                    >
                        Tự ĐG: {dayjs(selfStart).format("DD/MM")} → {dayjs(selfEnd).format("DD/MM")}
                    </Tag>
                    <Tag
                        icon={isMgrOpen ? <ClockCircleOutlined /> : <LockOutlined />}
                        color={isMgrOpen ? "green" : "default"}
                        className="text-xs m-0"
                    >
                        QL: {dayjs(mgrStart).format("DD/MM")} → {dayjs(mgrEnd).format("DD/MM")}
                    </Tag>
                </div>
            </MobileCard>

            {/* Time-gate alert */}
            {alert && (
                <Alert
                    type={alert.type}
                    message={alert.message}
                    description={alert.description}
                    showIcon
                    className="mb-3 rounded-xl"
                />
            )}

            {/* Criteria form */}
            <Form form={form} layout="vertical" onFinish={handleFinish} onValuesChange={handleValuesChange}>
                {evaluation.ratings.map((r: any, idx: number) => (
                    <MobileCard key={r.criteriaId} className="mb-3">
                        <div className="flex items-start justify-between mb-3">
                            <p className="text-sm font-semibold text-gray-800 flex-1 pr-2">
                                {idx + 1}. {r.criteriaName}
                            </p>
                            <span className="text-xs text-gray-400 flex-shrink-0">
                                Trọng số: <b className="text-gray-700">{r.weightage}%</b>
                            </span>
                        </div>

                        {/* Self evaluation */}
                        <div className={isMgr ? "mb-4 pb-4 border-b border-gray-100" : ""}>
                            <p className="text-xs font-semibold text-blue-600 mb-2">Tự đánh giá</p>
                            <Form.Item name={`selfRating_${r.criteriaId}`} label="Điểm (1–5)" className="mb-2">
                                <Rate disabled={!canEditSelf} />
                            </Form.Item>
                            {(canEditSelf || r.selfComments) && (
                                <Form.Item name={`selfComments_${r.criteriaId}`} label="Nhận xét" className="mb-0">
                                    <TextArea
                                        disabled={!canEditSelf}
                                        rows={2}
                                        placeholder={canEditSelf ? "Nhập nhận xét tự đánh giá..." : "—"}
                                    />
                                </Form.Item>
                            )}
                        </div>

                        {/* Manager evaluation */}
                        {isMgr && (
                            <div className="mb-3">
                                <p className="text-xs font-semibold text-pink-600 mb-2">Quản lý đánh giá</p>
                                <Form.Item name={`managerRating_${r.criteriaId}`} label="Điểm (1–5)" className="mb-2">
                                    <Rate disabled={!canEditMgr} />
                                </Form.Item>
                                <Form.Item name={`managerComments_${r.criteriaId}`} label="Nhận xét" className="mb-0">
                                    <TextArea
                                        disabled={!canEditMgr}
                                        rows={2}
                                        placeholder={canEditMgr ? "Nhập đánh giá của quản lý..." : "—"}
                                    />
                                </Form.Item>
                            </div>
                        )}

                        {/* Evidence */}
                        {(canEditSelf || canEditMgr) && (
                            <Form.Item name={`evidence_${r.criteriaId}`} label="Minh chứng" className="mb-0">
                                <Input placeholder="Link Jira, GitHub, Google Drive..." />
                            </Form.Item>
                        )}
                    </MobileCard>
                ))}

                {/* Overall rating — manager only */}
                {isMgr && (
                    <MobileCard className="mb-3 bg-gray-50">
                        <p className="text-sm font-semibold text-gray-800 mb-3">Điểm tổng kết</p>
                        <Form.Item
                            name="overallRating"
                            label="Điểm tổng (tự tính theo trọng số)"
                            rules={[{ required: canEditMgr, message: "Điểm tổng là bắt buộc!" }]}
                            className="mb-0"
                        >
                            <Rate allowHalf disabled={!canEditMgr} />
                        </Form.Item>
                    </MobileCard>
                )}
            </Form>

            {/* Fixed action bar */}
            {hasAction && (
                <div
                    className="fixed left-0 right-0 bg-white border-t border-gray-100 px-4 py-3 z-40 flex gap-3"
                    style={{ bottom: "calc(64px + env(safe-area-inset-bottom, 0px))" }}
                >
                    {isMgr && canEditMgr && (
                        <Button
                            block
                            size="large"
                            loading={loading}
                            className="h-11 rounded-xl"
                            onClick={handleDraft}
                        >
                            Lưu nháp
                        </Button>
                    )}
                    <Button
                        type="primary"
                        block
                        size="large"
                        loading={loading}
                        className="h-11 rounded-xl"
                        onClick={() => form.submit()}
                    >
                        Nộp đánh giá
                    </Button>
                </div>
            )}
        </div>
    );
};

export default MobileSubmitEvaluation;
