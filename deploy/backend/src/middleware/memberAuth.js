const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const MEMBER_JWT_SECRET = process.env.MEMBER_JWT_SECRET || process.env.JWT_SECRET || 'fallback-secret';

/**
 * 会员JWT认证中间件
 * 验证请求中的 Bearer Token
 */
const authenticateMember = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: '未提供认证令牌'
      });
    }

    const token = authHeader.substring(7);

    let decoded;
    try {
      decoded = jwt.verify(token, MEMBER_JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: '认证令牌无效或已过期'
      });
    }

    // 验证令牌类型
    if (decoded.type !== 'member') {
      return res.status(401).json({
        success: false,
        message: '无效的认证令牌类型'
      });
    }

    // 验证会员是否存在且状态正常
    const member = await prisma.member.findUnique({
      where: { id: decoded.memberId }
    });

    if (!member) {
      return res.status(401).json({
        success: false,
        message: '会员不存在'
      });
    }

    if (member.status !== 'APPROVED') {
      return res.status(403).json({
        success: false,
        message: '会员账户未激活或被禁用'
      });
    }

    // 将会员信息附加到请求对象
    req.member = {
      memberId: decoded.memberId,
      role: decoded.role
    };

    next();
  } catch (error) {
    console.error('Member authentication error:', error);
    res.status(500).json({
      success: false,
      message: '认证失败'
    });
  }
};

/**
 * 可选的会员认证
 * 如果提供了token则验证，否则继续执行
 */
const optionalAuthenticateMember = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7);

    try {
      const decoded = jwt.verify(token, MEMBER_JWT_SECRET);

      if (decoded.type === 'member') {
        const member = await prisma.member.findUnique({
          where: { id: decoded.memberId }
        });

        if (member && member.status === 'APPROVED') {
          req.member = {
            memberId: decoded.memberId,
            role: decoded.role
          };
        }
      }
    } catch (err) {
      // 忽略验证错误，继续执行
    }

    next();
  } catch (error) {
    next();
  }
};

module.exports = {
  authenticateMember,
  optionalAuthenticateMember
};
