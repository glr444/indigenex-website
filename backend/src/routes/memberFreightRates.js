const express = require('express');
const { getFreightRates, getFreightRateById } = require('../controllers/freightRateController');
const { authenticateMember } = require('../middleware/memberAuth');

const router = express.Router();

// 会员运价查询接口（需要会员认证）
router.get('/', authenticateMember, getFreightRates);
router.get('/:id', authenticateMember, getFreightRateById);

module.exports = router;
