var mysql = require('mysql');
const connectDB = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "database"
});

connectDB.connect(function (err) {
    if (err) {
        console.error('Error connecting to MySQL: ' + err.stack);
        return;
    }

    console.log('Connected to MySQL with the connection ID: ' + connectDB.threadId);
    return;
}); 

// Multer
const path = require('path');
const publicDirectoryPath = path.join(__dirname, '../public');
const multer = require('multer');

// Khởi tạo đối tượng multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(publicDirectoryPath, 'uploads'));
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });
// Các Functiones
exports.getRooms = (req, res) => {
    const sql = "SELECT * FROM rooms";
    connectDB.query(sql, (err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).send('An error occurred while retrieving rooms data from database');
        }
        // Lấy danh sách ảnh room_image
        const imgSql = "SELECT room_id, room_image FROM rooms";
        connectDB.query(imgSql, (err, imgResults) => {
            if (err) {
                console.log(err);
                return res.status(500).send('An error occurred while retrieving room images from database');
            }

            // Đường dẫn tới thư mục uploads
            const uploadsUrl = '/uploads/';

            // Tạo object để lưu trữ đường dẫn ảnh cho từng phòng
            const imgUrls = {};

            // Tính toán đường dẫn ảnh cho từng phòng
            imgResults.forEach((imgResult) => {
                imgUrls[imgResult.room_id] = uploadsUrl + imgResult.room_image;
            });

            // Thêm đường dẫn ảnh vào kết quả trả về
            results.forEach((room) => {
                room.room_image_url = imgUrls[room.room_id];
            });

            // Kiểm tra xem người dùng có đăng nhập với quyền admin hay không
            if (req.session.admin !== 'admin') {
                res.render('admin/login', { currentTab: 'admin/login' });
            } else {
                res.render('admin/rooms', { currentTab: 'admin/rooms', rooms: results });
            }
        });
    });
};

exports.postRooms = (req, res) => {
    // Lấy thông tin loại phòng và giá tiền từ request body
    let { room_type, price } = req.body;
    // Tạo query để lấy các phòng có loại phòng như yêu cầu
    let sql = `SELECT * FROM rooms where rooms.room_id `;
    if (room_type) {
        sql += `AND rooms.room_type = "${room_type}" `;
    }
    // Thêm điều kiện sắp xếp giá tăng dần
    if (price === 'price_low') {
        sql += `ORDER BY price ASC `
    }
    // Thêm điều kiện sắp xếp giá giảm dần
    if (price === 'price_height') {
        sql += `ORDER BY price DESC `
    }
    // kết nối database
    connectDB.query(sql, (err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).send('An error occurred while retrieving rooms data from database');
        }

        // Lấy danh sách ảnh room_image
        const imgSql = "SELECT room_id, room_image FROM rooms";
        connectDB.query(imgSql, (err, imgResults) => {
            if (err) {
                console.log(err);
                return res.status(500).send('An error occurred while retrieving room images from database');
            }

            // Đường dẫn tới thư mục uploads
            const uploadsUrl = '/uploads/';

            // Tạo object để lưu trữ đường dẫn ảnh cho từng phòng
            const imgUrls = {};

            // Tính toán đường dẫn ảnh cho từng phòng
            imgResults.forEach((imgResult) => {
                imgUrls[imgResult.room_id] = uploadsUrl + imgResult.room_image;
            });

            // Thêm đường dẫn ảnh vào kết quả trả về
            results.forEach((room) => {
                room.room_image_url = imgUrls[room.room_id];
            });

            // Kiểm tra xem người dùng có đăng nhập với quyền admin hay không
            if (req.session.admin !== 'admin') {
                res.render('admin/login', { currentTab: 'admin/login' });
            } else {
                res.render('admin/rooms', { currentTab: 'admin/rooms', rooms: results });
            }
        });
    });
}

exports.getLogin = (req, res) => {
    // render trang login
    res.render('admin/login', { currentTab: 'admin/login' });
}

exports.postLogin = (req, res) => {
    let adminAccount = req.body.username;
    let adminPassword = req.body.password;
    // Nếu tài khoản hoặc mật khẩu không đúng thì yêu cầu nhập lại và hiển thị lỗi
    if (adminAccount !== 'admin' || adminPassword !== '123456') {
        console.log('Invalid username or password!');
        res.render('admin/login', { msg: '', err: 'Invalid username or password!' });
    } else {
        // cấp session và đăng nhập với quyền admin
        req.session.admin = adminAccount;
        console.log(req.session.admin);
        res.redirect('/admin');
    }
}

exports.postLogout = (req, res) => {
    // Xóa quyền admin, yêu cầu đăng nhập và gửi thông báo đăng xuất thành công
    req.session.admin = undefined;
    res.render('admin/rooms', { msg: 'Sign out successful!', err: '' })
}

exports.postAddRoom = (req, res) => {
    // Sử dụng phương thức single của đối tượng upload để tải lên ảnh
    // Sử dụng tên trường input mà chúng ta đã đặt trong form, ở đây là "room_image"
    upload.single('room_image')(req, res, function (err) {
        // Lấy thông tin phòng từ request body
        let room_number = req.body.room_number;
        let room_type = req.body.room_type;
        let description = req.body.description;
        let price = req.body.price;
        let room_occupancy = req.body.room_occupancy;
        // Lấy tên tệp đã tải lên
        let room_image = req.file.filename;
        // Thực hiện truy vấn để thêm thông tin phòng mới vào cơ sở dữ liệu
        let sql = "INSERT INTO rooms (room_number, room_type, room_occupancy, description, price, room_image) VALUES (?, ?, ?, ?, ?, ?)";
        let paramsInserlRooms = [room_number, room_type, room_occupancy, description, price, room_image];

        connectDB.query(sql, paramsInserlRooms, (err, result) => {
            if (err) {
                return res.render('admin/rooms', { msg: '', err: 'Uploading room to mySQL server failed!' });
            } else {
                return res.render('admin/rooms', { msg: 'Room added successfully!', err: '' });
            }
        });
    });
};

exports.postDeleteRoom = (req, res) => {
    // Lấy id của phòng cần xóa
    const { room_id } = req.params;
    // console.log(room_id);
    // Thực hiện truy vấn
    const sql = "DELETE FROM rooms WHERE room_id = ?";
    connectDB.query(sql, [room_id], (err, results, fields) => {
        if (err) {
            // Nếu không thể xóa phòng vì đã có đặt phòng, trả về lỗi và không xóa phòng
            res.render('admin/rooms', { err: 'Cannot delete because the room is already booked!' });
            return;
        }
        // console.log(`Removed the room with id = ${room_id}`);
        // Trả về trang quản lý phòng và gửi thông báo thành công
        res.render('admin/rooms', { msg: 'Delete successfully!' });
    });
};



exports.getEditRoom = (req, res) => {
    // Lấy id của phòng cần sửa
    const room_id = req.params.room_id;
    // Thực hiện truy vấn để lấy thông tin của phòng cần sửa
    const sql = "SELECT * FROM rooms WHERE room_id = ?";
    connectDB.query(sql, [room_id], (err, results) => {
        if (err) throw err;
        const room = results[0];
        const { room_number, room_type, room_occupancy, description, price, room_image } = room
        // console.log('get:  ', typeof room.room_image)
        // console.log('get name:  ', room.room_image)
        // Render trang editroom và truyền vào các thông tin của phòng
        res.render("admin/editroom", {
            room_id: room_id,
            room_number: room_number,
            room_type: room_type,
            room_occupancy: room_occupancy,
            description: description,
            price: price,
            room_image: room_image,
        });
    });
}

exports.postEditRoom = (req, res) => {
    upload.single('room_image')(req, res, (err) => {
        let img2 = req.body.room_type;
        console.log("out IMG 2: ", img2)
        // Kiểm tra nếu có lỗi khi upload ảnh
        if (err) {
            // console.log(err);
            res.render('admin/rooms', { msg: '', err: 'Uploading room to mySQL server failed!' });
            return;
        } else {
            // Lấy thông tin của phòng cần sửa
            // console.log(req.body);
            let room_id = req.params.room_id;
            let room_number = req.body.room_number;
            let room_type = req.body.room_type;
            let room_occupancy = req.body.room_occupancy;
            let description = req.body.description;
            let price = req.body.price;
            let room_image = req.file ? req.file.filename : 'error.jpg';
            // Kiểm tra nếu không có ảnh mới thì dùng ảnh cũ
            if (!room_image) {
                room_image = req.body.current_image;
            }
            // Thực hiện truy vấn để cập nhật thông tin phòng
            const sql = "UPDATE rooms SET room_number = ?, room_type = ?, room_occupancy =?, description = ?, price = ?, room_image = ? WHERE room_id = ?";
            paramsEditRoom = [room_number, room_type, room_occupancy, description, price, room_image, room_id]
            connectDB.query(sql, paramsEditRoom, (err, result) => {
                if (err) throw err;
                res.render('admin/rooms', { msg: 'Room Editing Successful!', err: '' });
            });
        };
    });
};

exports.getCustomers = (req, res) => {
    // Thực hi truy vấn để lấy danh sách khách hàng từ cơ sở dữ liệu
    const sql = "SELECT * FROM users";
    connectDB.query(sql, (err, result) => {
        if (err) {
            // Nếu có lỗi thì trở về trang đăng nhập
            return res.render('admin/login', { err: 'please login before get customers!' });
        } else if (req.session.admin !== 'admin') {
            // Nếu session admin không tồn tại hoặc khác 'admin' thì trở về trang đăng nhập
            return res.render('admin/login', { err: 'please login before get customers!' });
        } else {
            // Nếu không có lỗi và session admin tồn tại, hiển thị danh sách khách hàng
            res.render('admin/customers', { users: result });
        }
    });
};


exports.getEditCustomer = (req, res) => {
    const user_id = req.params.user_id;
    // console.log(user_id)
    const sql = "SELECT * FROM users WHERE user_id = ?";
    connectDB.query(sql, [user_id], (err, results) => {
        if (err) throw err;
        const user = results[0];
        const { username, fullname, email, phone, address } = user

        res.render("admin/editcustomer", {
            user_id: user_id,
            username: username,
            fullname: fullname,
            email: email,
            phone: phone,
            address: address,
        });
    });
};

exports.postEditCustomer = (req, res) => {
    // tạo user_id bằng chính params của trang web
    let user_id = req.params.user_id;
    let { username, fullname, email, phone, address } = req.body;
    // Thực hiện truy vấn
    const sql = "UPDATE users SET username = ?, fullname = ?, email = ?, phone = ?, address = ? WHERE user_id = ?";
    connectDB.query(sql, [username, fullname, email, phone, address, user_id], (err, result) => {
        // console.log(user_id)
        // Bắt lỗi
        if (err) throw err
        // res.redirect('/admin/customers');

        // render trang quản lý khách hàng và thông báo thành công
        res.redirect('/admin/customers')
    });
};

exports.postDeleteCustomer = (req, res) => {
    // gán user_id bằng params trang web
    const { user_id } = req.params;
    console.log(user_id);
    // thực hiện truy vấn đến bảng user trong database
    const sql = "DELETE FROM users WHERE user_id = ?";
    connectDB.query(sql, [user_id], (err, results, fields) => {
        if (err) {
            // Thông báo lỗi khi xóa phòng thất bại
            return res.status(500).send(`User has booked a room so it can't be deleted`);
        }
        // console.log(`xoa khach hang id = ${user_id}`);
        // Trường hợp thành công tải và nhận lại trang quản lý khách hàng
        res.redirect('/admin/customers');
    });
}

exports.getPayments = (req, res) => {
    // Thực hiện truy vấn đến database
    connectDB.query('SELECT p.payment_id, u.user_id, s.service_name, s.service_type, s.price, p.room_number, p.payment_date, p.amount, p.accepted FROM payments p JOIN services s ON p.service_id = s.service_id JOIN users u ON p.user_id = u.user_id', (err, rows) => {
        if (err) {
            return res.render('admin/login', { err: 'Some error occurred!' });
        } else if (req.session.admin !== 'admin') {
            return res.render('admin/login', { err: 'Please login first!' });
        } else {
            // trường hợp thành công render đến trang payments và truyền rows cho payments
            res.render('admin/payments', { payments: rows });
        }
    });
};

exports.postPayments = (req, res) => {
    // Gán paymentId và accepted
    const paymentId = req.params.payment_id;
    const accepted = req.body.accepted;
    // Truy vấn
    connectDB.query('UPDATE payments SET accepted = ? WHERE payment_id = ?', [accepted, paymentId], (err, result) => {
        if (err) {
            // bắt lỗi
            return next(err);
        }
        // Tải lại và đưa đán trang payments
        res.redirect('/admin/payments');
    });
};

exports.getReservations = (req, res) => {
    // Thực hiện truy vấn đến CSDL
    const query =
        `SELECT bookings.booking_id, bookings.start_date, bookings.end_date, users.fullname, users.email, users.phone, rooms.room_type, (rooms.price * bookings.total_days) AS total_payment
    FROM bookings
    JOIN rooms ON bookings.room_id = rooms.room_id
    JOIN users ON bookings.user_id = users.user_id
    WHERE bookings.booking_id `

    connectDB.query(query, function (err, result) {
        if (err) throw err;
        else if (req.session.admin !== 'admin') {
            // Kiểm tra session, render trang login và hiển thị lỗi
            return res.render('admin/login', { err: 'Please login first!' })
        } else {
            // render reservations
            res.render('admin/reservations', { bookings: result });
        }
    });
};

exports.postReservations = (req, res) => {
    // Gán giá trị
    let { year, month, room_type } = req.body;
    // console.log(month)
    // console.log(room_type)

    // Thực hiện truy vấn
    let query =
        `SELECT bookings.booking_id, bookings.start_date, bookings.end_date, users.fullname, users.email, users.phone, rooms.room_type, (rooms.price * bookings.total_days) AS total_payment
    FROM bookings
    JOIN rooms ON bookings.room_id = rooms.room_id
    JOIN users ON bookings.user_id = users.user_id
    WHERE bookings.booking_id `

    // Nỗi để người dùng có thể search theo kết quả (Năm/ Tháng/ Loại phòng)
    if (year) {
        query += `AND year(bookings.start_date) = ${year} `;
    }
    if (month) {
        query += `AND MONTH(bookings.start_date) = ${month} `;
    }
    if (room_type) {
        query += `AND rooms.room_type = "${room_type}"`;
    }

    connectDB.query(query, function (err, result) {
        if (err) throw err;
        res.render('admin/reservations', { bookings: result });
    });
};


exports.getServices = (req, res) => {
    const sql = "SELECT * FROM services";
    connectDB.query(sql, (err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).send('An error occurred while retrieving rooms data from database');
        }
        // Lấy danh sách ảnh room_image
        const imgSql = "SELECT service_id, service_image FROM services";
        console.log(imgSql);
        connectDB.query(imgSql, (err, imgResults) => {
            if (err) {
                console.log(err);
                return res.status(500).send('An error occurred while retrieving room images from database');
            }

            // Đường dẫn tới thư mục uploads
            const uploadsUrl = '/uploads/';

            // Tạo object để lưu trữ đường dẫn ảnh cho từng phòng
            const imgUrls = {};

            // Tính toán đường dẫn ảnh cho từng phòng
            imgResults.forEach((imgResult) => {
                imgUrls[imgResult.service_id] = uploadsUrl + imgResult.service_image;
            });

            // Thêm đường dẫn ảnh vào kết quả trả về
            results.forEach((services) => {
                services.service_image_url = imgUrls[services.service_id];
            });

            // Kiểm tra xem người dùng có đăng nhập với quyền admin hay không
            if (req.session.admin !== 'admin') {
                res.render('admin/login', { currentTab: 'admin/login' });
            } else {
                res.render('admin/services', { currentTab: 'admin/services', services: results });
            }
        });
    });
};


exports.postAddService = (req, res) => {
    // Sử dụng phương thức single của đối tượng upload để tải lên ảnh
    // Sử dụng tên trường input mà chúng ta đã đặt trong form, ở đây là "service_image"
    upload.single('service_image')(req, res, function (err) {
        let service_name = req.body.service_name;
        let service_type = req.body.service_type;
        let description = req.body.description;
        let price = req.body.price;
        // Lấy tên tệp đã tải lên
        let service_image = req.file.filename;
        // Bắt lỗi
        if (err) {
            console.log(err);
            res.render('admin/services', { msg: '', err: 'Uploading service to mySQL server failed!' });
        }
        // thực hiện truy vấn database
        let sql = "INSERT INTO services (service_name, service_type, description, price, service_image) VALUES (?, ?, ?, ?, ?)";
        let paramsInserlService = [service_name, service_type, description, price, service_image];
        connectDB.query(sql, paramsInserlService, function (err, result) {
            if (err) {
                // console.log(error);
                res.render('admin/services', { msg: '', err: 'Uploading service to mySQL server failed!' });
            } else {
                // Tải lại trang services
                res.redirect('/admin/services');
            }
        });
    });
};


exports.getEditService = (req, res) => {
    const service_id = req.params.service_id;
    // thực hiện truy vấn
    const sql = "SELECT * FROM services WHERE service_id = ?";
    connectDB.query(sql, [service_id], (err, results) => {
        if (err) throw err;
        const service = results[0];
        // tạo biến
        const { service_name, service_type, description, price, service_image } = service
        console.log('get:  ', typeof service.service_image)
        console.log('get name:  ', service.service_image)
        // gửi các giá trị cần thiết để chỉnh sửa dịch vụ
        res.render("admin/editservice", {
            service_id: service_id,
            service_name: service_name,
            service_type: service_type,
            description: description,
            price: price,
            service_image: service_image,
        });
    });
}

exports.postEditService = (req, res) => {

    upload.single('service_image')(req, res, (err) => {
        if (err) {
            // Kiểm tra nếu có lỗi khi upload ảnh
            // console.log(err);
            res.render('admin/services', { msg: '', err: 'Uploading room to mySQL server failed!' });
        } else {
            // console.log(req.body);
            // Lấy thông tin của dịch vụ cần sửa
            let service_id = req.params.service_id;
            let service_name = req.body.service_name;
            let service_type = req.body.service_type;
            let description = req.body.description;
            let price = req.body.price;
            let service_image = req.file ? req.file.filename : 'error.jpg';
            // Kiểm tra nếu không có ảnh mới thì dùng ảnh cũ
            if (!service_image) {
                service_image = req.body.current_image;
            }
            // Thực hiện truy vấn để cập nhật thông tin dịch vụ vào cơ sở dữ liệu
            const sql = "UPDATE services SET service_name = ?, service_type = ?, description = ?, price = ?, service_image = ? WHERE service_id = ?";
            paramsEditService = [service_name, service_type, description, price, service_image, service_id]
            connectDB.query(sql, paramsEditService, (err, result) => {
                if (err) throw err;
                res.render('admin/services', { msg: 'Room Editing Successful!', err: '' });
            });
        };
    });
};


exports.postDeleteService = (req, res) => {
    // Lấy của dịch vụ cần xóa
    const { service_id } = req.params;
    // Thực hiện truy vấn để xóa dịch vụ có id tương ứng trong cơ sở dữ liệu
    const sql = "DELETE FROM services WHERE service_id = ?";
    connectDB.query(sql, [service_id], (err, results, fields) => {
        if (err) {
            // Nếu không thể xóa dịch vụ vì đã có đặt phòng, trả về lỗi và không xóa
            res.render('admin/services', { err: 'Cannot delete because the service is already booked!' });
        }
        // console.log(`Removed the service with id = ${service_id}`);
        // Nhận trang quản lý dịch vụ và thông báo xóa dịch vụ thành công
        res.render('admin/services', { msg: 'Delete successfully!' });
    });
};