const express = require('express');
const { addReview, getReviews } = require('../controllers/reviewController');
const verifyAdmin = require('../middlewares/adminMiddleware');

const router = express.Router();

router.get('/', getReviews);
router.post('/',verifyAdmin, addReview);

module.exports = router;
