const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * API Key认证中间件
 * 从请求头中读取 X-API-Key 进行认证
 */
const authenticateApiKey = async (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'];

    if (!apiKey) {
      return res.status(401).json({
        success: false,
        message: '未提供API Key，请在请求头中添加 X-API-Key'
      });
    }

    // 查询API Key
    const keyRecord = await prisma.apiKey.findUnique({
      where: { key: apiKey },
      include: {
        member: true
      }
    });

    if (!keyRecord) {
      return res.status(401).json({
        success: false,
        message: '无效的API Key'
      });
    }

    // 检查是否激活
    if (!keyRecord.isActive) {
      return res.status(401).json({
        success: false,
        message: 'API Key已被禁用'
      });
    }

    // 检查是否过期
    if (keyRecord.expiresAt && new Date() > new Date(keyRecord.expiresAt)) {
      return res.status(401).json({
        success: false,
        message: 'API Key已过期'
      });
    }

    // 检查会员状态
    if (keyRecord.member.status !== 'APPROVED') {
      return res.status(403).json({
        success: false,
        message: '会员账户未激活或被禁用'
      });
    }

    // 更新最后使用时间
    await prisma.apiKey.update({
      where: { id: keyRecord.id },
      data: { lastUsedAt: new Date() }
    });

    // 将会员信息和权限附加到请求对象
    req.member = {
      memberId: keyRecord.memberId,
      role: keyRecord.member.role,
      apiKeyId: keyRecord.id
    };

    req.apiKeyPermissions = keyRecord.permissions ? JSON.parse(keyRecord.permissions) : null;

    next();
  } catch (error) {
    console.error('API Key authentication error:', error);
    res.status(500).json({
      success: false,
      message: '认证失败'
    });
  }
};

/**
 * 检查API Key权限
 * @param {string} permission - 所需权限
 */
const requirePermission = (permission) => {
  return (req, res, next) => {
    const permissions = req.apiKeyPermissions;

    // 如果没有设置权限限制，允许访问
    if (!permissions || permissions.length === 0) {
      return next();
    }

    // 检查是否有所需权限
    if (!permissions.includes(permission) && !permissions.includes('*')) {
      return res.status(403).json({
        success: false,
        message: `权限不足，需要: ${permission}`
      });
    }

    next();
  };
};

module.exports = {
  authenticateApiKey,
  requirePermission
};
