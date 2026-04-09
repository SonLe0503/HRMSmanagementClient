import { Modal, Tag, Typography, Descriptions, Divider } from "antd";
import dayjs from "dayjs";
import {
    FileProtectOutlined,
    DollarOutlined,
    CalendarOutlined,
    UsergroupAddOutlined
} from "@ant-design/icons";

const { Text } = Typography;

interface ViewPayrollPolicyModalProps {
    open: boolean;
    onCancel: () => void;
    policy: any;
}

const ViewPayrollPolicyModal = ({ open, onCancel, policy }: ViewPayrollPolicyModalProps) => {
    if (!policy) return null;

    return (
        <Modal
            title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileProtectOutlined style={{ color: '#1890ff' }} />
                    <span>Payroll Policy Details</span>
                </div>
            }
            open={open}
            onCancel={onCancel}
            footer={null}
            width={700}
        >
            <Divider style={{ margin: '12px 0' }} />
            <Descriptions bordered column={1} labelStyle={{ width: '160px', fontWeight: 600 }}>
                <Descriptions.Item label="Policy Name">
                    {policy.policyName}
                </Descriptions.Item>
                <Descriptions.Item label="Policy Type">
                    <Tag color="geekblue">{policy.policyType?.toUpperCase()}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Applicable Group">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <UsergroupAddOutlined />
                        {policy.applicableEmployeeGroup}
                    </div>
                </Descriptions.Item>
                <Descriptions.Item label="Base Amount">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <DollarOutlined style={{ color: "#52c41a" }} />
                        <Text type="success" strong style={{ fontSize: '16px' }}>
                            {policy.baseAmount?.toLocaleString()} VND
                        </Text>
                    </div>
                </Descriptions.Item>
                <Descriptions.Item label="Effective Period">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CalendarOutlined />
                        {dayjs(policy.effectiveStartDate).format("DD/MM/YYYY")}
                        {policy.effectiveEndDate ? ` - ${dayjs(policy.effectiveEndDate).format("DD/MM/YYYY")}` : " - Present"}
                    </div>
                </Descriptions.Item>
                <Descriptions.Item label="Status">
                    <Tag color={policy.isActive ? "green" : "red"}>
                        {policy.isActive ? "ACTIVE" : "INACTIVE"}
                    </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Description">
                    {policy.description || <Text type="secondary" italic>No description provided.</Text>}
                </Descriptions.Item>
            </Descriptions>
        </Modal>
    );
};

export default ViewPayrollPolicyModal;
