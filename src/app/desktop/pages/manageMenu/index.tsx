import { useEffect } from "react";
import { Card, Tabs, Typography } from "antd";
import { useAppDispatch } from "../../../../store";
import { fetchMenuTree } from "../../../../store/menuSlide";
import { fetchAllRoles } from "../../../../store/roleSlide";
import MenuTreeTab from "./MenuTreeTab";
import RoleMenuTab from "./RoleMenuTab";

const { Title } = Typography;

const ManageMenu = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchMenuTree());
    dispatch(fetchAllRoles());
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

export default ManageMenu;
