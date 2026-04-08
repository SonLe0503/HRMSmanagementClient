import { Layout, Typography, Tabs } from "antd";
import PendingLeaveRequestTable from "./components/PendingLeaveRequestTable";
import TeamLeaveCalendar from "./components/TeamLeaveCalendar";

const { Content } = Layout;
const { Title } = Typography;
const ManageLeaveRequest = () => {
    return (
        <Layout className="bg-transparent p-6 min-h-screen">
            <Content>
                <div className="mb-8">
                    <Title level={2} className="m-0 text-gray-800">Quản lý Nghỉ phép</Title>
                    <p className="text-gray-500 mt-3 text-lg leading-relaxed">
                        Phê duyệt yêu cầu và xem lịch làm việc của nhân viên trong nhóm.
                    </p>
                </div>
                <div className="bg-white/40 backdrop-blur-md p-2 rounded-2xl shadow-xl border border-white/50">
                    <Tabs 
                        defaultActiveKey="1" 
                        className="custom-tabs" 
                        size="large" 
                        centered
                        items={[
                            {
                                key: "1",
                                label: (
                                    <span className="flex items-center px-6 py-2">
                                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                        </svg>
                                        Phê duyệt yêu cầu
                                    </span>
                                ),
                                children: (
                                    <div className="p-4">
                                        <PendingLeaveRequestTable />
                                    </div>
                                )
                            },
                            {
                                key: "2",
                                label: (
                                    <span className="flex items-center px-6 py-2">
                                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        Lịch nghỉ phép nhóm
                                    </span>
                                ),
                                children: (
                                    <div className="p-4">
                                        <TeamLeaveCalendar />
                                    </div>
                                )
                            }
                        ]}
                    />
                </div>
            </Content>

            <style>{`
                .custom-tabs .ant-tabs-nav::before {
                    border-bottom-color: transparent;
                }
                .custom-tabs .ant-tabs-tab {
                    font-size: 16px;
                    font-weight: 500;
                    color: #6b7280;
                    transition: all 0.3s;
                    border-radius: 12px;
                    margin: 0 4px !important;
                }
                .custom-tabs .ant-tabs-tab-active {
                    background-color: #3b82f6;
                }
                .custom-tabs .ant-tabs-tab-active .ant-tabs-tab-btn {
                    color: white !important;
                }
                .custom-tabs .ant-tabs-ink-bar {
                    display: none;
                }
                .custom-tabs .ant-tabs-tab:hover {
                    color: #3b82f6;
                    background-color: #f3f4f6;
                }
                .custom-tabs .ant-tabs-tab-active:hover {
                    background-color: #2563eb;
                }
            `}</style>
        </Layout>
    );
};

export default ManageLeaveRequest;
