import { useEffect } from "react";
import { Modal, Form, Input, InputNumber, TimePicker, Switch, message, Row, Col, Select } from "antd";
import { useAppDispatch } from "../../../../store";
import { updateShift, fetchAllShifts, type IShift } from "../../../../store/shiftSlide";
import dayjs from "dayjs";

interface EditShiftModalProps {
    open: boolean;
    onCancel: () => void;
    shift: IShift | null;
}

const EditShiftModal = ({ open, onCancel, shift }: EditShiftModalProps) => {
    const [form] = Form.useForm();
    const dispatch = useAppDispatch();

    useEffect(() => {
        if (shift && open) {
            form.setFieldsValue({
                ...shift,
                startTime: dayjs(`2000-01-01 ${shift.startTime}`),
                endTime: dayjs(`2000-01-01 ${shift.endTime}`),
            });
        }
    }, [shift, open, form]);

    const onFinish = (values: any) => {
        if (!shift) return;
        const data = {
            ...values,
            startTime: values.startTime.format("HH:mm:ss"),
            endTime: values.endTime.format("HH:mm:ss"),
            isActive: shift.isActive, // Keep current status
        };

        dispatch(updateShift({ id: shift.shiftId, data }))
            .unwrap()
            .then(() => {
                message.success("Cập nhật ca làm việc thành công.");
                onCancel();
                dispatch(fetchAllShifts());
            })
            .catch((error: any) => {
                message.error(error.message || "Không thể cập nhật ca làm việc.");
            });
    };

    return (
        <Modal
            title="Sửa Ca Làm Việc"
            open={open}
            onCancel={onCancel}
            onOk={() => form.submit()}
            width={700}
            centered
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
            >
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="shiftCode"
                            label="Mã Ca"
                            rules={[{ required: true, message: "Vui lòng nhập mã ca" }]}
                        >
                            <Input placeholder="Ví dụ: HC, CA1, CA2" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="shiftName"
                            label="Tên Ca"
                            rules={[{ required: true, message: "Vui lòng nhập tên ca" }]}
                        >
                            <Input placeholder="Ví dụ: Hành chính, Ca sáng" />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="startTime"
                            label="Giờ bắt đầu"
                            rules={[{ required: true, message: "Vui lòng chọn giờ bắt đầu" }]}
                        >
                            <TimePicker format="HH:mm" style={{ width: "100%" }} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="endTime"
                            label="Giờ kết thúc"
                            rules={[{ required: true, message: "Vui lòng chọn giờ kết thúc" }]}
                        >
                            <TimePicker format="HH:mm" style={{ width: "100%" }} />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item
                            name="workingHours"
                            label="Số giờ công"
                            rules={[{ required: true, message: "Nhập số giờ công" }]}
                        >
                            <InputNumber min={0.5} max={24} step={0.5} style={{ width: "100%" }} />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            name="shiftType"
                            label="Loại ca"
                        >
                            <Select>
                                <Select.Option value="Regular">Regular</Select.Option>
                                <Select.Option value="Flexible">Flexible</Select.Option>
                                <Select.Option value="Morning">Morning</Select.Option>
                                <Select.Option value="Afternoon">Afternoon</Select.Option>
                                <Select.Option value="Night">Night</Select.Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            name="isOvernight"
                            label="Ca qua đêm"
                            valuePropName="checked"
                        >
                            <Switch />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="lateGraceMinutes"
                            label="Phút cho phép đi trễ"
                        >
                            <InputNumber min={0} style={{ width: "100%" }} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="earlyCheckInMinutes"
                            label="Phút được phép check-in sớm"
                        >
                            <InputNumber min={0} style={{ width: "100%" }} />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="latestCheckInMinutes"
                            label="Phút check-in muộn tối đa"
                        >
                            <InputNumber min={0} style={{ width: "100%" }} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="latestCheckOutMinutes"
                            label="Phút check-out muộn tối đa"
                        >
                            <InputNumber min={0} style={{ width: "100%" }} />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Modal>
    );
};

export default EditShiftModal;
