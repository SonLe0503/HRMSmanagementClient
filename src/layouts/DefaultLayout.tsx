import Layout, { Content } from "antd/es/layout/layout"
import Sidebar from "../app/components/sidebar"
import HeaderBar from "../app/components/header"
import type { JSX } from "react";

interface DefaultLayoutProps {
    children: JSX.Element;
}

const DefaultLayout = ({children}: DefaultLayoutProps) => {
    return (
        <Layout className="h-screen">
            <Sidebar />
            <Layout>
                <HeaderBar />
                <Content className="m-2 bg-white shadow">
                    {children}
                </Content>
            </Layout>
        </Layout>   
    )
}
export default DefaultLayout;
