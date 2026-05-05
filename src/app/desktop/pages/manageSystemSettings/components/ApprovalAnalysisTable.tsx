import React from "react";
import { Card, Table, Tag, Badge, Button, Space, Alert, Typography } from "antd";
import { ReloadOutlined, AimOutlined } from "@ant-design/icons";

const { Text } = Typography;

interface ApprovalAnalysisTableProps {
    data: any[];
    loading: boolean;
    onRefresh: () => void;
}

const ApprovalAnalysisTable: React.FC<ApprovalAnalysisTableProps> = ({
    data, loading, onRefresh
}) => {
    const columns = [
        { title: 'Mã NV', dataIndex: 'employeeCode', key: 'employeeCode' },
        { title: 'Họ Tên', dataIndex: 'fullName', key: 'fullName' },
        {
            title: 'Quản lý trực tiếp',
            dataIndex: 'managerName',
            key: 'managerName',
            render: (name: string) => name || <Text type="secondary">N/A</Text>
        },
        {
            title: 'Loại định tuyến',
            dataIndex: 'approvalRouteType',
            key: 'approvalRouteType',
            render: (type: string) => {
                const colors: any = {
                    'Direct': 'green',
                    'TopLevelFallback': 'orange',
                    'DefaultFallback': 'blue',
                    'SystemAdminFallback': 'purple',
                    'None': 'red'
                };
                return <Tag color={colors[type] || 'default'}>{type}</Tag>
            }
        },
        {
            title: 'Người duyệt đích',
            dataIndex: 'targetApproverName',
            key: 'targetApproverName',
            render: (name: string) => name || <Text type="danger">Chưa cấu hình</Text>
        },
        {
            title: 'Trạng thái',
            dataIndex: 'isValid',
            key: 'isValid',
            render: (valid: boolean) => valid ? <Badge status="success" text="Hợp lệ" /> : <Badge status="error" text="Lỗi định tuyến" />
        }
    ];

    return (
        <Card
            title={<Space><AimOutlined /><span>Phân tích Lộ trình Phê duyệt (Audit)</span></Space>}
            extra={
                <Button
                    icon={<ReloadOutlined />}
                    onClick={onRefresh}
                    loading={loading}
                >
                    Làm mới báo cáo
                </Button>
            }
        >
            <Alert
                message="Giải thích báo cáo"
                description="Báo cáo này giúp bạn kiểm tra xem mỗi nhân viên sẽ gửi đơn cho ai. Hãy chú ý các trường hợp 'DefaultFallback' hoặc 'SystemAdminFallback' - đây là những nhân viên chưa có sếp trực tiếp."
                type="info"
                showIcon
                className="!mb-6"
            />
            <Table
                dataSource={data}
                rowKey="employeeId"
                loading={loading}
                pagination={{ pageSize: 5 }}
                columns={columns}
            />
        </Card>
    );
};

export default ApprovalAnalysisTable;
