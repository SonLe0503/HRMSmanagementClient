import { Layout, Menu } from "antd";
import {
    AppstoreOutlined,
    MenuUnfoldOutlined,
    MenuFoldOutlined,
    UserOutlined,
    TeamOutlined,
    // SafetyOutlined,
    NodeIndexOutlined,
} from "@ant-design/icons";
import { useAppSelector } from "../../../store";
import { useNavigate, useLocation } from "react-router-dom";
import { selectInfoLogin } from "../../../store/authSlide";
import URL from "../../../constants/url";
import { useState } from "react";
import { motion } from "framer-motion";
import { EUserRole } from "../../../interface/app";

const { Sider } = Layout;

const Sidebar = () => {
    const infoLogin = useAppSelector(selectInfoLogin);
    const role = infoLogin?.role;
    const navigate = useNavigate();
    const location = useLocation();
    const [collapsed, setCollapsed] = useState(false);

    const menuByRole: Record<EUserRole, any[]> = {
        [EUserRole.ADMIN]: [
            { key: URL.DashboardAdmin, icon: <AppstoreOutlined />, label: "Tổng quan" },
            { key: URL.ManageUser, icon: <UserOutlined />, label: "Quản lý người dùng" },
            { key: URL.ManageRole, icon: <UserOutlined />, label: "Quản lý vai trò" },
            { key: URL.ManageWorkflow, icon: <NodeIndexOutlined />, label: "Quản lý quy trình" },
        ],
        [EUserRole.MANAGE]: [
            { key: URL.DashboardManage, icon: <AppstoreOutlined />, label: "Tổng quan" },
            { key: URL.ManageUser, icon: <UserOutlined />, label: "Quản lý nhân viên" },
        ],
        [EUserRole.EMPLOYEE]: [
            { key: URL.DashboardEmployee, icon: <AppstoreOutlined />, label: "Tổng quan" },
        ],
        [EUserRole.HR]: [
            { key: URL.DashboardHR, icon: <AppstoreOutlined />, label: "Tổng quan" },
            { key: URL.ManageUser, icon: <TeamOutlined />, label: "Tuyển dụng" },
        ],
    };

    return (
        <Sider
            theme="light"
            width={collapsed ? 80 : 240}
            collapsedWidth={80}
            trigger={null}
            className="bg-white border-r border-gray-200"
            collapsed={collapsed}
        >
            <motion.div
                animate={{ width: collapsed ? 80 : 240 }}
                transition={{ duration: 0.3 }}
                className="h-full flex flex-col justify-between"
            >
                <div>
                    <div className="h-16 flex items-center justify-center font-bold text-blue-600 text-xl overflow-hidden whitespace-nowrap">
                        {collapsed ? "HR" : "HR MANAGEMENT"}
                    </div>
                    <Menu
                        mode="inline"
                        selectedKeys={[location.pathname]}
                        className="border-r-0 flex-1"
                        items={
                            role
                                ? (menuByRole[role] || []).map((item: any) => ({
                                    ...item,
                                    label: collapsed ? null : item.label,
                                }))
                                : []
                        }
                        onClick={({ key }) => {
                            if (key.startsWith("/")) {
                                navigate(key);
                            }
                        }}
                    />
                </div>
                <div className="flex justify-center items-center p-3 border-t border-gray-100">
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="p-2 rounded-full hover:bg-gray-100 transition text-gray-400 hover:text-blue-500"
                    >
                        {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                    </button>
                </div>
            </motion.div>
        </Sider>
    );
};

export default Sidebar;
