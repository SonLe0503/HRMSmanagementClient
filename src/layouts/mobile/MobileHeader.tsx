import { Avatar, Dropdown, Tag } from "antd";
import { UserOutlined, LogoutOutlined, KeyOutlined, ClockCircleOutlined } from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "../../store";
import { logout, selectInfoLogin } from "../../store/authSlide";
import { useNavigate } from "react-router-dom";
import URL from "../../constants/url";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import ChangePasswordModal from "../../app/pages/auth/ChangePasswordModal";
import { stringToColor, getInitial } from "../../utils/common";
import { request } from "../../utils/request";

const MobileHeader = () => {
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
                setTimeLeft(`${minutes}:${seconds < 10 ? "0" : ""}${seconds}`);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [infoLogin?.expiresTime]);

    useEffect(() => {
        if (!infoLogin?.accessToken) return;

        const pingTimer = setInterval(async () => {
            try {
                await request({
                    url: "/Auth/ping",
                    method: "GET",
                    headers: { Authorization: `Bearer ${infoLogin.accessToken}` },
                });
            } catch {
                clearInterval(pingTimer);
            }
        }, 10000);

        return () => clearInterval(pingTimer);
    }, [infoLogin?.accessToken]);

    const userInitial = getInitial(infoLogin?.userName);
    const avatarColor = infoLogin?.userName ? stringToColor(infoLogin.userName) : "#bfbfbf";
    const isNearExpiry = parseInt(timeLeft.split(":")[0]) < 5;

    return (
        <>
            <header className="mobile-header flex items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <span className="text-blue-600 font-bold text-lg leading-none">PeopleCore</span>
                    <Tag
                        icon={<ClockCircleOutlined />}
                        color={isNearExpiry ? "error" : "processing"}
                        className="m-0 text-xs"
                        style={{ lineHeight: "18px", padding: "0 6px" }}
                    >
                        {timeLeft}
                    </Tag>
                </div>

                <Dropdown
                    menu={{
                        items: [
                            ...(infoLogin?.employeeId
                                ? [{
                                    key: "profile",
                                    label: "Hồ sơ của tôi",
                                    icon: <UserOutlined />,
                                    onClick: () => navigate(URL.MyProfile),
                                }]
                                : []),
                            {
                                key: "change-password",
                                label: "Đổi mật khẩu",
                                icon: <KeyOutlined />,
                                onClick: () => setIsChangePasswordOpen(true),
                            },
                            { type: "divider" as const },
                            {
                                key: "logout",
                                label: "Đăng xuất",
                                icon: <LogoutOutlined />,
                                onClick: handleLogout,
                                danger: true,
                            },
                        ],
                    }}
                    placement="bottomRight"
                    arrow
                >
                    <div className="flex items-center gap-2 cursor-pointer">
                        <div className="text-right hidden">
                            <p className="text-xs font-semibold text-gray-800 leading-tight">{infoLogin?.userName}</p>
                            <p className="text-xs text-gray-400 leading-tight">{infoLogin?.positionName}</p>
                        </div>
                        <Avatar
                            size={36}
                            style={{ backgroundColor: avatarColor, fontWeight: "bold", cursor: "pointer" }}
                        >
                            {userInitial}
                        </Avatar>
                    </div>
                </Dropdown>
            </header>

            <ChangePasswordModal
                open={isChangePasswordOpen}
                onCancel={() => setIsChangePasswordOpen(false)}
            />
        </>
    );
};

export default MobileHeader;
