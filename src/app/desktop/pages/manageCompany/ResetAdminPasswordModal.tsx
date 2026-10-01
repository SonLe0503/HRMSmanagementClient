import { useEffect, useState } from "react";
import { Modal, Select, Alert, Typography, message } from "antd";
import { useAppDispatch } from "../../../../store";
import {
  resetCompanyAdminPassword,
  type ICompany,
  type IResetAdminPasswordResult,
} from "../../../../store/companySlide";

const { Text } = Typography;

interface Props {
  company: ICompany | null;
  onClose: () => void;
  onDone: (result: IResetAdminPasswordResult) => void;
}

const ResetAdminPasswordModal = ({ company, onClose, onDone }: Props) => {
  const dispatch = useAppDispatch();
  const [userId, setUserId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  // Pre-select the first active admin so the common single-admin case is one click
  useEffect(() => {
    setUserId(company?.admins.find((a) => a.isActive)?.userId ?? null);
  }, [company]);

  const handleOk = () => {
    if (!company || userId == null) return;
    setSaving(true);
    dispatch(resetCompanyAdminPassword({ companyId: company.companyId, userId }))
      .unwrap()
      .then(onDone)
      .catch((error: any) => message.error(typeof error === "string" ? error : "Đặt lại mật khẩu thất bại"))
      .finally(() => setSaving(false));
  };

  return (
    <Modal
      title="Đặt lại mật khẩu admin"
      open={!!company}
      onCancel={onClose}
      onOk={handleOk}
      okText="Đặt lại mật khẩu"
      okButtonProps={{ danger: true, disabled: userId == null }}
      cancelText="Hủy"
      confirmLoading={saving}
      destroyOnHidden
    >
      {company && (
        <>
          <Text type="secondary" style={{ display: "block", marginBottom: 8 }}>
            Công ty: <Text strong>{company.companyName}</Text>
          </Text>
          <Select
            style={{ width: "100%", marginBottom: 16 }}
            placeholder="Chọn tài khoản admin"
            value={userId ?? undefined}
            onChange={setUserId}
            options={company.admins.map((a) => ({
              value: a.userId,
              disabled: !a.isActive,
              label: `${a.username} · ${a.email}${a.isActive ? "" : " (đã vô hiệu hóa)"}`,
            }))}
          />
          <Alert
            type="warning"
            showIcon
            message="Mật khẩu hiện tại sẽ không dùng được nữa"
            description="Hệ thống tạo mật khẩu tạm mới, gửi qua email cho admin và đăng xuất mọi phiên đăng nhập đang mở của tài khoản này."
          />
        </>
      )}
    </Modal>
  );
};

export default ResetAdminPasswordModal;
