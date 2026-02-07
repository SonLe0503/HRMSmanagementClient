import { Card, Form, Input, Button, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import imghrm from '../../../assets/images/hrm.jpg';
import { actionLogin, selectInfoLogin } from '../../../store/authSlide';
import { useAppDispatch, useAppSelector } from '../../../store';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { EUserRole } from '../../../interface/app';
import URL from '../../../constants/url';
const LoginPage = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const infoLogin = useAppSelector(selectInfoLogin);
    const onFinish = async (values: any) => {
        try {
            const res: any = await dispatch(actionLogin(values));
            if (actionLogin.fulfilled.match(res)) {
                message.success("Đăng nhập thành công");
            } else {
                message.error("Đăng nhập thất bại");
            }
        } catch (error) {
            message.error("Đăng nhập thất bại");
        }
    };

    useEffect(() => {
        if (infoLogin?.accessToken) {
            const role = infoLogin.role;
            switch (role) {
                case EUserRole.ADMIN:
                    navigate(URL.DashboardAdmin);
                    break;
                case EUserRole.EMPLOYEE:
                    navigate(URL.DashboardEmployee);
                    break;
                case EUserRole.MANAGE:
                    navigate(URL.DashboardManage);
                    break;  
                case EUserRole.HR:
                    navigate(URL.DashboardHR);
                    break;
            }
        }
    }, [infoLogin, navigate])

    return (
        <>
            <div className="min-h-screen flex bg-gray-100">
                <div className="w-full lg:w-1/2 flex items-center justify-center relative overflow-hidden">
                    <img src={imghrm} className="w-full h-full rounded-tr-[250px] rounded-bl-[250px]" />
                    <div className="bg-black/40 w-full flex items-center justify-center absolute">
                        <div className="text-white text-center px-10">
                            <h1 className="text-4xl font-bold mb-4">
                                HR Management System
                            </h1>
                            <p className="text-lg opacity-90">
                                Quản lý nhân sự thông minh – chính xác – hiệu quả
                            </p>
                        </div>
                    </div>
                </div>
                <div className="w-full lg:w-1/2 flex items-center justify-center">
                    <Card className="w-full max-w-lg shadow-xl">
                        <div className="text-center mb-6">
                            <div className="text-blue-500 font-bold text-[50px]">LOGIN</div>
                        </div>

                        <Form
                            name="login"
                            layout="vertical"
                            autoComplete="off"
                            onFinish={onFinish}
                        >
                            <Form.Item
                                label="Username"
                                name="username"
                                rules={[
                                    { required: true, message: "Vui lòng nhập username!" },
                                ]}
                            >
                                <Input
                                    size="large"
                                    prefix={<UserOutlined />}
                                    placeholder="Nhập username"
                                />
                            </Form.Item>

                            <Form.Item
                                label="Password"
                                name="password"
                                rules={[
                                    { required: true, message: "Vui lòng nhập password!" },
                                ]}
                            >
                                <Input.Password
                                    size="large"
                                    prefix={<LockOutlined />}
                                    placeholder="Nhập password"
                                />
                            </Form.Item>

                            <Form.Item className="mt-6">
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    size="large"
                                    className="w-full"
                                >
                                    Login
                                </Button>
                            </Form.Item>
                        </Form>
                    </Card>
                </div>
            </div>
        </>
    )
}
export default LoginPage;