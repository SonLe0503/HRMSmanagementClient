import { Form, Input, Button, Typography, ConfigProvider } from 'antd';
import { UserOutlined, LockOutlined, ArrowRightOutlined, GlobalOutlined } from '@ant-design/icons';
import imghrm from '../../../assets/images/hrm.jpg';
import { actionLogin, selectInfoLogin } from '../../../store/authSlide';
import { useAppDispatch, useAppSelector } from '../../../store';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { EUserRole } from '../../../interface/app';
import URL from '../../../constants/url';
import { handleError } from '../../../utils/common';
import { motion } from 'framer-motion';

const { Title, Text } = Typography;

const LoginPage = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const infoLogin = useAppSelector(selectInfoLogin);
    const [loading, setLoading] = useState(false);

    const onFinish = async (values: any) => {
        setLoading(true);
        try {
            const res: any = await dispatch(actionLogin(values));
            if (!actionLogin.fulfilled.match(res)) {
                handleError(res.payload || "Tài khoản hoặc mật khẩu không đúng");
            }
        } catch (error) {
            handleError(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (infoLogin?.accessToken) {
            const role = infoLogin.role;
            const routes = {
                [EUserRole.ADMIN]: URL.DashboardAdmin,
                [EUserRole.EMPLOYEE]: URL.DashboardEmployee,
                [EUserRole.MANAGE]: URL.DashboardManage,
                [EUserRole.HR]: URL.DashboardHR,
            };
            navigate(routes[role as keyof typeof routes] || URL.DashboardEmployee);
        }
    }, [infoLogin, navigate]);

    return (
        <ConfigProvider
            theme={{
                token: {
                    colorPrimary: '#6366f1',
                    borderRadius: 16,
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                },
                components: {
                    Input: {
                        controlHeightLG: 54,
                        colorBorder: '#e2e8f0',
                    },
                    Button: {
                        controlHeightLG: 54,
                        fontWeight: 700,
                    }
                }
            }}
        >
            <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-[#0a0c10]">
                {/* Immersive Background Image */}
                <div className="absolute inset-0 z-0">
                    <img
                        src={imghrm}
                        className="w-full h-full object-cover opacity-40 scale-105"
                        alt="HR Background"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/90 via-slate-950/80 to-transparent"></div>
                </div>

                {/* Animated Decorative Blur */}
                <div className="absolute top-1/4 -left-20 w-80 h-80 bg-indigo-600/20 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-blue-600/20 rounded-full blur-[120px] animate-pulse delay-700"></div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    className="relative z-10 w-full max-w-[460px] mx-4"
                >
                    <div className="bg-white rounded-[40px] p-10 sm:p-14 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] border border-white/10">
                        {/* Header Area */}
                        <div className="text-center mb-12">
                            <motion.div
                                initial={{ y: -20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="inline-flex items-center justify-center w-14 h-14 bg-indigo-600 rounded-2xl text-white shadow-xl shadow-indigo-200 mb-6"
                            >
                                <GlobalOutlined style={{ fontSize: '28px' }} />
                            </motion.div>
                            <Title level={2} className="!m-0 !text-3xl font-black tracking-tight text-slate-900">
                                HRMS <span className="text-indigo-600">Portal</span>
                            </Title>
                            <Text className="text-slate-400 mt-2 block font-medium text-gray-100">
                                Hệ thống quản trị nhân sự tập trung
                            </Text>
                        </div>

                        <Form
                            name="login"
                            layout="vertical"
                            autoComplete="off"
                            onFinish={onFinish}
                            requiredMark={false}
                        >
                            <Form.Item
                                label={<span className="text-slate-500 font-bold text-[11px] tracking-[0.15em] uppercase px-1">Username</span>}
                                name="username"
                                rules={[{ required: true, message: "Vui lòng nhập tài khoản" }]}
                                className="mb-6"
                            >
                                <Input
                                    size="large"
                                    prefix={<UserOutlined className="text-slate-300 mr-2" />}
                                    placeholder="your_account"
                                    className="!rounded-2xl border-slate-100 hover:border-indigo-400 focus:border-indigo-400 bg-slate-50/50"
                                />
                            </Form.Item>

                            <Form.Item
                                label={<span className="text-slate-500 font-bold text-[11px] tracking-[0.15em] uppercase px-1">Mật khẩu</span>}
                                name="password"
                                rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}
                                className="mb-2"
                            >
                                <Input.Password
                                    size="large"
                                    prefix={<LockOutlined className="text-slate-300 mr-2" />}
                                    placeholder="••••••••"
                                    className="!rounded-2xl border-slate-100 hover:border-indigo-400 focus:border-indigo-400 bg-slate-50/50"
                                />
                            </Form.Item>

                            <div className="flex justify-end mb-10">
                                <Text className="text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer transition-colors px-1">
                                    QUÊN MẬT KHẨU?
                                </Text>
                            </div>

                            <Form.Item className="mb-0">
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    size="large"
                                    block
                                    loading={loading}
                                    icon={<ArrowRightOutlined />}
                                    className="h-14 !bg-indigo-600 hover:!bg-indigo-700 !border-none !rounded-2xl text-base font-bold shadow-xl shadow-indigo-100 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    BẮT ĐẦU LÀM VIỆC
                                </Button>
                            </Form.Item>
                        </Form>
                    </div>

                    {/* Bottom Link */}
                    <div className="mt-8 text-center">
                        <Text className="text-white/40 text-xs font-bold tracking-widest uppercase">
                            © 2026 HRMS Platform • Security Certified
                        </Text>
                    </div>
                </motion.div>
            </div>
        </ConfigProvider>
    );
};

export default LoginPage;
