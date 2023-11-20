const express = require('express');
const router = express.Router();

const adminController = require('../controller/adminController')

router.route('/')
    .get(adminController.getRooms)

router.route('/login/')
    .get(adminController.getLogin)
    .post(adminController.postLogin)

router.route('/rooms/')
    .get(adminController.getRooms)
    .post(adminController.postRooms)

router.route('/addroom/')
    .post(adminController.postAddRoom)

router.route('/delete/:room_id/')
    .post(adminController.postDeleteRoom)

router.route('/logout')
    .post(adminController.postLogout)

router.route('/editroom/:room_id/')
    .get(adminController.getEditRoom)
    .post(adminController.postEditRoom)

router.route('/customers')
    .get(adminController.getCustomers)

router.route('/customers/:user_id/')
    .get(adminController.getCustomers)

router.route('/editcustomer/:user_id/')
    .get(adminController.getEditCustomer)
    .post(adminController.postEditCustomer)

router.route('/deletecustomer/:user_id/')
    .post(adminController.postDeleteCustomer)

router.route('/payments')
    .get(adminController.getPayments);

router.route('/payments/:payment_id')
    .post(adminController.postPayments);

router.route('/reservations/')
    .get(adminController.getReservations)
    .post(adminController.postReservations)

router.route('/services/')
    .get(adminController.getServices)
    .post(adminController.postAddService)

router.route('/editservice/:service_id/')
    .get(adminController.getEditService)
    .post(adminController.postEditService)

router.route('/delservice/:service_id/')
    .post(adminController.postDeleteService)

module.exports = router;
