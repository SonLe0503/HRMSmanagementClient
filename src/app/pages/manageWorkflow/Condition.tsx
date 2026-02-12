import { Input, Select, Row, Col } from "antd";
import { SearchOutlined } from "@ant-design/icons";

interface ConditionProps {
    searchText: string;
    setSearchText: (value: string) => void;
    typeFilter: string | null;
    setTypeFilter: (value: string | null) => void;
    statusFilter: boolean | null;
    setStatusFilter: (value: boolean | null) => void;
}

const Condition = ({
    searchText,
    setSearchText,
    typeFilter,
    setTypeFilter,
    statusFilter,
    setStatusFilter,
}: ConditionProps) => {
    return (
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
            <Col xs={24} sm={12} md={8}>
                <Input
                    placeholder="Search workflows by name..."
                    prefix={<SearchOutlined />}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    allowClear
                />
            </Col>
            <Col xs={24} sm={6} md={4}>
                <Select
                    style={{ width: "100%" }}
                    placeholder="Filter by Type"
                    value={typeFilter}
                    onChange={setTypeFilter}
                    allowClear
                >
                    <Select.Option value="Leave">Leave</Select.Option>
                    <Select.Option value="Overtime">Overtime</Select.Option>
                    <Select.Option value="Attendance">Attendance</Select.Option>
                    <Select.Option value="Payroll">Payroll</Select.Option>
                    <Select.Option value="Performance">Performance</Select.Option>
                </Select>
            </Col>
            <Col xs={24} sm={6} md={4}>
                <Select
                    style={{ width: "100%" }}
                    placeholder="Filter by Status"
                    value={statusFilter}
                    onChange={setStatusFilter}
                    allowClear
                >
                    <Select.Option value={true}>Active</Select.Option>
                    <Select.Option value={false}>Inactive</Select.Option>
                </Select>
            </Col>
        </Row>
    );
};

export default Condition;
