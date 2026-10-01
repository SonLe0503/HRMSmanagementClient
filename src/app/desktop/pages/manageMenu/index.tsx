import { useEffect } from "react";
import { Card, Tabs, Typography } from "antd";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { selectInfoLogin } from "../../../../store/authSlide";
import { fetchMenuTree } from "../../../../store/menuSlide";
import { fetchAllRoles } from "../../../../store/roleSlide";
import { EUserRole } from "../../../../interface/app";
import MenuTreeTab from "./MenuTreeTab";
import RoleMenuTab from "./RoleMenuTab";

const { Title } = Typography;

// The menu tree is shared by every company, so only the SuperAdmin edits it;
// company admins only choose which menus their own roles see.
const ManageMenu = () => {
  const dispatch = useAppDispatch();
  const infoLogin = useAppSelector(selectInfoLogin);
  const isSuperAdmin = infoLogin?.role === EUserRole.SUPERADMIN;

  useEffect(() => {
    if (isSuperAdmin) dispatch(fetchMenuTree());
    else dispatch(fetchAllRoles());
  }, [dispatch, isSuperAdmin]);

  return (
    <div className="p-2">
      <Card title={<Title level={4} style={{ margin: 0 }}>{isSuperAdmin ? "Cây menu hệ thống" : "Quản lý menu"}</Title>}>
        <Tabs
          items={
            isSuperAdmin
              ? [{ key: "tree", label: "Cây menu", children: <MenuTreeTab /> }]
              : [{ key: "roles", label: "Phân menu theo vai trò", children: <RoleMenuTab /> }]
          }
        />
      </Card>
    </div>
  );
};

export default ManageMenu;
