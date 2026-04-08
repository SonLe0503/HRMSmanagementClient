# Kế hoạch frontend: đơn xác nhận quên check-in

## 1. Mục tiêu

Thêm luồng để nhân viên:

- bị ghi nhận `Late` vì quên check-in nhưng thực tế đến đúng giờ
- có thể tạo đơn xác nhận
- theo dõi trạng thái đơn

Và để cấp trên:

- xem các đơn chờ duyệt
- approve hoặc reject

Kết quả cuối cùng phải bám theo dữ liệu backend trả về. Frontend không tự tính lại giờ công nếu backend chưa cập nhật bản ghi chấm công.

## 2. Hiện trạng frontend

Frontend hiện đang gọi trực tiếp các API chấm công sau:

- `POST /Attendance/checkin`
- `POST /Attendance/checkout`
- `GET /Attendance/my-today`
- `GET /Attendance/my-history`
- `GET /Attendance/search`
- `GET /Attendance/{employeeId}/{date}`
- `PUT /Attendance/manual-adjust/{attendanceId}`
- `POST /Attendance/manual-create`
- `PUT /Attendance/{attendanceId}/lock`
- `PUT /Attendance/{attendanceId}/unlock`
- `GET /Attendance/logs`
- `PUT /Attendance/{attendanceId}/location-reason`

Các file chính đang dùng:

- [attendanceSlide.ts](C:/Users/Admin/Desktop/HRManagement/src/store/attendanceSlide.ts)
- [AttendanceTodayCard.tsx](C:/Users/Admin/Desktop/HRManagement/src/app/pages/myAttendance/components/AttendanceTodayCard.tsx)
- [MyAttendanceHistoryTable.tsx](C:/Users/Admin/Desktop/HRManagement/src/app/pages/myAttendance/components/MyAttendanceHistoryTable.tsx)
- [AttendanceTable.tsx](C:/Users/Admin/Desktop/HRManagement/src/app/pages/manageAttendance/components/AttendanceTable.tsx)

Hiện chưa có API hay state chính thức nào cho đơn xác nhận quên check-in.

## 3. Vấn đề cần xử lý

- Frontend đang coi trạng thái chấm công là dữ liệu cuối cùng, chưa có tầng request/approval cho trường hợp quên check-in.
- Sau khi approve/reject, frontend chưa có cơ chế reload lại bản ghi chấm công bị ảnh hưởng.
- Một số màn hình mới thêm thử nghiệm trước đó chỉ là prototype. Không nên merge theo hướng đó nếu backend chưa chốt contract API.

## 4. Contract frontend cần chờ từ backend

Frontend chỉ nên triển khai sau khi backend chốt tối thiểu các API sau:

- API tạo đơn xác nhận quên check-in
- API lấy danh sách đơn của tôi
- API lấy danh sách đơn chờ duyệt
- API approve đơn
- API reject đơn
- Dữ liệu attendance sau approve/reject có được cập nhật ngay trong response hay phải gọi lại `GET /Attendance/...`

Các field frontend cần backend trả rõ:

- `requestId`
- `attendanceId`
- `attendanceDate`
- `employeeId`
- `employeeName`
- `systemCheckInTime`
- `actualCheckInTime`
- `systemCheckOutTime`
- `status`
- `reason`
- `submittedDate`
- `approvedDate`
- `approvedBy`
- `comments`
- `rejectionReason`
- thông tin ảnh hưởng sau duyệt: `recalculatedWorkingHours`, `recalculatedLateMinutes`, `recalculatedStatus`

## 5. Kế hoạch sửa frontend

### 5.1 Store

Tạo store riêng cho attendance confirmation request, không nhét vào `attendanceSlide.ts`.

Đề xuất:

- `src/store/attendanceConfirmationSlide.ts`

Store này chịu trách nhiệm:

- create request
- fetch my requests
- fetch pending requests
- approve request
- reject request
- loading/error/success riêng

Không để frontend tự suy diễn attendance sau duyệt. Sau approve/reject cần gọi lại:

- `fetchAttendanceDetail`
- `fetchMyHistory`
- `fetchMyToday`
- `searchAttendance`

Tùy màn hình đang đứng.

### 5.2 Màn hình nhân viên

Sửa:

- [MyAttendanceHistoryTable.tsx](C:/Users/Admin/Desktop/HRManagement/src/app/pages/myAttendance/components/MyAttendanceHistoryTable.tsx)
- [index.tsx](C:/Users/Admin/Desktop/HRManagement/src/app/pages/myAttendance/index.tsx)

Thay đổi:

- chỉ hiển thị nút `Tạo đơn xác nhận quên check-in` khi bản ghi có `checkInTime`, có dấu hiệu đi trễ và backend cho phép tạo đơn
- mở modal/form để nhập:
  - giờ đến thực tế
  - lý do
- thêm tab hoặc section `Đơn xác nhận của tôi`
- hiển thị trạng thái `Pending`, `Approved`, `Rejected`
- khi submit thành công thì refresh danh sách đơn và lịch sử chấm công

### 5.3 Màn hình quản lý

Sửa:

- [index.tsx](C:/Users/Admin/Desktop/HRManagement/src/app/pages/manageAttendance/index.tsx)
- [AttendanceTable.tsx](C:/Users/Admin/Desktop/HRManagement/src/app/pages/manageAttendance/components/AttendanceTable.tsx)

Thay đổi:

- thêm tab `Duyệt xác nhận quên check-in`
- hiển thị:
  - nhân viên
  - ngày công
  - giờ check-in hệ thống
  - giờ đến thực tế nhân viên khai báo
  - lý do
  - trạng thái hiện tại và trạng thái dự kiến sau duyệt nếu backend có trả
- modal approve/reject
- sau khi xử lý xong phải reload lại:
  - danh sách pending request
  - bản ghi attendance liên quan

### 5.4 Mapping trạng thái

UI hiện tại mới map:

- `Present`
- `Late`
- `Absent`
- `Incomplete`

Nhưng backend service đã có thể sinh thêm:

- `EarlyLeave`
- `LateEarlyLeave`

Frontend cần cập nhật mapping màu/tag cho đủ, nếu không sẽ hiển thị sai hoặc không nhất quán.

### 5.5 Kiểm tra response check-in/check-out

Hiện `attendanceSlide.ts` đang ép response `checkIn/checkOut` thành `AttendanceResponseDto`, nhưng backend controller thực tế đang trả object message đơn giản hơn, không đủ field chuẩn của `AttendanceResponseDto`.

Frontend cần sửa một trong hai hướng:

1. Backend đổi response check-in/check-out sang DTO chuẩn.
2. Frontend không ép kiểu như attendance đầy đủ, mà luôn gọi lại `fetchMyToday()` sau thành công.

Hướng 2 an toàn hơn nếu chưa muốn động nhiều vào backend.

## 6. Trình tự làm frontend

1. Chốt contract API với backend.
2. Sửa kiểu dữ liệu response trong store.
3. Tạo `attendanceConfirmationSlide.ts`.
4. Thêm UI tạo đơn ở màn lịch sử chấm công.
5. Thêm UI xem đơn của tôi.
6. Thêm UI pending/approve/reject ở màn quản lý.
7. Cập nhật mapping status hiện có.
8. Test lại luồng:
   - check-in muộn
   - tạo đơn
   - approve
   - reject
   - refresh dữ liệu

## 7. Rủi ro cần lưu ý

- Nếu backend không trả attendance đã tính lại sau approve/reject, frontend rất dễ hiển thị dữ liệu cũ.
- Nếu vẫn giữ logic tự cập nhật `myToday` từ response check-in/check-out như hiện tại thì dễ mismatch với dữ liệu thật.
- Nếu không kiểm soát quyền tạo đơn ở backend, frontend chỉ ẩn nút sẽ không đủ an toàn.

## 8. Kết luận

Frontend chỉ là lớp hiển thị và gửi request. Phần cốt lõi của bài toán này phải xử lý ở backend trước:

- lưu đơn
- xác định approver
- approve/reject
- tính lại `LateMinutes`, `WorkingHours`, `Status`

Sau khi backend chốt contract, frontend mới nối UI theo đúng dữ liệu thật.
