const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// 上传附件
exports.uploadAttachment = async (req, res) => {
  try {
    const { customerId } = req.params
    const { name, type, url, size } = req.body

    if (!name || !url) {
      return res.status(400).json({
        success: false,
        message: '文件名和文件路径不能为空'
      })
    }

    // 检查客户是否存在
    const customer = await prisma.customer.findUnique({
      where: { id: customerId }
    })

    if (!customer) {
      return res.status(404).json({ success: false, message: '客户不存在' })
    }

    const attachment = await prisma.customerAttachment.create({
      data: {
        customerId,
        name,
        type: type || 'other',
        url,
        size: size || 0,
        uploadedBy: req.user.id
      }
    })

    res.json({
      success: true,
      message: '附件上传成功',
      data: attachment
    })
  } catch (error) {
    console.error('Upload attachment error:', error)
    res.status(500).json({ success: false, message: '上传附件失败' })
  }
}

// 获取附件列表
exports.getAttachments = async (req, res) => {
  try {
    const { customerId } = req.params

    const attachments = await prisma.customerAttachment.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' }
    })

    res.json({
      success: true,
      data: attachments
    })
  } catch (error) {
    console.error('Get attachments error:', error)
    res.status(500).json({ success: false, message: '获取附件列表失败' })
  }
}

// 删除附件
exports.deleteAttachment = async (req, res) => {
  try {
    const { id } = req.params

    const attachment = await prisma.customerAttachment.findUnique({
      where: { id },
      include: { customer: true }
    })

    if (!attachment) {
      return res.status(404).json({ success: false, message: '附件不存在' })
    }

    // 权限检查
    if (req.user.role !== 'ADMIN' && attachment.uploadedBy !== req.user.id && attachment.customer.ownerId !== req.user.id) {
      return res.status(403).json({ success: false, message: '无权删除此附件' })
    }

    await prisma.customerAttachment.delete({
      where: { id }
    })

    res.json({
      success: true,
      message: '附件删除成功'
    })
  } catch (error) {
    console.error('Delete attachment error:', error)
    res.status(500).json({ success: false, message: '删除附件失败' })
  }
}
