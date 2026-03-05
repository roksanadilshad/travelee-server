const express = require('express');
const { getUser, getSingleUser, createNewUser, ForgotPassword, ResetPassword } = require('../controllers/userController');

const router = express.Router();

const auth = require("../middlewares/auth");

router.get("/", auth, getUser);
router.post('/email', getSingleUser);
router.post('/', createNewUser);
router.post('/forgot-password', ForgotPassword);
router.post('/reset-password', ResetPassword);

module.exports = router;