import type { ReactNode } from "react";
import MobileHeader from "./MobileHeader";
import MobileBottomTabs from "./MobileBottomTabs";

interface MobileLayoutProps {
    children: ReactNode;
}

const MobileLayout = ({ children }: MobileLayoutProps) => {
    return (
        <div className="mobile-layout">
            <MobileHeader />
            <main className="mobile-content">
                {children}
            </main>
            <MobileBottomTabs />
        </div>
    );
};

export default MobileLayout;
