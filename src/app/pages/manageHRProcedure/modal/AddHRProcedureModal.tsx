import { useEffect } from "react";
import { Modal, Form, Select, DatePicker, InputNumber, Input, message, Row, Col } from "antd";
import dayjs from "dayjs";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { submitProcedure, updateProcedure, selectHRProcedureLoading } from "../../../../store/hrProcedureSlide";
import { fetchAllEmployees, selectEmployees } from "../../../../store/employeeSlide";

const { TextArea } = Input;

interface AddHRProcedureModalProps {
    open: boolean;
    initialValues?: any;
    onCancel: () => void;
    onSuccess: () => void;
}

const PROCEDURE_TYPES = ["Appointment", "Transfer", "Promotion", "Resignation", "Termination"].map(v => ({ label: v, value: v }));

const AddHRProcedureModal = ({ open, initialValues, onCancel, onSuccess }: AddHRProcedureModalProps) => {
    const [form] = Form.useForm();
    const dispatch = useAppDispatch();
    const loading = useAppSelector(selectHRProcedureLoading);
    const employees = useAppSelector(selectEmployees);

    const isEdit = !!initialValues;

    // Watch for procedureType changes to conditionally show fields
    const procedureType = Form.useWatch("procedureType", form);

    useEffect(() => {
        if (open && employees.length === 0) {
            dispatch(fetchAllEmployees());
        }
    }, [open, dispatch, employees.length]);

    useEffect(() => {
        if (open && initialValues) {
            form.setFieldsValue({
                ...initialValues,
                effectiveDate: initialValues.effectiveDate ? dayjs(initialValues.effectiveDate) : null,
            });
        } else if (open) {
            form.resetFields();
        }
    }, [open, initialValues, form]);

    const onFinish = (values: any) => {
        const payload = {
            employeeId: values.employeeId,
            procedureType: values.procedureType,
            effectiveDate: values.effectiveDate.format("YYYY-MM-DD"),
            newDepartmentId: values.newDepartmentId || null,
            newPositionId: values.newPositionId || null,
            newSalary: values.newSalary || null,
            reason: values.reason || "",
        };

        const action = isEdit 
            ? dispatch(updateProcedure({ id: initialValues.procedureId, data: payload }))
            : dispatch(submitProcedure(payload));

        action
            .unwrap()
            .then(() => {
                message.success(`${isEdit ? "Cập nhật" : "Tạo"} yêu cầu thủ tục thành công!`);
                form.resetFields();
                onSuccess();
            })
            .catch((err: any) => {
                const errMsg = typeof err === "string" ? err : err?.message || `Lỗi khi ${isEdit ? "cập nhật" : "tạo"} thủ tục!`;
                message.error(errMsg);
            });
    };

    const renderDynamicFields = () => {
        if (!procedureType) return null;

        const isAppointment = procedureType === "Appointment";
        const isTransfer = procedureType === "Transfer";
        const isPromotion = procedureType === "Promotion";
        const needsDepartment = isAppointment || isTransfer;
        const needsPosition = isAppointment || isPromotion;
        const needsSalary = isAppointment || isPromotion || isTransfer;

        return (
            <>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item 
                            name="effectiveDate" 
                            label="Ngày hiệu lực" 
                            rules={[{ required: true, message: "Vui lòng chọn ngày hiệu lực" }]}
                        >
                            <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
                        </Form.Item>
                    </Col>
                    {needsSalary && (
                        <Col span={12}>
                            <Form.Item 
                                name="newSalary" 
                                label="Mức lương mới (VND)"
                            >
                                <InputNumber 
                                    style={{ width: "100%" }} 
                                    formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")} 
                                    min={0} 
                                    placeholder="Nếu có thay đổi lương" 
                                />
                            </Form.Item>
                        </Col>
                    )}
                </Row>

                <Row gutter={16}>
                    {needsDepartment && (
                        <Col span={needsPosition ? 12 : 24}>
                            <Form.Item 
                                name="newDepartmentId" 
                                label="Phòng ban mới (ID)"
                                rules={[
                                    { required: isTransfer, message: 'Bắt buộc nhập Phòng ban mới cho thủ tục điều chuyển' }
                                ]}
                            >
                                <InputNumber style={{ width: "100%" }} min={1} placeholder="Nhập ID phòng ban mới" />
                            </Form.Item>
                        </Col>
                    )}
                    {needsPosition && (
                        <Col span={needsDepartment ? 12 : 24}>
                            <Form.Item 
                                name="newPositionId" 
                                label="Vị trí mới (ID)"
                                rules={[
                                    { required: isPromotion, message: 'Bắt buộc nhập Vị trí mới cho thủ tục thăng chức' }
                                ]}
                            >
                                <InputNumber style={{ width: "100%" }} min={1} placeholder="Nhập ID vị trí mới" />
                            </Form.Item>
                        </Col>
                    )}
                </Row>

                <Form.Item name="reason" label="Lý do thay đổi" rules={[{ required: true, message: "Vui lòng nhập lý do" }]}>
                    <TextArea rows={4} placeholder={`Nhập lý do ${procedureType.toLowerCase()}...`} />
                </Form.Item>
            </>
        );
    };

    return (
        <Modal 
            title={isEdit ? `Cập nhật thủ tục: ${initialValues.procedureNumber}` : `Tạo yêu cầu ${procedureType || 'thủ tục HR'}`} 
            open={open} 
            onCancel={() => { form.resetFields(); onCancel(); }}
            onOk={() => form.submit()} 
            confirmLoading={loading} 
            width={700} 
            destroyOnHidden
        >
            <Form form={form} layout="vertical" onFinish={onFinish}>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item 
                            name="employeeId" 
                            label="Nhân viên" 
                            rules={[{ required: true, message: "Vui lòng chọn nhân viên" }]}
                        >
                            <Select 
                                showSearch
                                placeholder="Chọn nhân viên"
                                optionFilterProp="children"
                                filterOption={(input, option) =>
                                    (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())
                                }
                                options={employees.map(emp => ({
                                    label: `${emp.employeeCode} - ${emp.fullName}`,
                                    value: emp.employeeId
                                }))}
                                disabled={isEdit}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item 
                            name="procedureType" 
                            label="Loại thủ tục" 
                            rules={[{ required: true, message: "Vui lòng chọn loại thủ tục" }]}
                        >
                            <Select options={PROCEDURE_TYPES} placeholder="Chọn loại thủ tục" />
                        </Form.Item>
                    </Col>
                </Row>
                
                {renderDynamicFields()}
            </Form>
        </Modal>
    );
};

export default AddHRProcedureModal;
