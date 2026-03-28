const express = require('express')
const router = express.Router()
const { authenticate } = require('../middleware/auth')
const contactPersonController = require('../controllers/contactPersonController')

// 所有路由都需要认证
router.use(authenticate)

// 联系人操作
router.post('/:customerId/contacts', contactPersonController.addContact)
router.put('/contacts/:id', contactPersonController.updateContact)
router.delete('/contacts/:id', contactPersonController.deleteContact)
router.post('/contacts/:id/set-primary', contactPersonController.setPrimaryContact)

module.exports = router
