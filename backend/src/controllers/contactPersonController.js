const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// 添加联系人
exports.addContact = async (req, res) => {
  try {
    const { customerId } = req.params
    const { name, position, phone, wechat, email, isPrimary } = req.body

    if (!name) {
      return res.status(400).json({ success: false, message: '联系人姓名不能为空' })
    }

    // 检查客户是否存在
    const customer = await prisma.customer.findUnique({
      where: { id: customerId }
    })

    if (!customer) {
      return res.status(404).json({ success: false, message: '客户不存在' })
    }

    // 如果设为主联系人，先取消其他主联系人
    if (isPrimary) {
      await prisma.contactPerson.updateMany({
        where: { customerId },
        data: { isPrimary: false }
      })
    }

    const contact = await prisma.contactPerson.create({
      data: {
        customerId,
        name,
        position,
        phone,
        wechat,
        email,
        isPrimary: isPrimary || false
      }
    })

    res.json({
      success: true,
      message: '联系人添加成功',
      data: contact
    })
  } catch (error) {
    console.error('Add contact error:', error)
    res.status(500).json({ success: false, message: '添加联系人失败' })
  }
}

// 更新联系人
exports.updateContact = async (req, res) => {
  try {
    const { id } = req.params
    const { name, position, phone, wechat, email, isPrimary } = req.body

    const contact = await prisma.contactPerson.findUnique({
      where: { id },
      include: { customer: true }
    })

    if (!contact) {
      return res.status(404).json({ success: false, message: '联系人不存在' })
    }

    // 权限检查
    if (req.user.role !== 'ADMIN' && contact.customer.ownerId !== req.user.id) {
      return res.status(403).json({ success: false, message: '无权修改此联系人' })
    }

    // 如果设为主联系人，先取消其他主联系人
    if (isPrimary && !contact.isPrimary) {
      await prisma.contactPerson.updateMany({
        where: { customerId: contact.customerId },
        data: { isPrimary: false }
      })
    }

    const updatedContact = await prisma.contactPerson.update({
      where: { id },
      data: {
        name,
        position,
        phone,
        wechat,
        email,
        isPrimary: isPrimary || false
      }
    })

    res.json({
      success: true,
      message: '联系人更新成功',
      data: updatedContact
    })
  } catch (error) {
    console.error('Update contact error:', error)
    res.status(500).json({ success: false, message: '更新联系人失败' })
  }
}

// 删除联系人
exports.deleteContact = async (req, res) => {
  try {
    const { id } = req.params

    const contact = await prisma.contactPerson.findUnique({
      where: { id },
      include: { customer: true }
    })

    if (!contact) {
      return res.status(404).json({ success: false, message: '联系人不存在' })
    }

    // 权限检查
    if (req.user.role !== 'ADMIN' && contact.customer.ownerId !== req.user.id) {
      return res.status(403).json({ success: false, message: '无权删除此联系人' })
    }

    await prisma.contactPerson.delete({
      where: { id }
    })

    res.json({
      success: true,
      message: '联系人删除成功'
    })
  } catch (error) {
    console.error('Delete contact error:', error)
    res.status(500).json({ success: false, message: '删除联系人失败' })
  }
}

// 设置主联系人
exports.setPrimaryContact = async (req, res) => {
  try {
    const { id } = req.params

    const contact = await prisma.contactPerson.findUnique({
      where: { id }
    })

    if (!contact) {
      return res.status(404).json({ success: false, message: '联系人不存在' })
    }

    // 先取消该客户的所有主联系人
    await prisma.contactPerson.updateMany({
      where: { customerId: contact.customerId },
      data: { isPrimary: false }
    })

    // 设置当前联系人为主联系人
    const updatedContact = await prisma.contactPerson.update({
      where: { id },
      data: { isPrimary: true }
    })

    res.json({
      success: true,
      message: '主联系人设置成功',
      data: updatedContact
    })
  } catch (error) {
    console.error('Set primary contact error:', error)
    res.status(500).json({ success: false, message: '设置主联系人失败' })
  }
}
