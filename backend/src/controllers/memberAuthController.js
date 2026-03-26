const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendMemberApprovalEmail } = require('../utils/emailService');

const prisma = new PrismaClient();

const MEMBER_JWT_SECRET = process.env.MEMBER_JWT_SECRET || process.env.JWT_SECRET || 'fallback-secret';
const MEMBER_JWT_EXPIRES_IN = process.env.MEMBER_JWT_EXPIRES_IN || '7d';

console.log('[MemberAuth] JWT Secret loaded:', MEMBER_JWT_SECRET.substring(0, 20) + '...');
console.log('[MemberAuth] NODE_ENV:', process.env.NODE_ENV);

// 生成随机密码
function generateRandomPassword(length = 10) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

// 生成会员JWT令牌
function generateMemberToken(memberId, role) {
  return jwt.sign(
    { memberId, role, type: 'member' },
    MEMBER_JWT_SECRET,
    { expiresIn: MEMBER_JWT_EXPIRES_IN }
  );
}

/**
 * 邮箱注册
 * POST /api/member/auth/register
 */
const register = async (req, res) => {
  try {
    const { email, password, companyName, contactName, phone, position } = req.body;

    // 验证必填字段
    if (!email || !password || !companyName || !contactName) {
      return res.status(400).json({
        success: false,
        message: '请填写所有必填字段：邮箱、密码、企业名称、联系人姓名'
      });
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: '邮箱格式不正确'
      });
    }

    // 检查邮箱是否已存在
    const existingMember = await prisma.member.findUnique({
      where: { email }
    });

    if (existingMember) {
      return res.status(400).json({
        success: false,
        message: '该邮箱已被注册'
      });
    }

    // 哈希密码
    const hashedPassword = await bcrypt.hash(password, 12);

    // 创建会员（状态为待审核）
    const member = await prisma.member.create({
      data: {
        email,
        password: hashedPassword,
        companyName,
        contactName,
        phone: phone || '',
        position: position || '',
        status: 'PENDING',
        role: 'MEMBER',
      }
    });

    res.status(201).json({
      success: true,
      message: '注册成功，请等待后台审核开通',
      data: {
        id: member.id,
        email: member.email,
        companyName: member.companyName,
        status: member.status
      }
    });
  } catch (error) {
    console.error('Member registration error:', error);
    res.status(500).json({
      success: false,
      message: '注册失败，请稍后重试'
    });
  }
};

/**
 * 邮箱登录
 * POST /api/member/auth/login
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: '请填写邮箱和密码'
      });
    }

    // 查找会员
    const member = await prisma.member.findUnique({
      where: { email }
    });

    if (!member || !member.password) {
      return res.status(401).json({
        success: false,
        message: '邮箱或密码错误'
      });
    }

    // 检查账户状态
    if (member.status === 'PENDING') {
      return res.status(403).json({
        success: false,
        message: '账户正在审核中，请等待开通'
      });
    }

    if (member.status === 'REJECTED') {
      return res.status(403).json({
        success: false,
        message: '账户审核未通过，请联系客服'
      });
    }

    if (member.status === 'DISABLED') {
      return res.status(403).json({
        success: false,
        message: '账户已被禁用，请联系客服'
      });
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, member.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: '邮箱或密码错误'
      });
    }

    // 生成令牌
    const token = generateMemberToken(member.id, member.role);

    // 更新最后登录时间
    await prisma.member.update({
      where: { id: member.id },
      data: { lastLoginAt: new Date() }
    });

    res.json({
      success: true,
      message: '登录成功',
      data: {
        token,
        member: {
          id: member.id,
          email: member.email,
          companyName: member.companyName,
          contactName: member.contactName,
          role: member.role,
          status: member.status
        }
      }
    });
  } catch (error) {
    console.error('Member login error:', error);
    res.status(500).json({
      success: false,
      message: '登录失败，请稍后重试'
    });
  }
};

/**
 * 获取当前会员信息
 * GET /api/member/profile
 */
const getProfile = async (req, res) => {
  try {
    const memberId = req.member.memberId;

    const member = await prisma.member.findUnique({
      where: { id: memberId },
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
        createdAt: true
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
    console.error('Get member profile error:', error);
    res.status(500).json({
      success: false,
      message: '获取会员信息失败'
    });
  }
};

/**
 * 更新会员资料
 * PUT /api/member/profile
 */
const updateProfile = async (req, res) => {
  try {
    const memberId = req.member.memberId;
    const { contactName, phone, position } = req.body;

    const member = await prisma.member.update({
      where: { id: memberId },
      data: {
        contactName: contactName || undefined,
        phone: phone || undefined,
        position: position || undefined
      },
      select: {
        id: true,
        email: true,
        companyName: true,
        contactName: true,
        phone: true,
        position: true,
        role: true,
        status: true,
        updatedAt: true
      }
    });

    res.json({
      success: true,
      message: '资料更新成功',
      data: { member }
    });
  } catch (error) {
    console.error('Update member profile error:', error);
    res.status(500).json({
      success: false,
      message: '更新资料失败'
    });
  }
};

/**
 * 修改密码
 * POST /api/member/auth/change-password
 */
const changePassword = async (req, res) => {
  try {
    const memberId = req.member.memberId;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: '请填写当前密码和新密码'
      });
    }

    // 验证新密码强度
    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: '新密码长度至少为8位'
      });
    }

    const member = await prisma.member.findUnique({
      where: { id: memberId }
    });

    if (!member || !member.password) {
      return res.status(400).json({
        success: false,
        message: '无法修改密码'
      });
    }

    // 验证当前密码
    const isCurrentValid = await bcrypt.compare(currentPassword, member.password);
    if (!isCurrentValid) {
      return res.status(401).json({
        success: false,
        message: '当前密码错误'
      });
    }

    // 更新密码
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);
    await prisma.member.update({
      where: { id: memberId },
      data: { password: hashedNewPassword }
    });

    res.json({
      success: true,
      message: '密码修改成功'
    });
  } catch (error) {
    console.error('Change member password error:', error);
    res.status(500).json({
      success: false,
      message: '修改密码失败'
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  generateMemberToken,
  generateRandomPassword
};
