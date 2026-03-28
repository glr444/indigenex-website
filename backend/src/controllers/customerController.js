const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// 客户列表
exports.getCustomers = async (req, res) => {
  try {
    const {
      search,
      status,
      level,
      type,
      ownerId,
      tag,
      page = 1,
      limit = 20
    } = req.query

    const skip = (Number(page) - 1) * Number(limit)

    // 构建查询条件
    const where = {}

    // 非管理员只能看自己的客户和公海客户
    if (req.user.role !== 'ADMIN') {
      where.OR = [
        { ownerId: req.user.id },
        { status: 'public' }
      ]
    }

    if (status) where.status = status
    if (level) where.level = level
    if (type) where.type = type
    if (ownerId) where.ownerId = ownerId

    // 搜索条件
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { creditCode: { contains: search } }
      ]
    }

    // 标签筛选
    if (tag) {
      where.tags = { contains: tag }
    }

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        include: {
          contacts: {
            where: { isPrimary: true },
            take: 1
          },
          _count: {
            select: {
              followUps: true,
              contacts: true
            }
          }
        },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: Number(limit)
      }),
      prisma.customer.count({ where })
    ])

    // 格式化数据
    const formattedCustomers = customers.map(c => ({
      id: c.id,
      name: c.name,
      creditCode: c.creditCode,
      industry: c.industry,
      level: c.level,
      type: c.type,
      status: c.status,
      ownerId: c.ownerId,
      source: c.source,
      tags: c.tags ? JSON.parse(c.tags) : [],
      primaryContact: c.contacts[0] || null,
      followUpCount: c._count.followUps,
      contactCount: c._count.contacts,
      lastFollowUpAt: c.lastFollowUpAt,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt
    }))

    res.json({
      success: true,
      data: {
        customers: formattedCustomers,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit))
        }
      }
    })
  } catch (error) {
    console.error('Get customers error:', error)
    res.status(500).json({ success: false, message: '获取客户列表失败' })
  }
}

// 客户详情
exports.getCustomerById = async (req, res) => {
  try {
    const { id } = req.params

    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        contacts: {
          orderBy: { isPrimary: 'desc' }
        },
        followUps: {
          orderBy: { createdAt: 'desc' },
          take: 50
        },
        attachments: {
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!customer) {
      return res.status(404).json({ success: false, message: '客户不存在' })
    }

    // 权限检查
    if (req.user.role !== 'ADMIN' && customer.status !== 'public' && customer.ownerId !== req.user.id) {
      return res.status(403).json({ success: false, message: '无权查看此客户' })
    }

    // 解析JSON字段
    const formattedCustomer = {
      ...customer,
      tags: customer.tags ? JSON.parse(customer.tags) : [],
      preferredRoutes: customer.preferredRoutes ? JSON.parse(customer.preferredRoutes) : [],
      transportModes: customer.transportModes ? JSON.parse(customer.transportModes) : []
    }

    res.json({
      success: true,
      data: formattedCustomer
    })
  } catch (error) {
    console.error('Get customer error:', error)
    res.status(500).json({ success: false, message: '获取客户详情失败' })
  }
}

// 创建客户
exports.createCustomer = async (req, res) => {
  try {
    const {
      name,
      creditCode,
      industry,
      scale,
      preferredRoutes,
      settlementType,
      level,
      type,
      monthlyVolume,
      transportModes,
      targetRoutes,
      requirements,
      competition,
      tags,
      contacts,
      source = 'manual'
    } = req.body

    // 检查必填字段
    if (!name) {
      return res.status(400).json({ success: false, message: '公司名称不能为空' })
    }

    // 检查重复客户（防撞客）
    const existingCustomer = await prisma.customer.findFirst({
      where: {
        OR: [
          { name },
          ...(creditCode ? [{ creditCode }] : [])
        ],
        status: { not: 'archived' }
      }
    })

    if (existingCustomer) {
      return res.status(409).json({
        success: false,
        message: '客户已存在',
        data: {
          existingCustomer: {
            id: existingCustomer.id,
            name: existingCustomer.name,
            ownerId: existingCustomer.ownerId
          }
        }
      })
    }

    // 创建客户
    const customer = await prisma.customer.create({
      data: {
        name,
        creditCode,
        industry,
        scale,
        preferredRoutes: preferredRoutes ? JSON.stringify(preferredRoutes) : null,
        settlementType,
        level: level || 'D',
        type: type || 'direct',
        monthlyVolume,
        transportModes: transportModes ? JSON.stringify(transportModes) : null,
        targetRoutes,
        requirements,
        competition,
        tags: tags ? JSON.stringify(tags) : null,
        source,
        ownerId: req.user.id,
        status: 'active'
      }
    })

    // 创建联系人
    if (contacts && contacts.length > 0) {
      await prisma.contactPerson.createMany({
        data: contacts.map((contact, index) => ({
          customerId: customer.id,
          name: contact.name,
          position: contact.position,
          phone: contact.phone,
          wechat: contact.wechat,
          email: contact.email,
          isPrimary: index === 0 // 第一个联系人设为主联系人
        }))
      })
    }

    res.json({
      success: true,
      message: '客户创建成功',
      data: customer
    })
  } catch (error) {
    console.error('Create customer error:', error)
    res.status(500).json({ success: false, message: '创建客户失败' })
  }
}

// 更新客户
exports.updateCustomer = async (req, res) => {
  try {
    const { id } = req.params
    const {
      name,
      creditCode,
      industry,
      scale,
      preferredRoutes,
      settlementType,
      level,
      type,
      monthlyVolume,
      transportModes,
      targetRoutes,
      requirements,
      competition,
      tags,
      status,
      contacts
    } = req.body

    const customer = await prisma.customer.findUnique({
      where: { id }
    })

    if (!customer) {
      return res.status(404).json({ success: false, message: '客户不存在' })
    }

    // 权限检查
    if (req.user.role !== 'ADMIN' && customer.ownerId !== req.user.id) {
      return res.status(403).json({ success: false, message: '无权修改此客户' })
    }

    const updatedCustomer = await prisma.customer.update({
      where: { id },
      data: {
        name,
        creditCode,
        industry,
        scale,
        preferredRoutes: preferredRoutes ? JSON.stringify(preferredRoutes) : null,
        settlementType,
        level,
        type,
        monthlyVolume,
        transportModes: transportModes ? JSON.stringify(transportModes) : null,
        targetRoutes,
        requirements,
        competition,
        tags: tags ? JSON.stringify(tags) : null,
        status
      }
    })

    // 更新联系人（如果提供了联系人数据）
    if (contacts && Array.isArray(contacts)) {
      // 先删除所有现有联系人
      await prisma.contactPerson.deleteMany({
        where: { customerId: id }
      })

      // 创建新的联系人
      if (contacts.length > 0) {
        await prisma.contactPerson.createMany({
          data: contacts.map((contact, index) => ({
            customerId: id,
            name: contact.name,
            position: contact.position,
            phone: contact.phone,
            wechat: contact.wechat,
            email: contact.email,
            isPrimary: contact.isPrimary || index === 0 // 如果没有指定，第一个设为主联系人
          }))
        })
      }
    }

    res.json({
      success: true,
      message: '客户更新成功',
      data: updatedCustomer
    })
  } catch (error) {
    console.error('Update customer error:', error)
    res.status(500).json({ success: false, message: '更新客户失败' })
  }
}

// 删除客户
exports.deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params

    const customer = await prisma.customer.findUnique({
      where: { id }
    })

    if (!customer) {
      return res.status(404).json({ success: false, message: '客户不存在' })
    }

    // 权限检查
    if (req.user.role !== 'ADMIN' && customer.ownerId !== req.user.id) {
      return res.status(403).json({ success: false, message: '无权删除此客户' })
    }

    await prisma.customer.delete({
      where: { id }
    })

    res.json({
      success: true,
      message: '客户删除成功'
    })
  } catch (error) {
    console.error('Delete customer error:', error)
    res.status(500).json({ success: false, message: '删除客户失败' })
  }
}

// 认领公海客户
exports.claimCustomer = async (req, res) => {
  try {
    const { id } = req.params

    const customer = await prisma.customer.findUnique({
      where: { id }
    })

    if (!customer) {
      return res.status(404).json({ success: false, message: '客户不存在' })
    }

    if (customer.status !== 'public') {
      return res.status(400).json({ success: false, message: '该客户不在公海池中' })
    }

    const updatedCustomer = await prisma.customer.update({
      where: { id },
      data: {
        status: 'active',
        ownerId: req.user.id
      }
    })

    res.json({
      success: true,
      message: '客户认领成功',
      data: updatedCustomer
    })
  } catch (error) {
    console.error('Claim customer error:', error)
    res.status(500).json({ success: false, message: '认领客户失败' })
  }
}

// 分配客户（管理员）
exports.assignCustomer = async (req, res) => {
  try {
    const { id } = req.params
    const { ownerId } = req.body

    if (!ownerId) {
      return res.status(400).json({ success: false, message: '请选择归属销售' })
    }

    const customer = await prisma.customer.findUnique({
      where: { id }
    })

    if (!customer) {
      return res.status(404).json({ success: false, message: '客户不存在' })
    }

    const updatedCustomer = await prisma.customer.update({
      where: { id },
      data: {
        ownerId,
        status: 'active'
      }
    })

    res.json({
      success: true,
      message: '客户分配成功',
      data: updatedCustomer
    })
  } catch (error) {
    console.error('Assign customer error:', error)
    res.status(500).json({ success: false, message: '分配客户失败' })
  }
}

// 移入公海
exports.moveToPublic = async (req, res) => {
  try {
    const { id } = req.params

    const customer = await prisma.customer.findUnique({
      where: { id }
    })

    if (!customer) {
      return res.status(404).json({ success: false, message: '客户不存在' })
    }

    const updatedCustomer = await prisma.customer.update({
      where: { id },
      data: {
        status: 'public',
        ownerId: null
      }
    })

    res.json({
      success: true,
      message: '客户已移入公海',
      data: updatedCustomer
    })
  } catch (error) {
    console.error('Move to public error:', error)
    res.status(500).json({ success: false, message: '移入公海失败' })
  }
}

// 检查客户是否存在（防撞客）
exports.checkDuplicate = async (req, res) => {
  try {
    const { name, creditCode } = req.query

    if (!name && !creditCode) {
      return res.status(400).json({ success: false, message: '请提供查询条件' })
    }

    const where = {
      status: { not: 'archived' }
    }

    if (name && creditCode) {
      where.OR = [
        { name: { contains: name } },
        { creditCode: { contains: creditCode } }
      ]
    } else if (name) {
      where.name = { contains: name }
    } else if (creditCode) {
      where.creditCode = { contains: creditCode }
    }

    const existingCustomers = await prisma.customer.findMany({
      where,
      select: {
        id: true,
        name: true,
        ownerId: true,
        status: true
      }
    })

    res.json({
      success: true,
      data: {
        hasDuplicate: existingCustomers.length > 0,
        customers: existingCustomers
      }
    })
  } catch (error) {
    console.error('Check duplicate error:', error)
    res.status(500).json({ success: false, message: '检查失败' })
  }
}
