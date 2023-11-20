const express = require('express');
const app = express();

const path = require('path');

// Đường dẫn tỉnh nhằm truy cập các file public
// app.use(express.static('public'));
app.use(express.static(path.join(__dirname, 'public')));

// Sử dựng EJS
app.set('view engine', 'ejs');

// sử dụng body-parser
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

// sử dụng Express-session
const session = require("express-session");
app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: true,
}));

// Middleware đăng ký tiếp theo để dữ liệu của session được truyền vào Reponse Local trong quá trình xử lý request
app.use((req, res, next) => {
  res.locals.msg = req.session.msg;
  res.locals.err = req.session.err;
  res.locals.user = req.session.user;
  res.locals.admin = req.session.admin;
  next()
})

// Thiết Lập mô hình MVC
const userRouter = require('./routes/userRouter');
app.use('/', userRouter);
const adminRouter = require('./routes/adminRouter');
app.use('/admin', adminRouter);

// Thiết lập server
app.listen(3000, () => {
  console.log('Server running...');
})