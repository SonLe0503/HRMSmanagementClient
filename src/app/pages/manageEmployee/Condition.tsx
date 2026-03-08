import { Input, Select, Row, Col } from "antd";
import { SearchOutlined } from "@ant-design/icons";

interface ConditionProps {
    searchText: string;
    setSearchText: (v: string) => void;
    statusFilter: string | null;
    setStatusFilter: (v: string | null) => void;
    genderFilter: string | null;
    setGenderFilter: (v: string | null) => void;
}

const EMPLOYMENT_STATUS_OPTIONS = [
    { label: "Active", value: "Active" },
    { label: "Inactive", value: "Inactive" },
    { label: "Resigned", value: "Resigned" },
    { label: "Terminated", value: "Terminated" },
    { label: "On Leave", value: "On Leave" },
];

const GENDER_OPTIONS = [
    { label: "Male", value: "Male" },
    { label: "Female", value: "Female" },
    { label: "Other", value: "Other" },
];

const Condition = ({
    searchText,
    setSearchText,
    statusFilter,
    setStatusFilter,
    genderFilter,
    setGenderFilter,
}: ConditionProps) => {
    return (
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
            <Col xs={24} sm={12} md={10}>
                <Input
                    placeholder="Tìm theo tên, mã NV hoặc email..."
                    prefix={<SearchOutlined />}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    allowClear
                />
            </Col>
            <Col xs={12} sm={6} md={5}>
                <Select
                    style={{ width: "100%" }}
                    placeholder="Trạng thái"
                    value={statusFilter}
                    onChange={setStatusFilter}
                    allowClear
                    options={EMPLOYMENT_STATUS_OPTIONS}
                />
            </Col>
            <Col xs={12} sm={6} md={5}>
                <Select
                    style={{ width: "100%" }}
                    placeholder="Giới tính"
                    value={genderFilter}
                    onChange={setGenderFilter}
                    allowClear
                    options={GENDER_OPTIONS}
                />
            </Col>
        </Row>
    );
};

export default Condition;
