import { Layout, Menu } from "antd";
import {
    AppstoreOutlined,
    MenuUnfoldOutlined,
    MenuFoldOutlined,
    TeamOutlined,
    IdcardOutlined,
    BankOutlined,
    SolutionOutlined,
    ClockCircleOutlined,
    CalendarOutlined,
    PieChartOutlined,
    SettingOutlined,
    WalletOutlined,
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
            {
                key: "admin-system", icon: <SettingOutlined />, label: "Hệ thống",
                children: [
                    { key: URL.ManageUser, label: "Quản lý người dùng" },
                    { key: URL.ManageRole, label: "Quản lý vai trò" },
                    { key: URL.ManageSystemSettings, label: "Cấu hình hệ thống" },
                ]
            },
            {
                key: "admin-org", icon: <BankOutlined />, label: "Tổ chức",
                children: [
                    { key: URL.ManageDepartment, label: "Quản lý phòng ban" },
                    { key: URL.ManagePosition, label: "Quản lý chức vụ" },
                    { key: URL.ManageEmployee, label: "Quản lý nhân viên" },
                ]
            },
            {
                key: "admin-time", icon: <ClockCircleOutlined />, label: "Chấm công & Ca làm",
                children: [
                    { key: URL.ManageShift, label: "Quản lý ca" },
                    { key: URL.ManageShiftAssignment, label: "Phân ca làm việc" },
                ]
            },
            {
                key: "admin-leave", icon: <CalendarOutlined />, label: "Nghỉ phép & Tăng ca",
                children: [
                    { key: URL.ManageLeaveRequest, label: "Duyệt nghỉ phép" },
                    { key: URL.LeaveConfiguration, label: "Cấu hình nghỉ phép" },
                    { key: URL.ManageOvertimeRequest, label: "Duyệt tăng ca" },
                    { key: URL.ManageResignationRequest, label: "Duyệt đơn thôi việc" },
                ]
            },
            {
                key: "admin-perf", icon: <SolutionOutlined />, label: "Đánh giá Năng lực",
                children: [
                    { key: URL.PerformanceTemplates, label: "Mẫu đánh giá" },
                    { key: URL.PerformanceCycles, label: "Đợt đánh giá" },
                    { key: URL.EvaluatorAssignments, label: "Phân công đánh giá" },
                    { key: URL.EvaluationList, label: "Phiếu đánh giá" },
                    { key: URL.PendingEvaluations, label: "Đánh giá nhân viên" },
                    { key: URL.MyEvaluationResults, label: "Kết quả đánh giá" },
                ]
            },
            {
                key: "admin-payroll", icon: <WalletOutlined />, label: "Lương & Thưởng",
                children: [
                    { key: URL.PayrollPeriods, label: "Quản lý kỳ lương" },
                    { key: URL.MyPayslips, label: "Phiếu lương của tôi" },
                    { key: URL.PayrollMethodology, label: "Quy tắc tính lương" },
                ]
            },
            {
                key: "admin-analytics", icon: <PieChartOutlined />, label: "Báo cáo",
                children: [
                    { key: URL.WorkforceAnalytics, label: "Phân tích Nhân sự" },
                    { key: URL.CompetencyReport, label: "Báo cáo Năng lực" },
                ]
            },
            { key: URL.ManageTask, icon: <TeamOutlined />, label: "Quản lý công việc" },
        ],
        [EUserRole.MANAGE]: [
            { key: URL.DashboardManage, icon: <AppstoreOutlined />, label: "Tổng quan" },
            {
                key: "manage-time", icon: <ClockCircleOutlined />, label: "Chấm công & Ca làm",
                children: [
                    { key: URL.MyAttendance, label: "Chấm công của tôi" },
                    { key: URL.ManageAttendance, label: "Quản lý chấm công" },
                ]
            },
            {
                key: "manage-leave", icon: <CalendarOutlined />, label: "Nghỉ phép & Tăng ca",
                children: [
                    { key: URL.MyLeaveRequest, label: "Nghỉ phép của tôi" },
                    { key: URL.ManageLeaveRequest, label: "Duyệt nghỉ phép" },
                    { key: URL.MyOvertimeRequest, label: "Tăng ca của tôi" },
                    { key: URL.ManageOvertimeRequest, label: "Duyệt tăng ca" },
                    { key: URL.MyResignationRequest, label: "Đơn thôi việc của tôi" },
                    { key: URL.ManageResignationRequest, label: "Duyệt đơn thôi việc" },
                ]
            },
            {
                key: "manage-hr", icon: <IdcardOutlined />, label: "Dịch vụ Nhân sự",
                children: [
                    { key: URL.ManageHRProcedure, label: "Quản lý thủ tục" },
                ]
            },
            {
                key: "manage-perf", icon: <SolutionOutlined />, label: "Đánh giá Năng lực",
                children: [
                    { key: URL.EvaluationList, label: "Phiếu đánh giá" },
                    { key: URL.PendingEvaluations, label: "Đánh giá nhân viên" },
                    { key: URL.MyEvaluationResults, label: "Kết quả đánh giá" },
                ]
            },
            {
                key: "manage-payroll", icon: <WalletOutlined />, label: "Lương & Thưởng",
                children: [
                    { key: URL.PayrollPeriods, label: "Quản lý kỳ lương" },
                    { key: URL.MyPayslips, label: "Phiếu lương của tôi" },
                ]
            },
            {
                key: "manage-analytics", icon: <PieChartOutlined />, label: "Báo cáo",
                children: [
                    { key: URL.WorkforceAnalytics, label: "Phân tích Nhân sự" },
                    { key: URL.CompetencyReport, label: "Báo cáo Năng lực" },
                ]
            },
            { key: URL.ManageTask, icon: <TeamOutlined />, label: "Quản lý công việc" },
        ],
        [EUserRole.EMPLOYEE]: [
            { key: URL.MyAttendance, icon: <ClockCircleOutlined />, label: "Chấm công của tôi" },
            { key: URL.MyLeaveRequest, icon: <CalendarOutlined />, label: "Nghỉ phép của tôi" },
            { key: URL.MyOvertimeRequest, icon: <ClockCircleOutlined />, label: "Tăng ca của tôi" },
            { key: URL.MyResignationRequest, icon: <IdcardOutlined />, label: "Đơn thôi việc" },
            { key: URL.ManageTask, icon: <TeamOutlined />, label: "Quản lý công việc" },
            { key: URL.EvaluationList, icon: <SolutionOutlined />, label: "Phiếu đánh giá của tôi" },
            { key: URL.MyEvaluationResults, icon: <AppstoreOutlined />, label: "Kết quả đánh giá" },
            { key: URL.MyPayslips, icon: <WalletOutlined />, label: "Phiếu lương của tôi" },
        ],
        [EUserRole.HR]: [
            { key: URL.DashboardHR, icon: <AppstoreOutlined />, label: "Tổng quan" },
            {
                key: "hr-org", icon: <BankOutlined />, label: "Tổ chức",
                children: [
                    { key: URL.ManageDepartment, label: "Quản lý phòng ban" },
                    { key: URL.ManagePosition, label: "Quản lý chức vụ" },
                    { key: URL.ManageEmployee, label: "Quản lý nhân viên" },
                ]
            },
            {
                key: "hr-time", icon: <ClockCircleOutlined />, label: "Chấm công & Ca làm",
                children: [
                    { key: URL.ManageAttendance, label: "Quản lý chấm công" },
                    { key: URL.MyAttendance, label: "Chấm công của tôi" },
                    { key: URL.ManageFaceRegistration, label: "Đăng ký khuôn mặt" },
                    { key: URL.ManageShift, label: "Quản lý ca" },
                    { key: URL.ManageShiftAssignment, label: "Phân ca làm việc" },
                ]
            },
            {
                key: "hr-leave", icon: <CalendarOutlined />, label: "Nghỉ phép & Tăng ca",
                children: [
                    { key: URL.MyLeaveRequest, label: "Nghỉ phép của tôi" },
                    { key: URL.ManageLeaveRequest, label: "Duyệt nghỉ phép" },
                    { key: URL.LeaveConfiguration, label: "Cấu hình nghỉ phép" },
                    { key: URL.MyOvertimeRequest, label: "Tăng ca của tôi" },
                ]
            },
            {
                key: "hr-services", icon: <IdcardOutlined />, label: "Dịch vụ Nhân sự",
                children: [
                    { key: URL.ManageHRProcedure, label: "Quản lý thủ tục" },
                    { key: URL.MyResignationRequest, label: "Đơn thôi việc của tôi" },
                ]
            },
            {
                key: "hr-perf", icon: <SolutionOutlined />, label: "Đánh giá Năng lực",
                children: [
                    { key: URL.PerformanceTemplates, label: "Mẫu đánh giá" },
                    { key: URL.PerformanceCycles, label: "Đợt đánh giá" },
                    { key: URL.EvaluatorAssignments, label: "Phân công đánh giá" },
                    { key: URL.EvaluationList, label: "Phiếu đánh giá" },
                ]
            },
            {
                key: "hr-payroll", icon: <WalletOutlined />, label: "Lương & Thưởng",
                children: [
                    { key: URL.PayrollPeriods, label: "Quản lý kỳ lương" },
                    { key: URL.MyPayslips, label: "Phiếu lương của tôi" },
                    { key: URL.PayrollReport, label: "Báo cáo quỹ lương" },
                    { key: URL.PayrollMethodology, label: "Quy tắc tính lương" },
                ]
            },
            { key: URL.ManageTask, icon: <TeamOutlined />, label: "Quản lý công việc" },
            {
                key: "hr-config", icon: <SettingOutlined />, label: "Cấu hình",
                children: [
                    { key: URL.HRPayrollSettings, label: "Cấu hình kỳ lương" },
                ]
            },
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
