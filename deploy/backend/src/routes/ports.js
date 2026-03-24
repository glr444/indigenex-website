const express = require('express');
const router = express.Router();
const {
  getPorts,
  getPopularPorts,
  recordPortPreference,
  searchPorts
} = require('../controllers/portController');
const { authenticateMember } = require('../middleware/memberAuth');

// 公开路由
router.get('/search', searchPorts);
router.get('/', getPorts);

// 需要会员登录的路由
router.get('/popular', authenticateMember, getPopularPorts);
router.post('/:code/preference', authenticateMember, recordPortPreference);

module.exports = router;
