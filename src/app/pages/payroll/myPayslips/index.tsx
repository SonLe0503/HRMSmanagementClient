import { useEffect } from "react"
import { Table, Card, Button, Typography, Tag } from "antd"
import { FilePdfOutlined } from "@ant-design/icons"
import { useAppDispatch, useAppSelector } from "../../../../store"
import { fetchMyPayslips, selectMyPayslips, selectPayrollLoading } from "../../../../store/payrollSlide"
import type { IPayslip } from "../../../../types/payroll"

const { Title } = Typography

const MyPayslips = () => {
  const dispatch = useAppDispatch()
  const myPayslips = useAppSelector(selectMyPayslips)
  const loading = useAppSelector(selectPayrollLoading)
  const currentUser = useAppSelector((state: any) => state.auth.infoLogin)

  useEffect(() => {
    if (currentUser?.employeeId) {
      dispatch(fetchMyPayslips(currentUser.employeeId))
    }
  }, [dispatch, currentUser])

  const handleDownload = (payslipId: number) => {
    window.open(`http://localhost:5103/api/Payroll/payslips/${payslipId}/pdf`, "_blank")
  }

  const columns = [
    {
      title: "Số phiếu",
      dataIndex: "payslipNumber",
      key: "payslipNumber",
      render: (v: string) => <span className="font-mono text-blue-600">{v}</span>
    },
    {
      title: "Kỳ lương",
      key: "period",
      render: (_: any, r: IPayslip) => <strong>Tháng {r.month}/{r.year}</strong>
    },
    {
      title: "Tổng thu nhập",
      dataIndex: "grossPay",
      align: "right",
      render: (v: number) => v.toLocaleString() + " đ"
    },
    {
      title: "Khấu trừ",
      dataIndex: "totalDeductions",
      align: "right",
      render: (v: number) => <span className="text-red-500">-{v.toLocaleString()} đ</span>
    },
    {
      title: "Thực lĩnh",
      dataIndex: "netPay",
      align: "right",
      render: (v: number) => <span className="font-bold text-green-600">{v.toLocaleString()} đ</span>
    },
    {
      title: "Ngày nhận",
      dataIndex: "generatedDate",
      render: (v: string) => new Date(v).toLocaleDateString("vi-VN")
    },
    {
      title: "Trình trạng",
      dataIndex: "isViewed",
      render: (v: boolean) => v ? <Tag color="default">Đã xem</Tag> : <Tag color="blue">Mới</Tag>
    },
    {
      title: "",
      key: "action",
      render: (_: any, r: IPayslip) => (
        <Button 
          type="primary" 
          icon={<FilePdfOutlined />} 
          onClick={() => handleDownload(r.payslipId)}
        >
          Tải PDF
        </Button>
      )
    }
  ]

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <Title level={2} className="mb-6">Phiếu Lương Của Tôi</Title>
      <Card className="shadow-sm rounded-xl">
        <Table
          columns={columns as any}
          dataSource={myPayslips}
          rowKey="payslipId"
          loading={loading}
          pagination={{ pageSize: 12 }}
        />
      </Card>
    </div>
  )
}

export default MyPayslips
