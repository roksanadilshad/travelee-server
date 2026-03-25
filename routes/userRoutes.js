const express = require('express');
const { getUser, getSingleUser, createNewUser, ForgotPassword, ResetPassword, updateProfile, updateUserStatus, deleteUser } = require('../controllers/userController');

const router = express.Router();

const auth = require("../middlewares/auth");
const authMiddleware = require('../middlewares/authMiddleware');

router.get("/", authMiddleware, getUser);
router.post('/email', getSingleUser);
router.post('/', createNewUser);
router.post('/forgot-password', ForgotPassword);
router.post('/reset-password', ResetPassword);
router.patch('/update-profile', authMiddleware, updateProfile);
router.delete('/:id', authMiddleware, deleteUser);
router.patch('/:id/status', authMiddleware, updateUserStatus);

module.exports = router;