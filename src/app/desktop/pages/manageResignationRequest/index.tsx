import { Layout, Typography } from "antd";
import PendingResignationTable from "./components/PendingResignationTable";

const { Content } = Layout;
const { Title } = Typography;

const ManageResignationRequest = () => {
    return (
        <Layout className="bg-transparent p-6 min-h-screen">
            <Content>
                <div className="mb-8">
                    <Title level={2} className="m-0 text-gray-800">Quản lý Đơn thôi việc</Title>
                    <p className="text-gray-500 mt-3 text-lg leading-relaxed">
                        Xem xét và phê duyệt đơn xin thôi việc của nhân viên trong nhóm.
                    </p>
                </div>
                <PendingResignationTable />
            </Content>
        </Layout>
    );
};

export default ManageResignationRequest;
