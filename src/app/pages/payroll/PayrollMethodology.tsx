import { Typography, Card, Table, Tag, Collapse, Alert, Divider, Row, Col, Timeline } from "antd"
import {
  BookOutlined,
  CalculatorOutlined,
  SafetyCertificateOutlined,
  FileTextOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons"

const { Title, Text, Paragraph } = Typography
const { Panel } = Collapse

// ── Bảng bậc thuế TNCN ──────────────────────────────────────────
const tncnBrackets = [
  { bac: 1, range: "Đến 5 triệu đ/tháng",       rate: "5%",  base: "Thu nhập tính thuế × 5%" },
  { bac: 2, range: "5 – 10 triệu đ/tháng",       rate: "10%", base: "0.25tr + (TN − 5tr) × 10%" },
  { bac: 3, range: "10 – 18 triệu đ/tháng",      rate: "15%", base: "0.75tr + (TN − 10tr) × 15%" },
  { bac: 4, range: "18 – 32 triệu đ/tháng",      rate: "20%", base: "1.95tr + (TN − 18tr) × 20%" },
  { bac: 5, range: "32 – 52 triệu đ/tháng",      rate: "25%", base: "4.75tr + (TN − 32tr) × 25%" },
  { bac: 6, range: "52 – 80 triệu đ/tháng",      rate: "30%", base: "9.75tr + (TN − 52tr) × 30%" },
  { bac: 7, range: "Trên 80 triệu đ/tháng",      rate: "35%", base: "18.15tr + (TN − 80tr) × 35%" },
]

const tncnColumns = [
  { title: "Bậc", dataIndex: "bac", width: 60, render: (v: number) => <Tag color="blue">Bậc {v}</Tag> },
  { title: "Thu nhập tính thuế / tháng", dataIndex: "range" },
  { title: "Thuế suất", dataIndex: "rate", render: (v: string) => <Tag color="orange">{v}</Tag> },
  { title: "Số thuế phải nộp", dataIndex: "base", className: "text-xs text-gray-500" },
]

// ── Bảng tỷ lệ bảo hiểm ─────────────────────────────────────────
const insuranceRates = [
  { loai: "BHXH (Hưu trí, tử tuất, ốm đau, thai sản)", nv: "8%", dn: "17.5%", tong: "25.5%", cancu: "Luật BHXH 2014 – Điều 85, 86" },
  { loai: "BHYT (Khám chữa bệnh)",                       nv: "1.5%", dn: "3%",   tong: "4.5%",  cancu: "Luật BHYT 2008 (sửa đổi 2014) – Điều 13" },
  { loai: "BHTN (Thất nghiệp)",                           nv: "1%",   dn: "1%",   tong: "2%",    cancu: "Luật Việc làm 2013 – Điều 57" },
  { loai: "Tổng NLĐ đóng",                                nv: "10.5%", dn: "—",   tong: "—",     cancu: "" },
]

const insuranceColumns = [
  { title: "Loại bảo hiểm",            dataIndex: "loai", render: (v: string) => <Text strong>{v}</Text> },
  { title: "NLĐ đóng",                 dataIndex: "nv",   render: (v: string) => <Tag color="red">{v}</Tag> },
  { title: "NSDLĐ đóng",               dataIndex: "dn",   render: (v: string) => v !== "—" ? <Tag color="volcano">{v}</Tag> : <Text type="secondary">—</Text> },
  { title: "Tổng",                      dataIndex: "tong", render: (v: string) => v !== "—" ? <Tag color="magenta">{v}</Tag> : <Text type="secondary">—</Text> },
  { title: "Căn cứ pháp lý",            dataIndex: "cancu", className: "text-xs text-gray-500" },
]

// ── Hệ số lương OT ───────────────────────────────────────────────
const otRates = [
  { loai: "Ngày làm việc thường",         heso: "×1.5", cancu: "Điều 98.1a – Bộ Luật Lao động 2019" },
  { loai: "Ngày nghỉ hàng tuần (Thứ 7)", heso: "×2.0", cancu: "Điều 98.1b – Bộ Luật Lao động 2019" },
  { loai: "Ngày Chủ Nhật",                heso: "×2.0", cancu: "Điều 98.1b – Bộ Luật Lao động 2019" },
  { loai: "Ngày lễ, Tết",                 heso: "×3.0", cancu: "Điều 98.1c – Bộ Luật Lao động 2019" },
]

const otColumns = [
  { title: "Loại ngày tăng ca", dataIndex: "loai", render: (v: string) => <Text strong>{v}</Text> },
  { title: "Hệ số lương OT",    dataIndex: "heso", render: (v: string) => <Tag color="green" className="text-base font-bold">{v}</Tag> },
  { title: "Căn cứ pháp lý",    dataIndex: "cancu", className: "text-xs text-gray-500" },
]

const PayrollMethodology = () => {
  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <Title level={2}>
          <BookOutlined className="mr-2 text-blue-500" />
          Quy tắc Tính Lương & Cơ sở Pháp lý
        </Title>
        <Paragraph className="text-gray-500 max-w-3xl">
          Trang này mô tả toàn bộ quy trình tính lương đang được áp dụng trong hệ thống,
          kèm theo căn cứ pháp lý từ các văn bản pháp luật hiện hành của Việt Nam.
          Mọi thay đổi thuế suất hoặc mức đóng bảo hiểm cần được cập nhật tại đây và trong cấu hình hệ thống.
        </Paragraph>
        <Alert
          type="info"
          showIcon
          icon={<InfoCircleOutlined />}
          message="Lưu ý: Tỷ lệ đóng BH được tính trên mức lương tối đa = 20 × Lương tối thiểu vùng (hiện tại ≈ 46,800,000 đ/tháng tại Vùng I)"
          className="max-w-3xl"
        />
      </div>

      {/* ── QUY TRÌNH TỔNG QUÁT ─────────────────── */}
      <Card
        title={<><CalculatorOutlined className="mr-2 text-blue-500" />Quy trình tính lương (9 bước)</>}
        className="shadow-sm rounded-xl mb-4"
      >
        <Timeline
          items={[
            {
              color: "blue",
              children: (
                <div>
                  <Text strong>Bước 1 — Xác định ngày công chuẩn (mẫu số)</Text>
                  <Paragraph className="text-gray-500 text-sm mb-0">
                    Đếm số ngày được <strong>phân ca làm việc</strong> (<code>ShiftAssignment</code>) của nhân viên trong kỳ lương.
                    Nếu nhân viên chưa được phân ca, fallback về đếm ngày Thứ 2 – Thứ 6 trong kỳ.
                  </Paragraph>
                </div>
              ),
            },
            {
              color: "blue",
              children: (
                <div>
                  <Text strong>Bước 2 — Xác định ngày công thực tế quy đổi (tử số)</Text>
                  <Paragraph className="text-gray-500 text-sm mb-1">
                    Tính <code>Σ (WorkingHours / ShiftStandardHours)</code> cho các bản ghi hợp lệ:
                  </Paragraph>
                  <ul className="text-gray-500 text-sm list-disc pl-5 space-y-1 mb-1">
                    <li>
                      <Tag color="green" className="text-xs">Present</Tag>{" "}
                      <Tag color="orange" className="text-xs">Late</Tag>{" "}
                      → luôn tính, dùng <code>WorkingHours</code> thực ghi nhận
                    </li>
                    <li>
                      Bất kỳ trạng thái nào có{" "}
                      <Tag color="blue" className="text-xs">ExplanationStatus = Approved</Tag>{" "}
                      → tính, nếu không có <code>WorkingHours</code> thì tính toàn bộ giờ ca
                    </li>
                    <li>
                      Giải trình <strong>chưa duyệt hoặc bị từ chối</strong> → không tính công
                    </li>
                    <li>
                      <code>LeaveRequest</code> được duyệt có lương (<Tag color="blue" className="text-xs">IsPaid</Tag>) → cộng thêm ngày nghỉ vào ngày công
                    </li>
                  </ul>
                  <div className="bg-gray-100 rounded px-3 py-1 inline-block text-sm font-mono">
                    ShiftStandardHours = Shift.WorkingHours (từ ShiftAssignment)
                  </div>
                </div>
              ),
            },
            {
              color: "blue",
              children: (
                <div>
                  <Text strong>Bước 3 — Tính lương ngày công</Text>
                  <div className="bg-gray-100 rounded px-3 py-2 inline-block text-sm font-mono mt-1">
                    Lương ngày công = Lương cơ bản ÷ Số ngày phân ca × Ngày công thực tế quy đổi
                  </div>
                  <Paragraph className="text-gray-500 text-sm mt-1 mb-0">
                    Căn cứ: Điều 101 – Bộ Luật Lao động 2019.
                    Ngày công quy đổi có thể là số thập phân (ví dụ: làm 4/8 giờ = 0.5 ngày).
                  </Paragraph>
                </div>
              ),
            },
            {
              color: "blue",
              children: (
                <div>
                  <Text strong>Bước 4 — Cộng phụ cấp theo chính sách</Text>
                  <Paragraph className="text-gray-500 text-sm mb-0">
                    Tổng hợp tất cả <code>PayrollPolicy</code> loại <Tag className="text-xs">Allowance</Tag> còn hiệu lực,
                    áp dụng cho chức vụ / phòng ban của nhân viên.
                    HR có thể bổ sung phụ cấp thủ công trực tiếp trên phiếu lương.
                  </Paragraph>
                </div>
              ),
            },
            {
              color: "blue",
              children: (
                <div>
                  <Text strong>Bước 5 — Tính lương tăng ca (OT)</Text>
                  <Paragraph className="text-gray-500 text-sm mb-0">
                    Tổng hợp <code>OvertimeRequest</code> trạng thái <Tag color="green" className="text-xs">Approved</Tag>,
                    nhân với hệ số tương ứng (xem bảng OT bên dưới).
                  </Paragraph>
                  <div className="bg-gray-100 rounded px-3 py-1 inline-block text-sm font-mono mt-1">
                    Lương OT = (Lương CB ÷ 26) ÷ 8 × Số giờ OT × Hệ số
                  </div>
                </div>
              ),
            },
            {
              color: "green",
              children: (
                <div>
                  <Text strong className="text-green-600">Bước 6 — Thu nhập gộp (GROSS)</Text>
                  <div className="bg-green-50 border border-green-200 rounded px-3 py-2 text-sm font-mono mt-1">
                    Gross = Lương ngày công + Phụ cấp + OT + Thưởng
                  </div>
                </div>
              ),
            },
            {
              color: "red",
              children: (
                <div>
                  <Text strong>Bước 7 — Khấu trừ BHXH / BHYT / BHTN</Text>
                  <div className="bg-red-50 border border-red-100 rounded px-3 py-2 text-sm font-mono mt-1">
                    Tổng BH = min(Gross, 46,800,000) × 10.5%
                  </div>
                  <Paragraph className="text-gray-500 text-sm mt-1 mb-0">
                    BHXH 8% + BHYT 1.5% + BHTN 1% = 10.5% (phần NLĐ đóng).
                    Trần đóng BH = 20 × Lương tối thiểu vùng I (2,340,000 đ × 20 = 46,800,000 đ).
                  </Paragraph>
                </div>
              ),
            },
            {
              color: "red",
              children: (
                <div>
                  <Text strong>Bước 8 — Tính thuế TNCN (lũy tiến 7 bậc)</Text>
                  <div className="bg-red-50 border border-red-100 rounded px-3 py-2 text-sm font-mono mt-1">
                    Thu nhập tính thuế = Gross − Tổng BH − Giảm trừ bản thân (11tr) − Giảm trừ gia cảnh (4.4tr/người phụ thuộc)
                  </div>
                  <Paragraph className="text-gray-500 text-sm mt-1 mb-0">
                    Hiện tại hệ thống tính với <strong>0 người phụ thuộc</strong>.
                    HR có thể cập nhật số người phụ thuộc khi tích hợp module quản lý nhân sự.
                  </Paragraph>
                </div>
              ),
            },
            {
              color: "green",
              children: (
                <div>
                  <Text strong className="text-green-700">Bước 9 — Thực lĩnh (NET PAY)</Text>
                  <div className="bg-green-600 text-white rounded px-3 py-2 text-sm font-mono mt-1">
                    Net Pay = Gross − Tổng BH − Thuế TNCN − Khấu trừ khác
                  </div>
                </div>
              ),
            },
          ]}
        />
      </Card>

      <Row gutter={[16, 16]}>
        {/* ── BẢNG BẬC THUẾ TNCN ──────────────────── */}
        <Col span={24}>
          <Card
            title={<><SafetyCertificateOutlined className="mr-2 text-orange-500" />Biểu thuế TNCN lũy tiến từng phần</>}
            className="shadow-sm rounded-xl"
          >
            <Alert
              type="warning"
              showIcon
              className="mb-3"
              message="Căn cứ pháp lý: Luật Thuế Thu nhập cá nhân số 04/2007/QH12 (có hiệu lực 01/01/2009), sửa đổi bởi Luật số 26/2012/QH13 (có hiệu lực 01/07/2013) và Nghị quyết 954/2020/UBTVQH14."
            />
            <Table
              size="small"
              dataSource={tncnBrackets}
              columns={tncnColumns}
              pagination={false}
              rowKey="bac"
            />
            <Divider />
            <Collapse ghost>
              <Panel header="Ví dụ tính thuế — Thu nhập tính thuế 25,000,000 đ/tháng" key="1">
                <div className="space-y-1 text-sm font-mono bg-gray-50 rounded p-3">
                  <div>Bậc 1: 5,000,000 × 5%    = <strong>250,000 đ</strong></div>
                  <div>Bậc 2: 5,000,000 × 10%   = <strong>500,000 đ</strong></div>
                  <div>Bậc 3: 8,000,000 × 15%   = <strong>1,200,000 đ</strong></div>
                  <div>Bậc 4: 7,000,000 × 20%   = <strong>1,400,000 đ</strong></div>
                  <Divider className="my-2" />
                  <div className="text-green-700 font-bold">Tổng thuế = 3,350,000 đ (thuế suất hiệu dụng ≈ 13.4%)</div>
                </div>
              </Panel>
            </Collapse>
          </Card>
        </Col>

        {/* ── BẢNG BẢO HIỂM ───────────────────────── */}
        <Col span={24}>
          <Card
            title={<><SafetyCertificateOutlined className="mr-2 text-red-500" />Tỷ lệ đóng bảo hiểm bắt buộc</>}
            className="shadow-sm rounded-xl"
          >
            <Alert
              type="error"
              showIcon
              className="mb-3"
              message="Căn cứ pháp lý: Luật BHXH số 58/2014/QH13 (Điều 85, 86); Luật BHYT số 25/2008/QH12 sửa đổi bởi số 46/2014/QH13 (Điều 13); Luật Việc làm số 38/2013/QH13 (Điều 57). Quyết định 595/QĐ-BHXH ngày 14/4/2017."
            />
            <Table
              size="small"
              dataSource={insuranceRates}
              columns={insuranceColumns}
              pagination={false}
              rowKey="loai"
            />
            <div className="mt-3 text-xs text-gray-400">
              * Mức đóng BH tối đa = 20 × Lương tối thiểu vùng.
              Vùng I (Hà Nội, TP.HCM): 2,340,000 đ × 20 = <strong>46,800,000 đ/tháng</strong>.
              (Theo Nghị định 38/2022/NĐ-CP, có hiệu lực từ 01/07/2022.)
            </div>
          </Card>
        </Col>

        {/* ── BẢNG HỆ SỐ OT ───────────────────────── */}
        <Col span={24}>
          <Card
            title={<><CalculatorOutlined className="mr-2 text-green-500" />Hệ số lương làm thêm giờ (OT)</>}
            className="shadow-sm rounded-xl"
          >
            <Alert
              type="success"
              showIcon
              className="mb-3"
              message="Căn cứ pháp lý: Điều 98 – Bộ Luật Lao động số 45/2019/QH14, có hiệu lực từ 01/01/2021."
            />
            <Table
              size="small"
              dataSource={otRates}
              columns={otColumns}
              pagination={false}
              rowKey="loai"
            />
            <div className="mt-3 text-xs text-gray-400">
              * Công thức: Lương giờ OT = (Lương CB ÷ 26 ngày ÷ 8 giờ) × Số giờ × Hệ số.
              Số 26 ngày là ngày làm việc bình quân/tháng theo quy định.
            </div>
          </Card>
        </Col>

        {/* ── GIẢM TRỪ GIA CẢNH ───────────────────── */}
        <Col span={24}>
          <Card
            title={<><FileTextOutlined className="mr-2 text-purple-500" />Giảm trừ gia cảnh thuế TNCN</>}
            className="shadow-sm rounded-xl"
          >
            <Alert
              type="info"
              showIcon
              className="mb-3"
              message="Căn cứ pháp lý: Nghị quyết số 954/2020/UBTVQH14, có hiệu lực từ ngày 01/07/2020 (áp dụng cho kỳ tính thuế năm 2020 trở đi)."
            />
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Card size="small" className="bg-purple-50 border-purple-200 text-center">
                  <div className="text-purple-600 font-bold text-2xl">11,000,000 đ</div>
                  <div className="text-gray-500 text-sm mt-1">Giảm trừ bản thân / tháng</div>
                  <div className="text-xs text-gray-400 mt-1">Điều 1 Nghị quyết 954/2020</div>
                </Card>
              </Col>
              <Col xs={24} sm={12}>
                <Card size="small" className="bg-blue-50 border-blue-200 text-center">
                  <div className="text-blue-600 font-bold text-2xl">4,400,000 đ</div>
                  <div className="text-gray-500 text-sm mt-1">Giảm trừ mỗi người phụ thuộc / tháng</div>
                  <div className="text-xs text-gray-400 mt-1">Điều 1 Nghị quyết 954/2020</div>
                </Card>
              </Col>
            </Row>
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
              <strong>Lưu ý hiện tại:</strong> Hệ thống đang tính thuế với <strong>0 người phụ thuộc</strong>.
              Để áp dụng giảm trừ gia cảnh, HR cần cập nhật thông tin người phụ thuộc cho từng nhân viên trong module Quản lý Nhân sự.
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default PayrollMethodology
