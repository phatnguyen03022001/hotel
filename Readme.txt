1. TÊN DỰ ÁN:
  WEBSITE QUẢN LÝ KHÁCH SẠN ONLINE

2. CÀI ĐẶT:
  - b1: Tải source code về máy
  - b2: cài đặt cơ sở dữ liệu (mysql)
	    + Cài đặt database.sql trên mysql workbench
  - b3: sử dụng command prompt chạy các lệnh sau ở thư mục chứa project
      + npm install 
      + npm start

3. CẤU TRÚC DỰ ÁN:
hotel_final/
├── node_modules/           # Chứa các modules của dự án
├── public/
│   ├── css/                # Chứa file bootstrap và css
│   ├── js/                 # Chứa file js của website
│   ├── img/                # Chứa ảnh của website
│   ├── fonts/              # Thư mục icon
│   └── uploads/            # Chứa ảnh được người dùng tải lên
├── views/
│   ├── admin/
│   │   ├── partials/
│   │   │   ├── header.ejs  # Header cho phép tận dụng code
│   │   │   ├── footer.ejs  # Footer cho phép tận dụng code
│   │   │   ├── msg-err.ejs # Gửi thông báo msg và err cho các trang web
│   │   ├── function/       # Chứa các file xử lý chức năng của trang admin
│   │   └── ...             # Chứa các file xử lý chức năng của trang admin
│   ├── user/
│   │   ├── partials/
│   │   │   ├── header.ejs  # Header cho phép tận dụng code
│   │   │   ├── footer.ejs  # Footer cho phép tận dụng code
│   │   │   ├── msg-err.ejs # Gửi thông báo msg và err cho các trang web
│   │   └── ...             # Chứa các file ejs của trang user
├── routes/
│   ├── adminRouter.js      # Chứa các đường dẫn của trang admin
│   └── userRouter.js       # Chứa các đường dẫn của trang user
├── controllers/
│   ├── adminController.js  # Chứa các hàm xử lý chức năng của trang admin
│   └── userController.js   # Chứa các hàm xử lý chức năng của trang user
├── app.js                  # file chính để chạy được dự án
├── package.json        
├── package-lock.json
├── hotel.sql               # Cơ sở dữ liệu của dự án        
└── Readme.md

4. TÀI KHOẢN VÀ MẬT KHẨU ĐĂNG NHẬP VỚI TƯ CÁCH ADMIN:
  - Tài khoản: admin
  - Mật khâu: 123456

5. CÁC TÍNH NĂNG CỦA WEBSITE (admin & user)
5.1 USER:
  - Tài khoản (Cần đăng nhập)
    + Đăng nhập 
    + Đăng xuất
    + Đăng ký tài khoản
    + Thay đổi thông tin tài khoản
    + Đổi mật khẩu

  - Phòng (Không cần đăng nhập)
    + Xem thông tin phòng 
    + Tìm kiếm phòng (Theo loại, theo giá) 

  - Giỏ hàng
    + Thêm phòng vào giỏ hàng (không cần đăng nhập)
    + Xóa phòng khỏi giỏ hàng (không cần đăng nhập)
    + Đặt phòng (Cần đăng nhập)
    + Thanh toán (Cần đăng nhập)

  - Dịch vụ
    + Dịch vụ đồ ăn (Có thể xem)
    + Dịch vụ đón khách (Có thể xem)
    + Đặt dịch vụ (Cần phải đăng nhập)

  - Lịch sử (Cần phải đăng nhập)
    + Xem lại lịch sử giao dịch 


5.2 ADMIN (Cần đăng nhập mới sử dụng được các chức năng)
  - Tài khoản	
    + Đăng nhập 
    + Đăng xuất

  - Phòng
    + Thêm phòng 
    + Xóa phòng
    + Sửa phòng (Nếu không chọn ảnh thì phòng sẽ set mặc định là ảnh lỗi)

  - Khách hàng
    + Thêm khách hàng
    + Xóa khách hàng
    + Sửa khách hàng

  - Dịch vụ
    + Thêm món ăn
    + Xóa món ăn
    + Sửa món ăn

    + Thêm địa điểm
    + Xóa địa điểm
    + Sửa địa điểm

  - Thống kê giao dịch
    + Tìm theo tháng
    + Tìm theo năm
    + Tìm theo loại phòng

  - Thống kê doanh thu
    + Thống kê theo ngày
    + Thống kê theo tháng
    + Thống kê theo năm

6. CÁC CÔNG NGHỆ ĐÃ SỬ DỤNG
  -  "5": "^0.0.1",
  -  "ejs": "^3.1.9",
  -  "express": "^4.18.2",
  -  "express-session": "^1.17.3",
  -  "fs": "^0.0.1-security",
  -  "moment": "^2.29.4",
  -  "multer": "^1.4.5-lts.1",
  -  "mysql": "^2.18.1",
  -  "nodemon": "^2.0.22",
  -  "path": "^0.12.7"

7. DANH SÁCH SINH VIÊN THAM GIA DỰ ÁN
  - 51900167 - Nguyễn Tiến Phát 

8. HƯỚNG DẪN SỬ DỤNG
 Đặt phòng
  -	Đăng nhập hoặc đăng ký tài khoản.
  -	Truy cập trang "rooms" và chọn ngày bắt đầu và kết thúc.
  -	Chọn phòng muốn đặt và số lượng khách.
  -	Chọn các dịch vụ bổ sung nếu có.
  -	Điền thông tin khách hàng và xác nhận đặt phòng.
 Quản trị viên
  -	Đăng nhập vào tài khoản quản trị viên.
  -	Truy cập trang quản trị viên để xem các báo cáo và thống kê.
  -	Quản lý các đối tượng của hệ thống như người dùng, phòng và dịch vụ.
 Quản lý phòng
  -	Đăng nhập vào tài khoản quản trị viên.
  -	Truy cập trang "Quản lý phòng".
  -	Xem danh sách phòng hiện có.
  -	Thêm, sửa hoặc xóa phòng.
 Quản lý dịch vụ
  -	Đăng nhập vào tài khoản quản trị viên.
  -	Truy cập trang "Quản lý dịch vụ".
  -	Xem danh sách các dịch vụ hiện có.
  -	Thêm, sửa hoặc xóa dịch vụ.
 Quản lý người dùng
  -	Đăng nhập vào tài khoản quản trị viên.
  -	Truy cập trang "Quản lý người dùng".
  -	Xem danh sách người dùng hiện có.
  -	Thêm, sửa hoặc xóa người dùng.
 Đăng ký tài khoản
  -	Truy cập trang đăng ký.
  -	Nhập thông tin cá nhân, tên đăng nhập và mật khẩu.
  -	Xác nhận đăng ký tài khoản và đăng nhập.
 Đăng nhập
  -	Truy cập trang đăng nhập.
  -	Nhập tên đăng nhập và mật khẩu.
  -	Xác nhận đăng nhập.

9. LƯU Ý:
  - Các chức năng xóa PHÒNG (ROOMS), DỊCH VỤ (SERVICE), ... chỉ có tác dụng khi người dùng chưa đặt phòng hoặc các dịch vụ này.
  - Trường hợp dữ liệu đã được thanh toán thì người dùng/admin chỉ có thể chỉnh sửa thông tin dữ liệu.

10. LỖI THƯỜNG GẶP: 
  - Edit, delete, add dữ liệu ở một số ít trường hợp có thể gặp lỗi (Ít hoặc không có).
      => Có thể khắc phục bằng cách nhấn vào trang bị lỗi ở thanh navbar
  - Khi add hoặc edit dữ liệu không nhập đầy đủ thông tin
      => Nhập đầy đủ thông tin các ô input mà trang web đưa ra (Sẽ không bị lỗi)
  - Update dữ liệu không nhập ảnh mới (Trang web vẫn cho phép update nhưng ảnh mặc định sẽ là 'errer.jpg')
      => Update dữ liệu phải nhập ảnh mới.#   h o t e l 
 
 
