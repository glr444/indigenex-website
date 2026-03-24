const express = require('express');
const multer = require('multer');
const { register, login, getProfile, updateProfile, changePassword } = require('../controllers/memberAuthController');
const { authenticateMember } = require('../middleware/memberAuth');

const router = express.Router();

// 公开接口
router.post('/auth/register', register);
router.post('/auth/login', login);

// 需要认证的接口
router.get('/profile', authenticateMember, getProfile);
router.put('/profile', authenticateMember, updateProfile);
router.post('/auth/change-password', authenticateMember, changePassword);

module.exports = router;
