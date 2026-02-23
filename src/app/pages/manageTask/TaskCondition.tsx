import React from 'react';
import { Input, Select, DatePicker, Row, Col } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

const { RangePicker } = DatePicker;

interface TaskConditionProps {
    searchText: string;
    setSearchText: (val: string) => void;
    priorityFilter: string | null;
    setPriorityFilter: (val: string | null) => void;
    statusFilter: string | null;
    setStatusFilter: (val: string | null) => void;
}

const TaskCondition: React.FC<TaskConditionProps> = ({
    searchText, setSearchText,
    priorityFilter, setPriorityFilter,
    statusFilter, setStatusFilter
}) => {
    return (
        <div style={{ marginBottom: 16 }}>
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={8}>
                    <Input
                        placeholder="Search Task ID, Type, Description..."
                        prefix={<SearchOutlined />}
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        allowClear
                    />
                </Col>
                <Col xs={24} sm={12} md={4}>
                    <Select
                        style={{ width: '100%' }}
                        placeholder="Filter Priority"
                        allowClear
                        value={priorityFilter}
                        onChange={setPriorityFilter}
                    >
                        <Select.Option value="High">High</Select.Option>
                        <Select.Option value="Medium">Medium</Select.Option>
                        <Select.Option value="Low">Low</Select.Option>
                    </Select>
                </Col>
                <Col xs={24} sm={12} md={4}>
                    <Select
                        style={{ width: '100%' }}
                        placeholder="Filter Status"
                        allowClear
                        value={statusFilter}
                        onChange={setStatusFilter}
                    >
                        <Select.Option value="Pending">Pending</Select.Option>
                        <Select.Option value="InProgress">InProgress</Select.Option>
                        <Select.Option value="Approved">Approved</Select.Option>
                        <Select.Option value="Rejected">Rejected</Select.Option>
                        <Select.Option value="Cancelled">Cancelled</Select.Option>
                    </Select>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <RangePicker style={{ width: '100%' }} />
                </Col>
            </Row>
        </div>
    );
};

export default TaskCondition;
