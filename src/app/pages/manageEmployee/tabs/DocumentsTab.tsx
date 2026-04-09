import { useEffect, useState } from "react";
import {
    Table, Button, Tag, Space, Tooltip, Popconfirm, Empty,
    Typography, Select, Row, Col, Badge, message,
} from "antd";
import {
    UploadOutlined, EditOutlined, DeleteOutlined, DownloadOutlined,
    LockOutlined, FileTextOutlined, FilePdfOutlined, FileImageOutlined, FileWordOutlined,
    FilterOutlined,
} from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "../../../../store";
import {
    fetchDocumentsByEmployee,
    deleteEmployeeDocument,
    downloadEmployeeDocument,
    selectEmployeeDocuments,
    selectDocumentLoading,
} from "../../../../store/employeeDocumentSlide";
import type { IEmployeeDocumentList } from "../../../../store/employeeDocumentSlide";
import UploadDocumentModal from "./UploadDocumentModal";
import EditDocumentModal from "./EditDocumentModal";

const { Text } = Typography;

const CATEGORY_OPTIONS = [
    { label: "Tất cả", value: null },
    { label: "Hợp đồng lao động", value: "Contract" },
    { label: "CCCD / Hộ chiếu", value: "ID" },
    { label: "Bằng cấp / Chứng chỉ", value: "Certificate" },
    { label: "Bảo hiểm", value: "Insurance" },
    { label: "Đánh giá năng lực", value: "Performance" },
    { label: "Khác", value: "Other" },
];

const CATEGORY_COLOR: Record<string, string> = {
    Contract: "blue",
    ID: "purple",
    Certificate: "gold",
    Insurance: "cyan",
    Performance: "orange",
    Other: "default",
};

const getFileIcon = (type: string) => {
    const ext = type.toLowerCase().replace(".", "");
    if (ext === "pdf") return <FilePdfOutlined style={{ color: "#ff4d4f" }} />;
    if (ext === "docx" || ext === "doc") return <FileWordOutlined style={{ color: "#1890ff" }} />;
    if (["jpg", "jpeg", "png"].includes(ext)) return <FileImageOutlined style={{ color: "#52c41a" }} />;
    return <FileTextOutlined />;
};


interface DocumentsTabProps {
    employeeId: number;
    employeeName: string;
}

const DocumentsTab = ({ employeeId }: DocumentsTabProps) => {
    const dispatch = useAppDispatch();
    const documents = useAppSelector(selectEmployeeDocuments);
    const loading = useAppSelector(selectDocumentLoading);

    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingDoc, setEditingDoc] = useState<IEmployeeDocumentList | null>(null);
    const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

    useEffect(() => {
        dispatch(fetchDocumentsByEmployee(employeeId));
    }, [employeeId, dispatch]);

    const filteredDocs = categoryFilter
        ? documents.filter(d => d.documentCategory === categoryFilter)
        : documents;


    const handleDownload = async (id: number, fileName: string) => {
        const result = await dispatch(downloadEmployeeDocument(id));
        if (downloadEmployeeDocument.fulfilled.match(result)) {
            const { url } = result.payload;
            const link = document.createElement("a");
            link.href = url;
            link.download = fileName;
            link.click();
            window.URL.revokeObjectURL(url);
        } else {
            message.error("Không thể tải file!");
        }
    };

    const handleDelete = (id: number) => {
        dispatch(deleteEmployeeDocument(id))
            .unwrap()
            .then(() => {
                message.success("Xóa tài liệu thành công!");
            })
            .catch((err: any) => {
                message.error(typeof err === "string" ? err : "Xóa thất bại!");
            });
    };

    const handleEdit = (doc: IEmployeeDocumentList) => {
        setEditingDoc(doc);
        setIsEditOpen(true);
    };

    const formatDate = (d: string) =>
        new Date(d).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });

    const columns = [
        {
            title: "Tiêu đề",
            dataIndex: "documentTitle",
            key: "documentTitle",
            render: (title: string, record: IEmployeeDocumentList) => (
                <Space>
                    {getFileIcon(record.fileType)}
                    <span style={{ fontWeight: 500 }}>{title}</span>
                    {record.isConfidential && (
                        <Tooltip title="Tài liệu bảo mật">
                            <LockOutlined style={{ color: "#faad14" }} />
                        </Tooltip>
                    )}
                </Space>
            ),
        },
        {
            title: "Danh mục",
            dataIndex: "documentCategory",
            key: "documentCategory",
            width: 160,
            render: (cat: string) => (
                <Tag color={CATEGORY_COLOR[cat] ?? "default"}>
                    {CATEGORY_OPTIONS.find(o => o.value === cat)?.label ?? cat}
                </Tag>
            ),
        },
        {
            title: "File",
            dataIndex: "fileName",
            key: "fileName",
            width: 200,
            render: (name: string, record: IEmployeeDocumentList) => (
                <div>
                    <div style={{ fontSize: 13 }}>{name}</div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        {record.fileType.toUpperCase()} · {record.fileSizeFormatted}
                    </Text>
                </div>
            ),
        },
        {
            title: "Ngày tải",
            dataIndex: "uploadDate",
            key: "uploadDate",
            width: 120,
            render: (d: string) => formatDate(d),
        },
        {
            title: "Người tải",
            dataIndex: "uploadedByName",
            key: "uploadedByName",
            width: 120,
        },
        {
            title: "Thao tác",
            key: "action",
            width: 120,
            render: (_: any, record: IEmployeeDocumentList) => (
                <Space>
                    <Tooltip title="Tải về">
                        <Button
                            icon={<DownloadOutlined />}
                            onClick={() => handleDownload(record.employeeDocumentId, record.fileName)}
                        />
                    </Tooltip>
                    <Tooltip title="Chỉnh sửa">
                        <Button
                            type="primary"
                            icon={<EditOutlined />}
                            onClick={() => handleEdit(record)}
                        />
                    </Tooltip>
                    <Popconfirm
                        title="Xóa tài liệu?"
                        description="Hành động này không thể hoàn tác."
                        okText="Xóa"
                        cancelText="Hủy"
                        okButtonProps={{ danger: true }}
                        onConfirm={() => handleDelete(record.employeeDocumentId)}
                    >
                        <Tooltip title="Xóa">
                            <Button danger icon={<DeleteOutlined />} />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div>
            {/* Toolbar */}
            <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
                <Col>
                    <Space>
                        <FilterOutlined style={{ color: "#8c8c8c" }} />
                        <Select
                            style={{ width: 220 }}
                            placeholder="Lọc theo danh mục"
                            allowClear
                            value={categoryFilter}
                            onChange={v => setCategoryFilter(v)}
                            options={CATEGORY_OPTIONS.slice(1)}
                        />
                        {filteredDocs.length > 0 && (
                            <Badge count={filteredDocs.length} color="#1890ff" showZero>
                                <span style={{ fontSize: 13, color: "#8c8c8c" }}>tài liệu</span>
                            </Badge>
                        )}
                    </Space>
                </Col>
                <Col>
                    <Button
                        type="primary"
                        icon={<UploadOutlined />}
                        onClick={() => setIsUploadOpen(true)}
                    >
                        Tải lên tài liệu
                    </Button>
                </Col>
            </Row>

            {/* Table */}
            <Table
                columns={columns}
                dataSource={filteredDocs}
                rowKey={(record) => record.employeeDocumentId || (record as any).documentId || (record as any).id}
                loading={loading}
                size="middle"
                pagination={{ pageSize: 8, showSizeChanger: false }}
                locale={{
                    emptyText: (
                        <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description={
                                <span>
                                    Chưa có tài liệu nào cho nhân viên này.{" "}
                                    <a onClick={() => setIsUploadOpen(true)}>Tải lên ngay</a>
                                </span>
                            }
                        />
                    ),
                }}
            />

            {/* Modals */}
            <UploadDocumentModal
                open={isUploadOpen}
                employeeId={employeeId}
                onCancel={() => setIsUploadOpen(false)}
                onSuccess={() => setIsUploadOpen(false)}
            />

            <EditDocumentModal
                open={isEditOpen}
                document={editingDoc}
                onCancel={() => { setIsEditOpen(false); setEditingDoc(null); }}
                onSuccess={() => { setIsEditOpen(false); setEditingDoc(null); }}
            />
        </div>
    );
};

export default DocumentsTab;
