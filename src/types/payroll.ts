// src/types/payroll.ts

export interface IPayrollPeriod {
  periodId: number
  month: number
  year: number
  startDate: string
  endDate: string
  status: 'Open' | 'Aggregated' | 'Calculated' | 'UnderReview' | 'Approved' | 'Rejected'
  totalEmployees: number
  totalGrossPay: number
  totalNetPay: number
  totalInsurance: number
  totalTax: number
  aggregatedDate?: string
  calculatedDate?: string
  approvedDate?: string
  approvedByName?: string
  workingDays?: number
  reviewDeadline?: string
  reviewDeadlineExpired?: boolean
  allAgreed?: boolean
  agreedCount?: number
  rejectionReason?: string
  rejectedByName?: string
  rejectedDate?: string
}

export interface ICreatePayrollPeriod {
  month: number
  year: number
  startDate: string
  endDate: string
}

export interface IPayrollRecord {
  payrollRecordId: number
  employeeId: number
  employeeCode: string
  employeeName: string
  departmentName: string
  positionName: string
  periodId: number
  periodStatus?: string
  baseSalary: number
  workingDays: number
  actualWorkingDays: number
  salariedAmount: number   // Lương theo ngày công = baseSalary / workingDays × actualWorkingDays
  totalAllowances: number  // Phụ cấp chính sách (không bao gồm OT)
  overtimePay: number
  bonusAmount: number
  grossPay: number
  insuranceAmount: number
  taxAmount: number
  totalDeductions: number
  netPay: number
  status: string
  calculatedDate?: string
  approvedDate?: string
  allowances: IPayrollAllowance[]
  deductions: IPayrollDeduction[]
}

export interface IPayrollAllowance {
  allowanceId: number
  allowanceType: string
  allowanceName: string
  amount: number
  description?: string
}

export interface IPayrollDeduction {
  deductionId: number
  deductionType: string
  deductionName: string
  amount: number
  description?: string
}

export interface IPayslip {
  payslipId: number
  payslipNumber: string
  employeeId: number
  employeeCode: string
  employeeName: string
  departmentName: string
  positionName: string
  month: number
  year: number
  grossPay: number
  totalDeductions: number
  netPay: number
  generatedDate: string
  isViewed: boolean
  viewedDate?: string
}

export interface IPayrollSummary {
  periodId: number
  month: number
  year: number
  totalEmployees: number
  totalBaseSalary: number
  totalAllowances: number
  totalOvertimePay: number
  totalBonuses: number
  totalGrossPay: number
  totalInsurance: number
  totalTax: number
  totalDeductions: number
  totalNetPay: number
  byDepartment: { departmentName: string; employeeCount: number; totalNetPay: number }[]
}

export interface IPayrollFeedback {
  feedbackId: number
  payrollRecordId: number
  employeeId: number
  employeeName: string
  employeeCode: string
  departmentName: string
  content?: string
  isAgreed: boolean
  submittedAt: string
  status: 'Pending' | 'Resolved' | 'Dismissed'
  hrResponse?: string
  resolvedAt?: string
  resolvedByName?: string
  netPay: number
  periodLabel: string
}

export interface ICreatePayrollFeedback {
  isAgreed: boolean
  content?: string
}

export interface IAttendanceItem {
  date: string
  status: string
  workingHours: number
  isExplanationApproved: boolean
}

export interface ILeaveItem {
  startDate: string
  endDate: string
  leaveTypeName: string
  isPaid: boolean
  days: number
}

export interface IOvertimeItem {
  date: string
  hours: number
}

export interface IAttendanceTotals {
  presentDays: number
  lateDays: number
  absentDays: number
  explanationApprovedDays: number
  paidLeaveDays: number
  overtimeHours: number
  totalActualDays: number
}

export interface IAttendanceSummary {
  records: IAttendanceItem[]
  approvedLeaves: ILeaveItem[]
  approvedOvertime: IOvertimeItem[]
  totals: IAttendanceTotals
}

export interface IResolveFeedback {
  status: 'Resolved' | 'Dismissed'
  hrResponse: string
}

export interface IRejectPayrollPeriod {
  reason: string
}

export interface ITaxCalculationResult {
  grossIncome: number
  insuranceDeduction: number
  personalDeduction: number
  dependentDeduction: number
  taxableIncome: number
  taxAmount: number
  taxBracket: number
  effectiveTaxRate: number
}
