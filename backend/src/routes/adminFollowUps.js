const express = require('express')
const router = express.Router()
const { authenticate } = require('../middleware/auth')
const followUpController = require('../controllers/followUpController')

// 所有路由都需要认证
router.use(authenticate)

// 跟进记录操作
router.get('/', followUpController.getFollowUps)
router.post('/', followUpController.addFollowUp)
router.put('/:id', followUpController.updateFollowUp)
router.delete('/:id', followUpController.deleteFollowUp)
router.get('/pending', followUpController.getPendingFollowUps)

module.exports = router
