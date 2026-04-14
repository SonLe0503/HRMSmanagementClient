import { Layout, Typography, Tabs } from "antd";
import { TableOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import AttendanceTable from "./components/AttendanceTable";
import ExplanationApprovalTable from "./components/ExplanationApprovalTable";
import { useAppSelector } from "../../../store";
import { selectAdminAttendance } from "../../../store/attendanceSlide";

const { Content } = Layout;
const { Title } = Typography;

const ManageAttendance = () => {
    const records = useAppSelector(selectAdminAttendance);
    const pendingCount = records.filter(r => r.explanationStatus === "Pending").length;

    return (
        <Layout className="bg-transparent p-6 min-h-screen">
            <Content>
                <div className="mb-6">
                    <Title level={2} className="m-0">Quản lý Chấm công</Title>
                    <p className="text-gray-500 mt-2">Tra cứu, điều chỉnh và quản lý dữ liệu chấm công của toàn bộ nhân viên.</p>
                </div>

                <Tabs
                    defaultActiveKey="attendance"
                    items={[
                        {
                            key: "attendance",
                            label: (
                                <span>
                                    <TableOutlined />
                                    Bảng chấm công
                                </span>
                            ),
                            children: <AttendanceTable />
                        },
                        {
                            key: "explanations",
                            label: (
                                <span>
                                    <ExclamationCircleOutlined />
                                    Giải trình chờ duyệt
                                    {pendingCount > 0 && (
                                        <span
                                            style={{
                                                marginLeft: 8,
                                                background: "#fa8c16",
                                                color: "#fff",
                                                borderRadius: 10,
                                                padding: "0 7px",
                                                fontSize: 12,
                                                fontWeight: 600,
                                            }}
                                        >
                                            {pendingCount}
                                        </span>
                                    )}
                                </span>
                            ),
                            children: <ExplanationApprovalTable />
                        }
                    ]}
                />
            </Content>
        </Layout>
    );
};

export default ManageAttendance;

