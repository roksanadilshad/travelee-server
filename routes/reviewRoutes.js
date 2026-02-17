const express = require('express');
const { addReview } = require('../controllers/reviewController');
const verifyAdmin = require('../middlewares/adminMiddleware');

const router = express.Router();

router.post('/',verifyAdmin, addReview);

module.exports = router;
