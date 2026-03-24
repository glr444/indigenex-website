const express = require('express');
const { getOrders, getOrderByNo } = require('../controllers/orderController');
const { authenticateMember } = require('../middleware/memberAuth');

const router = express.Router();

// 所有接口都需要会员认证
router.get('/', authenticateMember, getOrders);
router.get('/:orderNo', authenticateMember, getOrderByNo);

module.exports = router;
