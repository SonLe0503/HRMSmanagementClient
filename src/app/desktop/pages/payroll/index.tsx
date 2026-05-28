import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Table, Card, Button, Tag, Space, Typography,
  Tooltip, Select, Row, Col, Radio,
} from "antd"
import { PlusOutlined, PlayCircleOutlined } from "@ant-design/icons"
import type { ColumnsType } from "antd/es/table"
import { useAppDispatch, useAppSelector } from "../../../../store"
import {
  fetchPayrollPeriods,
  selectPayrollPeriods,
  selectPayrollLoading,
} from "../../../../store/payrollSlide"
import { selectInfoLogin } from "../../../../store/authSlide"
import { EUserRole } from "../../../../interface/app"
import type { IPayrollPeriod } from "../../../../types/payroll"
import URL from "../../../../constants/url"
import CreatePeriodModal from "./CreatePeriodModal"

const { Title } = Typography

const STATUS_COLORS: Record<string, string> = {
  Open:             "blue",
  AttendanceReview: "orange",
  Calculated:       "gold",
  Approved:         "green",
  Rejected:         "red",
}

const STATUS_LABELS_VI: Record<string, string> = {
  Open:             "Chưa xử lý",
  AttendanceReview: "Review chấm công",
  Calculated:       "Đã tính lương",
  Approved:         "Đã duyệt",
  Rejected:         "Đã từ chối",
}

const ALL_STATUSES = Object.keys(STATUS_LABELS_VI)

const PayrollPeriodList = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const periods = useAppSelector(selectPayrollPeriods)
  const loading = useAppSelector(selectPayrollLoading)
  const infoLogin = useAppSelector(selectInfoLogin)

  const isHR = infoLogin?.role === EUserRole.HR

  const [showCreate, setShowCreate] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [periodFilter, setPeriodFilter] = useState<string | null>(null)

  useEffect(() => {
    dispatch(fetchPayrollPeriods())
  }, [dispatch])

  const periodOptions = useMemo(() => {
    return [...periods]
      .sort((a, b) => b.year !== a.year ? b.year - a.year : b.month - a.month)
      .map(p => ({ label: `Tháng ${p.month}/${p.year}`, value: `${p.month}-${p.year}` }))
  }, [periods])

  const filteredPeriods = useMemo(() => {
    return periods.filter(p => {
      const matchStatus = statusFilter === "all" || p.status === statusFilter
      const matchPeriod = !periodFilter || `${p.month}-${p.year}` === periodFilter
      return matchStatus && matchPeriod
    })
  }, [periods, statusFilter, periodFilter])

  const columns: ColumnsType<IPayrollPeriod> = [
    {
      title: "Kỳ lương",
      key: "period",
      width: 140,
      sorter: (a, b) => {
        if (a.year !== b.year) return b.year - a.year
        return b.month - a.month
      },
      defaultSortOrder: "ascend",
      render: (_, r) => <span className="font-semibold text-blue-600">Tháng {r.month}/{r.year}</span>,
    },
    {
      title: "Thời gian đối soát",
      key: "range",
      width: 180,
      render: (_, r) => (
        <Space direction="vertical" size={0}>
          <small className="text-gray-500">Từ: {r.startDate}</small>
          <small className="text-gray-500">Đến: {r.endDate}</small>
        </Space>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      width: 150,
      filters: ALL_STATUSES.map(s => ({ text: STATUS_LABELS_VI[s], value: s })),
      onFilter: (value, record) => record.status === value,
      render: (s: string) => (
        <Tag color={STATUS_COLORS[s] || "default"} className="px-3 rounded-full">
          {STATUS_LABELS_VI[s] || s}
        </Tag>
      ),
    },
    {
      title: "Nhân viên",
      dataIndex: "totalEmployees",
      align: "center",
      width: 110,
      render: (v: number) => <Tag color="geekblue">{v ?? 0} người</Tag>,
    },
    {
      title: "Tổng Gross",
      dataIndex: "totalGrossPay",
      align: "right",
      width: 150,
      sorter: (a, b) => (a.totalGrossPay ?? 0) - (b.totalGrossPay ?? 0),
      render: (v: number) => (
        <span className="text-gray-700">{(v ?? 0).toLocaleString("vi-VN")} đ</span>
      ),
    },
    {
      title: "Tổng Thực lĩnh",
      dataIndex: "totalNetPay",
      align: "right",
      width: 160,
      sorter: (a, b) => (a.totalNetPay ?? 0) - (b.totalNetPay ?? 0),
      render: (v: number) => (
        <span className="font-bold text-green-600">{(v ?? 0).toLocaleString("vi-VN")} đ</span>
      ),
    },
    {
      title: "Ngày tính lương",
      dataIndex: "calculatedDate",
      width: 140,
      render: (v?: string) => v
        ? new Date(v).toLocaleDateString("vi-VN")
        : <span className="text-gray-400">—</span>,
    },
    {
      title: "Ngày duyệt",
      dataIndex: "approvedDate",
      width: 120,
      render: (v?: string) => v
        ? new Date(v).toLocaleDateString("vi-VN")
        : <span className="text-gray-400">—</span>,
    },
    {
      title: "Thao tác",
      key: "action",
      align: "center",
      fixed: "right",
      width: 110,
      render: (_, r) => (
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
      ),
    },
  ]

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center !mb-5">
        <div>
          <Title level={2} className="!mb-0">Quản Lý Kỳ Lương</Title>
          <p className="text-gray-500 mt-1">Quản lý và tính toán tiền lương định kỳ cho toàn hệ thống.</p>
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

      {/* Bộ lọc */}
      <Card className="!mb-4 shadow-sm rounded-xl">
        <Row gutter={[16, 12]} align="middle">
          <Col xs={24} sm={8} md={7}>
            <Select
              placeholder="Chọn kỳ lương"
              options={periodOptions}
              value={periodFilter}
              onChange={setPeriodFilter}
              allowClear
              style={{ width: "100%" }}
            />
          </Col>
          <Col xs={24} md={13}>
            <div style={{ overflowX: "auto", whiteSpace: "nowrap", paddingBottom: 2 }}>
              <Radio.Group
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                optionType="button"
                buttonStyle="solid"
              >
                <Radio.Button value="all">Tất cả</Radio.Button>
                {ALL_STATUSES.map(s => (
                  <Radio.Button key={s} value={s}>
                    <span style={{ color: statusFilter === s ? undefined : STATUS_COLORS[s] }}>
                      {STATUS_LABELS_VI[s]}
                    </span>
                  </Radio.Button>
                ))}
              </Radio.Group>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Bảng danh sách */}
      <Card className="!mb-4 shadow-sm rounded-xl overflow-hidden">
        <Table
          columns={columns}
          dataSource={filteredPeriods}
          rowKey="periodId"
          loading={loading}
          pagination={{ pageSize: 12, showTotal: (total) => `${total} kỳ lương` }}
          scroll={{ x: 1100 }}
          onRow={(r) => ({
            style: { cursor: "pointer" },
            onClick: () => navigate(URL.PayrollPeriodDetail.replace(":id", String(r.periodId))),
          })}
        />
      </Card>

      <CreatePeriodModal
        visible={showCreate}
        onCancel={() => setShowCreate(false)}
        onSuccess={() => {
          setShowCreate(false)
          dispatch(fetchPayrollPeriods())
        }}
      />
    </div>
  )
}

export default PayrollPeriodList
