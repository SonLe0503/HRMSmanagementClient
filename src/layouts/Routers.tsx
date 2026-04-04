import { lazy, Suspense } from "react"
import URL from "../constants/url"
import { DEFAULT_LAYOUT, NONE_LAYOUT } from "../constants/layout"
import { Navigate, Route, Routes } from "react-router-dom"
import PrivateLayout from "./PrivateLayout"
import DefaultLayout from "./DefaultLayout"



const Login = lazy(() => import("../app/pages/login"))
const DashboardAdmin = lazy(() => import("../app/pages/dashboard/DashboardAdmin"))
const DashboardHR = lazy(() => import("../app/pages/dashboard/DashboardHR"))
const DashboardManage = lazy(() => import("../app/pages/dashboard/DashboardManage"))
const ManageUser = lazy(() => import("../app/pages/manageAccount"))
const ManageRole = lazy(() => import("../app/pages/manageRole"))

const ManageTask = lazy(() => import("../app/pages/manageTask"))
const ManageEmployee = lazy(() => import("../app/pages/manageEmployee"))
const EmployeeDetail = lazy(() => import("../app/pages/manageEmployee/EmployeeDetail"))
const MyAttendance = lazy(() => import("../app/pages/myAttendance"))
const ManageAttendance = lazy(() => import("../app/pages/manageAttendance"))
const ManageHRProcedure = lazy(() => import("../app/pages/manageHRProcedure"))

const ManageDepartment = lazy(() => import("../app/pages/manageDepartment"));
const DepartmentDetail = lazy(() => import("../app/pages/manageDepartment/DepartmentDetail"));
const ManagePosition = lazy(() => import("../app/pages/managePosition"));
const PositionDetail = lazy(() => import("../app/pages/managePosition/PositionDetail"));
const ManageShift = lazy(() => import("../app/pages/manageShift"));
const ManageShiftAssignment = lazy(() => import("../app/pages/manageShiftAssignment"));
const MyLeaveRequest = lazy(() => import("../app/pages/myLeaveRequest/index"));
const ManageLeaveRequest = lazy(() => import("../app/pages/manageLeaveRequest/index"));
const LeaveConfiguration = lazy(() => import("../app/pages/leaveConfiguration/index"));
const MyOvertimeRequest = lazy(() => import("../app/pages/myOvertimeRequest/index"));
const ManageOvertimeRequest = lazy(() => import("../app/pages/manageOvertimeRequest/index"));
const ManageSystemSettings = lazy(() => import("../app/pages/manageSystemSettings/index"));


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
        element: <ManageTask />,
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
        element: <MyAttendance />,
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
        key: URL.ManageShiftAssignment,
        element: <ManageShiftAssignment />,
        layout: DEFAULT_LAYOUT,
        private: true,
    },
    {
        key: URL.MyLeaveRequest,
        element: <MyLeaveRequest />,
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
        element: <MyOvertimeRequest />,
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
        key: URL.ManageSystemSettings,
        element: <ManageSystemSettings />,
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