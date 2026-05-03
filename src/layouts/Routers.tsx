import { lazy, Suspense } from "react"
import URL from "../constants/url"
import { DEFAULT_LAYOUT, NONE_LAYOUT } from "../constants/layout"
import { Navigate, Route, Routes } from "react-router-dom"
import PrivateLayout from "./PrivateLayout"
import DefaultLayout from "./DefaultLayout"
import { useIsMobile } from "../hooks/useIsMobile"
import { useAppSelector } from "../store"
import { selectInfoLogin } from "../store/authSlide"
import { EUserRole } from "../interface/app"
import type { JSX } from "react"

// Mobile pages (lazy loaded)
const MobileAttendance        = lazy(() => import("../app/mobile/pages/MobileAttendance"))
const MobileLeaveRequest      = lazy(() => import("../app/mobile/pages/MobileLeaveRequest"))
const MobileOvertimeRequest   = lazy(() => import("../app/mobile/pages/MobileOvertimeRequest"))
const MobileProfile           = lazy(() => import("../app/mobile/pages/MobileProfile"))
const MobileResignation       = lazy(() => import("../app/mobile/pages/MobileResignation"))
const MobileManageTask        = lazy(() => import("../app/mobile/pages/MobileManageTask"))
const MobilePayslips          = lazy(() => import("../app/mobile/pages/MobilePayslips"))
const MobileEvaluationList              = lazy(() => import("../app/mobile/pages/MobileEvaluationList"))
const MobileEvaluationResults           = lazy(() => import("../app/mobile/pages/MobileEvaluationResults"))
const MobileSubmitEvaluation            = lazy(() => import("../app/mobile/pages/MobileSubmitEvaluation"))
const MobileViewEvaluationResultDetail  = lazy(() => import("../app/mobile/pages/MobileViewEvaluationResultDetail"))

const MOBILE_ROLES = [EUserRole.EMPLOYEE, EUserRole.HR, EUserRole.MANAGE]

// Renders mobile page for EMPLOYEE / HR / MANAGE on small screens, desktop otherwise
const AdaptivePage = ({ desktop, mobile }: { desktop: JSX.Element; mobile: JSX.Element }) => {
    const isMobile = useIsMobile()
    const infoLogin = useAppSelector(selectInfoLogin)
    if (isMobile && infoLogin?.role && MOBILE_ROLES.includes(infoLogin.role as any)) return mobile
    return desktop
}



const Login = lazy(() => import("../app/pages/login"))
const DashboardAdmin = lazy(() => import("../app/pages/dashboard/DashboardAdmin"))
const DashboardHR = lazy(() => import("../app/pages/dashboard/DashboardHR"))
const DashboardManage = lazy(() => import("../app/pages/dashboard/DashboardManage"))
const ManageUser = lazy(() => import("../app/pages/manageAccount"))
const ManageRole = lazy(() => import("../app/pages/manageRole"))

const ManageTask = lazy(() => import("../app/pages/manageTask"))
const ManageEmployee = lazy(() => import("../app/pages/manageEmployee"))
const AddEmployee = lazy(() => import("../app/pages/manageEmployee/AddEmployee"))
const EditEmployee = lazy(() => import("../app/pages/manageEmployee/EditEmployee"))
const EmployeeDetail = lazy(() => import("../app/pages/manageEmployee/EmployeeDetail"))
const MyAttendance = lazy(() => import("../app/pages/myAttendance"))
const ManageAttendance = lazy(() => import("../app/pages/manageAttendance"))
const ManageHRProcedure = lazy(() => import("../app/pages/manageHRProcedure"))

const ManageDepartment = lazy(() => import("../app/pages/manageDepartment"));
const DepartmentDetail = lazy(() => import("../app/pages/manageDepartment/DepartmentDetail"));
const ManagePosition = lazy(() => import("../app/pages/managePosition"));
const PositionDetail = lazy(() => import("../app/pages/managePosition/PositionDetail"));
const ManageShift = lazy(() => import("../app/pages/manageShift"));
const AddShift = lazy(() => import("../app/pages/manageShift/AddShift"));
const EditShift = lazy(() => import("../app/pages/manageShift/EditShift"));
const ManageShiftAssignment = lazy(() => import("../app/pages/manageShiftAssignment"));
const MyLeaveRequest = lazy(() => import("../app/pages/myLeaveRequest/index"));
const ManageLeaveRequest = lazy(() => import("../app/pages/manageLeaveRequest/index"));
const LeaveConfiguration = lazy(() => import("../app/pages/leaveConfiguration/index"));
const MyOvertimeRequest = lazy(() => import("../app/pages/myOvertimeRequest/index"));
const ManageOvertimeRequest = lazy(() => import("../app/pages/manageOvertimeRequest/index"));
const WorkforceAnalytics = lazy(() => import("../app/pages/analytics/WorkforceAnalytics"));
const CompetencyReport = lazy(() => import("../app/pages/competency/CompetencyReport"));
const PerformanceTemplates = lazy(() => import("../app/pages/performanceEvaluation/PerformanceTemplates"));
const PerformanceCriteria = lazy(() => import("../app/pages/performanceEvaluation/PerformanceCriteria"));
const PerformanceCycles = lazy(() => import("../app/pages/performanceEvaluation/PerformanceCycles"));
const EvaluatorAssignments = lazy(() => import("../app/pages/performanceEvaluation/EvaluatorAssignments"));
const EvaluationList = lazy(() => import("../app/pages/performanceEvaluation/EvaluationList"));
const PendingEvaluations = lazy(() => import("../app/pages/performanceEvaluation/PendingEvaluations"));
const SubmitEvaluation = lazy(() => import("../app/pages/performanceEvaluation/SubmitEvaluation"));
const MyEvaluationResults = lazy(() => import("../app/pages/performanceEvaluation/MyEvaluationResults"));
const ViewEvaluationResultDetail = lazy(() => import("../app/pages/performanceEvaluation/ViewEvaluationResultDetail"));
const ManageSystemSettings = lazy(() => import("../app/pages/manageSystemSettings/index"));
const HRPayrollSettings = lazy(() => import("../app/pages/hrPayrollSettings/index"));
const ManageFaceRegistration = lazy(() => import("../app/pages/manageFaceRegistration/index"));
const MyProfile = lazy(() => import("../app/pages/myProfile/index"));

const PayrollPeriods = lazy(() => import("../app/pages/payroll/index"));
const PayrollPeriodDetail = lazy(() => import("../app/pages/payroll/periodDetail/index"));
const PayrollRecordDetail = lazy(() => import("../app/pages/payroll/recordDetail/index"));
const MyPayslips = lazy(() => import("../app/pages/payroll/myPayslips/index"));
const PayrollReport = lazy(() => import("../app/pages/payroll/PayrollReport"));
const PayrollMethodology = lazy(() => import("../app/pages/payroll/PayrollMethodology"));
const MyResignationRequest = lazy(() => import("../app/pages/myResignationRequest/index"));
const ManageResignationRequest = lazy(() => import("../app/pages/manageResignationRequest/index"));

const shareResourceItem = [
    {
        key: URL.Login,
        element: <Login />,
        layout: NONE_LAYOUT,
        private: false,
    },
]
const privateResourceItem = [
    {
        key: URL.DashboardAdmin,
        element: <DashboardAdmin />,
        layout: DEFAULT_LAYOUT,
        private: true,
    },
    {
        key: URL.DashboardHR,
        element: <DashboardHR />,
        layout: DEFAULT_LAYOUT,
        private: true,
    },
    {
        key: URL.DashboardManage,
        element: <DashboardManage />,
        layout: DEFAULT_LAYOUT,
        private: true,
    },
    {
        key: URL.ManageUser,
        element: <ManageUser />,
        layout: DEFAULT_LAYOUT,
        private: true,
    },
    {
        key: URL.ManageRole,
        element: <ManageRole />,
        layout: DEFAULT_LAYOUT,
        private: true,
    },

    {
        key: URL.ManageTask,
        element: <AdaptivePage desktop={<ManageTask />} mobile={<MobileManageTask />} />,
        layout: DEFAULT_LAYOUT,
        private: true,
    },
    {
        key: URL.ManageEmployee,
        element: <ManageEmployee />,
        layout: DEFAULT_LAYOUT,
        private: true,
    },
    {
        key: URL.AddEmployee,
        element: <AddEmployee />,
        layout: DEFAULT_LAYOUT,
        private: true,
    },
    {
        key: URL.EditEmployee,
        element: <EditEmployee />,
        layout: DEFAULT_LAYOUT,
        private: true,
    },
    {
        key: URL.EmployeeDetail,
        element: <EmployeeDetail />,
        layout: DEFAULT_LAYOUT,
        private: true,
    },
    {
        key: URL.ManageDepartment,
        element: <ManageDepartment />,
        layout: DEFAULT_LAYOUT,
        private: true,
    },
    {
        key: URL.DepartmentDetail,
        element: <DepartmentDetail />,
        layout: DEFAULT_LAYOUT,
        private: true,
    },
    {
        key: URL.ManagePosition,
        element: <ManagePosition />,
        layout: DEFAULT_LAYOUT,
        private: true,
    },
    {
        key: URL.PositionDetail,
        element: <PositionDetail />,
        layout: DEFAULT_LAYOUT,
        private: true,
    },
    {
        key: URL.MyAttendance,
        element: <AdaptivePage desktop={<MyAttendance />} mobile={<MobileAttendance />} />,
        layout: DEFAULT_LAYOUT,
        private: true,
    },
    {
        key: URL.ManageAttendance,
        element: <ManageAttendance />,
        layout: DEFAULT_LAYOUT,
        private: true,
    },
    {
        key: URL.ManageHRProcedure,
        element: <ManageHRProcedure />,
        layout: DEFAULT_LAYOUT,
        private: true,
    },
    {
        key: URL.ManageShift,
        element: <ManageShift />,
        layout: DEFAULT_LAYOUT,
        private: true,
    },
    {
        key: URL.AddShift,
        element: <AddShift />,
        layout: DEFAULT_LAYOUT,
        private: true,
    },
    {
        key: URL.EditShift,
        element: <EditShift />,
        layout: DEFAULT_LAYOUT,
        private: true,
    },
    {
        key: URL.ManageShiftAssignment,
        element: <ManageShiftAssignment />,
        layout: DEFAULT_LAYOUT,
        private: true,
    },
    {
        key: URL.MyLeaveRequest,
        element: <AdaptivePage desktop={<MyLeaveRequest />} mobile={<MobileLeaveRequest />} />,
        layout: DEFAULT_LAYOUT,
        private: true,
    },
    {
        key: URL.ManageLeaveRequest,
        element: <ManageLeaveRequest />,
        layout: DEFAULT_LAYOUT,
        private: true,
    },
    {
        key: URL.LeaveConfiguration,
        element: <LeaveConfiguration />,
        layout: DEFAULT_LAYOUT,
        private: true,
    },
    {
        key: URL.MyOvertimeRequest,
        element: <AdaptivePage desktop={<MyOvertimeRequest />} mobile={<MobileOvertimeRequest />} />,
        layout: DEFAULT_LAYOUT,
        private: true,
    },
    {
        key: URL.ManageOvertimeRequest,
        element: <ManageOvertimeRequest />,
        layout: DEFAULT_LAYOUT,
        private: true,
    },
    {
        key: URL.WorkforceAnalytics,
        element: <WorkforceAnalytics />,
        layout: DEFAULT_LAYOUT,
        private: true,
    },
    {
        key: URL.CompetencyReport,
        element: <CompetencyReport />,
        layout: DEFAULT_LAYOUT,
        private: true,
    },
    {
        key: URL.PerformanceTemplates,
        element: <PerformanceTemplates />,
        layout: DEFAULT_LAYOUT,
        private: true,
    },
    {
        key: URL.PerformanceCriteria,
        element: <PerformanceCriteria />,
        layout: DEFAULT_LAYOUT,
        private: true,
    },
    {
        key: URL.PerformanceCycles,
        element: <PerformanceCycles />,
        layout: DEFAULT_LAYOUT,
        private: true,
    },
    {
        key: URL.EvaluatorAssignments,
        element: <EvaluatorAssignments />,
        layout: DEFAULT_LAYOUT,
        private: true,
    },
    {
        key: URL.EvaluationList,
        element: <AdaptivePage desktop={<EvaluationList />} mobile={<MobileEvaluationList />} />,
        layout: DEFAULT_LAYOUT,
        private: true,
    },
    {
        key: URL.PendingEvaluations,
        element: <PendingEvaluations />,
        layout: DEFAULT_LAYOUT,
        private: true,
    },
    {
        key: URL.SubmitEvaluation,
        element: <AdaptivePage desktop={<SubmitEvaluation />} mobile={<MobileSubmitEvaluation />} />,
        layout: DEFAULT_LAYOUT,
        private: true,
    },
    {
        key: URL.MyEvaluationResults,
        element: <AdaptivePage desktop={<MyEvaluationResults />} mobile={<MobileEvaluationResults />} />,
        layout: DEFAULT_LAYOUT,
        private: true,
    },
    {
        key: URL.ViewEvaluationResultDetail,
        element: <AdaptivePage desktop={<ViewEvaluationResultDetail />} mobile={<MobileViewEvaluationResultDetail />} />,
        layout: DEFAULT_LAYOUT,
        private: true,
    },
    {
        key: URL.ManageSystemSettings,
        element: <ManageSystemSettings />,
        layout: DEFAULT_LAYOUT,
        private: true,
    },
    {
        key: URL.HRPayrollSettings,
        element: <HRPayrollSettings />,
        layout: DEFAULT_LAYOUT,
        private: true,
    },
    {
        key: URL.ManageFaceRegistration,
        element: <ManageFaceRegistration />,
        layout: DEFAULT_LAYOUT,
        private: true,
    },
    {
        key: URL.MyProfile,
        element: <AdaptivePage desktop={<MyProfile />} mobile={<MobileProfile />} />,
        layout: DEFAULT_LAYOUT,
        private: true,
    },
    {
        key: URL.PayrollPeriods,
        element: <PayrollPeriods />,
        layout: DEFAULT_LAYOUT,
        private: true,
    },
    {
        key: URL.PayrollPeriodDetail,
        element: <PayrollPeriodDetail />,
        layout: DEFAULT_LAYOUT,
        private: true,
    },
    {
        key: URL.PayrollRecordDetail,
        element: <PayrollRecordDetail />,
        layout: DEFAULT_LAYOUT,
        private: true,
    },
    {
        key: URL.MyPayslips,
        element: <AdaptivePage desktop={<MyPayslips />} mobile={<MobilePayslips />} />,
        layout: DEFAULT_LAYOUT,
        private: true,
    },
    {
        key: URL.PayrollReport,
        element: <PayrollReport />,
        layout: DEFAULT_LAYOUT,
        private: true,
    },
    {
        key: URL.PayrollMethodology,
        element: <PayrollMethodology />,
        layout: DEFAULT_LAYOUT,
        private: true,
    },
    {
        key: URL.MyResignationRequest,
        element: <AdaptivePage desktop={<MyResignationRequest />} mobile={<MobileResignation />} />,
        layout: DEFAULT_LAYOUT,
        private: true,
    },
    {
        key: URL.ManageResignationRequest,
        element: <ManageResignationRequest />,
        layout: DEFAULT_LAYOUT,
        private: true,
    },
]
const menus = [...shareResourceItem, ...privateResourceItem]

export default function Routers() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to={URL.Login} replace />} />
            {menus.map((menu: any) => {
                let element = menu.element;
                element = <Suspense fallback={null}>{element}</Suspense>;
                if (menu.private) {
                    element = <PrivateLayout>{element}</PrivateLayout>;
                }
                if (menu.layout === DEFAULT_LAYOUT) {
                    return <Route key={menu.key} path={menu.key} element={<DefaultLayout>{element}</DefaultLayout>} />;
                }
                return <Route key={menu.key} path={menu.key} element={element} />
            })}
        </Routes>
    )
}