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
const moment = require('moment');

exports.getOverview = (req, res) => {
  res.render('user/overview', { currentTab: 'overview' });
}

exports.getRooms = (req, res) => {
  const sql = "SELECT * FROM rooms";
  connectDB.query(sql, (err, results) => {
    if (err) {
      console.log(`Can't connect to SQL`);
      return res.render('user/login', { msg: `Can't connect to SQL` });
    }
    // Lấy danh sách ảnh room_image
    const imgSql = "SELECT room_id, room_image FROM rooms";
    connectDB.query(imgSql, (err, imgResults) => {
      if (err) {
        console.log(`Can't connect to SQL`);
        return res.render('user/login', { msg: `Can't connect to SQL` });
      }
      const uploadsUrl = '/uploads/';
      const imgUrls = {};
      imgResults.forEach((imgResult) => {
        imgUrls[imgResult.room_id] = uploadsUrl + imgResult.room_image;
      });
      // Đưa các ảnh vào danh sách phòng
      results.forEach((room) => {
        room.room_image_url = imgUrls[room.room_id];
      });
      // Trả về trang danh sách các phòng với thông tin đã được thêm ảnh
      res.render('user/rooms', { currentTab: 'user/rooms', rooms: results });
    });
  });
}

exports.postRooms = (req, res) => {
  let { room_type, price } = req.body;
  let sql = `SELECT * FROM rooms where rooms.room_id `;
  if (room_type) {
    sql += `AND rooms.room_type = "${room_type}" `;
  }
  if (price === 'price_low') {
    sql += `ORDER BY price ASC `
  }
  if (price === 'price_height') {
    sql += `ORDER BY price DESC `
  }

  connectDB.query(sql, (err, results) => {
    if (err) {
      console.log(err);
      return res.render('user/rooms', { err: 'An error occurred while retrieving rooms data from database' })
    }

    // Lấy danh sách ảnh từ SQL
    const imgSql = "SELECT room_id, room_image FROM rooms";
    connectDB.query(imgSql, (err, imgResults) => {
      if (err) {
        console.log(err);
        return res.status(500).send('An error occurred while retrieving room images from database');
      }
      // Tạo đường dẫn tới thư mục chứa ảnh
      const uploadsUrl = '/uploads/';
      const imgUrls = {};
      imgResults.forEach((imgResult) => {
        imgUrls[imgResult.room_id] = uploadsUrl + imgResult.room_image;
      });
      // Thêm đường dẫn của ảnh vào phòng tương ứng trong danh sách phòng
      results.forEach((room) => {
        room.room_image_url = imgUrls[room.room_id];
      });
      // Trả về trang danh sách các phòng với thông tin đã được thêm ảnh
      res.render('user/rooms', { currentTab: 'user/rooms', rooms: results });
    });
  });
}

exports.postBooking = (req, res) => {
  const { room_id, start_date, end_date } = req.body
  // Trả về trang bookings
  res.render("user/booking", { room_id: room_id, start_date: start_date, end_date: end_date })
}

exports.postReservation = (req, res) => {
  // Lấy id ph và thông tin ngày bắt đầu và kết thúc đặt phòng từ request body
  const room_id = req.params.room_id;
  const { start_date, end_date } = req.body;
  // console.log('start_date:  ', start_date);
  // console.log('end_date:  ', end_date);

  // Kiểm tra kết nối tới database
  if (!connectDB) {
    console.log('Database connection error');
    return res.status(500).send('Database connection error');
  }
  // Thêm thông tin đặt phòng vào bảng tạm tmp_bookings
  const sql = "INSERT INTO tmp_bookings (room_id, start_date, end_date) VALUES (?, ?, ?)";
  connectDB.query(sql, [room_id, start_date, end_date], (err, result) => {
    if (err) {
      console.error('Error saving booking:', err);
      return res.status(500).send('Failed to save booking');
    }
    console.log('Booking saved successfully');
    res.redirect('/cart');
  });
}

exports.getLogin = (req, res) => {
  // Đường dẫn đến trang đăng nhập
  res.render('user/login', { currentTab: 'login' });
}

exports.postLogin = (req, res) => {
  // Lấy thông username và password từ request body
  let username = req.body.username;
  let password = req.body.password;
  // Cập nhật câu truy vấn để chỉ lấy ra id của user
  const sql = 'SELECT user_id FROM users WHERE (username = ? OR email = ? OR phone = ?) AND password = ?'; // Cập nhật câu truy vấn để chỉ lấy ra id của user
  const params = [username, username, username, password];
  // Thực hiện truy vấn và trả về kết quả
  connectDB.query(sql, params, function (error, results, fields) {
    if (error) {
      console.log(error);
      res.render('user/login', { msg: '', err: 'ERROR' });
    } else {
      if (results.length === 0) {
        console.log('Invalid username or password!');
        res.render('user/login', { msg: '', err: 'Invalid username or password!' });
      } else {
        // Lưu id của user vào session
        req.session.user = results[0].user_id;
        // console.log( req.session.user)
        console.log(results[0].user_id)
        res.redirect('/overview');
      }
    }
  });
}


exports.postLogout = (req, res) => {
  req.session.destroy();
  res.redirect('/login');
};

exports.getSignUp = (req, res) => {
  // Đường dẫn đến trang đăng ký
  res.render('user/signup', { currentTab: 'signup' });
}

exports.postSignUp = (req, res) => {
  // Lấy thông tin từ request body
  let username = req.body.username;
  let password = req.body.password;
  let confirm_password = req.body.confirm_password;
  let fullname = req.body.fullname;
  let email = req.body.email;
  let phone = req.body.phone;
  let address = req.body.address;

  // Kiểm tra xem 2 mật khẩu có trùng khớp không
  if (password !== confirm_password) {
    console.log('Passwords do not match');
    res.render('user/signup', { currentTab: 'signup', msg: 'Passwords do not match', err: '' });
    return;
  }
  // Kiểm tra tài khoản đã tồn tại chưa
  let sqlCheckUsername = 'SELECT * FROM users WHERE username = ?';
  let paramsCheckUsername = [username];

  connectDB.query(sqlCheckUsername, paramsCheckUsername, function (err, results, fields) {
    if (err) {
      console.log(err);
      res.render('user/signup', { msg: '', err: 'Error: ' });
    } else if (results.length > 0) {
      res.render('user/signup', { currentTab: 'signup', msg: '', err: 'Username already exists' });
      return;
    } else {
      let sqlInsertUser = 'INSERT INTO users (username, password, fullname, email, phone, address) VALUES (?, ?, ?, ?, ?, ?)';
      let paramsInsertUser = [username, password, fullname, email, phone, address];

      connectDB.query(sqlInsertUser, paramsInsertUser, function (error, results, fields) {
        if (err) {
          console.log(err);
          res.render('user/signup', { msg: '', err: 'Error ' });
        }
        else {
          console.log('User registered successfully', results.insertId);
          res.render('user/login', { msg: 'User registered successfully', err: '' });
        }
      });
    }
  });
};

exports.getCart = (req, res) => {
  const sql = "SELECT * FROM tmp_bookings";
  connectDB.query(sql, (err, results) => {
    if (err) {
      console.log(err);
      return res.status(500).send('An error occurred while retrieving rooms data from database');
    }
    const roomIdList = results.map(result => result.room_id);

    if (roomIdList.length === 0) {
      // Nếu roomIdList rỗng, gán roomResults rỗng và tiếp tục xử lý.
      const roomResults = [];
      const imgResults = [];
      const rooms = [];
      res.render('user/cart', { currentTab: 'user/cart', rooms });
      return;
    }

    const roomSql = `SELECT room_id, room_number, room_type, price FROM rooms WHERE room_id IN (${roomIdList.join()})`;
    connectDB.query(roomSql, (err, roomResults) => {
      if (err) {
        console.log(err);
        return res.status(500).send('An error occurred while retrieving room information from database');
      }
      const roomInfoMap = {};
      roomResults.forEach((roomResult) => {
        roomInfoMap[roomResult.room_id] = {
          room_number: roomResult.room_number,
          room_type: roomResult.room_type,
          price: roomResult.price
        };
      });

      // Lấy danh sách ảnh room_image
      const imgSql = "SELECT room_id, room_image FROM rooms";
      connectDB.query(imgSql, (err, imgResults) => {
        if (err) {
          console.log(err);
          return res.status(500).send('An error occurred while retrieving room images from database');
        }
        // Đường dẫn tới thư mục uploads
        const uploadsUrl = '/uploads/';
        const imgUrls = {};
        imgResults.forEach((imgResult) => {
          imgUrls[imgResult.room_id] = uploadsUrl + imgResult.room_image;
        });

        results.forEach((room) => {
          const roomInfo = roomInfoMap[room.room_id];
          room.room_number = roomInfo.room_number;
          room.room_type = roomInfo.room_type;
          room.price = roomInfo.price;
          room.room_image_url = imgUrls[room.room_id];
          room.start_date = moment(room.start_date).format('DD/MM/YYYY');
          room.end_date = moment(room.end_date).format('DD/MM/YYYY');
        });
        res.render('user/cart', { currentTab: 'user/cart', rooms: results });
      });
    });
  });
}




exports.postPayCart = (req, res, next) => {
  // Kiểm tra xem user đã đăng nhập chưa
  if (req.session.user === undefined) {
    res.render('user/login', { err: 'You need to login before paying!' });
  } else {
    // Lấy id của booking đã lưu ở bảng tạm tmp_bookings
    let tmp_booking_id = req.params.booking_id;
    let sql = 'SELECT room_id, start_date, end_date FROM tmp_bookings WHERE booking_id = ?';

    connectDB.query(sql, [tmp_booking_id], (err, results) => {
      if (err) {
        console.log('SELECT room_id, start_date, end_date FROM tmp_bookings WHERE booking_id = ?')
        res.redirect('/cart')
        throw err;
      }
      if (!results.length) { // kiểm tra kết quả truy vấn
        res.render('user/login', { err: 'Booking not found!' });
      } else {
        let { room_id, start_date, end_date } = results[0];
        let sql = "INSERT INTO bookings (user_id, room_id, start_date, end_date) VALUES (?, ?, ?, ?)";
        let params = [req.session.user, room_id, start_date, end_date];
        connectDB.query(sql, params, (err, result) => {
          if (err) {
            res.redirect('/cart')
          }
          // Sau đó xoá thông tin đặt phòng ở bảng tạm tmp_bookings
          let sql = "DELETE FROM tmp_bookings WHERE booking_id = ?";
          let params = [tmp_booking_id];
          connectDB.query(sql, params, (err, result) => {
            if (err) {
              console.log(err);
              res.redirect('/cart')
            } else {
              console.log("Record deleted from tmp_bookings");
              res.redirect('/cart');
            }
          });
        });
      }
    });
  }
};


exports.postDeteteCart = (req, res) => {
  let booking_id = req.params.booking_id;
  const sql = "DELETE FROM tmp_bookings WHERE booking_id = ?";

  connectDB.query(sql, [booking_id], (error, results, fields) => {
    if (error) {
      console.error(error);
      return res.status(500).send('Đã xảy ra lỗi khi xóa donn dat phong');
    }
    console.log(`Đã xóa phong có id = ${booking_id}`);
    res.redirect('/cart');
  });
}

exports.getFoods = (req, res) => {
  const sql = "SELECT * FROM services where service_type = 'Food Service'";
  connectDB.query(sql, (err, results) => {
    if (err) {
      console.log(err);
      return res.status(500).send('An error occurred while retrieving rooms data from database');
    }
    // Lấy danh sách ảnh room_image
    const imgSql = "SELECT service_id, service_image FROM services";
    // console.log(imgSql);
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
      // render đến trang Foods
      res.render('user/foods', { currentTab: 'foods', services: results });

    });
  });
};

exports.getShuttles = (req, res) => {
  const sql = "SELECT * FROM services where service_type = 'Shuttle service'";
  connectDB.query(sql, (err, results) => {
    if (err) {
      console.log(err);
      return res.status(500).send('An error occurred while retrieving rooms data from database');
    }
    // Lấy danh sách ảnh room_image
    const imgSql = "SELECT service_id, service_image FROM services";
    // console.log(imgSql);
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

      res.render('user/shuttles', { currentTab: 'shuttles', services: results });
    });
  });
};

exports.postBookService = (req, res) => {
  // Lấy và tên dịch vụ từ request body
  let service_id = req.body.service_id;
  let service_name = req.body.service_name;
  // Kiểm tra xem user đã đăng nhập chưa
  if (req.session.user === undefined) {
    return res.render('user/login', { err: 'you must be logged in1' });
  } else {
    // Nếu đã đăng nhập thì render trang postpayment và truyền tham số service_id và
    res.render("user/postpayment", { service_id: service_id, service_name: service_name })
  }
}



exports.postService = (req, res) => {
  // Lấy thông tin về id dịch vụ và số phòng từ request body
  const service_id = req.body.service_id;
  // console.log('service_idd:  ', service_id);
  const { room_number } = req.body;
  // console.log('room_number:  ', room_number);
  const amount = 0;
  const user_id = req.session.user;
  console.log(user_id)
  // Kiểm tra kết nối tới database
  if (!connectDB) {
    console.log('Database connection error');
    return res.status(500).send('Database connection error');
  }
  // Thực hiện truy vấn để lưu thông tin đặt dịch vụ vào bảng payments
  const sql = "INSERT INTO payments (user_id, service_id, room_number, amount) VALUES (?, ?, ?, ?)";
  connectDB.query(sql, [user_id, service_id, room_number, amount], (err, result) => {
    if (err) {
      return res.render('user/login', { err: 'You are not logged in' });
    }
    console.log('Booking saved successfully');
    res.redirect('/payments');
  });
}


exports.getPayments = function (req, res) {
  // Kiểm tra người dùng đã đăng nhập hay chưa
  if (req.session.user === undefined) {
    res.render('user/login', { err: 'You must be logged in1' });
    return;
  }

  const userID = req.session.user;
  const sql = 'SELECT payments.*, services.service_name, services.price, services.service_type, service_image FROM payments INNER JOIN services ON payments.service_id = services.service_id WHERE user_id = ?';
  connectDB.query(sql, [userID], function (err, results) {
    if (err) {
      console.log(err);
      return res.status(500).send('An error occurred while retrieving payments data from database');
    }
    // Lấy ảnh
    const imgSql = 'SELECT service_id, service_image FROM services';
    connectDB.query(imgSql, function (err, imgResults) {
      if (err) {
        console.log(err);
        return res.status(500).send('An error occurred while retrieving service images from database');
      }
      // Tạo url cho ảnh dịch vụ
      const imgUrls = {};
      const uploadsUrl = '/uploads/';
      imgResults.forEach(function (imgResult) {
        imgUrls[imgResult.service_id] = uploadsUrl + imgResult.service_image;
      });
      // Định dạng lại ngày
      results.forEach(function (service) {
        service.service_image_url = imgUrls[service.service_id];
        service.start_date = moment(service.start_date).format('DD/MM/YYYY');
      });
      // Render trang thanh toán và truyền vào kết quả
      res.render('user/services', { currentTab: 'payments', services: results });
    });
  });
};


exports.postDeteteService = (req, res) => {
  let service_id = req.params.service_id;
  const sql = "DELETE FROM payments WHERE service_id = ?";

  connectDB.query(sql, [service_id], (error, results, fields) => {
    if (error) {
      console.error(error);
      return res.status(500).send('Error!');
    }
    // console.log(`Đã xóa phong có id = ${service_id}`);
    res.redirect('/payments');
  });
}


exports.getHistory = (req, res) => {
  // Lấy id của người dùng từ session user
  const user_id = req.session.user; 

  // Kiểm tra xem user đã đăng nhập chưa
  if (req.session.user === undefined) {
    return res.render('user/login', { err: 'You must be logged in' })

  }

  // Thực hiện truy vấn để lấy thông tin lịch sử đặt phòng của người dùng
  const query = `SELECT b.booking_id, r.room_number, r.room_type, b.start_date, b.end_date, b.total_days, r.price 
                 FROM bookings b 
                 JOIN rooms r ON b.room_id = r.room_id 
                 WHERE b.user_id = ?`;
  connectDB.query(query, [user_id], (err, result) => {
    if (err) {
      res.render('user/login', { msg: 'You must be logged in' });
      return;
    } else {
      // Render trang lịch sử đặt phòng và truyền vào kết quả
      res.render('user/history', { history: result });
    }

  });
};

exports.searchHistory = (req, res) => {
  res.render('user/search', { currentTab: 'history' })
}

exports.getSettings = (req, res) => {
  // Lấy id người dùng đang đăng nhập
  const user_id = req.session.user;

  // Kiểm tra xem user đã đăng nhập chưa
  if (!user_id) {
    return res.render('user/login', { err: `You can't edit your info without being logged in!` });
  }

  // Thực hiện truy vấn để lấy thông tin của người dùng
  const sql = "SELECT * FROM users WHERE user_id = ?";
  connectDB.query(sql, [user_id], (err, results) => {
    if (err) {
      console.error(err);
      return res.redirect('/');
    }
    const user = results[0];
    // Trả về trang settings và truyền vào các thông tin của người dùng
    res.render("user/settings", {
      fullname: user.fullname,
      email: user.email,
      phone: user.phone,
      address: user.address,
      currentTab: 'settings',
    });
  });
};

exports.postSettings = (req, res) => {
  // Lấy người dùng từ session user và các thông tin mới cập nhật từ request body
  const user_id = req.session.user;
  const { fullname, email, phone, address } = req.body;
  // Thực hiện truy vấn để cập nhật thông tin mới cho người dùng
  const sql = "UPDATE users SET fullname = ?, email = ?, phone = ?, address = ? WHERE user_id = ?";
  connectDB.query(sql, [fullname, email, phone, address, user_id], (err, results) => {
    // Trường hợp lỗi thì trả về trang settings
    if (err) {
      console.log(err);
      return res.redirect('/settings');
    }
    // Cập nhật thông tin cá nhân thành công
    console.log('User settings updated successfully');
    res.render('user/rooms', { msg: 'User settings updated successfully!' });
  });
};

exports.getChangePass = (req, res) => {
  // Render trang thay đổi mật khẩu
  res.render('user/changepass', { msg: '' });
}

exports.postChangePass = function (req, res) {
  let oldPassword = req.body.old_password;
  let newPassword = req.body.new_password;
  let confirmPassword = req.body.confirm_password;
  let user_id = req.session.user;

  // Lấy mật khẩu hiện tại từ cơ sở dữ liệu
  let sql = "SELECT password FROM users WHERE user_id = ?";
  connectDB.query(sql, [user_id], function (err, results) {
    if (err) {
      res.redirect('/rooms')
    }
    let oldPassSQL = results[0].password;

    // So sánh mật khẩu hiện tại với mật khẩu lưu trữ
    if (oldPassword !== oldPassSQL) {
      res.render("change-password", { err: "The old password is incorrect." });
    } else if (newPassword !== confirmPassword) {
      res.render("change-password", { msg: "New passwords do not match." });
    } else {
      // Thay đổi mật khẩu trong cơ sở dữ liệu
      let updateSql = "UPDATE users SET password = ? WHERE user_id = ?";
      connectDB.query(updateSql, [newPassword, user_id], function (err, results) {
        if (err) {
          res.render("user/rooms", { msg: "Can't change the password." });
        }
        res.render("user/rooms", { msg: "Password changed successfully." });
      });
    }
  });
};