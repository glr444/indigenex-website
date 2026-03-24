const express = require('express');
const {
  getMembers,
  getMemberById,
  approveMember,
  rejectMember,
  toggleMemberStatus,
  updateMember,
  createApiKey,
  revokeApiKey
} = require('../controllers/memberController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// 所有接口都需要管理员认证
router.get('/', authenticate, getMembers);
router.get('/:id', authenticate, getMemberById);
router.post('/:id/approve', authenticate, approveMember);
router.post('/:id/reject', authenticate, rejectMember);
router.post('/:id/toggle-status', authenticate, toggleMemberStatus);
router.put('/:id', authenticate, updateMember);
router.post('/:id/api-keys', authenticate, createApiKey);
router.delete('/:memberId/api-keys/:keyId', authenticate, revokeApiKey);

module.exports = router;
