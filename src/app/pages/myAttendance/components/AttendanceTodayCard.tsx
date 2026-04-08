import { useEffect, useState } from "react";
import { Card, Button, Typography, Tag, Space, message, Row, Col, Statistic, Spin, Tooltip, Modal } from "antd";
import { CheckCircleOutlined, LogoutOutlined, UserOutlined } from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { checkIn, checkOut, fetchMyToday, selectMyToday, selectAttendanceLoading, checkFaceRegistration } from "../../../../store/attendanceSlide";
import dayjs from "dayjs";
import FaceRegisterModal from "../modal/FaceRegisterModal";
import CameraCaptureModal from "../modal/CameraCaptureModal";

const { Text } = Typography;

const AttendanceTodayCard = () => {
    const dispatch = useAppDispatch();
    const myToday = useAppSelector(selectMyToday);
    const loading = useAppSelector(selectAttendanceLoading);
    
    // Modals visibility
    const [faceRegisterOpen, setFaceRegisterOpen] = useState(false);
    const [checkInOpen, setCheckInOpen] = useState(false);
    const [checkOutOpen, setCheckOutOpen] = useState(false);

    useEffect(() => {
        dispatch(fetchMyToday());
    }, [dispatch]);

    const handleOpenFaceRegister = async () => {
        try {
            const res = await dispatch(checkFaceRegistration()).unwrap();
            if (res.isRegistered) {
                Modal.confirm({
                    title: 'Đã có dữ liệu khuôn mặt',
                    content: 'Bạn đã đăng ký khuôn mặt trên hệ thống. Bạn có muốn chụp lại để cập nhật mới không?',
                    okText: 'Cập nhật',
                    cancelText: 'Huỷ',
                    onOk: () => setFaceRegisterOpen(true)
                });
            } else {
                setFaceRegisterOpen(true);
            }
        } catch (error) {
            setFaceRegisterOpen(true);
        }
    };

    const handleCheckInCapture = async (faceImage: string) => {
        try {
            let latitude: number | undefined = undefined;
            let longitude: number | undefined = undefined;
            
            try {
                const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject, { 
                        timeout: 10000,
                        enableHighAccuracy: true 
                    });
                });
                latitude = position.coords.latitude;
                longitude = position.coords.longitude;
            } catch (geoError) {
                console.error("Geolocation error:", geoError);
                message.error("Hệ thống yêu cầu quyền truy cập vị trí GPS để thực hiện điểm danh. Vui lòng cấp quyền trình duyệt.");
                return;
            }

            await dispatch(checkIn({
                location: `GPS: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
                latitude,
                longitude,
                remarks: "Check-in từ Web Face-ID",
                faceImageBase64: faceImage,
                deviceInfo: navigator.userAgent
            })).unwrap();
            message.success("Check-in thành công");
            setCheckInOpen(false);
            dispatch(fetchMyToday());
        } catch (error: any) {
            message.error(error || "Check-in thất bại");
        }
    };

    const handleCheckOutCapture = async (faceImage: string) => {
        try {
            let latitude: number | undefined = undefined;
            let longitude: number | undefined = undefined;

            try {
                const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject, { 
                        timeout: 10000,
                        enableHighAccuracy: true
                    });
                });
                latitude = position.coords.latitude;
                longitude = position.coords.longitude;
            } catch (geoError) {
                console.error("Geolocation error:", geoError);
                message.error("Hệ thống yêu cầu quyền truy cập vị trí GPS để thực hiện điểm danh. Vui lòng cấp quyền trình duyệt.");
                return;
            }

            await dispatch(checkOut({
                location: `GPS: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
                latitude,
                longitude,
                remarks: "Check-out từ Web Face-ID",
                faceImageBase64: faceImage,
                deviceInfo: navigator.userAgent
            })).unwrap();
            message.success("Check-out thành công");
            setCheckOutOpen(false);
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
        <>
            <Card 
                title={
                    <div className="flex justify-between items-center">
                        <span>Attendance Today</span>
                        <Tooltip title="Đăng ký khuôn mặt">
                            <Button 
                                type="text" 
                                icon={<UserOutlined />} 
                                onClick={handleOpenFaceRegister}
                                size="small"
                                className="flex items-center"
                            >
                                Register Face
                            </Button>
                        </Tooltip>
                    </div>
                } 
                variant="borderless" 
                className="shadow-sm mb-6"
            >
                <Text type="secondary" className="block mb-4">Ngày hiện tại: {dayjs().format("DD/MM/YYYY")}</Text>

                {loading && !myToday ? (
                    <div className="text-center p-6"><Spin /></div>
                ) : (
                    <Row gutter={[24, 24]} align="middle">
                        <Col xs={24} sm={12} md={12}>
                            <Statistic
                                title="Check-in time"
                                value={attendance?.checkInTime ? dayjs(attendance.checkInTime).format("HH:mm:ss") : "--:--:--"}
                                styles={{ content: { color: hasCheckedIn ? '#3f8600' : '#cf1322' } }}
                            />
                        </Col>
                        <Col xs={24} sm={12} md={12}>
                            <Statistic
                                title="Check-out time"
                                value={attendance?.checkOutTime ? dayjs(attendance.checkOutTime).format("HH:mm:ss") : "--:--:--"}
                                styles={{ content: { color: hasCheckedOut ? '#3f8600' : '#888' } }}
                            />
                        </Col>
                        <Col xs={24} sm={12} md={12}>
                            <Statistic
                                title="Working hours"
                                value={attendance?.workingHours ?? 0}
                                suffix="h"
                            />
                        </Col>
                        <Col xs={24} sm={12} md={12}>
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
                    <Space size="middle" className="flex flex-wrap">
                        <Button
                            type="primary"
                            size="large"
                            icon={<CheckCircleOutlined />}
                            onClick={() => setCheckInOpen(true)}
                            disabled={loading}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            Face Check In
                        </Button>
                        <Button
                            danger
                            type="primary"
                            size="large"
                            icon={<LogoutOutlined />}
                            onClick={() => setCheckOutOpen(true)}
                            disabled={!hasCheckedIn || loading}
                        >
                            Face Check Out
                        </Button>
                    </Space>
                </div>
            </Card>

            <FaceRegisterModal 
                open={faceRegisterOpen} 
                onCancel={() => setFaceRegisterOpen(false)}
                onSuccess={() => setFaceRegisterOpen(false)}
            />

            <CameraCaptureModal 
                open={checkInOpen}
                title="Check In"
                onCancel={() => setCheckInOpen(false)}
                onCapture={handleCheckInCapture}
                loading={loading}
            />

            <CameraCaptureModal 
                open={checkOutOpen}
                title="Check Out"
                onCancel={() => setCheckOutOpen(false)}
                onCapture={handleCheckOutCapture}
                loading={loading}
            />
        </>
    );
};

export default AttendanceTodayCard;
