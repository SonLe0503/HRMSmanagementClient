import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { LaptopOutlined } from "@ant-design/icons";
import MobileHeader from "./MobileHeader";
import URL from "../../constants/url";

interface HRManagerMobileLayoutProps {
    children: ReactNode;
}

const ALLOWED_PATHS = [URL.MyAttendance];

const HRManagerMobileLayout = ({ children }: HRManagerMobileLayoutProps) => {
    const location = useLocation();

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
            <div className="flex items-center justify-center gap-2 py-3 bg-white border-t border-gray-100"
                style={{ paddingBottom: "calc(12px + env(safe-area-inset-bottom, 0px))" }}>
                <LaptopOutlined className="text-gray-400 text-sm" />
                <span className="text-xs text-gray-400">
                    Dùng máy tính để truy cập đầy đủ tính năng
                </span>
            </div>
        </div>
    );
};

export default HRManagerMobileLayout;
