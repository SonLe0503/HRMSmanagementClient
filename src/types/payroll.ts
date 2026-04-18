// src/types/payroll.ts

export interface IPayrollPeriod {
  periodId: number
  month: number
  year: number
  startDate: string
  endDate: string
  status: 'Open' | 'Aggregated' | 'Calculated' | 'Approved' | 'Closed'
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
