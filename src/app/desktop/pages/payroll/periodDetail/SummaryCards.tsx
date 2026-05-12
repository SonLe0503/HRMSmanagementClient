import { Row, Col, Card, Statistic, Tag } from "antd"
import { useAppSelector } from "../../../../../store"
import { selectCurrentPeriod, selectPayrollRecords } from "../../../../../store/payrollSlide"
import { selectInfoLogin } from "../../../../../store/authSlide"
import { EUserRole } from "../../../../../interface/app"
import {
  UsergroupAddOutlined,
  WalletOutlined,
  SafetyCertificateOutlined,
  BankOutlined
} from "@ant-design/icons"

const SummaryCards = () => {
  const period = useAppSelector(selectCurrentPeriod)
  const records = useAppSelector(selectPayrollRecords)
  const infoLogin = useAppSelector(selectInfoLogin)
  const isManager = infoLogin?.role === EUserRole.MANAGE

  if (!period) return null

  // Tính từ records cục bộ (tránh stale data từ period.totalGrossPay / totalNetPay)
  const totalEmployees = records.length
  const employeeCountTitle = isManager ? "Tổng NV (Quản lý)" : "Tổng Nhân Viên"
  const uniqueDepartments = [...new Set(records.map(r => r.departmentName).filter(Boolean))]
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
          <div className="flex justify-between items-start">
            <Statistic
              title={employeeCountTitle}
              value={totalEmployees}
              prefix={<UsergroupAddOutlined className="text-blue-500 mr-2" />}
            />
          </div>
          {isManager && uniqueDepartments.length > 0 && (
            <div className="mt-2 text-xs text-gray-500">
              Phòng ban: {uniqueDepartments.join(", ")}
            </div>
          )}
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card bordered={false} className="shadow-sm border-l-4 border-orange-500">
          <Statistic
            title={isManager ? "Tổng Thu Nhập (Quản lý)" : "Tổng Thu Nhập (Gross)"}
            value={totalGross}
            suffix="đ"
            prefix={<WalletOutlined className="text-orange-500 mr-2" />}
            valueStyle={{ color: "#fa8c16" }}
          />
          {isManager && (
            <div className="mt-2 text-xs text-gray-500">
              Của {totalEmployees} nhân viên
            </div>
          )}
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card bordered={false} className="shadow-sm border-l-4 border-red-500">
          <Statistic
            title={isManager ? "Thuế & BH (Quản lý)" : "Ước tính Thuế & BH"}
            value={totalDeductions}
            suffix="đ"
            prefix={<SafetyCertificateOutlined className="text-red-500 mr-2" />}
            valueStyle={{ color: "#f5222d" }}
          />
          {isManager && (
            <div className="mt-2 text-xs text-gray-500">
              Của {totalEmployees} nhân viên
            </div>
          )}
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card bordered={false} className="shadow-sm border-l-4 border-green-500">
          <Statistic
            title={isManager ? "Thực Lĩnh (Quản lý)" : "Thực Lĩnh (Net Pay)"}
            value={totalNet}
            suffix="đ"
            prefix={<BankOutlined className="text-green-500 mr-2" />}
            valueStyle={{ color: "#52c41a" }}
          />
          {isManager && (
            <div className="mt-2 text-xs text-gray-500">
              Của {totalEmployees} nhân viên
            </div>
          )}
        </Card>
      </Col>
    </Row>
  )
}

export default SummaryCards
