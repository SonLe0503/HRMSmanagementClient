import React, { useEffect, useState } from "react";
import { Card, Form, InputNumber, Button, Typography, message, Space, Divider, Row, Col, Alert } from "antd";
import { EnvironmentOutlined, SaveOutlined, ReloadOutlined, AimOutlined } from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "../../../store";
import { fetchLocationSettings, selectLocationSettings, selectSystemSettingLoading, updateLocationSettings } from "../../../store/systemSettingSlide";

const { Title, Text, Paragraph } = Typography;

const SystemSettingPage: React.FC = () => {
    const [form] = Form.useForm();
    const dispatch = useAppDispatch();
    const locationSettings = useAppSelector(selectLocationSettings);
    const loading = useAppSelector(selectSystemSettingLoading);
    const [detecting, setDetecting] = useState(false);

    useEffect(() => {
        dispatch(fetchLocationSettings());
    }, [dispatch]);

    useEffect(() => {
        if (locationSettings) {
            form.setFieldsValue(locationSettings);
        }
    }, [locationSettings, form]);

    const onFinish = async (values: any) => {
        try {
            await dispatch(updateLocationSettings(values)).unwrap();
            message.success("Cập nhật cấu hình vị trí thành công");
            dispatch(fetchLocationSettings());
        } catch (error: any) {
            message.error(error || "Lỗi cập nhật cấu hình");
        }
    };

    const handleGetCurrentLocation = () => {
        if (!navigator.geolocation) {
            message.error("Trình duyệt của bạn không hỗ trợ Geolocation");
            return;
        }

        setDetecting(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                form.setFieldsValue({
                    officeLatitude: position.coords.latitude,
                    officeLongitude: position.coords.longitude
                });
                setDetecting(false);
                message.info("Đã cập nhật toạ độ hiện tại vào form. Nhấn lưu để áp dụng.");
            },
            (error) => {
                setDetecting(false);
                message.error("Không thể lấy vị trí: " + error.message);
            }
        );
    };

    return (
        <div className="p-6">
            <div className="mb-6">
                <Title level={2}>Cấu hình Hệ thống</Title>
                <Paragraph type="secondary">
                    Quản lý các tham số vận hành của hệ thống HR Management.
                </Paragraph>
            </div>

            <Row gutter={[24, 24]}>
                <Col xs={24} lg={16}>
                    <Card 
                        title={<Space><EnvironmentOutlined /><span>Cấu hình Vị trí Văn phòng</span></Space>}
                        extra={
                            <Button 
                                icon={<ReloadOutlined />} 
                                onClick={() => dispatch(fetchLocationSettings())}
                                loading={loading}
                            >
                                Làm mới
                            </Button>
                        }
                    >
                        <Alert 
                            message="Lưu ý quan trọng"
                            description="Tọa độ này sẽ được dùng để xác minh vị trí khi nhân viên thực hiện Check-in/Check-out. Nhân viên phải nằm trong bán kính cho phép so với tọa độ này mới có thể điểm danh thành công."
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
                                    Lưu cấu hình
                                </Button>
                                <Button 
                                    icon={<AimOutlined />} 
                                    onClick={handleGetCurrentLocation}
                                    loading={detecting}
                                >
                                    Lấy toạ độ tại đây
                                </Button>
                            </Space>
                        </Form>
                    </Card>
                </Col>
                
                <Col xs={24} lg={8}>
                    <Card title="Hướng dẫn">
                        <Text strong>Làm sao để lấy tọa độ?</Text>
                        <ul className="mt-2 text-gray-600">
                            <li>Cách 1: Bạn có thể nhấn nút "Lấy toạ độ tại đây" nếu bạn đang ngồi tại văn phòng.</li>
                            <li>Cách 2: Truy cập Google Maps, chuột phải vào vị trí văn phòng và copy cặp toạ độ.</li>
                        </ul>
                        <Divider />
                        <Text strong>Bán kính gợi ý:</Text>
                        <Paragraph className="mt-2 text-gray-600">
                            - 50m đến 100m: Khuyên dùng cho văn phòng đơn lẻ.<br/>
                            - 200m+: Cho các khu công nghiệp hoặc công trình rộng lớn.
                        </Paragraph>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default SystemSettingPage;
