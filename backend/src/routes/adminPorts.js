const express = require('express');
const router = express.Router();
const {
  getAdminPorts,
  createPort,
  updatePort,
  deletePort,
  importPorts,
  getRegions
} = require('../controllers/adminPortController');
const { authenticate } = require('../middleware/auth');

// 所有路由都需要管理员认证
router.use(authenticate);

router.get('/regions', getRegions);
router.get('/', getAdminPorts);
router.post('/', createPort);
router.post('/import', importPorts);
router.put('/:id', updatePort);
router.delete('/:id', deletePort);

module.exports = router;
