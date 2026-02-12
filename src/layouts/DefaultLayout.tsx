import Layout, { Content } from "antd/es/layout/layout"
import Sidebar from "../app/components/sidebar"
import HeaderBar from "../app/components/header"
import type { JSX } from "react";

interface DefaultLayoutProps {
    children: JSX.Element;
}

const DefaultLayout = ({ children }: DefaultLayoutProps) => {
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
    )
}
export default DefaultLayout;
