const express = require('express');
const {
	registerUser,
	loginUser,
	getUserProfile,
	updateUserProfile,
	searchUsers,
	getAllUsers,
	updateUserByAdmin,
	deleteUserByAdmin,
	setUserApproval,
} = require('../controllers/userController');
const { protect, authorizeAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);

router.get('/me', protect, getUserProfile);
router.put('/me', protect, updateUserProfile);
router.get('/search', protect, searchUsers);

router.get('/', protect, authorizeAdmin, getAllUsers);
router.put('/:id', protect, authorizeAdmin, updateUserByAdmin);
router.delete('/:id', protect, authorizeAdmin, deleteUserByAdmin);
router.patch('/:id/approval', protect, authorizeAdmin, setUserApproval);

module.exports = router;
