import { Calendar, Badge, Tooltip } from "antd";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { fetchTeamLeaveCalendar, selectTeamLeaveCalendar } from "../../../../store/leaveRequestSlide";
import dayjs, { Dayjs } from "dayjs";

const TeamLeaveCalendar = () => {
    const dispatch = useAppDispatch();
    const leaves = useAppSelector(selectTeamLeaveCalendar);

    useEffect(() => {
        dispatch(fetchTeamLeaveCalendar());
    }, [dispatch]);

    const getListData = (value: Dayjs) => {
        return (leaves || []).filter(item => {
            const start = dayjs(item.startDate);
            const end = dayjs(item.endDate);
            return (value.isSame(start, 'day') || value.isAfter(start, 'day')) && 
                   (value.isSame(end, 'day') || value.isBefore(end, 'day'));
        });
    };

    const dateCellRender = (value: Dayjs) => {
        const listData = getListData(value);
        return (
            <ul className="list-none p-0 m-0 overflow-hidden">
                {(listData || []).map(item => (
                    <li key={item.leaveRequestId} className="mb-1">
                        <Tooltip title={`${item.employeeName} (${item.leaveTypeName})`}>
                            <Badge 
                                status="success" 
                                text={item.employeeName} 
                                className="text-[10px] whitespace-nowrap overflow-hidden transition-all duration-300 hover:scale-105" 
                            />
                        </Tooltip>
                    </li>
                ))}
            </ul>
        );
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <span className="w-1.5 h-6 bg-green-500 rounded-full mr-3"></span>
                Lịch nghỉ phép của nhóm
            </h3>
            <div className="overflow-auto max-h-[700px]">
                <Calendar 
                    cellRender={dateCellRender} 
                    className="custom-calendar"
                    fullscreen={true}
                />
            </div>
            <style>{`
                .custom-calendar .ant-picker-calendar-date-content {
                    height: 80px !important;
                    overflow-y: auto;
                }
                .custom-calendar .ant-picker-cell-selected .ant-picker-calendar-date {
                    background-color: #f0fdf4 !important;
                }
                .custom-calendar .ant-picker-calendar-date:hover {
                    background-color: #f9fafb;
                }
                .custom-calendar .ant-badge-status-text {
                    font-size: 11px;
                    color: #4b5563;
                }
            `}</style>
        </div>
    );
};

export default TeamLeaveCalendar;
