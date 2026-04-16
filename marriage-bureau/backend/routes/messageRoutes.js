const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { sendMessage, getMessagesWithUser, getConversations } = require('../controllers/messageController');

const router = express.Router();

router.get('/', protect, getConversations);
router.get('/with/:userId', protect, getMessagesWithUser);
router.post('/', protect, sendMessage);

module.exports = router;