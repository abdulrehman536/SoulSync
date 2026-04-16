const express = require('express');
const { sendInterest, getReceivedInterests, updateInterest } = require('../controllers/interestController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/send', protect, sendInterest);

router.get('/', protect, getReceivedInterests);

router.put('/:id', protect, updateInterest);

module.exports = router;