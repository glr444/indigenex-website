const express = require('express')
const router = express.Router()
const { authenticate } = require('../middleware/auth')
const customerController = require('../controllers/customerController')

// 所有路由都需要认证
router.use(authenticate)

// 客户CRUD
router.get('/', customerController.getCustomers)
router.post('/', customerController.createCustomer)
router.get('/check-duplicate', customerController.checkDuplicate)
router.get('/:id', customerController.getCustomerById)
router.put('/:id', customerController.updateCustomer)
router.delete('/:id', customerController.deleteCustomer)

// 客户状态操作
router.post('/:id/claim', customerController.claimCustomer)
router.post('/:id/assign', customerController.assignCustomer)
router.post('/:id/move-to-public', customerController.moveToPublic)

module.exports = router
