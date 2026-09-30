import { useEffect, useMemo, useState, type Key } from "react";
import { Card, Select, Tree, Button, Typography, Spin, Space, message } from "antd";
import { SaveOutlined } from "@ant-design/icons";
import type { DataNode } from "antd/es/tree";
import { useSearchParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../../store";
import {
  fetchAllRoles,
  fetchPermissionCatalog,
  fetchRolePermissions,
  updateRolePermissions,
  selectRoles,
  selectPermissionCatalog,
  selectRolePermissionKeys,
  selectPermissionsLoading,
} from "../../../../store/roleSlide";

const { Title, Text } = Typography;
const UNGROUPED = "Chung";
const GROUP_PREFIX = "group:";

const ManagePermission = () => {
  const dispatch = useAppDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const roles = useAppSelector(selectRoles);
  const catalog = useAppSelector(selectPermissionCatalog);
  const grantedKeys = useAppSelector(selectRolePermissionKeys);
  const loading = useAppSelector(selectPermissionsLoading);

  const initialRoleId = Number(searchParams.get("roleId")) || null;
  const [roleId, setRoleId] = useState<number | null>(initialRoleId);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    dispatch(fetchAllRoles());
    dispatch(fetchPermissionCatalog());
  }, [dispatch]);

  // Default to the first role so the page never opens empty.
  useEffect(() => {
    if (roleId == null && roles.length > 0) setRoleId(roles[0].roleId);
  }, [roles, roleId]);

  useEffect(() => {
    if (roleId != null) dispatch(fetchRolePermissions(roleId));
  }, [roleId, dispatch]);

  useEffect(() => {
    setSelected(new Set(grantedKeys));
  }, [grantedKeys]);

  const treeData = useMemo<DataNode[]>(() => {
    const byGroup = new Map<string, typeof catalog>();
    for (const perm of catalog) {
      const group = perm.category || UNGROUPED;
      if (!byGroup.has(group)) byGroup.set(group, []);
      byGroup.get(group)!.push(perm);
    }
    return Array.from(byGroup.entries()).map(([group, perms]) => ({
      key: GROUP_PREFIX + group,
      title: <strong>{group}</strong>,
      children: perms.map((p) => ({
        key: p.permissionKey,
        title: (
          <Space size={4}>
            {p.displayName}
            <Text type="secondary" style={{ fontSize: 12 }}>{p.permissionKey}</Text>
          </Space>
        ),
      })),
    }));
  }, [catalog]);

  const allKeys = useMemo(() => catalog.map((p) => p.permissionKey), [catalog]);

  const handleRoleChange = (id: number) => {
    setRoleId(id);
    setSearchParams({ roleId: String(id) });
  };

  const handleCheck = (checked: Key[] | { checked: Key[] }) => {
    const keys = Array.isArray(checked) ? checked : checked.checked;
    setSelected(new Set(keys.map(String).filter((k) => !k.startsWith(GROUP_PREFIX))));
  };

  const handleSave = () => {
    if (roleId == null) return;
    setSaving(true);
    dispatch(updateRolePermissions({ roleId, permissionKeys: Array.from(selected) }))
      .unwrap()
      .then(() => message.success("Đã lưu phân quyền"))
      .catch((error: any) => {
        const msg = typeof error === "string" ? error : error?.message || "Lưu phân quyền thất bại";
        message.error(msg);
      })
      .finally(() => setSaving(false));
  };

  return (
    <div className="p-2">
      <Card title={<Title level={4} style={{ margin: 0 }}>Phân quyền</Title>}>
        <Space style={{ marginBottom: 16 }} wrap>
          <Select
            style={{ width: 240 }}
            placeholder="Chọn vai trò"
            value={roleId ?? undefined}
            onChange={handleRoleChange}
            options={roles.map((r) => ({ value: r.roleId, label: r.roleName }))}
          />
          <Button type="primary" icon={<SaveOutlined />} disabled={roleId == null} loading={saving} onClick={handleSave}>
            Lưu
          </Button>
          <Button disabled={roleId == null} onClick={() => setSelected(new Set(allKeys))}>Chọn tất cả</Button>
          <Button disabled={roleId == null} onClick={() => setSelected(new Set())}>Bỏ chọn tất cả</Button>
          <Text type="secondary">Đã chọn {selected.size}/{allKeys.length} quyền</Text>
        </Space>

        <Spin spinning={loading}>
          <Text type="secondary" style={{ display: "block", marginBottom: 8 }}>
            Tick chọn những chức năng vai trò này được phép thực hiện; tick nhóm để chọn cả nhóm. Việc hiển thị menu được cấu hình riêng ở trang "Quản lý menu".
          </Text>
          <Tree
            checkable
            defaultExpandAll
            selectable={false}
            key={`${roleId}-${allKeys.length}`}
            treeData={treeData}
            checkedKeys={Array.from(selected)}
            onCheck={handleCheck}
          />
        </Spin>
      </Card>
    </div>
  );
};

export default ManagePermission;
