import { useEffect, useState } from "react"
import { Card, Table, Typography, Row, Col, Statistic, Tag, Empty, Select } from "antd"
import { DollarOutlined, TeamOutlined, RiseOutlined, CheckCircleOutlined, CalendarOutlined } from "@ant-design/icons"
import type { ColumnsType } from "antd/es/table"
import { useAppDispatch, useAppSelector } from "../../../store"
import { fetchPayrollPeriods, selectPayrollPeriods, selectPayrollLoading } from "../../../store/payrollSlide"
import type { IPayrollPeriod } from "../../../types/payroll"

const { Title, Text } = Typography
const fmt = (v: number) => (v || 0).toLocaleString("vi-VN")

const PayrollReport = () => {
  const dispatch = useAppDispatch()
  const periods = useAppSelector(selectPayrollPeriods)
  const loading = useAppSelector(selectPayrollLoading)

  useEffect(() => {
    dispatch(fetchPayrollPeriods())
  }, [dispatch])

  // Chỉ lấy kỳ đã được duyệt
  const approvedPeriods = periods.filter(p => p.status === "Approved")

  // Danh sách năm có dữ liệu (từ kỳ đã duyệt)
  const availableYears = [...new Set(approvedPeriods.map(p => p.year))].sort((a, b) => b - a)

  // Năm được chọn — mặc định là năm mới nhất có dữ liệu
  const [selectedYear, setSelectedYear] = useState<number | null>(null)
  const currentYear = selectedYear ?? (availableYears[0] ?? new Date().getFullYear())

  // Lọc theo năm được chọn
  const filteredPeriods = approvedPeriods.filter(p => p.year === currentYear)

  // Tổng quan tính từ các kỳ của năm được chọn
  const totalNetPaid  = filteredPeriods.reduce((s, p) => s + (p.totalNetPay  || 0), 0)
  const totalGross    = filteredPeriods.reduce((s, p) => s + (p.totalGrossPay || 0), 0)
  const avgNetPerPeriod = filteredPeriods.length > 0 ? Math.round(totalNetPaid / filteredPeriods.length) : 0
  const lastPeriod = filteredPeriods[0] ?? null

  const columns: ColumnsType<IPayrollPeriod> = [
    {
      title: "Kỳ lương",
      key: "period",
      render: (_, r) => (
        <div>
          <Text strong>Tháng {r.month}/{r.year}</Text>
          <div className="text-xs text-gray-400">
            Duyệt: {r.approvedDate ? new Date(r.approvedDate).toLocaleDateString("vi-VN") : "—"}
            {r.approvedByName && ` · ${r.approvedByName}`}
          </div>
        </div>
      ),
    },
    {
      title: "Nhân viên",
      dataIndex: "totalEmployees",
      align: "center",
      render: (v) => <Tag color="blue">{v} người</Tag>,
    },
    {
      title: "Tổng Gross",
      dataIndex: "totalGrossPay",
      align: "right",
      render: (v) => `${fmt(v)} đ`,
    },
    {
      title: "Tổng BH (10.5%)",
      dataIndex: "totalInsurance",
      align: "right",
      render: (v) => <Text type="danger">−{fmt(v)} đ</Text>,
    },
    {
      title: "Tổng thuế TNCN",
      dataIndex: "totalTax",
      align: "right",
      render: (v) => <Text type="danger">−{fmt(v)} đ</Text>,
    },
    {
      title: "Tổng thực lĩnh (Net)",
      dataIndex: "totalNetPay",
      align: "right",
      render: (v) => (
        <Text strong className="text-green-600">{fmt(v)} đ</Text>
      ),
    },
  ]

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header + bộ lọc năm */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <Title level={2} className="mb-1">Báo cáo quỹ lương</Title>
          <Text type="secondary">Phân tích và tổng hợp quỹ lương theo các kỳ đã được duyệt</Text>
        </div>
        <div className="flex items-center gap-2">
          <CalendarOutlined className="text-gray-500" />
          <Select
            value={currentYear}
            onChange={(v) => setSelectedYear(v)}
            style={{ width: 110 }}
            options={availableYears.map(y => ({ label: `Năm ${y}`, value: y }))}
            placeholder="Chọn năm"
          />
        </div>
      </div>

      {/* Summary cards */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="shadow-sm border-l-4 border-green-500">
            <Statistic
              title={`Tổng thực lĩnh năm ${currentYear}`}
              value={totalNetPaid}
              precision={0}
              valueStyle={{ color: "#3f8600" }}
              prefix={<DollarOutlined />}
              suffix="đ"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="shadow-sm border-l-4 border-orange-500">
            <Statistic
              title={`Tổng Gross năm ${currentYear}`}
              value={totalGross}
              precision={0}
              valueStyle={{ color: "#fa8c16" }}
              prefix={<DollarOutlined />}
              suffix="đ"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="shadow-sm border-l-4 border-blue-500">
            <Statistic
              title="Thực lĩnh trung bình / kỳ"
              value={avgNetPerPeriod}
              precision={0}
              valueStyle={{ color: "#1890ff" }}
              prefix={<RiseOutlined />}
              suffix="đ"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="shadow-sm border-l-4 border-purple-500">
            <Statistic
              title={`Số kỳ đã duyệt năm ${currentYear}`}
              value={filteredPeriods.length}
              prefix={<TeamOutlined />}
              suffix="/ 12 kỳ"
            />
            {lastPeriod && (
              <div className="text-xs text-gray-400 mt-1">
                Gần nhất: Tháng {lastPeriod.month}/{lastPeriod.year}
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* Bảng lịch sử */}
      <Card
        title={
          <div className="flex items-center gap-2">
            <CheckCircleOutlined className="text-green-500" />
            <span>Lịch sử quỹ lương năm {currentYear} (đã duyệt)</span>
          </div>
        }
        className="shadow-sm rounded-xl"
      >
        {filteredPeriods.length === 0 && !loading ? (
          <Empty
            description={`Chưa có kỳ lương nào được duyệt trong năm ${currentYear}`}
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <Table
            columns={columns}
            dataSource={filteredPeriods}
            loading={loading}
            rowKey="periodId"
            pagination={false}
            summary={() => filteredPeriods.length > 1 ? (
              <Table.Summary.Row className="bg-gray-50 font-semibold">
                <Table.Summary.Cell index={0}><Text strong>Tổng năm {currentYear}</Text></Table.Summary.Cell>
                <Table.Summary.Cell index={1} align="center">
                  <Tag color="blue">{filteredPeriods.reduce((s, p) => s + p.totalEmployees, 0) / filteredPeriods.length | 0} người TB</Tag>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={2} align="right"><Text strong>{fmt(totalGross)} đ</Text></Table.Summary.Cell>
                <Table.Summary.Cell index={3} align="right">
                  <Text type="danger">−{fmt(filteredPeriods.reduce((s, p) => s + (p.totalInsurance || 0), 0))} đ</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={4} align="right">
                  <Text type="danger">−{fmt(filteredPeriods.reduce((s, p) => s + (p.totalTax || 0), 0))} đ</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={5} align="right">
                  <Text strong className="text-green-600">{fmt(totalNetPaid)} đ</Text>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            ) : undefined}
          />
        )}
      </Card>
    </div>
  )
}

export default PayrollReport
