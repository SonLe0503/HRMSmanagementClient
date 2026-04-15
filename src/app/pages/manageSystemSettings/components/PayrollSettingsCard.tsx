import React from "react";
import { Card, Form, InputNumber, Button, Typography, Alert } from "antd";
import { SaveOutlined, ReloadOutlined, CalendarOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

interface Props {
    form: any;
    loading: boolean;
    onFinish: (values: any) => void;
    onRefresh: () => void;
}

const PayrollSettingsCard: React.FC<Props> = ({ form, loading, onFinish, onRefresh }) => {
    return (
        <Card className="shadow-sm rounded-2xl border border-slate-100">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                    <CalendarOutlined className="text-indigo-600 text-lg" />
                </div>
                <div>
                    <Title level={4} style={{ margin: 0 }}>Ngày chốt lương</Title>
                    <Text type="secondary" style={{ fontSize: 13 }}>
                        Cấu hình ngày bắt đầu kỳ tính lương hàng tháng
                    </Text>
                </div>
            </div>

            <Alert
                type="info"
                showIcon
                className="mb-6"
                message="Cách tính kỳ lương"
                description={
                    <div className="text-sm mt-1">
                        <p>Nếu ngày chốt = <strong>5</strong>, các kỳ lương sẽ là:</p>
                        <ul className="list-disc ml-4 mt-1 space-y-1">
                            <li>Kỳ tháng 1: <strong>05/01 → 04/02</strong></li>
                            <li>Kỳ tháng 2: <strong>05/02 → 04/03</strong></li>
                            <li>Kỳ tháng 3: <strong>05/03 → 04/04</strong></li>
                            <li>... và tiếp tục theo quy tắc tương tự</li>
                        </ul>
                    </div>
                }
            />

            <Form form={form} layout="vertical" onFinish={onFinish}>
                <Form.Item
                    name="payrollCutOffDay"
                    label="Ngày chốt lương (1 - 28)"
                    rules={[
                        { required: true, message: "Vui lòng nhập ngày chốt lương" },
                        { type: "number", min: 1, max: 28, message: "Ngày chốt phải từ 1 đến 28" }
                    ]}
                    extra="Giới hạn đến ngày 28 để tránh lỗi với tháng 2"
                >
                    <InputNumber
                        min={1}
                        max={28}
                        style={{ width: 180 }}
                        size="large"
                        addonBefore={<CalendarOutlined />}
                        addonAfter="hàng tháng"
                    />
                </Form.Item>

                <div className="flex gap-2 mt-2">
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                        icon={<SaveOutlined />}
                    >
                        Lưu cấu hình
                    </Button>
                    <Button icon={<ReloadOutlined />} onClick={onRefresh}>
                        Làm mới
                    </Button>
                </div>
            </Form>
        </Card>
    );
};

export default PayrollSettingsCard;
