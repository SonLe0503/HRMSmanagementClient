import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAndroidBack } from "../../hooks/useAndroidBack";
import { Drawer } from "antd";
import {
    ClockCircleOutlined,
    FileTextOutlined,
    TeamOutlined,
    WalletOutlined,
    UserOutlined,
    CalendarOutlined,
    IdcardOutlined,
    SolutionOutlined,
    AppstoreOutlined,
} from "@ant-design/icons";
import URL from "../../constants/url";

interface TabItem {
    key: string;
    label: string;
    icon: React.ReactNode;
    routes: string[];
    action?: () => void;
    path?: string;
}

const MobileBottomTabs = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [donTuOpen, setDonTuOpen] = useState(false);
    const [morePagesOpen, setMorePagesOpen] = useState(false);

    const donTuItems = [
        { key: URL.MyLeaveRequest,       icon: <CalendarOutlined />, label: "Nghỉ phép của tôi"   },
        { key: URL.MyOvertimeRequest,    icon: <ClockCircleOutlined />, label: "Tăng ca của tôi"  },
        { key: URL.MyResignationRequest, icon: <IdcardOutlined />,   label: "Đơn thôi việc"       },
    ];

    const morePagesItems = [
        { key: URL.EvaluationList,    icon: <SolutionOutlined />, label: "Phiếu đánh giá của tôi" },
        { key: URL.MyEvaluationResults, icon: <AppstoreOutlined />, label: "Kết quả đánh giá"     },
    ];

    const donTuRoutes = donTuItems.map((i) => i.key);
    const morePagesRoutes = morePagesItems.map((i) => i.key);

    const tabs: TabItem[] = [
        {
            key: "attendance",
            label: "Chấm công",
            icon: <ClockCircleOutlined />,
            routes: [URL.MyAttendance],
            path: URL.MyAttendance,
        },
        {
            key: "dontu",
            label: "Đơn từ",
            icon: <FileTextOutlined />,
            routes: donTuRoutes,
            action: () => setDonTuOpen(true),
        },
        {
            key: "task",
            label: "Công việc",
            icon: <TeamOutlined />,
            routes: [URL.ManageTask],
            path: URL.ManageTask,
        },
        {
            key: "payslips",
            label: "Lương",
            icon: <WalletOutlined />,
            routes: [URL.MyPayslips, ...morePagesRoutes],
            action: () => setMorePagesOpen(true),
        },
        {
            key: "profile",
            label: "Tôi",
            icon: <UserOutlined />,
            routes: [URL.MyProfile],
            path: URL.MyProfile,
        },
    ];

    useAndroidBack(donTuOpen, () => setDonTuOpen(false));
    useAndroidBack(morePagesOpen, () => setMorePagesOpen(false));

    const isActive = (tab: TabItem) =>
        tab.routes.some((r) => location.pathname === r || location.pathname.startsWith(r + "/"));

    const handleTabPress = (tab: TabItem) => {
        if (tab.action) {
            tab.action();
        } else if (tab.path) {
            navigate(tab.path);
        }
    };

    const handleDrawerNavigate = (path: string, closeFn: () => void) => {
        closeFn();
        navigate(path);
    };

    return (
        <>
            <nav className="mobile-bottom-tabs">
                <div className="flex h-16">
                    {tabs.map((tab) => {
                        const active = isActive(tab);
                        return (
                            <button
                                key={tab.key}
                                className={`flex-1 flex flex-col items-center justify-center gap-1 transition-colors relative ${active ? "text-blue-600" : "text-gray-400"}`}
                                onClick={() => handleTabPress(tab)}
                            >
                                {active && (
                                    <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-blue-600 rounded-full" />
                                )}
                                <span className={`text-xl leading-none ${active ? "text-blue-600" : "text-gray-400"}`}>
                                    {tab.icon}
                                </span>
                                <span className={`text-[10px] font-medium leading-none ${active ? "text-blue-600 font-semibold" : "text-gray-400"}`}>
                                    {tab.label}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </nav>

            {/* Đơn từ drawer */}
            <Drawer
                title="Đơn từ"
                placement="bottom"
                height="auto"
                open={donTuOpen}
                onClose={() => setDonTuOpen(false)}
                styles={{ body: { padding: "8px 0 16px" } }}
            >
                {donTuItems.map((item) => (
                    <button
                        key={item.key}
                        className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-gray-50 active:bg-gray-100 transition-colors"
                        onClick={() => handleDrawerNavigate(item.key, () => setDonTuOpen(false))}
                    >
                        <span className="text-blue-500 text-xl">{item.icon}</span>
                        <span className="text-sm font-medium text-gray-800">{item.label}</span>
                    </button>
                ))}
            </Drawer>

            {/* Lương & Đánh giá drawer */}
            <Drawer
                title="Lương & Đánh giá"
                placement="bottom"
                height="auto"
                open={morePagesOpen}
                onClose={() => setMorePagesOpen(false)}
                styles={{ body: { padding: "8px 0 16px" } }}
            >
                <button
                    className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-gray-50 active:bg-gray-100 transition-colors"
                    onClick={() => handleDrawerNavigate(URL.MyPayslips, () => setMorePagesOpen(false))}
                >
                    <span className="text-blue-500 text-xl"><WalletOutlined /></span>
                    <span className="text-sm font-medium text-gray-800">Phiếu lương của tôi</span>
                </button>
                {morePagesItems.map((item) => (
                    <button
                        key={item.key}
                        className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-gray-50 active:bg-gray-100 transition-colors"
                        onClick={() => handleDrawerNavigate(item.key, () => setMorePagesOpen(false))}
                    >
                        <span className="text-blue-500 text-xl">{item.icon}</span>
                        <span className="text-sm font-medium text-gray-800">{item.label}</span>
                    </button>
                ))}
            </Drawer>
        </>
    );
};

export default MobileBottomTabs;
