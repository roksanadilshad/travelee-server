const express = require('express');
const { getUser, getSingleUser, createNewUser, ForgotPassword, ResetPassword, updateProfile } = require('../controllers/userController');

const router = express.Router();

const auth = require("../middlewares/auth");
const authMiddleware = require('../middlewares/authMiddleware');

router.get("/", auth, getUser);
router.post('/email', getSingleUser);
router.post('/', createNewUser);
router.post('/forgot-password', ForgotPassword);
router.post('/reset-password', ResetPassword);
router.patch('/update-profile', authMiddleware, updateProfile);

module.exports = router;