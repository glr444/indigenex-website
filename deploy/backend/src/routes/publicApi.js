const express = require('express');
const {
  getFreightRates,
  getFreightRateById,
  createFreightRate,
  updateFreightRate,
  deleteFreightRate
} = require('../controllers/publicApiController');
const { authenticateApiKey } = require('../middleware/apiKeyAuth');

const router = express.Router();

// 所有接口都需要API Key认证
router.get('/freight-rates', authenticateApiKey, getFreightRates);
router.get('/freight-rates/:id', authenticateApiKey, getFreightRateById);
router.post('/freight-rates', authenticateApiKey, createFreightRate);
router.put('/freight-rates/:id', authenticateApiKey, updateFreightRate);
router.delete('/freight-rates/:id', authenticateApiKey, deleteFreightRate);

module.exports = router;