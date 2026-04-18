import { Row, Col, Card, Statistic } from "antd"
import { useAppSelector } from "../../../../store"
import { selectCurrentPeriod, selectPayrollRecords } from "../../../../store/payrollSlide"
import {
  UsergroupAddOutlined,
  WalletOutlined,
  SafetyCertificateOutlined,
  BankOutlined
} from "@ant-design/icons"

const SummaryCards = () => {
  const period = useAppSelector(selectCurrentPeriod)
  const records = useAppSelector(selectPayrollRecords)

  if (!period) return null

  // Tính từ records cục bộ (tránh stale data từ period.totalGrossPay / totalNetPay)
  const totalGross = records.reduce((sum, r) => {
    return sum + r.salariedAmount + r.totalAllowances + r.overtimePay + r.bonusAmount
  }, 0)

  const totalNet = records.reduce((sum, r) => {
    const gross = r.salariedAmount + r.totalAllowances + r.overtimePay + r.bonusAmount
    const insurance = Math.round(Math.min(gross, 46_800_000) * 0.105)
    const manualDeductions = r.deductions
      .filter(d => d.deductionType === "Manual")
      .reduce((s, d) => s + d.amount, 0)
    return sum + gross - insurance - r.taxAmount - manualDeductions
  }, 0)

  const totalDeductions = totalGross - totalNet

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} sm={12} lg={6}>
        <Card bordered={false} className="shadow-sm border-l-4 border-blue-500">
          <Statistic
            title="Tổng Nhân Viên"
            value={period.totalEmployees}
            prefix={<UsergroupAddOutlined className="text-blue-500 mr-2" />}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card bordered={false} className="shadow-sm border-l-4 border-orange-500">
          <Statistic
            title="Tổng Thu Nhập (Gross)"
            value={totalGross}
            suffix="đ"
            prefix={<WalletOutlined className="text-orange-500 mr-2" />}
            valueStyle={{ color: "#fa8c16" }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card bordered={false} className="shadow-sm border-l-4 border-red-500">
          <Statistic
            title="Ước tính Thuế & BH"
            value={totalDeductions}
            suffix="đ"
            prefix={<SafetyCertificateOutlined className="text-red-500 mr-2" />}
            valueStyle={{ color: "#f5222d" }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card bordered={false} className="shadow-sm border-l-4 border-green-500">
          <Statistic
            title="Thực Lĩnh (Net Pay)"
            value={totalNet}
            suffix="đ"
            prefix={<BankOutlined className="text-green-500 mr-2" />}
            valueStyle={{ color: "#52c41a" }}
          />
        </Card>
      </Col>
    </Row>
  )
}

export default SummaryCards
