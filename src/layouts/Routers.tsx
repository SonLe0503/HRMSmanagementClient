import { lazy, Suspense } from "react"
import URL from "../constants/url"
import { DEFAULT_LAYOUT, NONE_LAYOUT } from "../constants/layout"
import { Navigate, Route, Routes } from "react-router-dom"
import PrivateLayout from "./PrivateLayout"
import DefaultLayout from "./DefaultLayout"



const Login = lazy(() => import("../app/pages/login"))
const DashboardAdmin = lazy(() => import("../app/pages/dashboard/DashboardAdmin"))
const DashboardEmployee = lazy(() => import("../app/pages/dashboard/DashboardEmployee"))
const DashboardHR = lazy(() => import("../app/pages/dashboard/DashboardHR"))
const DashboardManage = lazy(() => import("../app/pages/dashboard/DashboardManage"))
const ManageUser = lazy(() => import("../app/pages/manageAccount"))
const ManageRole = lazy(() => import("../app/pages/manageRole"))

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
        key: URL.DashboardEmployee,
        element: <DashboardEmployee />,
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
    }
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