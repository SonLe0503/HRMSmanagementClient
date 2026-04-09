import { Input, Select, Row, Col } from "antd";
import { SearchOutlined } from "@ant-design/icons";

interface ConditionProps {
    searchText: string;
    setSearchText: (value: string) => void;
    typeFilter: string | null;
    setTypeFilter: (value: string | null) => void;
    statusFilter: boolean | null;
    setStatusFilter: (value: boolean | null) => void;
    groupFilter: string | null;
    setGroupFilter: (value: string | null) => void;
}

const Condition = ({
    searchText,
    setSearchText,
    typeFilter,
    setTypeFilter,
    statusFilter,
    setStatusFilter,
    groupFilter,
    setGroupFilter
}: ConditionProps) => {
    return (
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
            <Col xs={24} sm={12} md={6}>
                <Input
                    placeholder="Search by policy name..."
                    prefix={<SearchOutlined />}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    allowClear
                />
            </Col>
            <Col xs={24} sm={6} md={6}>
                <Select
                    style={{ width: "100%" }}
                    placeholder="Policy Type"
                    value={typeFilter}
                    onChange={setTypeFilter}
                    allowClear
                >
                    <Select.Option value="Salary">Salary</Select.Option>
                    <Select.Option value="Bonus">Bonus</Select.Option>
                    <Select.Option value="Allowance">Allowance</Select.Option>
                    <Select.Option value="Tax">Tax</Select.Option>
                    <Select.Option value="Insurance">Insurance</Select.Option>
                </Select>
            </Col>
            <Col xs={24} sm={6} md={6}>
                <Select
                    style={{ width: "100%" }}
                    placeholder="Employee Group"
                    value={groupFilter}
                    onChange={setGroupFilter}
                    allowClear
                >
                    <Select.Option value="All Employees">All Employees</Select.Option>
                    <Select.Option value="Full-time">Full-time</Select.Option>
                    <Select.Option value="Part-time">Part-time</Select.Option>
                    <Select.Option value="Contractor">Contractor</Select.Option>
                </Select>
            </Col>
            <Col xs={24} sm={6} md={6}>
                <Select
                    style={{ width: "100%" }}
                    placeholder="Status"
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
