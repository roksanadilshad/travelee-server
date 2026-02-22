const express = require('express');
const { getUser, getSingleUser, createNewUser, ForgotPassword } = require('../controllers/userController');

const router = express.Router();

router.get('/', getUser);
router.get('/email', getSingleUser);
router.post('/', createNewUser);
router.patch('/forgot-password', ForgotPassword);

module.exports = router;