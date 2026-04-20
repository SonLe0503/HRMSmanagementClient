import { Layout, Avatar, Dropdown, Tag } from 'antd';
import { UserOutlined, LogoutOutlined, ClockCircleOutlined, KeyOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../../../store';
import { logout, selectInfoLogin } from '../../../store/authSlide';
import { useNavigate } from 'react-router-dom';
import URL from '../../../constants/url';
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import ChangePasswordModal from '../../pages/auth/ChangePasswordModal';

import { stringToColor, getInitial } from '../../../utils/common';
import { request } from '../../../utils/request';

const { Header } = Layout;

const HeaderBar = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const infoLogin = useAppSelector(selectInfoLogin);
    const [timeLeft, setTimeLeft] = useState<string>("--:--");

    const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

    const handleLogout = () => {
        dispatch(logout());
        navigate(URL.Login);
    };

    useEffect(() => {
        const expiresTime = infoLogin?.expiresTime;
        if (!expiresTime) return;

        const timer = setInterval(() => {
            const now = dayjs().unix();
            const diff = expiresTime - now;

            if (diff <= 0) {
                clearInterval(timer);
                handleLogout();
            } else {
                const minutes = Math.floor(diff / 60);
                const seconds = diff % 60;
                setTimeLeft(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [infoLogin?.expiresTime]);

    useEffect(() => {
        if (!infoLogin?.accessToken) return;

        // Automatically ping the server to check if the session is still valid (detects concurrent logins)
        const pingTimer = setInterval(async () => {
            try {
                await request({
                    url: '/Auth/ping',
                    method: 'GET',
                    headers: { Authorization: `Bearer ${infoLogin.accessToken}` }
                });
            } catch (error) {
                clearInterval(pingTimer);
            }
        }, 10000); // Ping every 10 seconds

        return () => clearInterval(pingTimer);
    }, [infoLogin?.accessToken]);

    const userInitial = getInitial(infoLogin?.userName);
    const avatarColor = infoLogin?.userName ? stringToColor(infoLogin.userName) : "#bfbfbf";

    return (
        <Header
            className="flex items-center justify-between shadow-sm border-b border-gray-100 h-16 sticky top-0 z-10"
            style={{ background: '#fff', padding: '0 24px' }}
        >
            <Tag 
                icon={<ClockCircleOutlined />} 
                color={parseInt(timeLeft.split(':')[0]) < 5 ? "error" : "processing"}
                className="m-0 text-sm py-1 px-3"
            >
                Phiên: {timeLeft}
            </Tag>
            
            <Dropdown
                menu={{
                    items: [
                        ...(infoLogin?.employeeId ? [{
                            key: 'profile',
                            label: 'Hồ sơ của tôi',
                            icon: <UserOutlined />,
                            onClick: () => navigate(URL.MyProfile),
                        }] : []),
                        {
                            key: 'change-password',
                            label: 'Đổi mật khẩu',
                            icon: <KeyOutlined />,
                            onClick: () => setIsChangePasswordOpen(true),
                        },
                        {
                            type: 'divider',
                        },
                        {
                            key: 'logout',
                            label: 'Đăng xuất',
                            icon: <LogoutOutlined />,
                            onClick: handleLogout,
                            danger: true,
                        },
                    ]
                }}
                placement="bottomRight"
                arrow
            >
                <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded-lg transition-colors">
                    <Avatar
                        size="large"
                        style={{
                            backgroundColor: avatarColor,
                            verticalAlign: 'middle',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                        }}
                    >
                        {userInitial}
                    </Avatar>
                </div>
            </Dropdown>

            <ChangePasswordModal 
                open={isChangePasswordOpen}
                onCancel={() => setIsChangePasswordOpen(false)}
            />
        </Header>
    );
};

export default HeaderBar;
