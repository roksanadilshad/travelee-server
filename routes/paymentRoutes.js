const express = require('express');
const router = express.Router();
const { createCheckoutSession, markAsPaid } = require('../controllers/paymentController');

// Define the POST route
router.post('/create-checkout-session', createCheckoutSession);
router.patch('/mark-as-paid', markAsPaid);

module.exports = router;