import { Modal, Form, Select, DatePicker, TimePicker, Input, message, Row, Col } from "antd";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { assignShift, updateAssignment } from "../../../../store/attendanceSlide";
import { selectEmployees } from "../../../../store/employeeSlide";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;

interface Props {
    open: boolean;
    onCancel: () => void;
    editingShift?: any;
    currentDate?: dayjs.Dayjs;
}

const ShiftModal = ({ open, onCancel, editingShift, currentDate }: Props) => {
    const [form] = Form.useForm();
    const dispatch = useAppDispatch();
    const employees = useAppSelector(selectEmployees);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open) {
            if (editingShift) {
                form.setFieldsValue({
                    employeeId: editingShift.employeeId,
                    shiftId: editingShift.shiftId,
                    dateRange: [dayjs(editingShift.startDate), editingShift.endDate ? dayjs(editingShift.endDate) : null],
                    // other fields...
                });
            } else {
                form.resetFields();
            }
        }
    }, [open, editingShift, form]);

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);

            if (editingShift) {
                // Update 2.3.3
                await dispatch(updateAssignment({
                    id: editingShift.assignmentId,
                    dto: {
                        shiftId: values.shiftId,
                        startDate: values.dateRange[0].format("YYYY-MM-DD"),
                        endDate: values.dateRange[1]?.format("YYYY-MM-DD") || null,
                    }
                })).unwrap();
                message.success("Cập nhật lịch làm việc thành công! (MSG-20)");
            } else {
                // Create 2.3.2
                await dispatch(assignShift({
                    employeeId: values.employeeId,
                    shiftId: values.shiftId,
                    startDate: values.dateRange[0].format("YYYY-MM-DD"),
                    endDate: values.dateRange[1]?.format("YYYY-MM-DD") || null,
                })).unwrap();
                message.success("Tạo lịch làm việc thành công! (MSG-19)");
            }

            onCancel();
        } catch (error: any) {
            message.error(error || "Có lỗi xảy ra!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title={editingShift ? "Chỉnh sửa lịch làm việc" : "Tạo lịch làm việc mới"}
            open={open}
            onOk={handleOk}
            onCancel={onCancel}
            confirmLoading={loading}
            width={600}
        >
            <Form form={form} layout="vertical">
                <Row gutter={16}>
                    {!editingShift && (
                        <Col span={24}>
                            <Form.Item
                                name="employeeId"
                                label="Chọn nhân viên"
                                rules={[{ required: true, message: "Vui lòng chọn nhân viên" }]}
                            >
                                <Select
                                    showSearch
                                    optionFilterProp="label"
                                    options={employees.map(e => ({ label: e.fullName, value: e.employeeId }))}
                                />
                            </Form.Item>
                        </Col>
                    )}
                    <Col span={12}>
                        <Form.Item
                            name="shiftId"
                            label="Ca làm việc"
                            rules={[{ required: true, message: "Vui lòng chọn ca" }]}
                        >
                            <Select
                                options={[
                                    { label: "Ca sáng (08:00 - 12:00)", value: 1 },
                                    { label: "Ca chiều (13:00 - 17:00)", value: 2 },
                                    { label: "Ca tối (18:00 - 22:00)", value: 3 },
                                ]}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="dateRange"
                            label="Thời gian áp dụng"
                            rules={[{ required: true, message: "Vui lòng chọn ngày" }]}
                        >
                            <RangePicker style={{ width: "100%" }} />
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Form.Item name="remarks" label="Ghi chú">
                            <Input.TextArea rows={3} placeholder="Ghi chú cụ thể (vị trí, yêu cầu đặc biệt...)" />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Modal>
    );
};

export default ShiftModal;
