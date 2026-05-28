import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Card, List, Tag, Button, Typography, Space, Empty, Spin } from "antd"
import { EyeOutlined, ClockCircleOutlined } from "@ant-design/icons"
import { useAppDispatch, useAppSelector } from "../../../../../store"
import {
  fetchMyPeriods,
  selectMyPeriods,
  selectPayrollLoading,
} from "../../../../../store/payrollSlide"
import URL from "../../../../../constants/url"

const { Title, Text } = Typography

const STATUS_COLORS: Record<string, string> = {
  Open:             "default",
  AttendanceReview: "orange",
  Calculated:       "gold",
  Approved:         "green",
  Rejected:         "red",
}

const STATUS_LABELS: Record<string, string> = {
  Open:             "Chưa xử lý",
  AttendanceReview: "Đang review chấm công",
  Calculated:       "Đã tính lương",
  Approved:         "Đã duyệt",
  Rejected:         "Đã từ chối",
}

const MyAttendanceReviewList = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const periods  = useAppSelector(selectMyPeriods)
  const loading  = useAppSelector(selectPayrollLoading)

  useEffect(() => {
    dispatch(fetchMyPeriods())
  }, [dispatch])

  const reviewPeriods = periods.filter(p => p.status === "AttendanceReview")
  const otherPeriods  = periods.filter(p => p.status !== "AttendanceReview")

  if (loading && periods.length === 0) {
    return <div className="flex justify-center items-center min-h-screen"><Spin size="large" /></div>
  }

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <Title level={3} className="!mb-1">Review Chấm Công</Title>
      <Text type="secondary" className="block !mb-5">
        Kiểm tra dữ liệu chấm công trong các kỳ lương đang mở review.
      </Text>

      {reviewPeriods.length > 0 && (
        <Card
          title={
            <Space>
              <Tag color="orange">ĐANG REVIEW CHẤM CÔNG</Tag>
              <Text className="text-sm font-normal text-gray-500">
                Kiểm tra và báo cáo sai sót trước khi hết hạn review
              </Text>
            </Space>
          }
          className="shadow-sm rounded-xl !mb-4 border-orange-200"
        >
          <List
            dataSource={reviewPeriods}
            renderItem={period => (
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
                    Xem chấm công
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  title={
                    <Space>
                      <Text strong className="text-base">Tháng {period.month}/{period.year}</Text>
                      <Tag color="orange" icon={<ClockCircleOutlined />}>Đang review</Tag>
                    </Space>
                  }
                  description={
                    <Text type="secondary" className="text-xs">
                      Từ {period.startDate} đến {period.endDate}
                      {period.reviewDeadline && (
                        <span className={`ml-3 font-semibold ${period.reviewDeadlineExpired ? "text-red-500" : "text-orange-600"}`}>
                          Hạn review: {new Date(period.reviewDeadline).toLocaleDateString("vi-VN")}
                          {period.reviewDeadlineExpired && " (Đã hết hạn)"}
                        </span>
                      )}
                    </Text>
                  }
                />
              </List.Item>
            )}
          />
        </Card>
      )}

      {otherPeriods.length > 0 && (
        <Card title="Lịch sử kỳ lương" className="shadow-sm rounded-xl">
          <List
            dataSource={otherPeriods}
            renderItem={period => (
              <List.Item
                key={period.periodId}
                actions={[
                  <Button
                    ghost
                    type="primary"
                    icon={<EyeOutlined />}
                    onClick={() =>
                      navigate(URL.MyPayrollDraft.replace(":periodId", String(period.periodId)))
                    }
                  >
                    Xem
                  </Button>,
                ]}
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

export default MyAttendanceReviewList
