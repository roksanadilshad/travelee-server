const express = require('express');
const router = express.Router();
const { getActiveDeal } = require('../controllers/dealController');
const { claimDealController } = require('../controllers/dealController');

router.get('/active-deal', getActiveDeal);
router.post('/claim-deal', claimDealController);

module.exports = router;