const express = require('express');
const { getUser, getSingleUser, createNewUser } = require('../controllers/userController');

const router = express.Router();

router.get('/', getUser);
router.get('/email', getSingleUser);
router.post('/', createNewUser);

module.exports = router;