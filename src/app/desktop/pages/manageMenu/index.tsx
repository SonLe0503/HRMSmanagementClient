import { useEffect } from "react";
import { Card, Tabs, Typography } from "antd";
import { useAppDispatch } from "../../../../store";
import { fetchMenuTree } from "../../../../store/menuSlide";
import { SuperAdminOnly } from "../../components/companyScopeSelect";
import MenuTreeTab from "./MenuTreeTab";
import RoleMenuTab from "./RoleMenuTab";

const { Title } = Typography;

// The menu tree is shared by every company; which menus each company role sees is picked per company.
// Both are configured by the SuperAdmin.
const ManageMenuContent = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchMenuTree());
  }, [dispatch]);

  return (
    <div className="p-2">
      <Card title={<Title level={4} style={{ margin: 0 }}>Quản lý menu</Title>}>
        <Tabs
          items={[
            { key: "tree", label: "Cây menu", children: <MenuTreeTab /> },
            { key: "roles", label: "Phân menu theo vai trò", children: <RoleMenuTab /> },
          ]}
        />
      </Card>
    </div>
  );
};

const ManageMenu = () => (
  <SuperAdminOnly>
    <ManageMenuContent />
  </SuperAdminOnly>
);

export default ManageMenu;
