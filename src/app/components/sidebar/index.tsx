import { Layout, Menu } from "antd";
import {
    AppstoreOutlined,
    MenuUnfoldOutlined,
    MenuFoldOutlined,
    UserOutlined,
    TeamOutlined,
    IdcardOutlined,
    BankOutlined,
    SolutionOutlined,
    ClockCircleOutlined,
    CalendarOutlined,
    SettingOutlined,
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
            { key: URL.ManageAttendance, icon: <ClockCircleOutlined />, label: "Quản lý chấm công" },
            { key: URL.ManageUser, icon: <UserOutlined />, label: "Quản lý người dùng" },
            { key: URL.ManageRole, icon: <UserOutlined />, label: "Quản lý vai trò" },
            { key: URL.ManageTask, icon: <TeamOutlined />, label: "Quản lý công việc" },
            { key: URL.ManageDepartment, icon: <BankOutlined />, label: "Quản lý phòng ban" },
            { key: URL.ManagePosition, icon: <SolutionOutlined />, label: "Quản lý chức vụ" },
            { key: URL.ManageEmployee, icon: <IdcardOutlined />, label: "Quản lý nhân viên" },
            { key: URL.ManageShift, icon: <ClockCircleOutlined />, label: "Quản lý ca" },
            { key: URL.ManageShiftAssignment, icon: <CalendarOutlined />, label: "Phân ca làm việc" },
            { key: URL.MyLeaveRequest, icon: <CalendarOutlined />, label: "Nghỉ phép của tôi" },
            { key: URL.ManageLeaveRequest, icon: <CalendarOutlined />, label: "Duyệt nghỉ phép" },
            { key: URL.LeaveConfiguration, icon: <IdcardOutlined />, label: "Cấu hình nghỉ phép" },
            { key: URL.MyOvertimeRequest, icon: <ClockCircleOutlined />, label: "Tăng ca của tôi" },
            { key: URL.ManageOvertimeRequest, icon: <ClockCircleOutlined />, label: "Duyệt tăng ca" },
            { key: URL.ManageSystemSettings, icon: <SettingOutlined />, label: "Cấu hình hệ thống" },
        ],
        [EUserRole.MANAGE]: [
            { key: URL.DashboardManage, icon: <AppstoreOutlined />, label: "Tổng quan" },
            { key: URL.ManageAttendance, icon: <ClockCircleOutlined />, label: "Quản lý chấm công" },
            { key: URL.MyAttendance, icon: <ClockCircleOutlined />, label: "Chấm công của tôi" },
            { key: URL.ManageHRProcedure, icon: <IdcardOutlined />, label: "Quản lý thủ tục" },
            { key: URL.ManageTask, icon: <TeamOutlined />, label: "Quản lý công việc" },
            { key: URL.MyLeaveRequest, icon: <CalendarOutlined />, label: "Nghỉ phép của tôi" },
            { key: URL.ManageLeaveRequest, icon: <CalendarOutlined />, label: "Duyệt nghỉ phép" },
            { key: URL.MyOvertimeRequest, icon: <ClockCircleOutlined />, label: "Tăng ca của tôi" },
            { key: URL.ManageOvertimeRequest, icon: <ClockCircleOutlined />, label: "Duyệt tăng ca" },
        ],
        [EUserRole.EMPLOYEE]: [
            { key: URL.MyAttendance, icon: <ClockCircleOutlined />, label: "Chấm công của tôi" },
            { key: URL.ManageTask, icon: <TeamOutlined />, label: "Quản lý công việc" },
            { key: URL.MyLeaveRequest, icon: <CalendarOutlined />, label: "Nghỉ phép của tôi" },
            { key: URL.MyOvertimeRequest, icon: <ClockCircleOutlined />, label: "Tăng ca của tôi" },
        ],
        [EUserRole.HR]: [
            { key: URL.DashboardHR, icon: <AppstoreOutlined />, label: "Tổng quan" },
            { key: URL.ManageAttendance, icon: <ClockCircleOutlined />, label: "Quản lý chấm công" },
            { key: URL.ManageEmployee, icon: <IdcardOutlined />, label: "Quản lý nhân viên" },
            { key: URL.ManageHRProcedure, icon: <IdcardOutlined />, label: "Quản lý thủ tục" },
            { key: URL.ManageDepartment, icon: <BankOutlined />, label: "Quản lý phòng ban" },
            { key: URL.ManagePosition, icon: <SolutionOutlined />, label: "Quản lý chức vụ" },
            { key: URL.ManageTask, icon: <TeamOutlined />, label: "Quản lý công việc" },
            { key: URL.ManageShift, icon: <ClockCircleOutlined />, label: "Quản lý ca" },
            { key: URL.ManageShiftAssignment, icon: <CalendarOutlined />, label: "Phân ca làm việc" },
            { key: URL.MyLeaveRequest, icon: <CalendarOutlined />, label: "Nghỉ phép của tôi" },
            { key: URL.ManageLeaveRequest, icon: <CalendarOutlined />, label: "Duyệt nghỉ phép" },
            { key: URL.LeaveConfiguration, icon: <IdcardOutlined />, label: "Cấu hình nghỉ phép" },
            { key: URL.MyOvertimeRequest, icon: <ClockCircleOutlined />, label: "Tăng ca của tôi" },
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
                <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                    <div className="h-16 flex items-center justify-center font-bold text-blue-600 text-xl overflow-hidden whitespace-nowrap flex-shrink-0">
                        {collapsed ? "HR" : "HR MANAGEMENT"}
                    </div>
                    <div className="flex-1 overflow-y-auto overflow-x-hidden sidebar-menu-scroll">
                        <Menu
                            mode="inline"
                            selectedKeys={[location.pathname]}
                            className="border-r-0"
                            items={
                                role
                                    ? (menuByRole[role as EUserRole] || []).map((item: any) => ({
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
