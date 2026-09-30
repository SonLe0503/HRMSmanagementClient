import { useEffect, useMemo } from "react";
import { Modal, Form, Input, InputNumber, Select, Switch, Checkbox, message, Space } from "antd";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { createMenu, updateMenu, fetchMenuTree, fetchMyMenu, type IMenuAdminNode } from "../../../../store/menuSlide";
import { selectRoles } from "../../../../store/roleSlide";
import { MENU_ICON_NAMES, renderMenuIcon } from "../../../../constants/menuIcons";
import { MAX_MENU_DEPTH, flattenTree, collectDescendantIds } from "./menuTreeUtils";

interface Props {
  open: boolean;
  /** Node being edited, or null when creating. */
  editing: IMenuAdminNode | null;
  /** Pre-selected parent when adding a child. */
  defaultParentId: number | null;
  tree: IMenuAdminNode[];
  onClose: () => void;
}

const MenuItemModal = ({ open, editing, defaultParentId, tree, onClose }: Props) => {
  const dispatch = useAppDispatch();
  const roles = useAppSelector(selectRoles);
  const [form] = Form.useForm();

  useEffect(() => {
    if (!open) return;
    if (editing) {
      form.setFieldsValue({
        title: editing.title,
        code: editing.code,
        parentId: editing.parentId,
        route: editing.route,
        iconName: editing.iconName,
        displayOrder: editing.displayOrder,
        isActive: editing.isActive,
        roleIds: editing.roleIds,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({ parentId: defaultParentId, displayOrder: 0, isActive: true, roleIds: [] });
    }
  }, [open, editing, defaultParentId, form]);

  // A node can't become a child of itself/its descendants, and parents must leave room for depth.
  const parentOptions = useMemo(() => {
    const excluded = editing ? collectDescendantIds(editing) : new Set<number>();
    return flattenTree(tree)
      .filter((row) => !excluded.has(row.node.menuId) && row.depth < MAX_MENU_DEPTH - 1)
      .map((row) => ({
        value: row.node.menuId,
        label: `${"— ".repeat(row.depth)}${row.node.title}`,
      }));
  }, [tree, editing]);

  const iconOptions = useMemo(
    () =>
      MENU_ICON_NAMES.map((name) => ({
        value: name,
        label: (
          <Space>
            {renderMenuIcon(name)}
            <span>{name}</span>
          </Space>
        ),
      })),
    []
  );

  const handleOk = async () => {
    const values = await form.validateFields();
    const data = { ...values, parentId: values.parentId ?? null };
    const action = editing ? updateMenu({ id: editing.menuId, data }) : createMenu(data);

    dispatch(action as any)
      .unwrap()
      .then(() => {
        message.success(editing ? "Đã cập nhật mục menu" : "Đã thêm mục menu");
        dispatch(fetchMenuTree());
        dispatch(fetchMyMenu());
        onClose();
      })
      .catch((error: any) => message.error(typeof error === "string" ? error : "Lưu mục menu thất bại"));
  };

  return (
    <Modal
      title={editing ? "Sửa mục menu" : "Thêm mục menu"}
      open={open}
      onOk={handleOk}
      onCancel={onClose}
      okText="Lưu"
      cancelText="Hủy"
      width={640}
      destroyOnHidden
    >
      <Form form={form} layout="vertical">
        <Form.Item name="title" label="Tên hiển thị" rules={[{ required: true, message: "Nhập tên hiển thị" }]}>
          <Input placeholder="VD: Quản lý nhân viên" />
        </Form.Item>
        <Form.Item
          name="code"
          label="Mã hệ thống"
          tooltip="Mã duy nhất, chỉ gồm chữ, số và . _ -"
          rules={[
            { required: true, message: "Nhập mã hệ thống" },
            { pattern: /^[a-zA-Z0-9._-]+$/, message: "Chỉ gồm chữ, số và các ký tự . _ -" },
          ]}
        >
          <Input placeholder="VD: org.employees" />
        </Form.Item>
        <Form.Item name="parentId" label="Thuộc mục">
          <Select allowClear placeholder="(Mục gốc)" options={parentOptions} />
        </Form.Item>
        <Form.Item name="route" label="Đường dẫn" tooltip="Để trống nếu đây là nhóm chỉ để mở rộng">
          <Input placeholder="VD: /hr/manage-employee" />
        </Form.Item>
        <Form.Item name="iconName" label="Icon">
          <Select
            allowClear
            showSearch
            placeholder="Chọn icon"
            options={iconOptions}
            filterOption={(input, option) => String(option?.value).toLowerCase().includes(input.toLowerCase())}
          />
        </Form.Item>
        <Space size="large">
          <Form.Item name="displayOrder" label="Thứ tự">
            <InputNumber min={0} />
          </Form.Item>
          <Form.Item name="isActive" label="Đang hoạt động" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Space>
        <Form.Item name="roleIds" label="Vai trò thấy mục này">
          <Checkbox.Group options={roles.map((r) => ({ value: r.roleId, label: r.roleName }))} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default MenuItemModal;
