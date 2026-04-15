import React, { useEffect, useState } from "react";
import { Form, Typography, message, Row, Col, Space, Tabs, Badge } from "antd";
import {
    SafetyCertificateOutlined,
    EnvironmentOutlined,
    AimOutlined,
    SettingOutlined,
    QuestionCircleOutlined,
    DollarOutlined
} from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "../../../store";
import {
    fetchLocationSettings, selectLocationSettings, selectSystemSettingLoading,
    updateLocationSettings, fetchApprovalSettings, selectApprovalSettings,
    updateApprovalSettings, fetchPayrollSettings, selectPayrollSettings, updatePayrollSettings
} from "../../../store/systemSettingSlide";
import { fetchAllUsers, selectUsers } from "../../../store/userSlide";
import { fetchApprovalAnalysis, selectApprovalAnalysis } from "../../../store/employeeSlide";

// Import modular components (will be redesigned next)
import TopLevelApprovalCard from "./components/TopLevelApprovalCard";
import DefaultFallbackApprovalCard from "./components/DefaultFallbackApprovalCard";
import LocationConfigurationCard from "./components/LocationConfigurationCard";
import ApprovalAnalysisTable from "./components/ApprovalAnalysisTable";
import GuidanceCard from "./components/GuidanceCard";
import PayrollSettingsCard from "./components/PayrollSettingsCard";

const { Title, Paragraph, Text } = Typography;

const SystemSettingPage: React.FC = () => {
    const [topLevelForm] = Form.useForm();
    const [defaultFallbackForm] = Form.useForm();
    const [locationForm] = Form.useForm();
    const [payrollForm] = Form.useForm();
    const dispatch = useAppDispatch();

    const locationSettings = useAppSelector(selectLocationSettings);
    const approvalSettings = useAppSelector(selectApprovalSettings);
    const payrollSettings = useAppSelector(selectPayrollSettings);
    const approvalAnalysis = useAppSelector(selectApprovalAnalysis);
    const users = useAppSelector(selectUsers);
    const loading = useAppSelector(selectSystemSettingLoading);
    
    const [detecting, setDetecting] = useState(false);

    // Initial data fetch
    useEffect(() => {
        dispatch(fetchLocationSettings());
        dispatch(fetchApprovalSettings());
        dispatch(fetchPayrollSettings());
        dispatch(fetchAllUsers());
        dispatch(fetchApprovalAnalysis());
    }, [dispatch]);

    // Update form values
    useEffect(() => {
        if (locationSettings) locationForm.setFieldsValue(locationSettings);
    }, [locationSettings, locationForm]);

    useEffect(() => {
        if (payrollSettings) payrollForm.setFieldsValue(payrollSettings);
    }, [payrollSettings, payrollForm]);

    useEffect(() => {
        if (approvalSettings) {
            topLevelForm.setFieldsValue({
                topLevelFallbackUserId: approvalSettings.topLevelFallbackUserId
            });
            defaultFallbackForm.setFieldsValue({
                defaultFallbackUserId: approvalSettings.defaultFallbackUserId
            });
        }
    }, [approvalSettings, topLevelForm, defaultFallbackForm]);

    // Handlers
    const onLocationFinish = async (values: any) => {
        try {
            await dispatch(updateLocationSettings(values)).unwrap();
            message.success("Cấu hình vị trí đã được lưu");
            dispatch(fetchLocationSettings());
        } catch (error: any) {
            message.error(error || "Lỗi lưu cấu hình vị trí");
        }
    };

    const onPayrollFinish = async (values: any) => {
        try {
            await dispatch(updatePayrollSettings(values)).unwrap();
            message.success("Cấu hình kỳ lương đã được lưu");
            dispatch(fetchPayrollSettings());
        } catch (error: any) {
            message.error(error || "Lỗi lưu cấu hình kỳ lương");
        }
    };

    const onApprovalFinish = async (values: any) => {
        try {
            const payload = {
                ...(approvalSettings || {}),
                ...values
            };
            await dispatch(updateApprovalSettings(payload)).unwrap();
            message.success("Cấu hình phê duyệt đã được lưu");
            dispatch(fetchApprovalSettings());
            dispatch(fetchApprovalAnalysis());
        } catch (error: any) {
            message.error(error || "Lỗi lưu cấu hình phê duyệt");
        }
    };

    const handleGetCurrentLocation = () => {
        if (!navigator.geolocation) {
            message.error("Trình duyệt không hỗ trợ Geolocation");
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
                message.info("Đã cập nhật toạ độ hiện tại.");
            },
            (error) => {
                setDetecting(false);
                message.error("Lỗi lấy vị trí: " + error.message);
            }
        );
    };

    // Tab Items Definition
    const tabItems = [
        {
            key: "1",
            label: <Space className="px-4"><SafetyCertificateOutlined />Quy trình Phê duyệt</Space>,
            children: (
                <div className="animate-in fade-in duration-500">
                    <Row gutter={[32, 32]}>
                        <Col xs={24} lg={16}>
                            <Space orientation="vertical" style={{ width: '100%' }}>
                                <TopLevelApprovalCard 
                                    form={topLevelForm}
                                    users={users}
                                    loading={loading}
                                    onFinish={onApprovalFinish}
                                    onRefresh={() => dispatch(fetchApprovalSettings())}
                                />
                                <DefaultFallbackApprovalCard 
                                    form={defaultFallbackForm}
                                    users={users}
                                    loading={loading}
                                    onFinish={onApprovalFinish}
                                    onRefresh={() => dispatch(fetchApprovalSettings())}
                                />
                            </Space>
                        </Col>
                        <Col xs={24} lg={8}>
                            <GuidanceCard />
                        </Col>
                    </Row>
                </div>
            )
        },
        {
            key: "2",
            label: <Space className="px-4"><EnvironmentOutlined />Vị trí & Điểm danh</Space>,
            children: (
                <div className="animate-in fade-in duration-500">
                    <Row gutter={[32, 32]}>
                        <Col xs={24} lg={16}>
                            <LocationConfigurationCard 
                                form={locationForm}
                                loading={loading}
                                detecting={detecting}
                                onFinish={onLocationFinish}
                                onRefresh={() => dispatch(fetchLocationSettings())}
                                onDetect={handleGetCurrentLocation}
                            />
                        </Col>
                        <Col xs={24} lg={8}>
                            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 h-full">
                                <Title level={4} className="mb-4">Thông tin bổ trợ</Title>
                                <Paragraph className="text-slate-500">
                                    Hệ thống sử dụng tọa độ vệ tinh để xác minh tính trung thực khi điểm danh.
                                </Paragraph>
                                <Badge status="processing" text="Bán kính ổn định nhất: 50m" />
                            </div>
                        </Col>
                    </Row>
                </div>
            )
        },
        {
            key: "3",
            label: <Space className="px-4"><DollarOutlined />Kỳ lương</Space>,
            children: (
                <div className="animate-in fade-in duration-500">
                    <Row gutter={[32, 32]}>
                        <Col xs={24} lg={16}>
                            <PayrollSettingsCard
                                form={payrollForm}
                                loading={loading}
                                onFinish={onPayrollFinish}
                                onRefresh={() => dispatch(fetchPayrollSettings())}
                            />
                        </Col>
                        <Col xs={24} lg={8}>
                            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 h-full">
                                <Title level={4} className="mb-4">Lưu ý</Title>
                                <Paragraph className="text-slate-500">
                                    Thay đổi ngày chốt lương sẽ ảnh hưởng đến cách hiển thị kỳ lương trong bảng chấm công.
                                    Nên cấu hình trước khi bắt đầu chu kỳ mới.
                                </Paragraph>
                                <Badge status="warning" text="Giới hạn tối đa ngày 28 để tránh lỗi tháng 2" />
                            </div>
                        </Col>
                    </Row>
                </div>
            )
        },
        {
            key: "4",
            label: <Space className="px-4"><AimOutlined />Phân tích (Audit)</Space>,
            children: (
                <div className="animate-in fade-in duration-500">
                    <ApprovalAnalysisTable
                        data={approvalAnalysis}
                        loading={loading}
                        onRefresh={() => dispatch(fetchApprovalAnalysis())}
                    />
                </div>
            )
        }
    ];

    return (
        <div className="p-8 lg:p-12 bg-[#f8fafc] min-h-screen">
            <div className="max-w-7xl mx-auto">
                <div className="mb-10 flex justify-between items-end">
                    <div>
                        <Title level={2} style={{ marginBottom: 4, fontWeight: 700, color: '#1e293b' }}>
                            <SettingOutlined className="mr-3 text-indigo-600" />Thiết lập Hệ thống
                        </Title>
                        <Paragraph type="secondary" className="text-lg">
                            Cấu hình tham số lõi và quản lý quy tắc phê duyệt tự động.
                        </Paragraph>
                    </div>
                    <div className="hidden md:block">
                        <Badge count="Admin Control Center" style={{ backgroundColor: '#4f46e5', padding: '0 12px' }} />
                    </div>
                </div>

                <Tabs 
                    defaultActiveKey="1" 
                    items={tabItems} 
                    className="custom-minimal-tabs"
                    tabBarStyle={{ 
                        marginBottom: 32,
                        borderBottom: '1px solid #e2e8f0'
                    }}
                    size="large"
                />

                <div className="mt-16 text-center opacity-40">
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        <QuestionCircleOutlined className="mr-1" />
                        Mọi thay đổi sẽ có hiệu lực ngay lập tức. Liên hệ hỗ trợ nếu cần hướng dẫn nâng cao.
                    </Text>
                </div>
            </div>
        </div>
    );
};

export default SystemSettingPage;
