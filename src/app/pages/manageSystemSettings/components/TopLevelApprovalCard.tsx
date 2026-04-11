import React from "react";
import { Card, Form, Button, Select, Space, Alert } from "antd";
import { ReloadOutlined, SaveOutlined, SafetyCertificateOutlined } from "@ant-design/icons";

const { Option } = Select;

interface TopLevelApprovalCardProps {
    form: any;
    users: any[];
    loading: boolean;
    onFinish: (values: any) => Promise<void>;
    onRefresh: () => void;
}

const TopLevelApprovalCard: React.FC<TopLevelApprovalCardProps> = ({
    form, users, loading, onFinish, onRefresh
}) => {
    return (
        <Card
            title={<Space><SafetyCertificateOutlined /><span>Dự phòng Phê duyệt (Cấp quản lý)</span></Space>}
            extra={
                <Button
                    icon={<ReloadOutlined />}
                    onClick={onRefresh}
                    loading={loading}
                >
                    Làm mới
                </Button>
            }
        >
            <Alert
                description="Dùng cho nhân sự quản lý cấp cao nhất (CEO, Manager không có sếp trực tiếp)."
                type="info"
                showIcon
                className="mb-6"
            />

            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
            >
                <Form.Item
                    label="Người duyệt dự phòng cho cấp cao nhất (Top-Level Fallback)"
                    name="topLevelFallbackUserId"
                    tooltip="Chọn người sẽ phê duyệt cho các nhân sự thuộc vị trí Top-level."
                    rules={[{ required: true, message: 'Vui lòng chọn người duyệt' }]}
                >
                    <Select
                        showSearch
                        placeholder="Chọn một tài khoản người dùng"
                        optionFilterProp="children"
                        allowClear
                    >
                        {users.filter(u => u.isActive).map(user => (
                            <Option key={user.userId} value={user.userId}>
                                {user.username} ({user.email})
                            </Option>
                        ))}
                    </Select>
                </Form.Item>

                <div className="mt-4">
                    <Button
                        type="primary"
                        htmlType="submit"
                        icon={<SaveOutlined />}
                        loading={loading}
                    >
                        Lưu cấu hình Top-level
                    </Button>
                </div>
            </Form>
        </Card>
    );
};

export default TopLevelApprovalCard;
