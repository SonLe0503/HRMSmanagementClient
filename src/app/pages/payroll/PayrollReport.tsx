import React, { useEffect } from 'react';
import { Card, Table, Typography, Row, Col, Statistic } from 'antd';
import { DollarOutlined, TeamOutlined, RiseOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../../../store';
import { fetchPayrollPeriods } from '../../../store/payrollSlide';

const { Title } = Typography;

const PayrollReport: React.FC = () => {
    const dispatch = useAppDispatch();
    const { periods, loading } = useAppSelector(state => state.payroll);
    
    useEffect(() => {
        dispatch(fetchPayrollPeriods());
    }, [dispatch]);

    const columns = [
        {
            title: 'Kỳ lương',
            key: 'period',
            render: (record: any) => `Tháng ${record.month}/${record.year}`,
        },
        {
            title: 'Tổng nhân viên',
            dataIndex: 'totalEmployees',
            key: 'totalEmployees',
            render: (val: number) => val || 0,
        },
        {
            title: 'Tổng lương Gross',
            dataIndex: 'totalGrossPay',
            key: 'totalGrossPay',
            render: (val: number) => `${(val || 0).toLocaleString()} đ`,
        },
        {
            title: 'Tổng thuế TNCN',
            dataIndex: 'totalTax',
            key: 'totalTax',
            render: (val: number) => `${(val || 0).toLocaleString()} đ`,
        },
        {
            title: 'Tổng bảo hiểm',
            dataIndex: 'totalInsurance',
            key: 'totalInsurance',
            render: (val: number) => `${(val || 0).toLocaleString()} đ`,
        },
        {
            title: 'Tổng thực lĩnh (Net)',
            dataIndex: 'totalNetPay',
            key: 'totalNetPay',
            render: (val: number) => (
                <Typography.Text type="success" strong>
                    {`${(val || 0).toLocaleString()} đ`}
                </Typography.Text>
            ),
        },
    ];

    // Tính toán số liệu tổng quan
    const totalSalaryPaid = periods.reduce((sum, p) => sum + (p.totalNetPay || 0), 0);
    const avgSalary = periods.length > 0 ? totalSalaryPaid / periods.length : 0;
    const lastPeriod = periods.length > 0 ? periods[0] : null;

    return (
        <div style={{ padding: '24px' }}>
            <Row gutter={[16, 24]} justify="space-between" align="middle" style={{ marginBottom: 24 }}>
                <Col>
                    <Title level={2}>Báo cáo quỹ lương</Title>
                    <Typography.Text type="secondary">Phân tích và tổng hợp quỹ lương theo các kỳ</Typography.Text>
                </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false} className="summary-card">
                        <Statistic
                            title="Tổng ngân sách đã chi"
                            value={totalSalaryPaid}
                            precision={0}
                            valueStyle={{ color: '#3f8600' }}
                            prefix={<DollarOutlined />}
                            suffix="đ"
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false} className="summary-card">
                        <Statistic
                            title="Lương trung bình / kỳ"
                            value={avgSalary}
                            precision={0}
                            valueStyle={{ color: '#1890ff' }}
                            prefix={<RiseOutlined />}
                            suffix="đ"
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false} className="summary-card">
                        <Statistic
                            title="Kỳ lương gần nhất"
                            value={lastPeriod ? lastPeriod.totalNetPay : 0}
                            precision={0}
                            prefix={<RiseOutlined />}
                            suffix="đ"
                        />
                        <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
                            {lastPeriod ? `Tháng ${lastPeriod.month}/${lastPeriod.year}` : 'N/A'}
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false} className="summary-card">
                        <Statistic
                            title="Tổng số kỳ lương"
                            value={periods.length}
                            prefix={<TeamOutlined />}
                        />
                    </Card>
                </Col>
            </Row>

            <Card title="Lịch sử quỹ lương theo kỳ">
                <Table
                    columns={columns}
                    dataSource={periods}
                    loading={loading}
                    rowKey="periodId"
                    pagination={{ pageSize: 10 }}
                />
            </Card>
        </div>
    );
};

export default PayrollReport;
