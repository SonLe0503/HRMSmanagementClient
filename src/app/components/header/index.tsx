import { Layout, Avatar, Dropdown } from 'antd';
import { UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { useAppDispatch } from '../../../store';
import { logout } from '../../../store/authSlide';
import { useNavigate } from 'react-router-dom';
import URL from '../../../constants/url';

const { Header } = Layout;

const HeaderBar = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const handleLogout = () => {
        dispatch(logout());
        navigate(URL.Login);
    };

    return (
        <Header
            className="flex items-center justify-between shadow-sm border-b border-gray-100 h-16 sticky top-0 z-10"
            style={{ background: '#fff' }}
        >
            <div className="flex items-center">
                header
            </div>

            <div className="flex items-center">
                <Dropdown
                    menu={{
                        items: [
                            {
                                key: 'profile',
                                label: 'Thông tin cá nhân',
                                icon: <UserOutlined />,
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
                            icon={<UserOutlined />}
                            className="bg-blue-500"
                        />
                    </div>
                </Dropdown>
            </div>
        </Header>
    );
};

export default HeaderBar;
