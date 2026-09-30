import { useEffect, useMemo, useState } from "react";
import { Select, Tree, Button, Space, Spin, Empty, Tag, Typography, message } from "antd";
import { SaveOutlined } from "@ant-design/icons";
import type { DataNode } from "antd/es/tree";
import { useAppDispatch, useAppSelector } from "../../../../store";
import {
  fetchRoleMenus,
  updateRoleMenus,
  fetchMyMenu,
  selectRoleMenuTree,
  selectRoleMenuTreeLoading,
  type IMenuAdminNode,
} from "../../../../store/menuSlide";
import { selectRoles } from "../../../../store/roleSlide";
import { renderMenuIcon } from "../../../../constants/menuIcons";
import { flattenTree } from "./menuTreeUtils";

const { Text } = Typography;

const toTreeData = (nodes: IMenuAdminNode[]): DataNode[] =>
  nodes.map((n) => ({
    key: n.menuId,
    title: (
      <Space size={4}>
        {n.title}
        {n.route && <Text type="secondary" style={{ fontSize: 12 }}>{n.route}</Text>}
        {!n.isActive && <Tag>Đang ẩn</Tag>}
      </Space>
    ),
    icon: renderMenuIcon(n.iconName),
    children: toTreeData(n.children),
  }));

const RoleMenuTab = () => {
  const dispatch = useAppDispatch();
  const roles = useAppSelector(selectRoles);
  const roleTree = useAppSelector(selectRoleMenuTree);
  const loading = useAppSelector(selectRoleMenuTreeLoading);

  const [roleId, setRoleId] = useState<number | null>(null);
  const [granted, setGranted] = useState<Set<number>>(new Set());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (roleId != null) dispatch(fetchRoleMenus(roleId));
  }, [roleId, dispatch]);

  const rows = useMemo(() => flattenTree(roleTree), [roleTree]);

  useEffect(() => {
    setGranted(new Set(rows.filter((r) => r.node.isGranted).map((r) => r.node.menuId)));
  }, [rows]);

  const byId = useMemo(() => new Map(rows.map((r) => [r.node.menuId, r.node])), [rows]);
  const treeData = useMemo(() => toTreeData(roleTree), [roleTree]);
  const allKeys = useMemo(() => rows.map((r) => r.node.menuId), [rows]);

  // A node is only visible when its whole ancestor chain is granted, so keep the set consistent.
  const toggle = (menuId: number, checked: boolean) => {
    setGranted((prev) => {
      const next = new Set(prev);
      if (checked) {
        for (let id: number | null = menuId; id != null; id = byId.get(id)?.parentId ?? null) next.add(id);
      } else {
        const clear = (node: IMenuAdminNode) => {
          next.delete(node.menuId);
          node.children.forEach(clear);
        };
        const node = byId.get(menuId);
        if (node) clear(node);
      }
      return next;
    });
  };

  const handleSave = () => {
    if (roleId == null) return;
    setSaving(true);
    dispatch(updateRoleMenus({ roleId, menuIds: Array.from(granted) }))
      .unwrap()
      .then(() => {
        message.success("Đã lưu phân menu cho vai trò");
        dispatch(fetchMyMenu());
      })
      .catch((error: any) => message.error(typeof error === "string" ? error : "Lưu thất bại"))
      .finally(() => setSaving(false));
  };

  return (
    <>
      <Space style={{ marginBottom: 16 }} wrap>
        <Select
          style={{ width: 240 }}
          placeholder="Chọn vai trò"
          value={roleId ?? undefined}
          onChange={setRoleId}
          options={roles.map((r) => ({ value: r.roleId, label: r.roleName }))}
        />
        <Button type="primary" icon={<SaveOutlined />} disabled={roleId == null} loading={saving} onClick={handleSave}>
          Lưu
        </Button>
        {roleId != null && (
          <>
            <Button onClick={() => setGranted(new Set(allKeys))}>Chọn tất cả</Button>
            <Button onClick={() => setGranted(new Set())}>Bỏ chọn tất cả</Button>
            <Text type="secondary">Đã chọn {granted.size}/{allKeys.length} mục</Text>
          </>
        )}
      </Space>

      {roleId == null ? (
        <Empty description="Chọn một vai trò để phân menu" />
      ) : (
        <Spin spinning={loading}>
          <Text type="secondary" style={{ display: "block", marginBottom: 8 }}>
            Tick mục con sẽ tự tick các mục cha; bỏ tick mục cha sẽ bỏ luôn các mục con.
          </Text>
          <Tree
            checkable
            checkStrictly
            showIcon
            defaultExpandAll
            key={`${roleId}-${allKeys.length}`}
            treeData={treeData}
            checkedKeys={{ checked: Array.from(granted), halfChecked: [] }}
            onCheck={(_, info) => toggle(Number(info.node.key), info.checked)}
            selectable={false}
          />
        </Spin>
      )}
    </>
  );
};

export default RoleMenuTab;
