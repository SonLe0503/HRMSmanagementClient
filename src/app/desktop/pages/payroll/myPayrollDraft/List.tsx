import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Card, List, Tag, Button, Typography, Space, Empty, Spin, Alert } from "antd"
import { EyeOutlined, MessageOutlined } from "@ant-design/icons"
import { useAppDispatch, useAppSelector } from "../../../../../store"
import {
  fetchMyPeriods,
  fetchMyFeedbacks,
  selectMyPeriods,
  selectMyFeedbacks,
  selectPayrollLoading,
} from "../../../../../store/payrollSlide"
import URL from "../../../../../constants/url"

const { Title, Text } = Typography

const STATUS_COLORS: Record<string, string> = {
  Open:        "blue",
  Aggregated:  "orange",
  Calculated:  "gold",
  UnderReview: "purple",
  Approved:    "green",
  Closed:      "default",
}

const STATUS_LABELS: Record<string, string> = {
  Open:        "Đang mở",
  Aggregated:  "Đã tổng hợp",
  Calculated:  "Đã tính lương",
  UnderReview: "Chờ xem xét",
  Approved:    "Đã duyệt",
  Closed:      "Đã đóng",
}

const MyPayrollDraftList = () => {
  const dispatch  = useAppDispatch()
  const navigate  = useNavigate()
  const periods   = useAppSelector(selectMyPeriods)
  const feedbacks = useAppSelector(selectMyFeedbacks)
  const loading   = useAppSelector(selectPayrollLoading)

  useEffect(() => {
    dispatch(fetchMyPeriods())
    dispatch(fetchMyFeedbacks())
  }, [dispatch])

  const underReviewPeriods = periods.filter(p => p.status === "UnderReview")
  const otherPeriods       = periods.filter(p => p.status !== "UnderReview")

  const pendingFeedbackCount = feedbacks.filter(f => f.status === "Pending").length

  if (loading && periods.length === 0) {
    return <div className="flex justify-center items-center min-h-screen"><Spin size="large" /></div>
  }

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <Title level={3} className="!mb-1">Phiếu Lương Tạm</Title>
      <Text type="secondary" className="block !mb-5">
        Xem phiếu lương tạm đang chờ xác nhận và gửi phản hồi cho HR.
      </Text>

      {/* Banner khi có phản hồi đang chờ */}
      {pendingFeedbackCount > 0 && (
        <Alert
          type="info"
          showIcon
          className="!mb-4"
          message={`Bạn có ${pendingFeedbackCount} phản hồi đang chờ HR xử lý`}
          description="Vào từng phiếu để xem tình trạng phản hồi của bạn."
        />
      )}

      {/* Phiếu đang chờ xem xét */}
      {underReviewPeriods.length > 0 && (
        <Card
          title={
            <Space>
              <Tag color="purple">ĐANG CHỜ XEM XÉT</Tag>
              <Text className="text-sm font-normal text-gray-500">
                Vui lòng xem và phản hồi trước khi HR phê duyệt
              </Text>
            </Space>
          }
          className="shadow-sm rounded-xl !mb-4 border-purple-200"
        >
          <List
            dataSource={underReviewPeriods}
            renderItem={period => {
              const myFeedbacksForPeriod = feedbacks.filter(
                f => f.periodLabel?.includes(`${period.month}/${period.year}`)
              )
              const hasPending = myFeedbacksForPeriod.some(f => f.status === "Pending")

              return (
                <List.Item
                  key={period.periodId}
                  actions={[
                    <Button
                      type="primary"
                      icon={<EyeOutlined />}
                      onClick={() =>
                        navigate(URL.MyPayrollDraft.replace(":periodId", String(period.periodId)))
                      }
                    >
                      Xem phiếu tạm
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    title={
                      <Space>
                        <Text strong className="text-base">
                          Tháng {period.month}/{period.year}
                        </Text>
                        <Tag color="purple">Chờ xem xét</Tag>
                        {hasPending && (
                          <Tag color="orange" icon={<MessageOutlined />}>
                            Có phản hồi đang chờ
                          </Tag>
                        )}
                      </Space>
                    }
                    description={
                      <Text type="secondary" className="text-xs">
                        Từ {period.startDate} đến {period.endDate}
                        {period.totalNetPay > 0 && (
                          <span className="ml-3 text-green-600 font-semibold">
                            Dự kiến: {period.totalNetPay.toLocaleString("vi-VN")} đ
                          </span>
                        )}
                      </Text>
                    }
                  />
                </List.Item>
              )
            }}
          />
        </Card>
      )}

      {/* Lịch sử kỳ lương khác */}
      {otherPeriods.length > 0 && (
        <Card
          title="Lịch sử kỳ lương"
          className="shadow-sm rounded-xl"
        >
          <List
            dataSource={otherPeriods}
            renderItem={period => (
              <List.Item
                key={period.periodId}
                actions={
                  period.status === "Approved" || period.status === "Closed"
                    ? [
                        <Button
                          size="small"
                          ghost
                          type="primary"
                          icon={<EyeOutlined />}
                          onClick={() =>
                            navigate(URL.MyPayrollDraft.replace(":periodId", String(period.periodId)))
                          }
                        >
                          Xem
                        </Button>,
                      ]
                    : []
                }
              >
                <List.Item.Meta
                  title={
                    <Space>
                      <Text>Tháng {period.month}/{period.year}</Text>
                      <Tag color={STATUS_COLORS[period.status] || "default"}>
                        {STATUS_LABELS[period.status] || period.status}
                      </Tag>
                    </Space>
                  }
                  description={
                    <Text type="secondary" className="text-xs">
                      {period.startDate} — {period.endDate}
                    </Text>
                  }
                />
              </List.Item>
            )}
          />
        </Card>
      )}

      {periods.length === 0 && !loading && (
        <Empty description="Chưa có kỳ lương nào liên quan đến bạn." />
      )}
    </div>
  )
}

export default MyPayrollDraftList
