import { EnvironmentOutlined, UserDeleteOutlined, ClockCircleOutlined } from "@ant-design/icons";
import React from "react";

export const SUGGESTIONS_INVALID_LOCATION = [
    "Tôi làm việc tại văn phòng đối tác / khách hàng, không ở văn phòng chính.",
    "Tôi được phê duyệt làm việc từ xa (WFH) ngày hôm đó.",
    "Thiết bị gặp sự cố định vị GPS, tọa độ bị sai lệch.",
    "Tôi kết nối mạng từ xa qua VPN, IP không khớp mạng văn phòng.",
    "Tôi check-in/out tại khu vực ngoài tòa nhà do thang máy kẹt.",
];

export const SUGGESTIONS_ABSENT = [
    "Tôi bị ốm đột xuất và đã thông báo với quản lý qua điện thoại.",
    "Tôi gặp sự cố gia đình khẩn cấp, không thể đến làm.",
    "Tôi bị kẹt xe / tai nạn giao thông trên đường đi làm.",
    "Tôi đi công tác bên ngoài, không làm việc tại văn phòng.",
    "Tôi đã xin nghỉ phép nhưng đơn chưa được duyệt trên hệ thống.",
];

export const SUGGESTIONS_INCOMPLETE = [
    "Tôi quên check-out do có cuộc họp khẩn kéo dài đến cuối giờ.",
    "Tôi check-out muộn do phải hoàn thành bàn giao công việc gấp.",
    "Hệ thống gặp lỗi khi tôi thực hiện check-in / check-out.",
    "Tôi check-in muộn do phương tiện giao thông gặp sự cố.",
];

export const SUGGESTIONS_OVERTIME_REASON = [
    "Hoàn thành báo cáo tháng / quý theo yêu cầu của quản lý.",
    "Xử lý công việc gấp phát sinh cuối ngày không thể trì hoãn.",
    "Hỗ trợ đội nhóm hoàn thành dự án trước deadline.",
    "Triển khai / cập nhật hệ thống ngoài giờ để tránh ảnh hưởng vận hành.",
    "Chuẩn bị tài liệu cho cuộc họp / sự kiện ngày hôm sau.",
    "Xử lý sự cố khẩn cấp phát sinh ngoài giờ làm việc.",
    "Bàn giao công việc cho đồng nghiệp do nhân sự nghỉ đột xuất.",
];

export const SUGGESTIONS_LEAVE_REASON = [
    "Tôi bị ốm, cần nghỉ để dưỡng bệnh và phục hồi sức khỏe.",
    "Tôi cần đưa con / người thân đi khám bệnh.",
    "Tôi có việc gia đình quan trọng cần giải quyết.",
    "Tôi có lịch hẹn y tế định kỳ không thể dời.",
    "Tôi cần nghỉ để xử lý thủ tục hành chính / giấy tờ cá nhân.",
    "Tôi đi tham dự đám cưới / đám tang của người thân.",
    "Tôi cần nghỉ phép năm theo kế hoạch đã đăng ký.",
    "Tôi cần chăm sóc con nhỏ do trường/nhà trẻ tạm nghỉ.",
];

export const CASE_CONFIG = {
    location: {
        icon: React.createElement(EnvironmentOutlined),
        label: "Check-in/out sai vị trí",
        color: "#fa8c16",
        bg: "#fff7e6",
        border: "#ffd591",
        tagColor: "orange",
    },
    absent: {
        icon: React.createElement(UserDeleteOutlined),
        label: "Vắng mặt không có phép",
        color: "#ff4d4f",
        bg: "#fff1f0",
        border: "#ffa39e",
        tagColor: "red",
    },
    incomplete: {
        icon: React.createElement(ClockCircleOutlined),
        label: "Giờ công chưa đầy đủ",
        color: "#1677ff",
        bg: "#e6f4ff",
        border: "#91caff",
        tagColor: "blue",
    },
};
