# HRMSmanagementClient - Giao Diện Hệ Thống Quản Trị Nhân Sự (HRMS Client)

Hệ thống giao diện người dùng (Frontend) dành cho ứng dụng Quản lý Nhân sự (HRMS), được xây dựng bằng **React 19**, **TypeScript** và **Vite**. Dự án được thiết kế chuyên biệt với cấu trúc giao diện kép, tối ưu hóa trải nghiệm sử dụng trên cả máy tính để bàn (Desktop Web) và các thiết bị di động (Mobile Web).

---

## ✨ Tính Năng Nổi Bật theo Nền Tảng

### 🖥️ 1. Giao Diện Desktop (Dành cho Quản trị viên & Nhân sự)
Giao diện quản lý toàn diện với các phân hệ lớn:
* **Bảng điều khiển & Phân tích (Dashboard & Analytics):** Biểu đồ động về biến động nhân sự, tỷ lệ chuyên cần, phân phối hiệu suất phòng ban và các chỉ số nhân lực cốt lõi.
* **Quản lý Nhân viên (Manage Employee):** Xem danh sách nhân viên dạng bảng thông minh, tạo mới, chỉnh sửa thông tin, tải lên tài liệu hồ sơ nhân sự.
* **Quản lý Chấm công & Phân ca (Attendance & Shift Configuration):** 
  - Quản lý ca làm việc, gán ca cho nhân viên.
  - Xem, xuất dữ liệu chấm công chi tiết của toàn bộ công ty.
  - Phê duyệt các yêu cầu xin tăng ca (Overtime).
* **Quản lý Phép & Nghỉ phép (Leave Management):** Cấu hình các loại phép, thiết lập số dư phép hàng năm và duyệt đơn xin nghỉ phép của nhân viên.
* **Quy trình Nhân sự (HR Procedures & Resignations):** Quản lý thuyên chuyển công tác, thay đổi chức vụ, tăng lương, bổ nhiệm và xử lý đơn thôi việc.
* **Đánh Giá Hiệu Suất (Performance Evaluation):** Tạo tiêu chí, biểu mẫu đánh giá, thiết lập chu kỳ và xem tổng hợp kết quả đánh giá nhân viên.
* **Bảng Lương & Tính Lương (Payroll Management):** Cấu hình các thiết lập tính lương, tạo chu kỳ lương, xem bảng lương tổng hợp và xuất báo cáo lương (PDF, Excel).
* **Quản lý Tài Khoản & Phân Quyền (Access Control):** Quản lý tài khoản đăng nhập, gán vai trò (Roles) và thiết lập quyền hạn truy cập hệ thống.

### 📱 2. Giao Diện Mobile (Dành cho Nhân viên Tự phục vụ - Employee Self-Service)
Giao diện tinh gọn, tối ưu hóa thao tác chạm và tốc độ tải trang:
* **Chấm Công Khuôn Mặt Camera (Mobile Attendance):** Cho phép nhân viên check-in/check-out trực tiếp bằng camera điện thoại thông qua cơ chế nhận diện khuôn mặt kết hợp định vị.
* **Đăng Ký Khuôn Mặt (Mobile Face Registration):** Chụp ảnh khuôn mặt để đăng ký mẫu sinh trắc học vào hệ thống.
* **Đơn Từ Tiện Lợi:** Đăng ký xin nghỉ phép (Leave Request), xin tăng ca (Overtime Request) hoặc nộp đơn xin thôi việc ngay trên điện thoại.
* **Phiếu Lương Cá Nhân (Mobile Payslips):** Xem nhanh phiếu lương hàng tháng chi tiết và trực quan.
* **Đánh Giá Nhân Viên (Mobile Evaluations):** Thực hiện tự đánh giá năng lực trong các chu kỳ đánh giá hiệu suất.
* **Quản Lý Công Việc (Mobile Tasks):** Theo dõi danh sách công việc cá nhân được giao, cập nhật tiến độ công việc.

---

## 🛠️ Công Nghệ Sử Dụng

* **Thư viện Core:** React 19, TypeScript, Vite
* **Quản lý State:** Redux Toolkit, Redux Persist (Lưu trữ và duy trì trạng thái đăng nhập, cấu hình hệ thống)
* **Thư viện UI & Component:** Ant Design (antd v6) - cung cấp các thành phần giao diện chất lượng cao, bảng biểu và biểu mẫu thông minh.
* **CSS Framework:** Tailwind CSS (v4) - thiết kế giao diện tùy biến, responsive nhanh chóng.
* **Hiệu ứng & Chuyển động:** Framer Motion - tạo các hiệu ứng micro-animations mượt mà và trực quan.
* **Kết nối API:** Axios (đã tích hợp interceptor tự động đính kèm JWT Token và xử lý lỗi đồng thời).
* **Xử lý Thời gian:** Day.js
* **Điều hướng:** React Router DOM (v7)
* **Xử lý Camera:** React Webcam (dùng cho mô-đun chụp khuôn mặt để chấm công).

---

## 📂 Cấu Trúc Thư Mục

```text
src/
├── app/
│   ├── desktop/            # Giao diện trên máy tính (Admin & Manager)
│   │   ├── components/     # Các component dùng riêng cho bản desktop
│   │   └── pages/          # Các trang nghiệp vụ (Employee, Payroll, Shift, Analytics...)
│   └── mobile/             # Giao diện trên điện thoại (Employee)
│       ├── components/     # Các component dùng riêng cho bản mobile
│       └── pages/          # Các trang tự phục vụ (MobileAttendance, Payslips, Requests...)
├── assets/                 # Các tài nguyên tĩnh (Hình ảnh, Logo, Icons...)
├── constants/              # Định nghĩa các biến hằng số, API endpoints
├── hooks/                  # Các Custom React Hooks dùng chung
├── interface/              # Các định nghĩa TypeScript Interfaces
├── layouts/                # Các Layout bọc ngoài (Sidebar, Header, Footer)
├── store/                  # Cấu hình Redux Store và Redux Slices
├── styles/                 # Cấu hình phong cách và định dạng CSS toàn cục
├── utils/                  # Các hàm tiện ích dùng chung (Định dạng ngày tháng, tiền tệ...)
└── main.tsx                # File đầu vào khởi chạy ứng dụng React
```

---

## 🧠 Thử Thách Kỹ Thuật & Bài Học Kinh Nghiệm (Từ góc nhìn của Junior Developer)

Trong quá trình xây dựng ứng dụng Client, tôi đã đối mặt với những bài toán thực tế thú vị và tích lũy được nhiều kinh nghiệm quý báu:

### 1. Đồng bộ và tổ chức cấu trúc dự án Giao diện Kép (Desktop & Mobile)
* **Thử thách:** Việc quản lý song song hai giao diện với hai luồng đối tượng (Admin trên Desktop và Employee trên Mobile) dễ dẫn đến lặp lại code, khó khăn trong quản lý router và đồng bộ hóa trạng thái đăng nhập.
* **Giải pháp & Bài học:** Tôi đã phân chia mã nguồn rõ ràng theo mô hình thư mục `src/app/desktop` và `src/app/mobile`. Đồng thời, tôi sử dụng Redux Toolkit để quản lý chung các trạng thái cốt lõi như thông tin xác thực (`Auth`) và thiết lập hệ thống toàn cục. Điều này giúp tối ưu khả năng tái sử dụng các hook, interface và utility dùng chung mà không làm tăng kích thước bundle.

### 2. Tương tác với phần cứng Camera & Xử lý hình ảnh chấm công
* **Thử thách:** Tích hợp camera điện thoại bằng `react-webcam` hoạt động ổn định trên các trình duyệt di động khác nhau, xử lý luồng chụp hình nhanh chóng và chuyển đổi ảnh sang dạng chuỗi Base64 để gửi lên server mà không gây hiện tượng đơ lag hay đứng giao diện.
* **Giải pháp & Bài học:** Tôi đã học được cách làm việc với API MediaDevices của trình duyệt, kiểm soát vòng đời của luồng webcam và cách xử lý chuyển đổi dữ liệu nhị phân (Binary Data) thành Base64 một cách an toàn. Nhờ đó giao diện chụp ảnh chấm công trên mobile hoạt động mượt mà và trực quan.

### 3. Ràng buộc thời gian nghiệp vụ phức tạp (Time-Gating) ở phía Client
* **Thử thách:** Các quy trình như tự đánh giá năng lực hay nộp đơn nghỉ phép có các mốc giới hạn chặt chẽ (chỉ được thực hiện trong thời gian cho phép). Nếu chỉ kiểm tra ở Backend, trải nghiệm người dùng sẽ rất tệ khi họ điền toàn bộ đơn rồi bị báo lỗi.
* **Giải pháp & Bài học:** Tôi đã sử dụng thư viện `Day.js` kết hợp với thuộc tính `disabled` của các thành phần Ant Design (như nút nhấn, lịch chọn ngày, trường nhập liệu) để chặn hành động của người dùng ngay trên giao diện khi chu kỳ đánh giá hoặc thời gian hợp lệ đã kết thúc. Việc này giúp cải thiện đáng kể UX và ngăn chặn dữ liệu rác gửi lên server.

---

## ⚙️ Hướng Dẫn Cài Đặt & Chạy Dự Án

### 1. Yêu Cầu
* Cài đặt **Node.js** phiên bản LTS mới nhất (Khuyến nghị bản 18 hoặc 20 trở lên).

### 2. Cài Đặt Thư Viện
Mở terminal tại thư mục `HRMSmanagementClient` và chạy lệnh sau để cài đặt các gói phụ thuộc:
```bash
npm install
```

### 3. Cấu Hình Biến Môi Trường
Ứng dụng sử dụng API từ máy chủ backend. Đảm bảo cấu hình đúng địa chỉ URL của backend (thường là cấu hình trong file `.env` hoặc file cấu hình Axios tại `src/utils/axios.ts` hoặc tương đương). Địa chỉ API mặc định thường trỏ về:
`http://localhost:<Cổng_Backend>/api`

### 4. Khởi Chạy Dự Án Trong Môi Trường Phát Triển
Chạy lệnh bên dưới để khởi chạy môi trường dev cục bộ:
```bash
npm run dev
```
Sau khi chạy, ứng dụng sẽ có sẵn tại địa chỉ:
`http://localhost:5173`

### 5. Biên Dịch Dự Án Cho Production
Để tối ưu hóa mã nguồn và xuất ra thư mục phân phối `dist`:
```bash
npm run build
```
Để chạy thử bản build sau khi biên dịch:
```bash
npm run preview
```
