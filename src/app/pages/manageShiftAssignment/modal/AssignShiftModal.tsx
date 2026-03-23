import { Modal, Form, Select, DatePicker, message, Checkbox, InputNumber } from "antd";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { assignShift, fetchShiftAssignments, type AssignShiftDto } from "../../../../store/shiftAssignmentSlide";
import { selectShifts, fetchAllShifts } from "../../../../store/shiftSlide";
import { selectEmployees, fetchAllEmployees } from "../../../../store/employeeSlide";
import { useEffect, useState } from "react";
import dayjs from "dayjs";

// const { RangePicker } = DatePicker;

interface AssignShiftModalProps {
    open: boolean;
    onCancel: () => void;
    initialDate?: string;
    initialEmployeeId?: number;
}

const DAYS_OF_WEEK = [
    { label: "Chủ Nhật", value: 0 },
    { label: "Thứ 2", value: 1 },
    { label: "Thứ 3", value: 2 },
    { label: "Thứ 4", value: 3 },
    { label: "Thứ 5", value: 4 },
    { label: "Thứ 6", value: 5 },
    { label: "Thứ 7", value: 6 },
];

const AssignShiftModal = ({ open, onCancel, initialDate, initialEmployeeId }: AssignShiftModalProps) => {
    const [form] = Form.useForm();
    const dispatch = useAppDispatch();
    const shifts = useAppSelector(selectShifts);
    const employees = useAppSelector(selectEmployees);
    const [assignType, setAssignType] = useState<"Daily" | "Weekly">("Daily");

    useEffect(() => {
        if (open) {
            dispatch(fetchAllShifts());
            dispatch(fetchAllEmployees());
            
            form.setFieldsValue({
                employeeId: initialEmployeeId,
                startDate: initialDate ? dayjs(initialDate) : dayjs(),
                durationValue: 1,
                durationUnit: "week",
                assignType: "Daily",
                daysOfWeek: [1, 2, 3, 4, 5, 6], // Default T2 -> T7
            });
            setAssignType("Daily");
        }
    }, [open, dispatch, initialDate, initialEmployeeId, form]);

    const onFinish = (values: any) => {
        const { startDate, durationValue, durationUnit } = values;
        const endDate = startDate.add(durationValue, durationUnit).subtract(1, 'day');

        const data: AssignShiftDto = {
            employeeId: values.employeeId,
            shiftId: values.shiftId,
            startDate: startDate.format("YYYY-MM-DD"),
            endDate: endDate.format("YYYY-MM-DD"),
            assignType: values.assignType,
            daysOfWeek: values.assignType === "Weekly" ? values.daysOfWeek : undefined,
        };

        dispatch(assignShift(data))
            .unwrap()
            .then(() => {
                message.success("Phân ca thành công.");
                onCancel();
                // Refresh list with current date
                const refreshDate = initialDate || dayjs().format("YYYY-MM-DD");
                dispatch(fetchShiftAssignments({ date: refreshDate }));
            })
            .catch((error: any) => {
                message.error(error.message || "Không thể phân ca.");
            });
    };

    return (
        <Modal
            title="Phân Ca Làm Việc"
            open={open}
            onCancel={onCancel}
            onOk={() => form.submit()}
            centered
            width={800}
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
            >
                <div className="grid grid-cols-2 gap-4">
                    <Form.Item
                        name="employeeId"
                        label="Nhân viên"
                        rules={[{ required: true, message: "Vui lòng chọn nhân viên" }]}
                    >
                        <Select
                            showSearch
                            placeholder="Tìm nhân viên..."
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                            }
                            options={employees.map(e => ({ value: e.employeeId, label: e.fullName }))}
                        />
                    </Form.Item>

                    <Form.Item
                        name="shiftId"
                        label="Ca làm việc"
                        rules={[{ required: true, message: "Vui lòng chọn ca" }]}
                    >
                        <Select
                            placeholder="Chọn ca làm việc..."
                            options={shifts.map(s => ({ value: s.shiftId, label: `${s.shiftCode} - ${s.shiftName}` }))}
                        />
                    </Form.Item>
                </div>

                <div className="grid grid-cols-4 gap-4">
                    <Form.Item
                        name="startDate"
                        label="Ngày bắt đầu"
                        rules={[{ required: true, message: "Vui lòng chọn ngày bắt đầu" }]}
                    >
                        <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
                    </Form.Item>

                    <Form.Item
                        name="durationValue"
                        label="Số lượng"
                        rules={[{ required: true, message: "Nhập số lượng" }]}
                    >
                        <InputNumber min={1} style={{ width: "100%" }} placeholder="VD: 1, 2, 3..." />
                    </Form.Item>

                    <Form.Item
                        name="durationUnit"
                        label="Đơn vị"
                        rules={[{ required: true }]}
                    >
                        <Select
                            options={[
                                { label: "Tuần", value: "week" },
                                { label: "Tháng", value: "month" },
                                { label: "Năm", value: "year" },
                            ]}
                        />
                    </Form.Item>

                    <Form.Item
                        name="assignType"
                        label="Hình thức lặp"
                        rules={[{ required: true }]}
                    >
                        <Select 
                            onChange={(val) => setAssignType(val)}
                            options={[
                                { label: "Hàng ngày (Daily)", value: "Daily" },
                                { label: "Theo tuần (Weekly)", value: "Weekly" },
                            ]}
                        />
                    </Form.Item>
                </div>

                {assignType === "Weekly" && (
                    <Form.Item
                        name="daysOfWeek"
                        label="Các ngày được gán trong tuần"
                        rules={[{ required: true, message: "Vui lòng chọn ít nhất một thứ" }]}
                    >
                        <Checkbox.Group options={DAYS_OF_WEEK} />
                    </Form.Item>
                )}
            </Form>
        </Modal>
    );
};

export default AssignShiftModal;
