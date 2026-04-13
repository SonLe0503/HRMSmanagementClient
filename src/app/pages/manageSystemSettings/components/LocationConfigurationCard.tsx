import React from "react";
import { Card, Form, Button, InputNumber, Space, Alert, Row, Col, Divider } from "antd";
import { ReloadOutlined, SaveOutlined, EnvironmentOutlined, AimOutlined } from "@ant-design/icons";

interface LocationConfigurationCardProps {
    form: any;
    loading: boolean;
    detecting: boolean;
    onFinish: (values: any) => Promise<void>;
    onRefresh: () => void;
    onDetect: () => void;
}

const LocationConfigurationCard: React.FC<LocationConfigurationCardProps> = ({
    form, loading, detecting, onFinish, onRefresh, onDetect
}) => {
    return (
        <Card
            title={<Space><EnvironmentOutlined /><span>Cấu hình Vị trí Văn phòng</span></Space>}
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
                title="Lưu ý về điểm danh"
                description="Tọa độ này sẽ được dùng để xác minh vị trí khi nhân viên thực hiện Check-in/Check-out. Nhân viên phải nằm trong bán kính cho phép mới có thể điểm danh."
                type="info"
                showIcon
                className="mb-6"
            />

            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                initialValues={{
                    officeLatitude: 0,
                    officeLongitude: 0,
                    attendanceAllowedRadius: 50
                }}
            >
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            label="Vĩ độ (Latitude)"
                            name="officeLatitude"
                            rules={[{ required: true, message: 'Vui lòng nhập vĩ độ' }]}
                        >
                            <InputNumber style={{ width: '100%' }} precision={15} step={0.000001} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label="Kinh độ (Longitude)"
                            name="officeLongitude"
                            rules={[{ required: true, message: 'Vui lòng nhập kinh độ' }]}
                        >
                            <InputNumber style={{ width: '100%' }} precision={15} step={0.000001} />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item
                    label="Bán kính cho phép (Mét)"
                    name="attendanceAllowedRadius"
                    tooltip="Nhân viên phải đứng trong vòng tròn có bán kính này để được phép điểm danh."
                    rules={[{ required: true, message: 'Vui lòng nhập bán kính' }]}
                >
                    <InputNumber style={{ width: '100%' }} min={1} max={10000} />
                </Form.Item>

                <Divider />

                <Space>
                    <Button
                        type="primary"
                        htmlType="submit"
                        icon={<SaveOutlined />}
                        loading={loading}
                    >
                        Lưu cấu hình vị trí
                    </Button>
                    <Button
                        icon={<AimOutlined />}
                        onClick={onDetect}
                        loading={detecting}
                    >
                        Lấy toạ độ tại đây
                    </Button>
                </Space>
            </Form>
        </Card>
    );
};

export default LocationConfigurationCard;
