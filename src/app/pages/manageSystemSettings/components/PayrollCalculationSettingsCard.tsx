import { Card, Form, InputNumber, Button, Space, Radio, Alert, Divider, Row, Col, Tooltip } from "antd"
import { CalculatorOutlined, ReloadOutlined, SaveOutlined, QuestionCircleOutlined } from "@ant-design/icons"
import { useState } from "react"

interface Props {
    form: any
    loading: boolean
    onFinish: (values: any) => void
    onRefresh: () => void
}

const PayrollCalculationSettingsCard = ({ form, loading, onFinish, onRefresh }: Props) => {
    const [baseMode, setBaseMode] = useState<string>(form.getFieldValue("insuranceBaseMode") || "Gross")

    const handleValuesChange = (changed: any) => {
        if (changed.insuranceBaseMode !== undefined) {
            setBaseMode(changed.insuranceBaseMode)
        }
    }

    const totalInsuranceRate = () => {
        const bhxh = form.getFieldValue("bhxhRate") ?? 8
        const bhyt = form.getFieldValue("bhytRate") ?? 1.5
        const bhtn = form.getFieldValue("bhtnRate") ?? 1
        return (Number(bhxh) + Number(bhyt) + Number(bhtn)).toFixed(1)
    }

    return (
        <Card
            title={
                <Space>
                    <CalculatorOutlined className="text-indigo-500" />
                    <span>Cấu hình Tính Lương (Bảo hiểm & Thuế)</span>
                </Space>
            }
            extra={
                <Button icon={<ReloadOutlined />} onClick={onRefresh} size="small">
                    Làm mới
                </Button>
            }
            className="shadow-sm rounded-2xl border border-slate-100"
        >
            <Alert
                type="info"
                showIcon
                className="mb-5"
                message="Các tỷ lệ được lưu vào SystemSettings và dùng ngay trong lần tính lương tiếp theo. Không cần sửa code khi nhà nước thay đổi quy định."
            />

            <Form form={form} layout="vertical" onFinish={onFinish} onValuesChange={handleValuesChange}>

                {/* ── Bảo hiểm NLĐ ── */}
                <Divider className="text-sm font-semibold text-slate-600">
                    Tỷ lệ Bảo hiểm (phần Người lao động đóng)
                </Divider>

                <Row gutter={16}>
                    <Col xs={24} sm={8}>
                        <Form.Item
                            name="bhxhRate"
                            label={
                                <Space>
                                    BHXH (%)
                                    <Tooltip title="Luật BHXH 58/2014 — Điều 85. Mặc định: 8%">
                                        <QuestionCircleOutlined className="text-gray-400" />
                                    </Tooltip>
                                </Space>
                            }
                            rules={[{ required: true }, { type: "number", min: 0, max: 100 }]}
                        >
                            <InputNumber min={0} max={100} step={0.5} addonAfter="%" style={{ width: "100%" }} />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={8}>
                        <Form.Item
                            name="bhytRate"
                            label={
                                <Space>
                                    BHYT (%)
                                    <Tooltip title="Luật BHYT 46/2014 — Điều 13. Mặc định: 1.5%">
                                        <QuestionCircleOutlined className="text-gray-400" />
                                    </Tooltip>
                                </Space>
                            }
                            rules={[{ required: true }, { type: "number", min: 0, max: 100 }]}
                        >
                            <InputNumber min={0} max={100} step={0.5} addonAfter="%" style={{ width: "100%" }} />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={8}>
                        <Form.Item
                            name="bhtnRate"
                            label={
                                <Space>
                                    BHTN (%)
                                    <Tooltip title="Luật Việc làm 38/2013 — Điều 57. Mặc định: 1%">
                                        <QuestionCircleOutlined className="text-gray-400" />
                                    </Tooltip>
                                </Space>
                            }
                            rules={[{ required: true }, { type: "number", min: 0, max: 100 }]}
                        >
                            <InputNumber min={0} max={100} step={0.5} addonAfter="%" style={{ width: "100%" }} />
                        </Form.Item>
                    </Col>
                </Row>

                <div className="bg-slate-50 rounded-lg px-4 py-2 mb-5 text-sm">
                    Tổng NLĐ đóng: <strong className="text-indigo-600">{totalInsuranceRate()}%</strong>
                    &emsp;|&emsp;Theo luật: <span className="text-gray-500">8% + 1.5% + 1% = 10.5%</span>
                </div>

                {/* ── Căn cứ tính BH ── */}
                <Divider className="text-sm font-semibold text-slate-600">
                    Mức lương làm căn cứ đóng Bảo hiểm
                </Divider>

                <Form.Item
                    name="insuranceBaseMode"
                    label="Chế độ tính căn cứ"
                >
                    <Radio.Group>
                        <Radio value="Gross">
                            <strong>Theo lương gộp thực tế</strong>
                            <div className="text-xs text-gray-400 mt-0.5">
                                BH = min(GrossPay, InsuranceCap) × TỷLệ — đúng quy định nhà nước
                            </div>
                        </Radio>
                        <Radio value="Fixed" className="mt-3">
                            <strong>Mức cố định (khai báo)</strong>
                            <div className="text-xs text-gray-400 mt-0.5">
                                BH = InsuranceFixedBase × TỷLệ — bất kể lương thực tế
                                (áp dụng khi công ty khai báo mức đóng BH riêng)
                            </div>
                        </Radio>
                    </Radio.Group>
                </Form.Item>

                {baseMode === "Gross" && (
                    <Form.Item
                        name="insuranceCap"
                        label={
                            <Space>
                                Mức trần đóng BH (đồng)
                                <Tooltip title="Mặc định: 46,800,000 = 20 × LTT vùng I. Cập nhật khi Nghị định điều chỉnh lương tối thiểu vùng.">
                                    <QuestionCircleOutlined className="text-gray-400" />
                                </Tooltip>
                            </Space>
                        }
                        rules={[{ required: true }, { type: "number", min: 0 }]}
                    >
                        <InputNumber
                            min={0} step={100000}
                            formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                            parser={(v) => Number(v!.replace(/,/g, "")) as any}
                            addonAfter="đ" style={{ width: "100%" }}
                        />
                    </Form.Item>
                )}

                {baseMode === "Fixed" && (
                    <Form.Item
                        name="insuranceFixedBase"
                        label={
                            <Space>
                                Mức lương khai báo cố định (đồng)
                                <Tooltip title="Ví dụ: 7,500,000 (LTT vùng I) hoặc mức công ty tự khai báo với cơ quan BHXH.">
                                    <QuestionCircleOutlined className="text-gray-400" />
                                </Tooltip>
                            </Space>
                        }
                        rules={[{ required: true }, { type: "number", min: 0 }]}
                    >
                        <InputNumber
                            min={0} step={100000}
                            formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                            parser={(v) => Number(v!.replace(/,/g, "")) as any}
                            addonAfter="đ" style={{ width: "100%" }}
                        />
                    </Form.Item>
                )}

                {/* ── Giảm trừ Thuế TNCN ── */}
                <Divider className="text-sm font-semibold text-slate-600">
                    Giảm trừ Thuế TNCN
                    <span className="text-xs font-normal text-gray-400 ml-2">(Nghị quyết 954/2020/UBTVQH14)</span>
                </Divider>

                <Row gutter={16}>
                    <Col xs={24} sm={12}>
                        <Form.Item
                            name="personalDeduction"
                            label={
                                <Space>
                                    Giảm trừ bản thân (đ/tháng)
                                    <Tooltip title="Mặc định: 11,000,000 đ. Cập nhật khi Nghị quyết UBTVQH điều chỉnh.">
                                        <QuestionCircleOutlined className="text-gray-400" />
                                    </Tooltip>
                                </Space>
                            }
                            rules={[{ required: true }, { type: "number", min: 0 }]}
                        >
                            <InputNumber
                                min={0} step={500000}
                                formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                parser={(v) => Number(v!.replace(/,/g, "")) as any}
                                addonAfter="đ" style={{ width: "100%" }}
                            />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                        <Form.Item
                            name="dependentDeduction"
                            label={
                                <Space>
                                    Giảm trừ mỗi người phụ thuộc (đ/tháng)
                                    <Tooltip title="Mặc định: 4,400,000 đ. Cập nhật khi Nghị quyết UBTVQH điều chỉnh.">
                                        <QuestionCircleOutlined className="text-gray-400" />
                                    </Tooltip>
                                </Space>
                            }
                            rules={[{ required: true }, { type: "number", min: 0 }]}
                        >
                            <InputNumber
                                min={0} step={500000}
                                formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                parser={(v) => Number(v!.replace(/,/g, "")) as any}
                                addonAfter="đ" style={{ width: "100%" }}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Alert
                    type="warning"
                    showIcon
                    className="!mb-5"
                    message="Biểu thuế lũy tiến 7 bậc (5%–35%) được cố định trong code theo luật hiện hành. Chỉ giảm trừ bản thân và người phụ thuộc được cấu hình tại đây."
                />

                <Form.Item className="mb-0">
                    <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading}>
                        Lưu cấu hình
                    </Button>
                </Form.Item>
            </Form>
        </Card>
    )
}

export default PayrollCalculationSettingsCard
