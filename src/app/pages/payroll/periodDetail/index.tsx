import { useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Table, Card, Button, Space, Typography, Tag, message, Breadcrumb, Divider } from "antd"
import {
  CalculatorOutlined,
  ArrowLeftOutlined,
  FileExcelOutlined,
  CheckCircleOutlined,
  LoadingOutlined,
  EyeOutlined
} from "@ant-design/icons"
import type { ColumnsType } from "antd/es/table"
import { useAppDispatch, useAppSelector } from "../../../../store"
import {
  fetchPayrollPeriodById,
  fetchRecordsByPeriod,
  calculateAllEmployees,
  approvePayrollPeriod,
  selectCurrentPeriod,
  selectPayrollRecords,
  selectPayrollLoading,
  selectPayrollCalculating
} from "../../../../store/payrollSlide"
import { selectInfoLogin } from "../../../../store/authSlide"
import { EUserRole } from "../../../../interface/app"
import type { IPayrollRecord } from "../../../../types/payroll"
import URL from "../../../../constants/url"
import SummaryCards from "./SummaryCards"

const { Title, Text } = Typography

const PayrollPeriodDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const period = useAppSelector(selectCurrentPeriod)
  const records = useAppSelector(selectPayrollRecords)
  const loading = useAppSelector(selectPayrollLoading)
  const calculating = useAppSelector(selectPayrollCalculating)
  const infoLogin = useAppSelector(selectInfoLogin)

  const periodId = Number(id)
  const isHR = infoLogin?.role === EUserRole.HR
  const isAdmin = infoLogin?.role === EUserRole.ADMIN
  const isApproved = period?.status === "Approved"
  const isCalculated = period?.status === "Calculated"

  useEffect(() => {
    if (periodId) {
      dispatch(fetchPayrollPeriodById(periodId))
      dispatch(fetchRecordsByPeriod(periodId))
    }
  }, [dispatch, periodId])

  const handleCalculateAll = async () => {
    try {
      await dispatch(calculateAllEmployees(periodId)).unwrap()
      message.success("Đã hoàn tất tính lương cho toàn bộ nhân viên!")
    } catch (err: any) {
      message.error(err.message || "Lỗi khi tính lương")
    }
  }

  const handleApprove = async () => {
    try {
      await dispatch(approvePayrollPeriod(periodId)).unwrap()
      message.success("Kỳ lương đã được duyệt và khóa dữ liệu.")
    } catch (err: any) {
      message.error(err.message || "Lỗi khi duyệt kỳ lương")
    }
  }

  const handleExport = () => {
    window.open(`http://localhost:5103/api/Payroll/export/${periodId}`, "_blank")
  }

  const columns: ColumnsType<IPayrollRecord> = [
    {
      title: "Nhân viên",
      key: "employee",
      fixed: "left",
      width: 200,
      render: (_, r) => (
        <Space direction="vertical" size={0}>
          <Text strong>{r.employeeName}</Text>
          <Text type="secondary" className="text-xs">{r.employeeCode}</Text>
        </Space>
      ),
    },
    {
      title: "Công TT",
      dataIndex: "actualWorkingDays",
      align: "center",
      render: (v, r) => (
        <Tag color="blue">
          {Number(v).toFixed(2)} / {r.workingDays || period?.workingDays || "--"}
        </Tag>
      )
    },
    {
      title: "Lương ngày công",
      dataIndex: "salariedAmount",
      align: "right",
      render: (v) => v?.toLocaleString() ?? "—"
    },
    {
      title: "Phụ cấp",
      dataIndex: "totalAllowances",
      align: "right",
      render: (v) => v > 0 ? v.toLocaleString() : "—"
    },
    {
      title: "OT",
      dataIndex: "overtimePay",
      align: "right",
      render: (v) => <Text type="success">{v > 0 ? v.toLocaleString() : "—"}</Text>
    },
    {
      title: "Bảo hiểm",
      key: "insurance",
      align: "right",
      render: (_, r) => {
        const gross = r.salariedAmount + r.totalAllowances + r.overtimePay + r.bonusAmount
        const insurance = Math.round(Math.min(gross, 46_800_000) * 0.105)
        return <Text type="danger">-{insurance.toLocaleString()}</Text>
      }
    },
    {
      title: "Thuế",
      dataIndex: "taxAmount",
      align: "right",
      render: (v) => <Text type="danger">-{v.toLocaleString()}</Text>
    },
    {
      title: "THỰC LĨNH",
      key: "netPay",
      align: "right",
      fixed: "right",
      width: 130,
      render: (_, r) => {
        const gross = r.salariedAmount + r.totalAllowances + r.overtimePay + r.bonusAmount
        const manualDeductions = r.deductions
          .filter(d => d.deductionType === "Manual")
          .reduce((s, d) => s + d.amount, 0)
        const computedNet = gross - r.insuranceAmount - r.taxAmount - manualDeductions
        return <span className="font-bold text-green-600">{computedNet.toLocaleString()} đ</span>
      }
    },
    {
      title: "Thao tác",
      key: "action",
      fixed: "right",
      align: "center",
      width: 100,
      render: (_, r) => (
        <Button 
          type="primary" 
          icon={<EyeOutlined />} 
          size="small"
          onClick={() => navigate(URL.PayrollRecordDetail.replace(":id", String(r.payrollRecordId)))}
        >
          Chi tiết
        </Button>
      ),
    },
  ]

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <Breadcrumb
        className="mb-4"
        items={[
          { title: "Dashboard", href: "/" },
          { title: "Kỳ lương", href: URL.PayrollPeriods },
          { title: `Tháng ${period?.month}/${period?.year}` },
        ]}
      />

      <div className="flex justify-between items-start mb-6">
        <Space direction="vertical" size={0}>
          <Title level={3}>Chi tiết Kỳ lương Tháng {period?.month}/{period?.year}</Title>
          <Space>
            <Tag color="cyan">Từ: {period?.startDate}</Tag>
            <Tag color="cyan">Đến: {period?.endDate}</Tag>
            {period?.status === "Approved" && <Tag color="green" icon={<CheckCircleOutlined />}>ĐÃ DUYỆT</Tag>}
          </Space>
        </Space>

        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>Quay lại</Button>
          {isHR && !isApproved && (
            <Button
              icon={calculating ? <LoadingOutlined /> : <CalculatorOutlined />}
              onClick={handleCalculateAll}
              loading={calculating}
            >
              Tính lương toàn bộ
            </Button>
          )}
          {isHR && isApproved && (
            <Button
              icon={<FileExcelOutlined />}
              onClick={handleExport}
              className="border-green-500 text-green-600"
            >
              Xuất Excel
            </Button>
          )}
          {isAdmin && isCalculated && (
            <Button type="primary" icon={<CheckCircleOutlined />} onClick={handleApprove}>Duyệt & Khóa</Button>
          )}
        </Space>
      </div>

      <SummaryCards />

      <Divider />

      <Card title="Danh sách nhân viên" className="shadow-sm rounded-xl">
        <Table
          columns={columns}
          dataSource={records}
          rowKey="payrollRecordId"
          loading={loading || calculating}
          scroll={{ x: 1200 }}
          pagination={{ pageSize: 20 }}
        />
      </Card>
    </div>
  )
}

export default PayrollPeriodDetail
