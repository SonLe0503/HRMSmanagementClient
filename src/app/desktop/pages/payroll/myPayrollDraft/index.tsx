import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  Card, Descriptions, Tag, Button, Space, Typography, Divider, message,
  Alert, Spin, Modal, Input, Tooltip,
} from "antd"
import {
  ArrowLeftOutlined, CheckCircleOutlined, CloseCircleOutlined,
  CalendarOutlined,
} from "@ant-design/icons"
import { useAppDispatch, useAppSelector } from "../../../../../store"
import {
  fetchMyDraftRecord,
  fetchMyFeedbacks,
  fetchMyAttendanceSummary,
  submitFeedback,
  selectMyDraftRecord,
  selectMyFeedbacks,
  selectMyAttendanceSummary,
  selectPayrollLoading,
} from "../../../../../store/payrollSlide"

const { Title, Text } = Typography
const { TextArea } = Input

const STATUS_TAG: Record<string, { color: string; label: string }> = {
  Present: { color: "blue",   label: "Có mặt"   },
  Late:    { color: "orange", label: "Đi trễ"   },
  Absent:  { color: "red",    label: "Vắng mặt" },
}

// Explicit Tailwind class strings (no dynamic interpolation)
const CELL_STYLE: Record<string, { bg: string; border: string; text: string }> = {
  blue:    { bg: "bg-blue-50",    border: "border-blue-200",    text: "text-blue-700"    },
  orange:  { bg: "bg-amber-50",   border: "border-amber-200",   text: "text-amber-700"   },
  red:     { bg: "bg-red-50",     border: "border-red-200",     text: "text-red-600"     },
  green:   { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700" },
  purple:  { bg: "bg-violet-50",  border: "border-violet-200",  text: "text-violet-700"  },
  cyan:    { bg: "bg-cyan-50",    border: "border-cyan-200",    text: "text-cyan-700"    },
  default: { bg: "bg-gray-50",    border: "border-gray-100",    text: "text-gray-400"    },
}

const getMonthYear = (att: any): { year: number; month: number } => {
  if (att?.records?.length) {
    const d = new Date(att.records[0].date)
    return { year: d.getFullYear(), month: d.getMonth() + 1 }
  }
  if (att?.approvedLeaves?.length) {
    const d = new Date(att.approvedLeaves[0].startDate)
    return { year: d.getFullYear(), month: d.getMonth() + 1 }
  }
  const now = new Date()
  return { year: now.getFullYear(), month: now.getMonth() + 1 }
}

const generateMonthDays = (year: number, month: number): Date[] => {
  const days: Date[] = []
  const d = new Date(year, month - 1, 1)
  while (d.getMonth() === month - 1) {
    days.push(new Date(d))
    d.setDate(d.getDate() + 1)
  }
  return days
}

const MyPayrollDraft = () => {
  const { periodId } = useParams<{ periodId: string }>()
  const navigate     = useNavigate()
  const dispatch     = useAppDispatch()

  const record     = useAppSelector(selectMyDraftRecord)
  const feedbacks  = useAppSelector(selectMyFeedbacks)
  const attendance = useAppSelector(selectMyAttendanceSummary)
  const loading    = useAppSelector(selectPayrollLoading)

  const [disagreeVisible, setDisagreeVisible] = useState(false)
  const [disagreeNote, setDisagreeNote]       = useState("")
  const [submitting, setSubmitting]           = useState(false)

  const numericPeriodId = Number(periodId)

  useEffect(() => {
    if (numericPeriodId) {
      dispatch(fetchMyDraftRecord(numericPeriodId))
      dispatch(fetchMyFeedbacks())
      dispatch(fetchMyAttendanceSummary(numericPeriodId))
    }
  }, [dispatch, numericPeriodId])

  const recordFeedbacks = feedbacks.filter(f => f.payrollRecordId === record?.payrollRecordId)
  const latestFeedback  = [...recordFeedbacks].sort(
    (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
  )[0]
  // Coi là "đã xong" nếu: đã đồng ý, hoặc không đồng ý mà HR chưa xử lý (Pending)
  // Nếu HR đã xử lý (Resolved/Dismissed) → hiện lại button để NV có thể đồng ý
  const hasResponded = !!latestFeedback && (
    latestFeedback.isAgreed || latestFeedback.status === "Pending"
  )

  const handleAgree = async () => {
    if (!record) return
    setSubmitting(true)
    try {
      await dispatch(submitFeedback({ recordId: record.payrollRecordId, data: { isAgreed: true } })).unwrap()
      message.success("Đã xác nhận đồng ý phiếu lương!")
      dispatch(fetchMyFeedbacks())
    } catch (err: any) {
      message.error(err.message || "Lỗi xác nhận")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDisagree = async () => {
    if (!record) return
    setSubmitting(true)
    try {
      await dispatch(submitFeedback({
        recordId: record.payrollRecordId,
        data: { isAgreed: false, content: disagreeNote || undefined },
      })).unwrap()
      message.success("Đã gửi phản hồi! HR sẽ xem xét và liên hệ bạn.")
      setDisagreeVisible(false)
      setDisagreeNote("")
      dispatch(fetchMyFeedbacks())
    } catch (err: any) {
      message.error(err.message || "Lỗi gửi phản hồi")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading && !record) {
    return <div className="flex justify-center items-center min-h-screen"><Spin size="large" /></div>
  }

  if (!record) {
    return (
      <div className="p-6">
        <Alert type="info" message="Chưa có phiếu lương tạm"
          description="Kỳ lương này chưa có dữ liệu lương cho bạn, hoặc HR chưa gửi phiếu tạm."
          showIcon />
        <Button icon={<ArrowLeftOutlined />} className="mt-4" onClick={() => navigate(-1)}>Quay lại</Button>
      </div>
    )
  }

  const gross  = record.salariedAmount + record.totalAllowances + record.overtimePay + record.bonusAmount
  const manDed = record.deductions.filter(d => d.deductionType === "Manual").reduce((s, d) => s + d.amount, 0)
  const netPay = gross - record.insuranceAmount - record.taxAmount - manDed

  // ── Build full-month rows ─────────────────────────────────────────────────
  const buildMonthlyRows = () => {
    if (!attendance) return []
    const { year, month } = getMonthYear(attendance)
    const days = generateMonthDays(year, month)

    const recMap = new Map<string, (typeof attendance.records)[0]>()
    ;(attendance.records ?? []).forEach(r => recMap.set(r.date.split("T")[0], r))

    const otMap = new Map<string, number>()
    ;(attendance.approvedOvertime ?? []).forEach(o => otMap.set(o.date.split("T")[0], o.hours))

    return days.map(date => {
      const y         = date.getFullYear()
      const m         = String(date.getMonth() + 1).padStart(2, "0")
      const d         = String(date.getDate()).padStart(2, "0")
      const dateStr   = `${y}-${m}-${d}`
      const dayIdx    = date.getDay()
      const isWeekend = dayIdx === 0 || dayIdx === 6
      const rec       = recMap.get(dateStr)
      const otHours   = otMap.get(dateStr) ?? 0

      const leaveItem = (attendance.approvedLeaves ?? []).find(l => {
        const s = new Date(l.startDate); s.setHours(0, 0, 0, 0)
        const e = new Date(l.endDate);   e.setHours(23, 59, 59, 999)
        return date >= s && date <= e
      })

      let statusTag    = "default"
      let statusLabel  = "—"
      let workingHours = 0

      if (isWeekend) {
        statusTag = "default"; statusLabel = "Nghỉ"
      } else if (leaveItem) {
        statusTag   = leaveItem.isPaid ? "green" : "purple"
        statusLabel = leaveItem.leaveTypeName || (leaveItem.isPaid ? "Nghỉ phép" : "Nghỉ NL")
      } else if (rec) {
        workingHours = rec.workingHours
        if (rec.isExplanationApproved) {
          statusTag = "cyan"; statusLabel = "GT OK"
        } else {
          const s = STATUS_TAG[rec.status] || { color: "default", label: rec.status }
          statusTag = s.color; statusLabel = s.label
        }
      }

      return { key: dateStr, day: date.getDate(), dayIdx, isWeekend,
               statusTag, statusLabel, workingHours, otHours }
    })
  }

  const monthlyRows    = buildMonthlyRows()
  const monthYear      = attendance ? getMonthYear(attendance) : null
  const totalWorkHours = monthlyRows.reduce((s, r) => s + r.workingHours, 0)
  const totalOTHours   = monthlyRows.reduce((s, r) => s + r.otHours, 0)

  // ── Calendar grid ─────────────────────────────────────────────────────────
  const renderCalendar = () => {
    if (!attendance || monthlyRows.length === 0) return null
    const { year, month } = getMonthYear(attendance)

    // Monday-first offset
    const firstWeekday = new Date(year, month - 1, 1).getDay()
    const offset = firstWeekday === 0 ? 6 : firstWeekday - 1

    const cells: (typeof monthlyRows[0] | null)[] = [
      ...Array(offset).fill(null),
      ...monthlyRows,
    ]
    while (cells.length % 7 !== 0) cells.push(null)

    return (
      <div className="overflow-x-auto">
        <div className="min-w-[320px]">
          {/* Headers */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((h, i) => (
              <div key={h} className={`text-center text-xs font-semibold py-1.5 rounded-md select-none
                ${i >= 5 ? "bg-red-50 text-red-400" : "bg-gray-100 text-gray-500"}`}>
                {h}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 gap-1">
            {cells.map((cell, idx) => {
              if (!cell) return <div key={`e${idx}`} className="h-16 rounded-lg" />

              const cfg = cell.isWeekend
                ? CELL_STYLE.default
                : (CELL_STYLE[cell.statusTag] ?? CELL_STYLE.default)

              return (
                <Tooltip key={cell.key}
                  title={cell.isWeekend ? `Ngày ${cell.day} – Nghỉ cuối tuần`
                    : `Ngày ${cell.day} – ${cell.statusLabel}${cell.workingHours > 0 ? ` · ${cell.workingHours.toFixed(1)}h` : ""}${cell.otHours > 0 ? ` · OT ${cell.otHours.toFixed(1)}h` : ""}`}
                >
                  <div className={`rounded-lg border h-16 p-1.5 flex flex-col justify-between
                    select-none cursor-default transition-opacity
                    ${cfg.bg} ${cfg.border} ${cell.isWeekend ? "opacity-50" : ""}`}>

                    {/* Top row */}
                    <div className="flex items-start justify-between">
                      <span className={`text-sm font-bold leading-none ${cfg.text}`}>
                        {cell.day}
                      </span>
                      {cell.otHours > 0 && (
                        <span className="text-[9px] font-bold leading-none px-1 py-0.5
                          rounded bg-purple-100 text-purple-600">
                          OT
                        </span>
                      )}
                    </div>

                    {/* Bottom row */}
                    <div>
                      <div className={`text-[10px] font-medium leading-tight truncate ${cfg.text}`}>
                        {cell.statusLabel !== "—" ? cell.statusLabel : ""}
                      </div>
                      {cell.workingHours > 0 && (
                        <div className={`text-[9px] leading-none ${cfg.text} opacity-70`}>
                          {cell.workingHours.toFixed(1)}h
                        </div>
                      )}
                    </div>
                  </div>
                </Tooltip>
              )
            })}
          </div>

          {/* Footer: totals + legend */}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2
            bg-gray-50 rounded-xl px-4 py-2.5 border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="text-sm">
                <span className="text-gray-500 text-xs">Tổng giờ làm: </span>
                <span className="font-semibold text-gray-800">{totalWorkHours.toFixed(1)}h</span>
              </div>
              {totalOTHours > 0 && (
                <div className="text-sm">
                  <span className="text-gray-500 text-xs">Tăng ca: </span>
                  <span className="font-semibold text-purple-600">{totalOTHours.toFixed(1)}h</span>
                </div>
              )}
            </div>
            <div className="flex items-center flex-wrap gap-x-3 gap-y-1">
              {[
                { dot: "bg-blue-500",    label: "Có mặt"   },
                { dot: "bg-amber-500",   label: "Đi trễ"   },
                { dot: "bg-red-500",     label: "Vắng"     },
                { dot: "bg-emerald-500", label: "Nghỉ phép"},
                { dot: "bg-violet-500",  label: "Nghỉ NL"  },
              ].map(l => (
                <span key={l.label} className="flex items-center gap-1">
                  <span className={`inline-block w-2 h-2 rounded-full ${l.dot}`} />
                  <span className="text-[10px] text-gray-500">{l.label}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Stat cards ────────────────────────────────────────────────────────────
  const renderStats = () => {
    if (!attendance) return null
    const stats = [
      { label: "Có mặt",   val: attendance.totals.presentDays,                       unit: "ngày", bg: "bg-blue-50",    border: "border-blue-100",    num: "text-blue-700"    },
      { label: "Đi trễ",   val: attendance.totals.lateDays,                          unit: "ngày", bg: "bg-amber-50",   border: "border-amber-100",   num: "text-amber-700"   },
      { label: "Vắng mặt", val: attendance.totals.absentDays,                        unit: "ngày", bg: "bg-red-50",     border: "border-red-100",     num: "text-red-600"     },
      { label: "Nghỉ phép",val: Number(attendance.totals.paidLeaveDays).toFixed(1),  unit: "ngày", bg: "bg-emerald-50", border: "border-emerald-100", num: "text-emerald-700" },
      { label: "Tăng ca",  val: Number(attendance.totals.overtimeHours).toFixed(1),  unit: "giờ",  bg: "bg-purple-50",  border: "border-purple-100",  num: "text-purple-700"  },
    ]
    return (
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-4">
        {stats.map(s => (
          <div key={s.label} className={`rounded-xl border px-3 py-2.5 ${s.bg} ${s.border}`}>
            <div className={`text-xl font-bold leading-none ${s.num}`}>{s.val}</div>
            <div className={`text-xs mt-1 font-medium ${s.num} opacity-80`}>{s.label}</div>
            <div className="text-[10px] text-gray-400">{s.unit}</div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between !mb-5">
        <Space direction="vertical" size={0}>
          <Title level={3} className="!mb-0">Phiếu Lương Tạm</Title>
          <Text type="secondary">Xem và xác nhận phiếu lương trước khi Admin phê duyệt chính thức.</Text>
        </Space>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>Quay lại</Button>
      </div>

      <Alert type="warning" showIcon className="!mb-4"
        message="Đây là phiếu lương tạm — chưa được duyệt chính thức"
        description="Số liệu có thể thay đổi sau khi HR xem xét phản hồi và Admin phê duyệt." />

      {/* Thông tin cơ bản */}
      <Card className="shadow-sm rounded-xl !mb-4">
        <Descriptions column={{ xs: 1, sm: 2 }} bordered size="small">
          <Descriptions.Item label="Nhân viên" span={2}>
            <Text strong>{record.employeeName}</Text>
            <Text type="secondary" className="ml-2">({record.employeeCode})</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Phòng ban">{record.departmentName || "—"}</Descriptions.Item>
          <Descriptions.Item label="Chức vụ">{record.positionName || "—"}</Descriptions.Item>
          <Descriptions.Item label="Ngày công">
            <Tag color={record.actualWorkingDays < record.workingDays ? "orange" : "blue"}>
              {Number(record.actualWorkingDays).toFixed(1)} / {record.workingDays} ngày
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Lương cơ bản">
            {record.baseSalary.toLocaleString("vi-VN")} đ
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Bảng chấm công tháng */}
      {attendance && (
        <Card
          title={
            <Space>
              <CalendarOutlined className="text-blue-500" />
              <span>Bảng Chấm Công Tháng {monthYear?.month}/{monthYear?.year}</span>
            </Space>
          }
          className="shadow-sm rounded-xl !mb-4"
        >
          {renderStats()}
          {renderCalendar()}
        </Card>
      )}

      {/* Chi tiết lương */}
      <Card title="Chi tiết thu nhập & khấu trừ" className="shadow-sm rounded-xl !mb-4">
        <Descriptions column={{ xs: 1, sm: 2 }} size="small">
          <Descriptions.Item label="Lương theo ngày công">
            {(record.salariedAmount ?? 0).toLocaleString("vi-VN")} đ
          </Descriptions.Item>
          <Descriptions.Item label="Phụ cấp">
            {(record.totalAllowances ?? 0).toLocaleString("vi-VN")} đ
          </Descriptions.Item>
          <Descriptions.Item label="Làm thêm giờ (OT)">
            <Text type="success">{(record.overtimePay ?? 0).toLocaleString("vi-VN")} đ</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Thưởng">
            <Text type="success">{(record.bonusAmount ?? 0).toLocaleString("vi-VN")} đ</Text>
          </Descriptions.Item>
        </Descriptions>
        <Divider className="my-3" />
        <Descriptions column={{ xs: 1, sm: 2 }} size="small">
          <Descriptions.Item label="Bảo hiểm">
            <Text type="danger">-{(record.insuranceAmount ?? 0).toLocaleString("vi-VN")} đ</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Thuế TNCN">
            <Text type="danger">-{(record.taxAmount ?? 0).toLocaleString("vi-VN")} đ</Text>
          </Descriptions.Item>
        </Descriptions>
        <Divider className="my-3" />
        <div className="bg-green-600 rounded-xl px-5 py-3 flex justify-between items-center">
          <Text className="text-white font-semibold text-base">THỰC LĨNH DỰ KIẾN</Text>
          <Text className="text-white font-bold text-xl">{netPay.toLocaleString("vi-VN")} đ</Text>
        </div>
      </Card>

      {/* Xác nhận */}
      <Card title="Xác nhận phiếu lương" className="shadow-sm rounded-xl !mb-4">
        {!hasResponded ? (
          <Space direction="vertical" size="middle" className="w-full">
            {/* HR đã xử lý phản hồi trước đó — hiện context trước khi NV đồng ý lại */}
            {latestFeedback && !latestFeedback.isAgreed && (
              <Alert type="info" showIcon
                message="HR đã xem xét và phản hồi thắc mắc của bạn"
                description={
                  <Space direction="vertical" size={2}>
                    {latestFeedback.content &&
                      <Text className="text-sm text-gray-600">Phản hồi của bạn: "{latestFeedback.content}"</Text>}
                    {latestFeedback.hrResponse &&
                      <Text className="text-sm font-medium">HR trả lời: "{latestFeedback.hrResponse}"</Text>}
                  </Space>
                }
              />
            )}
            <Text>Sau khi xem xét thông tin lương và chấm công bên trên, vui lòng xác nhận:</Text>
            {record.periodStatus && record.periodStatus !== "UnderReview" && (
              <Alert type="info" showIcon
                message="Kỳ lương không còn ở trạng thái chờ xem xét, không thể gửi phản hồi." />
            )}
            <Space>
              <Tooltip title="Xác nhận số liệu lương chính xác">
                <Button type="primary" icon={<CheckCircleOutlined />} size="large"
                  onClick={handleAgree} loading={submitting}
                  disabled={!!(record.periodStatus && record.periodStatus !== "UnderReview")}
                  style={{ background: "#16a34a", borderColor: "#16a34a" }}>
                  Đồng ý
                </Button>
              </Tooltip>
              <Tooltip title="Có thắc mắc hoặc sai sót về số liệu lương">
                <Button danger icon={<CloseCircleOutlined />} size="large"
                  onClick={() => setDisagreeVisible(true)} loading={submitting}
                  disabled={!!(record.periodStatus && record.periodStatus !== "UnderReview")}>
                  Không đồng ý
                </Button>
              </Tooltip>
            </Space>
          </Space>
        ) : latestFeedback.isAgreed ? (
          <Alert type="success" showIcon icon={<CheckCircleOutlined />}
            message="Bạn đã xác nhận đồng ý phiếu lương này"
            description={`Xác nhận lúc: ${new Date(latestFeedback.submittedAt).toLocaleString("vi-VN")}`} />
        ) : (
          // NV không đồng ý, HR chưa xử lý (Pending)
          <Alert type="warning" showIcon icon={<CloseCircleOutlined />}
            message="Bạn đã gửi phản hồi không đồng ý — đang chờ HR xem xét"
            description={
              <Space direction="vertical" size={0}>
                {latestFeedback.content && <Text className="text-sm">"{latestFeedback.content}"</Text>}
                <Text type="secondary" className="text-xs">HR sẽ xem xét và phản hồi, sau đó bạn có thể xác nhận lại.</Text>
              </Space>
            } />
        )}
      </Card>

      {/* Modal không đồng ý */}
      <Modal
        title={<Space><CloseCircleOutlined className="text-red-500" /><span>Gửi phản hồi không đồng ý</span></Space>}
        open={disagreeVisible}
        onCancel={() => { setDisagreeVisible(false); setDisagreeNote("") }}
        footer={[
          <Button key="cancel" onClick={() => { setDisagreeVisible(false); setDisagreeNote("") }}>Hủy</Button>,
          <Button key="submit" danger loading={submitting} onClick={handleDisagree}>Gửi phản hồi</Button>,
        ]}
      >
        <Text type="secondary" className="block !mb-3">
          Nội dung phản hồi <Text type="secondary">(không bắt buộc)</Text> — mô tả vấn đề bạn nhận thấy:
        </Text>
        <TextArea rows={4} maxLength={500} showCount value={disagreeNote} className="!mb-3"
          onChange={e => setDisagreeNote(e.target.value)}
          placeholder="Ví dụ: Ngày công không khớp, bị trừ sai khoản..." />
      </Modal>
    </div>
  )
}

export default MyPayrollDraft
