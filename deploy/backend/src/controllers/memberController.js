const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { sendMemberApprovalEmail } = require('../utils/emailService');
const { generateRandomPassword } = require('./memberAuthController');

const prisma = new PrismaClient();

/**
 * 获取会员列表
 * GET /api/admin/members
 */
const getMembers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      role,
      search
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // 构建查询条件
    const where = {};

    if (status) {
      where.status = status;
    }

    if (role) {
      where.role = role;
    }

    if (search) {
      where.OR = [
        { companyName: { contains: search } },
        { contactName: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } }
      ];
    }

    // 查询总数
    const total = await prisma.member.count({ where });

    // 查询数据
    const members = await prisma.member.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        companyName: true,
        contactName: true,
        phone: true,
        position: true,
        role: true,
        status: true,
        dazhangguiEnterpriseId: true,
        salesName: true,
        salesPhone: true,
        salesMobile: true,
        salesEmail: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.json({
      success: true,
      data: {
        members,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get members error:', error);
    res.status(500).json({
      success: false,
      message: '获取会员列表失败'
    });
  }
};

/**
 * 获取会员详情
 * GET /api/admin/members/:id
 */
const getMemberById = async (req, res) => {
  try {
    const { id } = req.params;

    const member = await prisma.member.findUnique({
      where: { id },
      include: {
        apiKeys: {
          select: {
            id: true,
            name: true,
            key: true,
            isActive: true,
            lastUsedAt: true,
            expiresAt: true,
            createdAt: true
          }
        },
        subscriptions: {
          where: { isActive: true },
          orderBy: { periodEnd: 'desc' }
        }
      }
    });

    if (!member) {
      return res.status(404).json({
        success: false,
        message: '会员不存在'
      });
    }

    res.json({
      success: true,
      data: { member }
    });
  } catch (error) {
    console.error('Get member error:', error);
    res.status(500).json({
      success: false,
      message: '获取会员详情失败'
    });
  }
};

/**
 * 审核通过会员
 * POST /api/admin/members/:id/approve
 */
const approveMember = async (req, res) => {
  try {
    const { id } = req.params;

    const member = await prisma.member.findUnique({
      where: { id }
    });

    if (!member) {
      return res.status(404).json({
        success: false,
        message: '会员不存在'
      });
    }

    if (member.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: '该会员不在待审核状态'
      });
    }

    // 生成临时密码
    const tempPassword = generateRandomPassword(10);
    const hashedPassword = await bcrypt.hash(tempPassword, 12);

    // 更新会员状态
    await prisma.member.update({
      where: { id },
      data: {
        status: 'APPROVED',
        password: hashedPassword
      }
    });

    // 发送开通邮件
    if (member.email) {
      const loginUrl = `${process.env.PORTAL_URL || 'http://localhost:3000'}/portal/login`;
      try {
        await sendMemberApprovalEmail({
          to: member.email,
          companyName: member.companyName,
          contactName: member.contactName,
          password: tempPassword,
          loginUrl
        });
      } catch (emailError) {
        console.error('Send approval email error:', emailError);
        // 邮件发送失败不影响审核通过
      }
    }

    res.json({
      success: true,
      message: '会员审核通过，开通邮件已发送',
      data: {
        memberId: id,
        email: member.email
      }
    });
  } catch (error) {
    console.error('Approve member error:', error);
    res.status(500).json({
      success: false,
      message: '审核会员失败'
    });
  }
};

/**
 * 拒绝会员
 * POST /api/admin/members/:id/reject
 */
const rejectMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const member = await prisma.member.findUnique({
      where: { id }
    });

    if (!member) {
      return res.status(404).json({
        success: false,
        message: '会员不存在'
      });
    }

    await prisma.member.update({
      where: { id },
      data: {
        status: 'REJECTED'
      }
    });

    res.json({
      success: true,
      message: '会员已拒绝',
      data: {
        memberId: id,
        reason
      }
    });
  } catch (error) {
    console.error('Reject member error:', error);
    res.status(500).json({
      success: false,
      message: '拒绝会员失败'
    });
  }
};

/**
 * 禁用/启用会员
 * POST /api/admin/members/:id/toggle-status
 */
const toggleMemberStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const member = await prisma.member.findUnique({
      where: { id }
    });

    if (!member) {
      return res.status(404).json({
        success: false,
        message: '会员不存在'
      });
    }

    const newStatus = member.status === 'DISABLED' ? 'APPROVED' : 'DISABLED';

    await prisma.member.update({
      where: { id },
      data: { status: newStatus }
    });

    res.json({
      success: true,
      message: newStatus === 'DISABLED' ? '会员已禁用' : '会员已启用',
      data: {
        memberId: id,
        status: newStatus
      }
    });
  } catch (error) {
    console.error('Toggle member status error:', error);
    res.status(500).json({
      success: false,
      message: '操作失败'
    });
  }
};

/**
 * 更新会员信息
 * PUT /api/admin/members/:id
 */
const updateMember = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      companyName,
      contactName,
      phone,
      position,
      role,
      dazhangguiEnterpriseId,
      salesName,
      salesPhone,
      salesMobile,
      salesEmail
    } = req.body;

    const member = await prisma.member.findUnique({
      where: { id }
    });

    if (!member) {
      return res.status(404).json({
        success: false,
        message: '会员不存在'
      });
    }

    const updatedMember = await prisma.member.update({
      where: { id },
      data: {
        companyName: companyName !== undefined ? companyName : undefined,
        contactName: contactName !== undefined ? contactName : undefined,
        phone: phone !== undefined ? phone : undefined,
        position: position !== undefined ? position : undefined,
        role: role !== undefined ? role : undefined,
        dazhangguiEnterpriseId: dazhangguiEnterpriseId !== undefined ? dazhangguiEnterpriseId : undefined,
        salesName: salesName !== undefined ? salesName : undefined,
        salesPhone: salesPhone !== undefined ? salesPhone : undefined,
        salesMobile: salesMobile !== undefined ? salesMobile : undefined,
        salesEmail: salesEmail !== undefined ? salesEmail : undefined
      }
    });

    res.json({
      success: true,
      message: '会员信息更新成功',
      data: { member: updatedMember }
    });
  } catch (error) {
    console.error('Update member error:', error);
    res.status(500).json({
      success: false,
      message: '更新会员信息失败'
    });
  }
};

/**
 * 生成API Key
 * POST /api/admin/members/:id/api-keys
 */
const createApiKey = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, permissions, expiresAt } = req.body;

    const member = await prisma.member.findUnique({
      where: { id }
    });

    if (!member) {
      return res.status(404).json({
        success: false,
        message: '会员不存在'
      });
    }

    if (member.status !== 'APPROVED') {
      return res.status(400).json({
        success: false,
        message: '会员未通过审核，无法生成API Key'
      });
    }

    // 生成API Key
    const key = 'pk_' + crypto.randomBytes(32).toString('hex');

    const apiKey = await prisma.apiKey.create({
      data: {
        memberId: id,
        key,
        name: name || 'Default',
        permissions: permissions ? JSON.stringify(permissions) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null
      }
    });

    res.status(201).json({
      success: true,
      message: 'API Key 生成成功',
      data: {
        apiKey: {
          id: apiKey.id,
          name: apiKey.name,
          key: apiKey.key,
          createdAt: apiKey.createdAt
        }
      }
    });
  } catch (error) {
    console.error('Create API key error:', error);
    res.status(500).json({
      success: false,
      message: '生成API Key失败'
    });
  }
};

/**
 * 撤销API Key
 * DELETE /api/admin/members/:memberId/api-keys/:keyId
 */
const revokeApiKey = async (req, res) => {
  try {
    const { memberId, keyId } = req.params;

    const apiKey = await prisma.apiKey.findFirst({
      where: {
        id: keyId,
        memberId
      }
    });

    if (!apiKey) {
      return res.status(404).json({
        success: false,
        message: 'API Key不存在'
      });
    }

    await prisma.apiKey.update({
      where: { id: keyId },
      data: { isActive: false }
    });

    res.json({
      success: true,
      message: 'API Key已撤销'
    });
  } catch (error) {
    console.error('Revoke API key error:', error);
    res.status(500).json({
      success: false,
      message: '撤销API Key失败'
    });
  }
};

module.exports = {
  getMembers,
  getMemberById,
  approveMember,
  rejectMember,
  toggleMemberStatus,
  updateMember,
  createApiKey,
  revokeApiKey
};
