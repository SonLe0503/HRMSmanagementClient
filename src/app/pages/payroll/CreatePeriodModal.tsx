import { Modal, Form, DatePicker, Select, Row, Col, message } from "antd"
import { useAppDispatch } from "../../../store"
import { createPayrollPeriod } from "../../../store/payrollSlide"

interface Props {
  visible: boolean
  onCancel: () => void
  onSuccess: () => void
}

const CreatePeriodModal = ({ visible, onCancel, onSuccess }: Props) => {
  const [form] = Form.useForm()
  const dispatch = useAppDispatch()

  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      const payload = {
        month: values.month,
        year: values.year,
        startDate: values.range[0].format("YYYY-MM-DD"),
        endDate: values.range[1].format("YYYY-MM-DD"),
      }

      await dispatch(createPayrollPeriod(payload)).unwrap()
      message.success("Tạo kỳ lương thành công!")
      form.resetFields()
      onSuccess()
    } catch (err: any) {
      message.error(err.message || "Không thể tạo kỳ lương")
    }
  }

  return (
    <Modal
      title="Tạo Kỳ Lương Mới"
      open={visible}
      onOk={handleOk}
      onCancel={onCancel}
      okText="Xác nhận"
      cancelText="Hủy bỏ"
      width={500}
    >
      <Form form={form} layout="vertical" className="mt-4">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="month" label="Tháng" rules={[{ required: true }]}>
              <Select placeholder="Chọn tháng">
                {Array.from({ length: 12 }, (_, i) => (
                  <Select.Option key={i + 1} value={i + 1}>Tháng {i + 1}</Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="year" label="Năm" rules={[{ required: true }]}>
              <Select placeholder="Chọn năm">
                {[2024, 2025, 2026].map(y => (
                  <Select.Option key={y} value={y}>{y}</Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item 
          name="range" 
          label="Thời gian chốt công" 
          rules={[{ required: true, message: "Vui lòng chọn khoảng thời gian" }]}
        >
          <DatePicker.RangePicker className="w-full" />
        </Form.Item>
        
        <p className="text-gray-400 text-xs italic">
          * Lưu ý: Thời gian này dùng để lọc dữ liệu Chấm công, Nghỉ phép và OT của nhân viên.
        </p>
      </Form>
    </Modal>
  )
}

export default CreatePeriodModal
