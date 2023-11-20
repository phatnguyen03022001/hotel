const express = require('express');
const router = express.Router();

const userController = require('../controller/userController')

router.route('/login')
    .get(userController.getLogin)
    .post(userController.postLogin)

router.route('/signup')
    .get(userController.getSignUp)
    .post(userController.postSignUp)

router.route('/logout')
    .post(userController.postLogout)

router.route('/settings')
    .get(userController.getSettings)
    .post(userController.postSettings)

router.route('/')
    .get(userController.getOverview)

router.route('/overview')
    .get(userController.getOverview)

router.route('/rooms')
    .get(userController.getRooms)
    .post(userController.postRooms)

router.route('/booking/:room_id/')
    .post(userController.postBooking)

router.route('/reservation/:room_id/')
    .post(userController.postReservation)

router.route('/cart')
    .get(userController.getCart)

router.route('/paycart/:booking_id')
    .post(userController.postPayCart)

router.route('/deleteCart/:booking_id/')
    .post(userController.postDeteteCart)

router.route('/payments/')
    .get(userController.getPayments)

router.route('/foods')
    .get(userController.getFoods)

router.route('/shuttles')
    .get(userController.getShuttles)

router.route('/postpayment/:payments_id/')
    .post(userController.postBookService)

router.route('/delservice/:service_id/')
    .post(userController.postDeteteService)

router.route('/postservice/:service_id/')
    .post(userController.postService);

router.route('/history')
    .get(userController.getHistory)

router.route('/search')
    .get(userController.searchHistory)

router.route('/changepass')
    .get(userController.getChangePass)
    .post(userController.postChangePass)




module.exports = router;