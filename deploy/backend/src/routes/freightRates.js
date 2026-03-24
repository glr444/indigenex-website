const express = require('express');
const multer = require('multer');
const {
  getFreightRates,
  getFreightRateById,
  createFreightRate,
  updateFreightRate,
  deleteFreightRate,
  importFreightRates,
  getPublicFreightRates
} = require('../controllers/freightRateController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// 配置multer（内存存储）
const upload = multer({ storage: multer.memoryStorage() });

// 公开接口（供客户查询）
router.get('/public', getPublicFreightRates);

// 后台管理接口（需要管理员认证）
router.get('/', authenticate, getFreightRates);
router.get('/:id', authenticate, getFreightRateById);
router.post('/', authenticate, createFreightRate);
router.put('/:id', authenticate, updateFreightRate);
router.delete('/:id', authenticate, deleteFreightRate);
router.post('/import', authenticate, upload.single('file'), importFreightRates);

module.exports = router;
