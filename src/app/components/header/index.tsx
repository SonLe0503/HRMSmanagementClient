import { Layout, Avatar, Dropdown, Breadcrumb, Tag } from 'antd';
import { UserOutlined, LogoutOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../../../store';
import { logout, selectInfoLogin } from '../../../store/authSlide';
import { useNavigate, useLocation } from 'react-router-dom';
import URL from '../../../constants/url';
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';

import { stringToColor, getInitial, getBreadcrumbItems } from '../../../utils/common';

const { Header } = Layout;

const HeaderBar = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const infoLogin = useAppSelector(selectInfoLogin);
    const [timeLeft, setTimeLeft] = useState<string>("--:--");

    const handleLogout = () => {
        dispatch(logout());
        navigate(URL.Login);
    };

    const breadcrumbItems = getBreadcrumbItems(location);

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

    const userInitial = getInitial(infoLogin?.userName);
    const avatarColor = infoLogin?.userName ? stringToColor(infoLogin.userName) : "#bfbfbf";

    return (
        <Header
            className="flex items-center justify-between shadow-sm border-b border-gray-100 h-16 sticky top-0 z-10"
            style={{ background: '#fff', padding: '0 24px' }}
        >
            <div className="flex items-center">
                <Breadcrumb items={breadcrumbItems} />
            </div>

            <Tag icon={<ClockCircleOutlined />} color={parseInt(timeLeft.split(':')[0]) < 5 ? "error" : "processing"}>
                Session: {timeLeft}
            </Tag>
            <Dropdown
                menu={{
                    items: [
                        {
                            key: 'profile',
                            label: 'My Profile',
                            icon: <UserOutlined />,
                        },
                        {
                            type: 'divider',
                        },
                        {
                            key: 'logout',
                            label: 'Logout',
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
        </Header>
    );
};

export default HeaderBar;
