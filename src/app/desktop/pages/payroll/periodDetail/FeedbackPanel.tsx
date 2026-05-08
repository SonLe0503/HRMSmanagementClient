import { useState } from "react"
import {
  Card, Table, Tag, Button, Modal, Form, Input, Select, Space, Typography, Badge, Tooltip,
  message,
} from "antd"
import { CommentOutlined, CheckOutlined, CloseOutlined } from "@ant-design/icons"
import type { ColumnsType } from "antd/es/table"
import { useAppDispatch, useAppSelector } from "../../../../../store"
import {
  resolveFeedback,
  selectPeriodFeedbacks,
  selectPayrollLoading,
} from "../../../../../store/payrollSlide"
import type { IPayrollFeedback } from "../../../../../types/payroll"

const { Text } = Typography
const { TextArea } = Input

const FEEDBACK_STATUS_COLORS: Record<string, string> = {
  Pending:   "orange",
  Resolved:  "green",
  Dismissed: "default",
}

const FEEDBACK_STATUS_LABELS: Record<string, string> = {
  Pending:   "Chờ xử lý",
  Resolved:  "Đã xử lý",
  Dismissed: "Bỏ qua",
}

interface Props {
  periodId: number
}

const FeedbackPanel = ({ periodId: _periodId }: Props) => {
  const dispatch  = useAppDispatch()
  const feedbacks = useAppSelector(selectPeriodFeedbacks)
  const loading   = useAppSelector(selectPayrollLoading)

  const [resolveModal, setResolveModal] = useState<IPayrollFeedback | null>(null)
  const [form] = Form.useForm()

  const pendingCount = feedbacks.filter(f => f.status === "Pending").length

  const handleResolve = async (values: { status: "Resolved" | "Dismissed"; hrResponse: string }) => {
    if (!resolveModal) return
    try {
      await dispatch(resolveFeedback({ feedbackId: resolveModal.feedbackId, data: values })).unwrap()
      message.success("Đã xử lý phản hồi!")
      setResolveModal(null)
      form.resetFields()
    } catch (err: any) {
      message.error(err.message || "Lỗi xử lý phản hồi")
    }
  }

  const columns: ColumnsType<IPayrollFeedback> = [
    {
      title: "Nhân viên",
      key: "employee",
      width: 180,
      render: (_, r) => (
        <Space direction="vertical" size={0}>
          <Text strong className="text-sm">{r.employeeName}</Text>
          <Text type="secondary" className="text-xs">{r.employeeCode} · {r.departmentName}</Text>
        </Space>
      ),
    },
    {
      title: "Phản hồi",
      dataIndex: "isAgreed",
      width: 130,
      render: (isAgreed: boolean) => isAgreed
        ? <Tag color="green" icon={<CheckOutlined />}>Đồng ý</Tag>
        : <Tag color="red"   icon={<CloseOutlined />}>Không đồng ý</Tag>,
    },
    {
      title: "Ghi chú",
      dataIndex: "content",
      render: (v?: string) => v
        ? <span className="text-sm">{v}</span>
        : <span className="text-gray-300 text-xs">—</span>,
    },
    {
      title: "Thời gian",
      dataIndex: "submittedAt",
      width: 130,
      render: (v: string) => new Date(v).toLocaleString("vi-VN"),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      width: 120,
      render: (s: string) => (
        <Tag color={FEEDBACK_STATUS_COLORS[s] || "default"}>
          {FEEDBACK_STATUS_LABELS[s] || s}
        </Tag>
      ),
    },
    {
      title: "Phản hồi HR",
      dataIndex: "hrResponse",
      width: 180,
      render: (v?: string) => v
        ? <Text type="secondary" className="text-xs italic">"{v}"</Text>
        : <span className="text-gray-300">—</span>,
    },
    {
      title: "",
      key: "action",
      align: "center",
      width: 100,
      render: (_, r) =>
        r.status === "Pending" ? (
          <Tooltip title="Xử lý phản hồi này">
            <Button
              size="small"
              type="primary"
              ghost
              icon={<CommentOutlined />}
              onClick={() => {
                setResolveModal(r)
                form.resetFields()
              }}
            >
              Xử lý
            </Button>
          </Tooltip>
        ) : null,
    },
  ]

  return (
    <>
      <Card
        title={
          <Space>
            <CommentOutlined className="text-purple-500" />
            <span>Phản hồi từ nhân viên</span>
            {pendingCount > 0 && (
              <Badge count={pendingCount} color="orange" title={`${pendingCount} chờ xử lý`} />
            )}
          </Space>
        }
        className="shadow-sm rounded-xl"
      >
        <Table
          columns={columns}
          dataSource={feedbacks}
          rowKey="feedbackId"
          loading={loading}
          size="small"
          pagination={{ pageSize: 10, showTotal: t => `${t} phản hồi` }}
          locale={{ emptyText: "Chưa có phản hồi nào từ nhân viên." }}
          rowClassName={r => r.status === "Pending" ? "bg-orange-50" : ""}
        />
      </Card>

      <Modal
        title="Xử lý phản hồi"
        open={!!resolveModal}
        onCancel={() => { setResolveModal(null); form.resetFields() }}
        footer={null}
        width={520}
      >
        {resolveModal && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <Text strong>{resolveModal.employeeName}</Text>
            <Text type="secondary" className="text-xs ml-2">{resolveModal.employeeCode}</Text>
            <p className="mt-2 text-sm text-gray-700 mb-0">"{resolveModal.content}"</p>
          </div>
        )}
        <Form form={form} layout="vertical" onFinish={handleResolve}>
          <Form.Item
            name="status"
            label="Kết quả xử lý"
            rules={[{ required: true, message: "Vui lòng chọn kết quả" }]}
          >
            <Select
              options={[
                { label: <><CheckOutlined className="text-green-500 mr-1" />Đã xử lý (Resolved)</>, value: "Resolved" },
                { label: <><CloseOutlined className="text-gray-400 mr-1" />Bỏ qua (Dismissed)</>, value: "Dismissed" },
              ]}
            />
          </Form.Item>
          <Form.Item
            name="hrResponse"
            label="Phản hồi gửi lại nhân viên"
            rules={[{ required: true, message: "Vui lòng nhập phản hồi" }]}
          >
            <TextArea rows={3} maxLength={500} showCount placeholder="Giải thích hoặc thông báo kết quả..." />
          </Form.Item>
          <div className="flex justify-end gap-2">
            <Button onClick={() => { setResolveModal(null); form.resetFields() }}>Hủy</Button>
            <Button type="primary" htmlType="submit" loading={loading}>Xác nhận</Button>
          </div>
        </Form>
      </Modal>
    </>
  )
}

export default FeedbackPanel
