import { useEffect, useMemo, useState } from "react";
import { Card, Select, Checkbox, Button, Divider, Typography, Spin, Empty, message, Space } from "antd";
import { SaveOutlined } from "@ant-design/icons";
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

  useEffect(() => {
    if (roleId != null) dispatch(fetchRolePermissions(roleId));
  }, [roleId, dispatch]);

  useEffect(() => {
    setSelected(new Set(grantedKeys));
  }, [grantedKeys]);

  const groups = useMemo(() => {
    const byParent = new Map<string, typeof catalog>();
    for (const perm of catalog) {
      const parent = perm.category || UNGROUPED;
      if (!byParent.has(parent)) byParent.set(parent, []);
      byParent.get(parent)!.push(perm);
    }
    return Array.from(byParent.entries());
  }, [catalog]);

  const handleRoleChange = (id: number) => {
    setRoleId(id);
    setSearchParams({ roleId: String(id) });
  };

  const toggle = (key: string, checked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(key);
      else next.delete(key);
      return next;
    });
  };

  const toggleGroup = (keys: string[], checked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      keys.forEach((k) => (checked ? next.add(k) : next.delete(k)));
      return next;
    });
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
      <Card
        title={
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Title level={4} style={{ margin: 0 }}>Phân quyền</Title>
            <Space>
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
            </Space>
          </div>
        }
      >
        {roleId == null ? (
          <Empty description="Chọn một vai trò để cấu hình quyền truy cập menu và chức năng" />
        ) : (
          <Spin spinning={loading}>
            <Text type="secondary">
              Tick chọn những chức năng vai trò này được phép thực hiện. Việc hiển thị menu được cấu hình riêng ở trang "Quản lý menu". Thay đổi có hiệu lực ngay.
            </Text>
            {groups.map(([groupName, perms]) => {
              const keys = perms.map((p) => p.permissionKey);
              const checkedCount = keys.filter((k) => selected.has(k)).length;
              return (
                <div key={groupName} style={{ marginTop: 16 }}>
                  <Divider titlePlacement="left" plain style={{ margin: "8px 0" }}>
                    <Checkbox
                      checked={checkedCount === keys.length}
                      indeterminate={checkedCount > 0 && checkedCount < keys.length}
                      onChange={(e) => toggleGroup(keys, e.target.checked)}
                    >
                      <strong>{groupName}</strong>
                    </Checkbox>
                  </Divider>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 8, paddingLeft: 24 }}>
                    {perms.map((perm) => (
                      <Checkbox
                        key={perm.permissionKey}
                        checked={selected.has(perm.permissionKey)}
                        onChange={(e) => toggle(perm.permissionKey, e.target.checked)}
                      >
                        {perm.displayName}
                        <div style={{ fontSize: 11, color: "#999" }}>{perm.permissionKey}</div>
                      </Checkbox>
                    ))}
                  </div>
                </div>
              );
            })}
          </Spin>
        )}
      </Card>
    </div>
  );
};

export default ManagePermission;
