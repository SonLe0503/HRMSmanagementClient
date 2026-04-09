import { useState } from "react";
import { Modal, Form, Input, Select, Upload, message, Switch, Row, Col, Typography, Alert } from "antd";
import { InboxOutlined, FileTextOutlined, FilePdfOutlined, FileImageOutlined, FileWordOutlined } from "@ant-design/icons";
import type { UploadFile, UploadProps } from "antd";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { uploadEmployeeDocument, fetchDocumentsByEmployee, selectDocumentUploading } from "../../../../store/employeeDocumentSlide";

const { Dragger } = Upload;
const { Text } = Typography;

const CATEGORY_OPTIONS = [
    { label: "Hợp đồng lao động", value: "Contract" },
    { label: "CCCD / Hộ chiếu", value: "ID" },
    { label: "Bằng cấp / Chứng chỉ", value: "Certificate" },
    { label: "Bảo hiểm", value: "Insurance" },
    { label: "Đánh giá năng lực", value: "Performance" },
    { label: "Khác", value: "Other" },
];

const ALLOWED_TYPES = [".pdf", ".jpg", ".jpeg", ".png", ".docx"];
const MAX_SIZE_MB = 10;

const getFileIcon = (name: string) => {
    const ext = name.split(".").pop()?.toLowerCase();
    if (ext === "pdf") return <FilePdfOutlined style={{ color: "#ff4d4f", fontSize: 20 }} />;
    if (ext === "docx" || ext === "doc") return <FileWordOutlined style={{ color: "#1890ff", fontSize: 20 }} />;
    if (["jpg", "jpeg", "png"].includes(ext ?? "")) return <FileImageOutlined style={{ color: "#52c41a", fontSize: 20 }} />;
    return <FileTextOutlined style={{ fontSize: 20 }} />;
};

interface UploadDocumentModalProps {
    open: boolean;
    employeeId: number;
    onCancel: () => void;
    onSuccess: () => void;
}

const UploadDocumentModal = ({ open, employeeId, onCancel, onSuccess }: UploadDocumentModalProps) => {
    const [form] = Form.useForm();
    const dispatch = useAppDispatch();
    const uploading = useAppSelector(selectDocumentUploading);
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [fileError, setFileError] = useState<string | null>(null);

    const validateFile = (file: File): string | null => {
        const ext = "." + file.name.split(".").pop()?.toLowerCase();
        if (!ALLOWED_TYPES.includes(ext)) {
            return `Định dạng không hỗ trợ: ${ext}. Chỉ chấp nhận: ${ALLOWED_TYPES.join(", ")}`;
        }
        if (file.size > MAX_SIZE_MB * 1024 * 1024) {
            return `File quá lớn (${(file.size / 1024 / 1024).toFixed(1)} MB). Giới hạn ${MAX_SIZE_MB} MB.`;
        }
        return null;
    };

    const uploadProps: UploadProps = {
        name: "file",
        multiple: false,
        fileList,
        beforeUpload: (file) => {
            const error = validateFile(file);
            if (error) {
                setFileError(error);
                return Upload.LIST_IGNORE;
            }
            setFileError(null);
            setFileList([{ uid: file.uid, name: file.name, status: "done", originFileObj: file as any }]);
            return false; // prevent auto-upload
        },
        onRemove: () => {
            setFileList([]);
            setFileError(null);
        },
        itemRender: (_, file) => (
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0" }}>
                {getFileIcon(file.name)}
                <span style={{ flex: 1 }}>{file.name}</span>
                <Text type="secondary" style={{ fontSize: 12 }}>
                    {file.originFileObj ? `${(file.originFileObj.size / 1024).toFixed(1)} KB` : ""}
                </Text>
            </div>
        ),
    };

    const onFinish = async (values: any) => {
        if (fileList.length === 0) {
            message.error("Vui lòng chọn file để tải lên!");
            return;
        }
        const originFile = fileList[0].originFileObj as File;
        const formData = new FormData();
        formData.append("file", originFile);
        formData.append("EmployeeId", String(employeeId));
        formData.append("DocumentTitle", values.documentTitle);
        formData.append("DocumentCategory", values.documentCategory);
        formData.append("IsConfidential", String(values.isConfidential ?? false));

        dispatch(uploadEmployeeDocument({ formData }))
            .unwrap()
            .then(() => {
                message.success("Tải lên tài liệu thành công!");
                form.resetFields();
                setFileList([]);
                setFileError(null);
                dispatch(fetchDocumentsByEmployee(employeeId));
                onSuccess();
            })
            .catch((err: any) => {
                message.error(typeof err === "string" ? err : err?.message || "Tải lên thất bại!");
            });
    };

    const handleCancel = () => {
        form.resetFields();
        setFileList([]);
        setFileError(null);
        onCancel();
    };

    return (
        <Modal
            title="Tải lên tài liệu"
            open={open}
            onCancel={handleCancel}
            onOk={() => form.submit()}
            okText="Tải lên"
            cancelText="Hủy"
            confirmLoading={uploading}
            width={600}
            destroyOnHidden
        >
            <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ isConfidential: false }}>
                {/* Drag-and-drop area */}
                <Form.Item label="Chọn file">
                    <Dragger {...uploadProps} style={{ borderRadius: 8 }}>
                        <p className="ant-upload-drag-icon">
                            <InboxOutlined style={{ fontSize: 40, color: "#1890ff" }} />
                        </p>
                        <p className="ant-upload-text" style={{ fontWeight: 600 }}>
                            Kéo thả file vào đây hoặc click để chọn
                        </p>
                        <p className="ant-upload-hint" style={{ color: "#8c8c8c" }}>
                            Hỗ trợ: PDF, JPG, PNG, DOCX &nbsp;|&nbsp; Tối đa {MAX_SIZE_MB} MB
                        </p>
                    </Dragger>
                    {fileError && (
                        <Alert
                            type="error"
                            message={fileError}
                            showIcon
                            style={{ marginTop: 8 }}
                            closable
                            onClose={() => setFileError(null)}
                        />
                    )}
                </Form.Item>

                <Row gutter={16}>
                    <Col span={24}>
                        <Form.Item
                            name="documentTitle"
                            label="Tiêu đề tài liệu"
                            rules={[{ required: true, message: "Vui lòng nhập tiêu đề!" }, { max: 200 }]}
                        >
                            <Input placeholder="VD: Hợp đồng lao động 2024" />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={16}>
                        <Form.Item
                            name="documentCategory"
                            label="Danh mục"
                            rules={[{ required: true, message: "Vui lòng chọn danh mục!" }]}
                        >
                            <Select options={CATEGORY_OPTIONS} placeholder="Chọn danh mục" />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="isConfidential" label="Bảo mật" valuePropName="checked">
                            <Switch checkedChildren="Có" unCheckedChildren="Không" />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Modal>
    );
};

export default UploadDocumentModal;
