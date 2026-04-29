import Layout, { Content } from "antd/es/layout/layout";
import Sidebar from "../app/components/sidebar";
import HeaderBar from "../app/components/header";
import type { JSX } from "react";
import { useIsMobile } from "../hooks/useIsMobile";
import { useAppSelector } from "../store";
import { selectInfoLogin } from "../store/authSlide";
import { EUserRole } from "../interface/app";
import MobileLayout from "./mobile/MobileLayout";

interface DefaultLayoutProps {
    children: JSX.Element;
}

const DefaultLayout = ({ children }: DefaultLayoutProps) => {
    const isMobile = useIsMobile();
    const infoLogin = useAppSelector(selectInfoLogin);

    if (isMobile && infoLogin?.role === EUserRole.EMPLOYEE) {
        return <MobileLayout>{children}</MobileLayout>;
    }

    return (
        <Layout className="app-layout">
            <Sidebar />
            <Layout className="flex flex-col flex-1">
                <HeaderBar />
                <Content className="main-content">
                    <div className="content-container">
                        {children}
                    </div>
                </Content>
            </Layout>
        </Layout>
    );
};

export default DefaultLayout;
