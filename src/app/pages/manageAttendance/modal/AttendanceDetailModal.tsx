import { Modal, Descriptions, Tag, Typography, Image, Card, Row, Col } from "antd";
import dayjs from "dayjs";
import { EnvironmentOutlined, PictureOutlined } from "@ant-design/icons";

const { Text } = Typography;

interface Props {
    open: boolean;
    onCancel: () => void;
    record: any;
}

const AttendanceDetailModal = ({ open, onCancel, record }: Props) => {
    if (!record) return null;

    return (
        <Modal
            title="Chi tiết bản ghi chấm công"
            open={open}
            onCancel={onCancel}
            footer={null}
            width={700}
        >
            <Descriptions bordered column={2}>
                <Descriptions.Item label="Nhân viên" span={2}>
                    <Text strong>{record.fullName}</Text> ({record.employeeCode})
                </Descriptions.Item>
                <Descriptions.Item label="Ngày">
                    {record.date}
                </Descriptions.Item>
                <Descriptions.Item label="Ca làm việc">
                    {record.shiftName}
                </Descriptions.Item>
                <Descriptions.Item label="Giờ vào">
                    {record.checkIn ? dayjs(record.checkIn).format("HH:mm:ss") : <Text type="secondary">Chưa vào ca</Text>}
                </Descriptions.Item>
                <Descriptions.Item label="Giờ ra">
                    {record.checkOut ? dayjs(record.checkOut).format("HH:mm:ss") : <Text type="secondary">Chưa ra ca</Text>}
                </Descriptions.Item>
                <Descriptions.Item label="Số phút trễ">
                    <Tag color={record.lateMinutes > 0 ? "red" : "green"}>
                        {record.lateMinutes || 0} phút
                    </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                    <Tag color={record.status === "Present" ? "green" : "orange"}>
                        {record.status}
                    </Tag>
                </Descriptions.Item>
            </Descriptions>

            <div style={{ marginTop: 24 }}>
                <Title level={5}>Minh chứng hình ảnh & Vị trí (Verification)</Title>
                <Row gutter={16} style={{ marginTop: 12 }}>
                    <Col span={12}>
                        <Card
                            size="small"
                            title={<span><PictureOutlined /> Hình ảnh AI Check-in</span>}
                            cover={
                                <Image
                                    alt="Check-in verification"
                                    src="https://via.placeholder.com/300x200?text=AI+Face+Recognition+Check-in"
                                />
                            }
                        >
                            <Card.Meta description="Xác thực khuôn mặt thành công" />
                        </Card>
                    </Col>
                    <Col span={12}>
                        <Card
                            size="small"
                            title={<span><EnvironmentOutlined /> Vị trí Check-in</span>}
                            cover={
                                <Image
                                    alt="Location verification"
                                    src="https://via.placeholder.com/300x200?text=Map+Location+Verification"
                                />
                            }
                        >
                            <Card.Meta description="Văn phòng 1 - Quận 1, TP.HCM" />
                        </Card>
                    </Col>
                </Row>
            </div>
        </Modal>
    );
};

const { Title } = Typography;

export default AttendanceDetailModal;
