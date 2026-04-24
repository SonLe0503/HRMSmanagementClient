import { Modal, Form, Input, Space, AutoComplete, Tag, Typography, Divider } from "antd";
import {
    ExclamationCircleOutlined,
    BulbOutlined,
    CalendarOutlined,
    CloseCircleOutlined,
    SendOutlined,
} from "@ant-design/icons";
import { useMemo } from "react";
import type { FormInstance } from "antd";
import dayjs from "dayjs";
import type { AttendanceResponseDto } from "../../../../store/attendanceSlide";
import {
    SUGGESTIONS_INVALID_LOCATION,
    SUGGESTIONS_ABSENT,
    SUGGESTIONS_INCOMPLETE,
    CASE_CONFIG,
} from "../../../../constants/explanationTemplates";

const { Text, Title } = Typography;

interface ExplanationModalProps {
    open: boolean;
    loading: boolean;
    selectedRecord: AttendanceResponseDto | null;
    form: FormInstance;
    onOk: () => void;
    onCancel: () => void;
}

const ExplanationModal: React.FC<ExplanationModalProps> = ({
    open, loading, selectedRecord, form, onOk, onCancel
}) => {
    const isInvalidLocation = selectedRecord?.location?.includes("[INVALID]");
    const isAbsent = selectedRecord?.status === "Absent";

    const cfg = isInvalidLocation
        ? CASE_CONFIG.location
        : isAbsent
        ? CASE_CONFIG.absent
        : CASE_CONFIG.incomplete;

    const suggestions = isInvalidLocation
        ? SUGGESTIONS_INVALID_LOCATION
        : isAbsent
        ? SUGGESTIONS_ABSENT
        : SUGGESTIONS_INCOMPLETE;

    const messageValue: string = Form.useWatch("message", form) ?? "";

    const options = useMemo(() =>
        suggestions
            .filter(s => !messageValue.trim() || s.toLowerCase().includes(messageValue.toLowerCase()))
            .map(s => ({ value: s, label: s })),
        [suggestions, messageValue]
    );

    const isRejected = selectedRecord?.explanationStatus === "Rejected";

    return (
        <Modal
            title={
                <Space>
                    <ExclamationCircleOutlined style={{ color: "#fa8c16", fontSize: 16 }} />
                    <span style={{ fontWeight: 600 }}>Phiếu giải trình chấm công</span>
                </Space>
            }
            open={open}
            onOk={onOk}
            onCancel={onCancel}
            okText={<Space><SendOutlined />Gửi giải trình</Space>}
            cancelText="Hủy"
            confirmLoading={loading}
            okButtonProps={{ size: "middle" }}
            cancelButtonProps={{ size: "middle" }}
            destroyOnHidden
            width={540}
        >
            {/* ── Info banner ── */}
            {selectedRecord && (
                <div
                    style={{
                        background: cfg.bg,
                        border: `1px solid ${cfg.border}`,
                        borderRadius: 10,
                        padding: "12px 16px",
                        marginBottom: 16,
                        display: "flex",
                        gap: 12,
                        alignItems: "flex-start",
                    }}
                >
                    <span style={{ fontSize: 20, color: cfg.color, marginTop: 2 }}>{cfg.icon}</span>
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                            <Tag color={cfg.tagColor} style={{ margin: 0 }}>
                                {cfg.label}
                            </Tag>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                                <CalendarOutlined style={{ marginRight: 4 }} />
                                {dayjs(selectedRecord.attendanceDate).format("dddd, DD/MM/YYYY")}
                            </Text>
                        </div>
                        <Text type="secondary" style={{ fontSize: 12, marginTop: 4, display: "block" }}>
                            Giờ công ngày này đang bị tạm khóa chờ giải trình được phê duyệt.
                        </Text>
                    </div>
                </div>
            )}

            {/* ── Rejected banner ── */}
            {isRejected && selectedRecord?.explanationResponse && (
                <div
                    style={{
                        background: "#fff1f0",
                        border: "1px solid #ffa39e",
                        borderRadius: 10,
                        padding: "10px 14px",
                        marginBottom: 16,
                        display: "flex",
                        gap: 10,
                        alignItems: "flex-start",
                    }}
                >
                    <CloseCircleOutlined style={{ color: "#ff4d4f", fontSize: 16, marginTop: 2 }} />
                    <div>
                        <Text strong style={{ color: "#cf1322", fontSize: 13 }}>Phiếu bị từ chối</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            "{selectedRecord.explanationResponse}"
                        </Text>
                    </div>
                </div>
            )}

            <Divider style={{ margin: "0 0 16px" }} />

            {/* ── Suggestions header ── */}
            <div style={{ marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                <BulbOutlined style={{ color: "#faad14" }} />
                <Title level={5} style={{ margin: 0, fontSize: 13 }}>Lý do giải trình</Title>
                <Text type="secondary" style={{ fontSize: 11 }}>— nhập hoặc chọn gợi ý từ danh sách</Text>
            </div>

            {/* ── Form ── */}
            <Form form={form} layout="vertical" style={{ marginBottom: 20 }}>
                <Form.Item
                    name="message"
                    rules={[{ required: true, message: "Vui lòng nhập lý do giải trình!" }]}
                    style={{ marginBottom: 0 }}
                >
                    <AutoComplete
                        options={options}
                        style={{ width: "100%" }}
                        popupMatchSelectWidth
                    >
                        <Input.TextArea
                            rows={4}
                            placeholder="Nhập lý do hoặc gõ để lọc gợi ý từ danh sách..."
                            showCount
                            maxLength={500}
                            style={{ borderRadius: 8 }}
                        />
                    </AutoComplete>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default ExplanationModal;
