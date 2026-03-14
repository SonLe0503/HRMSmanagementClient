import { useEffect } from "react";
import { Card, Button, Typography, Tag, Space, message, Row, Col, Statistic, Spin } from "antd";
import { CheckCircleOutlined, LogoutOutlined } from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { checkIn, checkOut, fetchMyToday, selectMyToday, selectAttendanceLoading } from "../../../../store/attendanceSlide";
import dayjs from "dayjs";

const { Text } = Typography;

const AttendanceTodayCard = () => {
    const dispatch = useAppDispatch();
    const myToday = useAppSelector(selectMyToday);
    const loading = useAppSelector(selectAttendanceLoading);

    useEffect(() => {
        dispatch(fetchMyToday());
    }, [dispatch]);

    const handleCheckIn = async () => {
        try {
            await dispatch(checkIn({
                location: "Tại văn phòng",
                remarks: "Check-in từ Web"
            })).unwrap();
            message.success("Check-in thành công");
            dispatch(fetchMyToday());
        } catch (error: any) {
            message.error(error || "Bạn đã check-in hôm nay rồi");
        }
    };

    const handleCheckOut = async () => {
        try {
            await dispatch(checkOut({
                location: "Tại văn phòng",
                remarks: "Check-out từ Web"
            })).unwrap();
            message.success("Check-out thành công");
            dispatch(fetchMyToday());
        } catch (error: any) {
            message.error(error || "Lỗi check-out");
        }
    };

    const attendance = myToday?.attendance;

    const hasCheckedIn = !!attendance?.checkInTime;
    const hasCheckedOut = !!attendance?.checkOutTime;

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Present": return "green";
            case "Late": return "orange";
            case "Absent": return "red";
            case "Incomplete": return "blue";
            default: return "default";
        }
    };

    return (
        <Card title="Attendance Today" bordered={false} className="shadow-sm mb-6">
            <Text type="secondary" className="block mb-4">Ngày hiện tại: {dayjs().format("DD/MM/YYYY")}</Text>

            {loading && !myToday ? (
                <div className="text-center p-6"><Spin /></div>
            ) : (
                <Row gutter={[24, 24]} align="middle">
                    <Col xs={24} sm={12} md={6}>
                        <Statistic
                            title="Check-in time"
                            value={attendance?.checkInTime ? dayjs(attendance.checkInTime).format("HH:mm:ss") : "--:--:--"}
                            valueStyle={{ color: hasCheckedIn ? '#3f8600' : '#cf1322' }}
                        />
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Statistic
                            title="Check-out time"
                            value={attendance?.checkOutTime ? dayjs(attendance.checkOutTime).format("HH:mm:ss") : "--:--:--"}
                            valueStyle={{ color: hasCheckedOut ? '#3f8600' : '#888' }}
                        />
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Statistic
                            title="Working hours"
                            value={attendance?.workingHours ?? 0}
                            suffix="h"
                        />
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <div className="flex flex-col">
                            <span className="text-gray-400 text-sm mb-1">Status</span>
                            <div>
                                <Tag color={getStatusColor(attendance?.status || "")}>
                                    {attendance?.status || "Not Checked In"}
                                </Tag>
                            </div>
                        </div>
                    </Col>
                </Row>
            )}

            <div className="mt-6 border-t pt-4">
                <Space size="large">
                    <Button
                        type="primary"
                        size="large"
                        icon={<CheckCircleOutlined />}
                        onClick={handleCheckIn}
                        disabled={hasCheckedIn || loading}
                    >
                        Check In
                    </Button>
                    <Button
                        danger
                        type="primary"
                        size="large"
                        icon={<LogoutOutlined />}
                        onClick={handleCheckOut}
                        disabled={!hasCheckedIn || hasCheckedOut || loading}
                    >
                        Check Out
                    </Button>
                </Space>
            </div>
        </Card>
    );
};

export default AttendanceTodayCard;
