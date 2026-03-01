import { Modal, Form, Input, Select, DatePicker, message } from "antd";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { createPayrollPolicy, selectPayrollPolicyLoading } from "../../../../store/payrollPolicySlice";
import dayjs from "dayjs";

interface AddPayrollPolicyModalProps {
    open: boolean;
    onCancel: () => void;
    onSuccess: () => void;
}

const AddPayrollPolicyModal = ({ open, onCancel, onSuccess }: AddPayrollPolicyModalProps) => {
    const [form] = Form.useForm();
    const dispatch = useAppDispatch();
    const loading = useAppSelector(selectPayrollPolicyLoading);

    const onFinish = (values: any) => {
        const data = {
            ...values,
            EffectiveStartDate: values.EffectiveStartDate.format("YYYY-MM-DD"),
            EffectiveEndDate: values.EffectiveEndDate ? values.EffectiveEndDate.format("YYYY-MM-DD") : null,
        };

        dispatch(createPayrollPolicy(data)).then((res: any) => {
            if (!res.error) {
                message.success(res.payload?.Message || "Payroll policy created successfully");
                form.resetFields();
                onSuccess();
            } else {
                const error = res.payload;
                const msg = typeof error === 'string' ? error : error?.Message || error?.message || "Failed to create policy";
                message.error(msg);
            }
        });
    };

    return (
        <Modal
            title="Create New Payroll Policy"
            open={open}
            onCancel={() => {
                form.resetFields();
                onCancel();
            }}
            onOk={() => form.submit()}
            confirmLoading={loading}
            width={600}
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                initialValues={{ PolicyType: 'Salary', ApplicableEmployeeGroup: 'All Employees' }}
            >
                <Form.Item
                    name="PolicyName"
                    label="Policy Name"
                    rules={[{ required: true, message: "Please input the policy name!" }]}
                >
                    <Input placeholder="Enter policy name" />
                </Form.Item>

                <div style={{ display: 'flex', gap: '16px' }}>
                    <Form.Item
                        name="PolicyType"
                        label="Policy Type"
                        rules={[{ required: true, message: "Please select a policy type!" }]}
                        style={{ flex: 1 }}
                    >
                        <Select>
                            <Select.Option value="Salary">Salary</Select.Option>
                            <Select.Option value="Allowance">Allowance</Select.Option>
                            <Select.Option value="Deduction">Deduction</Select.Option>
                            <Select.Option value="Overtime">Overtime</Select.Option>
                            <Select.Option value="Bonus">Bonus</Select.Option>
                            <Select.Option value="Tax">Tax</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="ApplicableEmployeeGroup"
                        label="Employee Group"
                        rules={[{ required: true, message: "Please select an employee group!" }]}
                        style={{ flex: 1 }}
                    >
                        <Select>
                            <Select.Option value="All Employees">All Employees</Select.Option>
                            <Select.Option value="Full-time">Full-time</Select.Option>
                            <Select.Option value="Part-time">Part-time</Select.Option>
                            <Select.Option value="Contractor">Contractor</Select.Option>
                        </Select>
                    </Form.Item>
                </div>

                <div style={{ display: 'flex', gap: '16px' }}>
                    <Form.Item
                        name="EffectiveStartDate"
                        label="Effective Start Date"
                        rules={[{ required: true, message: "Please select start date!" }]}
                        style={{ flex: 1 }}
                    >
                        <DatePicker style={{ width: '100%' }} disabledDate={(current) => current && current < dayjs().startOf('day')} />
                    </Form.Item>

                    <Form.Item
                        name="EffectiveEndDate"
                        label="Effective End Date"
                        style={{ flex: 1 }}
                    >
                        <DatePicker style={{ width: '100%' }} />
                    </Form.Item>
                </div>

                <Form.Item
                    name="CalculationFormula"
                    label="Calculation Formula"
                    tooltip="Enter formula or base amount. E.g., 5000000 or BaseSalary * 0.1"
                >
                    <Input placeholder="Enter formula" />
                </Form.Item>

                <Form.Item
                    name="Description"
                    label="Description"
                >
                    <Input.TextArea placeholder="Enter description" rows={3} />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default AddPayrollPolicyModal;
