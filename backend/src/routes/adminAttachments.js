const express = require('express')
const router = express.Router()
const { authenticate } = require('../middleware/auth')
const attachmentController = require('../controllers/customerAttachmentController')

// 所有路由都需要认证
router.use(authenticate)

// 附件操作
router.get('/:customerId/attachments', attachmentController.getAttachments)
router.post('/:customerId/attachments', attachmentController.uploadAttachment)
router.delete('/attachments/:id', attachmentController.deleteAttachment)

module.exports = router
