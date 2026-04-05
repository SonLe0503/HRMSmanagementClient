import React, { useEffect, useState } from "react";
import { Card, Form, InputNumber, Button, Typography, message, Space, Divider, Row, Col, Alert } from "antd";
import { EnvironmentOutlined, SaveOutlined, ReloadOutlined, AimOutlined, SafetyCertificateOutlined } from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "../../../store";
import { fetchLocationSettings, selectLocationSettings, selectSystemSettingLoading, updateLocationSettings, fetchApprovalSettings, selectApprovalSettings, updateApprovalSettings } from "../../../store/systemSettingSlide";
import { fetchAllUsers, selectUsers } from "../../../store/userSlide";
import { Select } from "antd";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const SystemSettingPage: React.FC = () => {
    const [locationForm] = Form.useForm();
    const [approvalForm] = Form.useForm();
    const dispatch = useAppDispatch();
    
    const locationSettings = useAppSelector(selectLocationSettings);
    const approvalSettings = useAppSelector(selectApprovalSettings);
    const users = useAppSelector(selectUsers);
    const loading = useAppSelector(selectSystemSettingLoading);
    
    const [detecting, setDetecting] = useState(false);

    useEffect(() => {
        dispatch(fetchLocationSettings());
        dispatch(fetchApprovalSettings());
        dispatch(fetchAllUsers());
    }, [dispatch]);

    useEffect(() => {
        if (locationSettings) {
            locationForm.setFieldsValue(locationSettings);
        }
    }, [locationSettings, locationForm]);

    useEffect(() => {
        if (approvalSettings) {
            approvalForm.setFieldsValue(approvalSettings);
        }
    }, [approvalSettings, approvalForm]);

    const onLocationFinish = async (values: any) => {
        try {
            await dispatch(updateLocationSettings(values)).unwrap();
            message.success("Cập nhật cấu hình vị trí thành công");
            dispatch(fetchLocationSettings());
        } catch (error: any) {
            message.error(error || "Lỗi cập nhật cấu hình vị trí");
        }
    };

    const onApprovalFinish = async (values: any) => {
        try {
            await dispatch(updateApprovalSettings(values)).unwrap();
            message.success("Cập nhật cấu hình phê duyệt thành công");
            dispatch(fetchApprovalSettings());
        } catch (error: any) {
            message.error(error || "Lỗi cập nhật cấu hình phê duyệt");
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
                locationForm.setFieldsValue({
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
                    <Space direction="vertical" size="large" style={{ width: '100%' }}>
                        {/* Approval Configuration */}
                        <Card 
                            title={<Space><SafetyCertificateOutlined /><span>Cấu hình Phê duyệt (Approval)</span></Space>}
                            extra={
                                <Button 
                                    icon={<ReloadOutlined />} 
                                    onClick={() => dispatch(fetchApprovalSettings())}
                                    loading={loading}
                                >
                                    Làm mới
                                </Button>
                            }
                        >
                            <Alert 
                                message="Thông báo về quy trình phê duyệt"
                                description="Thiết lập người phê duyệt dự phòng cho các cấp quản lý cao nhất (Top-level Management). Khi một nhân viên cấp cao nhất gửi yêu cầu, hệ thống sẽ gửi yêu cầu đó đến người được chỉ định dưới đây."
                                type="warning"
                                showIcon
                                className="mb-6"
                            />

                            <Form
                                form={approvalForm}
                                layout="vertical"
                                onFinish={onApprovalFinish}
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
                                    >
                                        {users.filter(u => u.isActive).map(user => (
                                            <Option key={user.userId} value={user.userId}>
                                                {user.username} ({user.email})
                                            </Option>
                                        ))}
                                    </Select>
                                </Form.Item>

                                <Button 
                                    type="primary" 
                                    htmlType="submit" 
                                    icon={<SaveOutlined />}
                                    loading={loading}
                                >
                                    Lưu cấu hình phê duyệt
                                </Button>
                            </Form>
                        </Card>

                        {/* Location Configuration */}
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
                                message="Lưu ý về điểm danh"
                                description="Tọa độ này sẽ được dùng để xác minh vị trí khi nhân viên thực hiện Check-in/Check-out. Nhân viên phải nằm trong bán kính cho phép mới có thể điểm danh."
                                type="info"
                                showIcon
                                className="mb-6"
                            />

                            <Form
                                form={locationForm}
                                layout="vertical"
                                onFinish={onLocationFinish}
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
                                        onClick={handleGetCurrentLocation}
                                        loading={detecting}
                                    >
                                        Lấy toạ độ tại đây
                                    </Button>
                                </Space>
                            </Form>
                        </Card>
                    </Space>
                </Col>
                
                <Col xs={24} lg={8}>
                    <Card title="Hướng dẫn">
                        <Text strong>Cấu hình Phê duyệt là gì?</Text>
                        <Paragraph className="mt-2 text-gray-600">
                            Hệ thống tự động xác định cấp quản lý. Đối với những nhân sự có chức vụ cao nhất (CEO, Director), hệ thống sẽ lấy "Người duyệt dự phòng" này để làm cấp phê duyệt cuối cùng.
                        </Paragraph>
                        <Divider />
                        <Text strong>Làm sao để lấy tọa độ?</Text>
                        <ul className="mt-2 text-gray-600">
                            <li>Cách 1: Nhấn nút "Lấy toạ độ tại đây" nếu bạn đang ngồi tại văn phòng.</li>
                            <li>Cách 2: Truy cập Google Maps, chuột phải vào vị trí văn phòng và copy tọa độ.</li>
                        </ul>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default SystemSettingPage;
