import { Modal, Form, DatePicker, Select, Input, message } from "antd";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { manualCreateAttendance } from "../../../../store/attendanceSlide";
import { selectEmployees, fetchAllEmployees } from "../../../../store/employeeSlide";
import { useEffect } from "react";
import dayjs from "dayjs";

interface ManualCreateModalProps {
    open: boolean;
    onClose: () => void;
}

const ManualCreateModal = ({ open, onClose }: ManualCreateModalProps) => {
    const [form] = Form.useForm();
    const dispatch = useAppDispatch();
    const employees = useAppSelector(selectEmployees);

    useEffect(() => {
        if (open) {
            dispatch(fetchAllEmployees());
            form.resetFields();
            form.setFieldsValue({
                attendanceDate: dayjs(),
                status: "Present"
            });
        }
    }, [open, dispatch, form]);

    const onFinish = async (values: any) => {
        try {
            await dispatch(manualCreateAttendance({
                employeeId: values.employeeId,
                attendanceDate: values.attendanceDate.format("YYYY-MM-DD"),
                checkInTime: values.checkInTime ? values.attendanceDate.format("YYYY-MM-DD") + "T" + values.checkInTime.format("HH:mm:ss") : undefined,
                checkOutTime: values.checkOutTime ? values.attendanceDate.format("YYYY-MM-DD") + "T" + values.checkOutTime.format("HH:mm:ss") : undefined,
                status: values.status,
                remarks: values.remarks
            })).unwrap();
            
            message.success("Tạo chấm công thành công");
            onClose();
        } catch (error: any) {
            message.error(error || "Tạo thất bại");
        }
    };

    return (
        <Modal
            title="Tạo Check-in Thủ Công"
            open={open}
            onCancel={onClose}
            onOk={() => form.submit()}
            okText="Tạo mới"
            cancelText="Hủy"
        >
            <Form form={form} layout="vertical" onFinish={onFinish}>
                <Form.Item
                    name="employeeId"
                    label="Nhân viên"
                    rules={[{ required: true, message: "Chọn nhân viên" }]}
                >
                    <Select
                        showSearch
                        optionFilterProp="label"
                        options={employees.map((e) => ({ value: e.employeeId, label: e.fullName }))}
                        placeholder="Tìm và chọn nhân viên"
                    />
                </Form.Item>

                <Form.Item
                    name="attendanceDate"
                    label="Ngày"
                    rules={[{ required: true, message: "Chọn ngày" }]}
                >
                    <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
                </Form.Item>

                <div className="flex gap-4">
                    <Form.Item name="checkInTime" label="Giờ check-in" className="flex-1">
                        <DatePicker picker="time" format="HH:mm:ss" style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item name="checkOutTime" label="Giờ check-out" className="flex-1">
                        <DatePicker picker="time" format="HH:mm:ss" style={{ width: '100%' }} />
                    </Form.Item>
                </div>

                <Form.Item
                    name="status"
                    label="Trạng thái"
                    rules={[{ required: true }]}
                >
                    <Select options={[
                        { label: "Present", value: "Present" },
                        { label: "Late", value: "Late" },
                        { label: "Absent", value: "Absent" },
                        { label: "Incomplete", value: "Incomplete" },
                    ]} />
                </Form.Item>

                <Form.Item
                    name="remarks"
                    label="Lý do tạo thủ công"
                    rules={[{ required: true, message: "Nhập lý do" }]}
                >
                    <Input.TextArea rows={3} placeholder="VD: Quên chấm công do máy lỗi bận họp..." />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default ManualCreateModal;
