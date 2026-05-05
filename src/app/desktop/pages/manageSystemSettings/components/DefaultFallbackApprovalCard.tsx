import React from "react";
import { Card, Form, Button, Select, Space, Alert } from "antd";
import { ReloadOutlined, SaveOutlined, SafetyCertificateOutlined } from "@ant-design/icons";

const { Option } = Select;

interface DefaultFallbackApprovalCardProps {
    form: any;
    users: any[];
    loading: boolean;
    onFinish: (values: any) => Promise<void>;
    onRefresh: () => void;
}

const DefaultFallbackApprovalCard: React.FC<DefaultFallbackApprovalCardProps> = ({
    form, users, loading, onFinish, onRefresh
}) => {
    return (
        <Card
            title={<Space><SafetyCertificateOutlined /><span>Dự phòng Phê duyệt (Toàn cục)</span></Space>}
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
                description="Dùng cho các trường hợp nhân viên bình thường nhưng chưa được gán ManagerId."
                type="info"
                showIcon
                className="!mb-6"
            />

            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
            >
                <Form.Item
                    label="Người duyệt dự phòng mặc định (Global Default Fallback)"
                    name="defaultFallbackUserId"
                    tooltip="Chọn người sẽ phê duyệt cho bất kỳ nhân viên nào chưa có Manager trực tiếp."
                    rules={[{ required: true, message: 'Vui lòng chọn người duyệt mặc định' }]}
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
                        Lưu cấu hình mặc định
                    </Button>
                </div>
            </Form>
        </Card>
    );
};

export default DefaultFallbackApprovalCard;
