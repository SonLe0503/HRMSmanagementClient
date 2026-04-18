import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Table, Card, Button, Tag, Space, Typography, Tooltip } from "antd"
import { PlusOutlined, PlayCircleOutlined } from "@ant-design/icons"
import type { ColumnsType } from "antd/es/table"
import { useAppDispatch, useAppSelector } from "../../../store"
import {
  fetchPayrollPeriods,
  selectPayrollPeriods,
  selectPayrollLoading,
} from "../../../store/payrollSlide"
import { selectInfoLogin } from "../../../store/authSlide"
import { EUserRole } from "../../../interface/app"
import type { IPayrollPeriod } from "../../../types/payroll"
import URL from "../../../constants/url"
import CreatePeriodModal from "./CreatePeriodModal"

const { Title } = Typography

const STATUS_COLORS: Record<string, string> = {
  Open: "blue",
  Aggregated: "orange",
  Calculated: "gold",
  Approved: "green",
  Closed: "default",
}

const PayrollPeriodList = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const periods = useAppSelector(selectPayrollPeriods)
  const loading = useAppSelector(selectPayrollLoading)
  const infoLogin = useAppSelector(selectInfoLogin)

  const isHR = infoLogin?.role === EUserRole.HR

  const [showCreate, setShowCreate] = useState(false)

  useEffect(() => {
    dispatch(fetchPayrollPeriods())
  }, [dispatch])

  const columns: ColumnsType<IPayrollPeriod> = [
    {
      title: "Kỳ lương",
      key: "period",
      render: (_, r) => <span className="font-semibold text-blue-600">Tháng {r.month}/{r.year}</span>,
    },
    {
      title: "Thời gian đối soát",
      key: "range",
      render: (_, r) => (
        <Space direction="vertical" size={0}>
          <small className="text-gray-400">Từ: {r.startDate}</small>
          <small className="text-gray-400">Đến: {r.endDate}</small>
        </Space>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (s: string) => <Tag color={STATUS_COLORS[s] || "default"} className="px-3 rounded-full">{s.toUpperCase()}</Tag>,
    },
    {
      title: "Nhân viên",
      dataIndex: "totalEmployees",
      align: "center",
      render: (v: number) => <Tag color="geekblue">{v} người</Tag>
    },
    {
      title: "Tổng Thực lĩnh",
      dataIndex: "totalNetPay",
      align: "right",
      render: (v: number) => <span className="font-bold text-green-600">{v?.toLocaleString("vi-VN")} đ</span>,
    },
    {
      title: "Thao tác",
      key: "action",
      align: "center",
      render: (_, r) => (
        <Space>
          <Tooltip title="Xem chi tiết và tính lương">
            <Button
              type="primary"
              ghost
              icon={<PlayCircleOutlined />}
              onClick={() => navigate(URL.PayrollPeriodDetail.replace(":id", String(r.periodId)))}
            >
              Chi tiết
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ]

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={2}>Quản Lý Kỳ Lương</Title>
          <p className="text-gray-500">Quản lý và tính toán tiền lương định kỳ cho toàn hệ thống.</p>
        </div>
        {isHR && (
          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            onClick={() => setShowCreate(true)}
            className="shadow-md"
          >
            Tạo kỳ lương mới
          </Button>
        )}
      </div>

      <Card className="shadow-sm rounded-xl overflow-hidden">
        <Table
          columns={columns}
          dataSource={periods}
          rowKey="periodId"
          loading={loading}
          pagination={{ pageSize: 10 }}
          className="payroll-table"
        />
      </Card>

      <CreatePeriodModal
        visible={showCreate}
        onCancel={() => setShowCreate(false)}
        onSuccess={() => {
          setShowCreate(false);
          dispatch(fetchPayrollPeriods());
        }}
      />
    </div>
  )
}

export default PayrollPeriodList
