import type { ReactNode } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { CalendarOutlined, CameraOutlined } from "@ant-design/icons";
import MobileHeader from "./MobileHeader";
import URL from "../../constants/url";

interface HRManagerMobileLayoutProps {
    children: ReactNode;
}

const ALLOWED_PATHS = [URL.MyAttendance, URL.ManageFaceRegistration];

const NAV_TABS = [
    { path: URL.MyAttendance, icon: CalendarOutlined, label: "Chấm công" },
    { path: URL.ManageFaceRegistration, icon: CameraOutlined, label: "Khuôn mặt" },
];

const HRManagerMobileLayout = ({ children }: HRManagerMobileLayoutProps) => {
    const location = useLocation();
    const navigate = useNavigate();

    const isAllowed = ALLOWED_PATHS.some(
        (p) => location.pathname === p || location.pathname.startsWith(p + "/")
    );

    if (!isAllowed) {
        return <Navigate to={URL.MyAttendance} replace />;
    }

    return (
        <div className="mobile-layout">
            <MobileHeader />
            <main className="mobile-content">
                {children}
            </main>
            <div
                className="flex bg-white border-t border-gray-100"
                style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
            >
                {NAV_TABS.map(({ path, icon: Icon, label }) => {
                    const active = location.pathname === path || location.pathname.startsWith(path + "/");
                    return (
                        <button
                            key={path}
                            onClick={() => navigate(path)}
                            className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors ${
                                active ? "text-indigo-600" : "text-gray-400"
                            }`}
                        >
                            <Icon className="text-xl" />
                            <span className="text-[10px] font-medium">{label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default HRManagerMobileLayout;
