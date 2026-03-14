import { Layout, Typography } from "antd";
import AttendanceTable from "./components/AttendanceTable";

const { Content } = Layout;
const { Title } = Typography;

const ManageAttendance = () => {
    return (
        <Layout className="bg-transparent p-6 min-h-screen">
            <Content>
                <div className="mb-6">
                    <Title level={2} className="m-0">Quản lý Chấm công</Title>
                    <p className="text-gray-500 mt-2">Tra cứu, điều chỉnh và quản lý dữ liệu chấm công của toàn bộ nhân viên.</p>
                </div>

                <AttendanceTable />
            </Content>
        </Layout>
    );
};

export default ManageAttendance;
