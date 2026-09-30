import { Modal, Form, Input, message } from "antd";
import { useAppDispatch } from "../../../../../store";
import { createRole, fetchAllRoles } from "../../../../../store/roleSlide";

interface Props {
  open: boolean;
  onClose: () => void;
}

const AddRoleModal = ({ open, onClose }: Props) => {
  const dispatch = useAppDispatch();
  const [form] = Form.useForm();

  const handleOk = () => {
    form.validateFields().then((values) => {
      dispatch(createRole(values))
        .unwrap()
        .then(() => {
          message.success("Tạo vai trò thành công");
          form.resetFields();
          dispatch(fetchAllRoles());
          onClose();
        })
        .catch((error: any) => {
          const msg = typeof error === "string" ? error : error?.message || "Tạo vai trò thất bại";
          message.error(msg);
        });
    });
  };

  return (
    <Modal
      title="Thêm vai trò mới"
      open={open}
      onOk={handleOk}
      onCancel={onClose}
      okText="Tạo"
      cancelText="Hủy"
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="roleName"
          label="Tên vai trò"
          rules={[{ required: true, message: "Vui lòng nhập tên vai trò" }]}
        >
          <Input placeholder="VD: ACCOUNTANT" />
        </Form.Item>
        <Form.Item name="description" label="Mô tả">
          <Input.TextArea rows={3} placeholder="Mô tả vai trò (tùy chọn)" />
        </Form.Item>
      </Form>
      <p style={{ color: "#888", marginTop: 8 }}>
        Vai trò mới sẽ chưa có quyền nào. Sau khi tạo, hãy dùng nút "Phân quyền" để cấp quyền truy cập menu và API.
      </p>
    </Modal>
  );
};

export default AddRoleModal;
