const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// 获取跟进记录列表
exports.getFollowUps = async (req, res) => {
  try {
    const { customerId, page = 1, limit = 20 } = req.query

    const skip = (Number(page) - 1) * Number(limit)

    const where = {}
    if (customerId) where.customerId = customerId

    // 非管理员只能看自己的跟进记录
    if (req.user.role !== 'ADMIN') {
      where.userId = req.user.id
    }

    const [followUps, total] = await Promise.all([
      prisma.followUp.findMany({
        where,
        include: {
          customer: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit)
      }),
      prisma.followUp.count({ where })
    ])

    res.json({
      success: true,
      data: {
        followUps,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit))
        }
      }
    })
  } catch (error) {
    console.error('Get follow-ups error:', error)
    res.status(500).json({ success: false, message: '获取跟进记录失败' })
  }
}

// 添加跟进记录
exports.addFollowUp = async (req, res) => {
  try {
    const { customerId, method, content, feedback, nextFollowUpAt, updateProfile } = req.body

    if (!customerId || !method || !content) {
      return res.status(400).json({
        success: false,
        message: '请填写完整的跟进信息'
      })
    }

    // 检查客户是否存在
    const customer = await prisma.customer.findUnique({
      where: { id: customerId }
    })

    if (!customer) {
      return res.status(404).json({ success: false, message: '客户不存在' })
    }

    // 创建跟进记录
    const followUp = await prisma.followUp.create({
      data: {
        customerId,
        userId: req.user.id,
        method,
        content,
        feedback,
        nextFollowUpAt: nextFollowUpAt ? new Date(nextFollowUpAt) : null,
        updateProfile: updateProfile || false
      }
    })

    // 更新客户的最后跟进时间
    await prisma.customer.update({
      where: { id: customerId },
      data: {
        lastFollowUpAt: new Date()
      }
    })

    res.json({
      success: true,
      message: '跟进记录添加成功',
      data: followUp
    })
  } catch (error) {
    console.error('Add follow-up error:', error)
    res.status(500).json({ success: false, message: '添加跟进记录失败' })
  }
}

// 更新跟进记录
exports.updateFollowUp = async (req, res) => {
  try {
    const { id } = req.params
    const { method, content, feedback, nextFollowUpAt } = req.body

    const followUp = await prisma.followUp.findUnique({
      where: { id }
    })

    if (!followUp) {
      return res.status(404).json({ success: false, message: '跟进记录不存在' })
    }

    // 权限检查
    if (req.user.role !== 'ADMIN' && followUp.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: '无权修改此跟进记录' })
    }

    const updatedFollowUp = await prisma.followUp.update({
      where: { id },
      data: {
        method,
        content,
        feedback,
        nextFollowUpAt: nextFollowUpAt ? new Date(nextFollowUpAt) : null
      }
    })

    res.json({
      success: true,
      message: '跟进记录更新成功',
      data: updatedFollowUp
    })
  } catch (error) {
    console.error('Update follow-up error:', error)
    res.status(500).json({ success: false, message: '更新跟进记录失败' })
  }
}

// 删除跟进记录
exports.deleteFollowUp = async (req, res) => {
  try {
    const { id } = req.params

    const followUp = await prisma.followUp.findUnique({
      where: { id }
    })

    if (!followUp) {
      return res.status(404).json({ success: false, message: '跟进记录不存在' })
    }

    // 权限检查
    if (req.user.role !== 'ADMIN' && followUp.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: '无权删除此跟进记录' })
    }

    await prisma.followUp.delete({
      where: { id }
    })

    res.json({
      success: true,
      message: '跟进记录删除成功'
    })
  } catch (error) {
    console.error('Delete follow-up error:', error)
    res.status(500).json({ success: false, message: '删除跟进记录失败' })
  }
}

// 获取待跟进提醒
exports.getPendingFollowUps = async (req, res) => {
  try {
    const where = {
      nextFollowUpAt: {
        lte: new Date()
      }
    }

    // 非管理员只能看自己的提醒
    if (req.user.role !== 'ADMIN') {
      where.userId = req.user.id
    }

    const followUps = await prisma.followUp.findMany({
      where,
      include: {
        customer: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { nextFollowUpAt: 'asc' }
    })

    res.json({
      success: true,
      data: followUps
    })
  } catch (error) {
    console.error('Get pending follow-ups error:', error)
    res.status(500).json({ success: false, message: '获取待跟进提醒失败' })
  }
}
