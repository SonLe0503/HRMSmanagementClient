import { Table, Drawer, Tag } from "antd";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { fetchAttendanceLogs, selectLogs, selectAttendanceLoading } from "../../../../store/attendanceSlide";
import { useEffect } from "react";
import dayjs from "dayjs";

interface AttendanceLogsModalProps {
    open: boolean;
    onClose: () => void;
    employeeId: number;
    employeeName: string;
    date: string;
}

const AttendanceLogsModal = ({ open, onClose, employeeId, employeeName, date }: AttendanceLogsModalProps) => {
    const dispatch = useAppDispatch();
    const logs = useAppSelector(selectLogs);
    const loading = useAppSelector(selectAttendanceLoading);

    useEffect(() => {
        if (open && employeeId && date) {
            dispatch(fetchAttendanceLogs({ employeeId, date }));
        }
    }, [open, employeeId, date, dispatch]);

    const columns = [
        {
            title: "Thời gian",
            dataIndex: "logTime",
            key: "logTime",
            render: (text: string) => dayjs(text).format("HH:mm:ss DD/MM")
        },
        {
            title: "Hành động",
            dataIndex: "logType",
            key: "logType",
            render: (val: string) => <Tag color="blue">{val}</Tag>
        },
        {
            title: "Nguồn",
            dataIndex: "source",
            key: "source",
            render: (val: string) => <Tag>{val}</Tag>
        },
        {
            title: "Lý do / Mô tả",
            dataIndex: "remarks",
            key: "remarks",
            render: (val: string) => val || "—"
        },
        {
            title: "Vị trí",
            dataIndex: "location",
            key: "location",
            render: (val: string) => val || "—"
        }
    ];

    return (
        <Drawer
            title={`Lịch sử Audit / Chấm công - ${employeeName} - ${dayjs(date).format("DD/MM/YYYY")}`}
            placement="right"
            width={700}
            onClose={onClose}
            open={open}
        >
            <Table
                columns={columns}
                dataSource={logs}
                rowKey="logId"
                loading={loading}
                pagination={false}
                bordered
            />
        </Drawer>
    );
};

export default AttendanceLogsModal;
