import { Card, Form, Input, Button, Space } from "antd"
import { BankOutlined, ReloadOutlined, SaveOutlined } from "@ant-design/icons"

interface Props {
  form: any
  loading: boolean
  onFinish: (values: any) => void
  onRefresh: () => void
}

const CompanySettingsCard = ({ form, loading, onFinish, onRefresh }: Props) => {
  return (
    <Card
      title={
        <Space>
          <BankOutlined className="text-indigo-500" />
          <span>Thông tin Công ty</span>
        </Space>
      }
      extra={
        <Button icon={<ReloadOutlined />} onClick={onRefresh} size="small">
          Làm mới
        </Button>
      }
      className="shadow-sm rounded-2xl border border-slate-100"
    >
      <p className="text-slate-400 text-sm mb-4">
        Thông tin này sẽ được in trên phiếu lương PDF xuất ra cho nhân viên.
      </p>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          name="companyName"
          label="Tên công ty"
          rules={[{ required: true, message: "Vui lòng nhập tên công ty" }]}
        >
          <Input placeholder="VD: CÔNG TY CỔ PHẦN HR SYSTEM" />
        </Form.Item>

        <Form.Item name="address" label="Địa chỉ">
          <Input placeholder="VD: Toà nhà Innovation, Quận 12, TP. Hồ Chí Minh" />
        </Form.Item>

        <div className="flex gap-4">
          <Form.Item name="phone" label="Số điện thoại" className="flex-1">
            <Input placeholder="VD: (028) 1234 5678" />
          </Form.Item>
          <Form.Item name="email" label="Email" className="flex-1">
            <Input placeholder="VD: hr@company.com" />
          </Form.Item>
        </div>

        <Form.Item className="mb-0">
          <Button
            type="primary"
            htmlType="submit"
            icon={<SaveOutlined />}
            loading={loading}
          >
            Lưu thông tin
          </Button>
        </Form.Item>
      </Form>
    </Card>
  )
}

export default CompanySettingsCard
