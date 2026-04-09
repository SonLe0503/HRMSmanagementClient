import { Modal, Form, Select, DatePicker, message } from "antd";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { updateShiftAssignment, type IShiftAssignment, type UpdateShiftAssignmentDto } from "../../../../store/shiftAssignmentSlide";
import { selectShifts, fetchAllShifts } from "../../../../store/shiftSlide";
import { useEffect } from "react";
import dayjs from "dayjs";

interface EditAssignmentModalProps {
    open: boolean;
    onCancel: () => void;
    assignment: IShiftAssignment | null;
    onSuccess: () => void;
}

const EditAssignmentModal = ({ open, onCancel, assignment, onSuccess }: EditAssignmentModalProps) => {
    const [form] = Form.useForm();
    const dispatch = useAppDispatch();
    const shifts = useAppSelector(selectShifts);

    useEffect(() => {
        if (open && assignment) {
            dispatch(fetchAllShifts(true));
            form.setFieldsValue({
                shiftId: assignment.shiftId,
                assignmentDate: dayjs(assignment.assignmentDate),
                status: assignment.status
            });
        }
    }, [open, assignment, dispatch, form]);

    const onFinish = (values: any) => {
        if (!assignment) return;

        const data: UpdateShiftAssignmentDto = {
            shiftId: values.shiftId,
            assignmentDate: values.assignmentDate.format("YYYY-MM-DD"),
            status: values.status
        };

        dispatch(updateShiftAssignment({ id: assignment.assignmentId, data }))
            .unwrap()
            .then(() => {
                message.success("Cập nhật phân ca thành công.");
                onSuccess();
                onCancel();
            })
            .catch((error: any) => {
                message.error(error.message || "Không thể cập nhật.");
            });
    };

    return (
        <Modal
            title="Chỉnh Sửa Phân Ca"
            open={open}
            onCancel={onCancel}
            onOk={() => form.submit()}
            centered
            destroyOnClose
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
            >
                <Form.Item
                    label="Nhân viên"
                >
                    <div className="bg-gray-50 p-2 rounded font-medium border border-gray-100">
                        {assignment?.employeeName}
                    </div>
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

                <Form.Item
                    name="assignmentDate"
                    label="Ngày phân ca"
                    rules={[{ required: true, message: "Vui lòng chọn ngày" }]}
                >
                    <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
                </Form.Item>

                <Form.Item
                    name="status"
                    label="Trạng thái"
                    rules={[{ required: true }]}
                >
                    <Select
                        options={[
                            { label: "Đang hoạt động", value: "Active" },
                            { label: "Ngưng sử dụng", value: "Inactive" },
                        ]}
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default EditAssignmentModal;
