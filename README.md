# PBL6-ATTT

## Đề tài: Bảo mật dữ liệu cá nhân cho ứng dụng di động

### 1. Đề tài dự kiến
- #### ***App nhắn tin***

### 2. Phương thức bảo mật
- #### 1. Dùng nhiều loại mã hóa trên dữ liệu
- #### 2. Mã hóa dữ liệu trên đường truyền
- #### 3. Gọi API
  - Dùng HTTPS
  - Dùng HttpsURLConnection
  - Middleware authentication
  - Encode dữ liệu socket
- #### 4. Tự động khóa sau khoảng thời gian
  - Tự động khóa xem tin nhắn trong các group/inbox sau một khoảng thời gian cụ thể (có thể setup)
  - Sử dụng pin/ vân tay để unlock
### 3. Phân quyền
  - **Room owner**
    - Thay đổi quyền xem tin nhắn (xem tin nhắn riêng)
    - Thay đổi quyền gửi tin nhắn (bật/ tắt)
    - Thay đổi quyền gửi files (bật/ tắt)
    - Thay đổi quyền xem files (bật/ tắt)
    - Thay đổi quyền quản trị viên (k tác động lên owner)

  - **User** (bao gồm owner)
    - Gửi, đọc tin
    - Đổi biệt danh
### 4. Chức năng
- **Login, Logout, Sign in, Forgot pass** (Firebase: email & password)
- **Chat**
  - Chat cá nhân
    - Gửi tin nhắn
    - Gửi file
    - Đổi nickname
  - Chat room
    - (***Phân quyền***)

- **Setting**
  - Update profile (name, image)
  - PIN (update)
  - Khoảng thời gian lock app


### 5.Request
#### Get All Room
#### Get All Message By ROOM_ID
#### (OPTION) Get Paging Message By ROOM_ID