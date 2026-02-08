import { Input, Select, Row, Col } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useAppSelector } from "../../../store";
import { selectRoles } from "../../../store/roleSlide";

interface ConditionProps {
    searchText: string;
    setSearchText: (value: string) => void;
    roleFilter: string | null;
    setRoleFilter: (value: string | null) => void;
    statusFilter: boolean | null;
    setStatusFilter: (value: boolean | null) => void;
}

const Condition = ({
    searchText,
    setSearchText,
    roleFilter,
    setRoleFilter,
    statusFilter,
    setStatusFilter,
}: ConditionProps) => {
    const roles = useAppSelector(selectRoles);

    return (
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
            <Col xs={24} sm={12} md={8}>
                <Input
                    placeholder="Search by username or email"
                    prefix={<SearchOutlined />}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    allowClear
                />
            </Col>
            <Col xs={12} sm={6} md={4}>
                <Select
                    style={{ width: "100%" }}
                    placeholder="Filter by Role"
                    value={roleFilter}
                    onChange={setRoleFilter}
                    allowClear
                >
                    {roles.map((role) => (
                        <Select.Option key={role.roleId} value={role.roleName}>
                            {role.roleName}
                        </Select.Option>
                    ))}
                </Select>
            </Col>
            <Col xs={12} sm={6} md={4}>
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
