const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * 获取所有港口列表（用于下拉选择）
 * GET /api/ports
 */
const getPorts = async (req, res) => {
  try {
    const { search, type, region } = req.query;

    const where = { isActive: true };

    if (search) {
      where.OR = [
        { code: { contains: search } },
        { nameEn: { contains: search } },
        { nameCn: { contains: search } }
      ];
    }

    if (region) {
      where.region = region;
    }

    const ports = await prisma.port.findMany({
      where,
      orderBy: [
        { region: 'asc' },
        { nameEn: 'asc' }
      ],
      select: {
        id: true,
        code: true,
        nameEn: true,
        nameCn: true,
        countryCode: true,
        countryName: true,
        region: true
      }
    });

    res.json({
      success: true,
      data: { ports }
    });
  } catch (error) {
    console.error('Get ports error:', error);
    res.status(500).json({
      success: false,
      message: '获取港口列表失败'
    });
  }
};

/**
 * 获取常用港口列表（根据会员偏好排序）
 * GET /api/ports/popular
 */
const getPopularPorts = async (req, res) => {
  try {
    const { type = 'ORIGIN' } = req.query;
    const memberId = req.user?.id; // 如果有登录会员

    let preferredPortCodes = [];
    let preferredPorts = [];
    let otherPorts = [];

    // 如果有会员ID，先获取会员偏好的港口
    if (memberId) {
      const prefs = await prisma.memberPortPreference.findMany({
        where: {
          memberId,
          portType: type
        },
        orderBy: { queryCount: 'desc' },
        take: 10
      });
      preferredPortCodes = prefs.map(p => p.portCode);
    }

    // 获取所有活跃的港口
    const allPorts = await prisma.port.findMany({
      where: { isActive: true },
      select: {
        id: true,
        code: true,
        nameEn: true,
        nameCn: true,
        countryCode: true,
        countryName: true,
        region: true
      }
    });

    // 分离偏好港口和其他港口
    if (preferredPortCodes.length > 0) {
      // 按照偏好顺序排序
      preferredPorts = preferredPortCodes
        .map(code => allPorts.find(p => p.code === code))
        .filter(Boolean);

      // 其他港口（排除已偏好的）
      otherPorts = allPorts.filter(p => !preferredPortCodes.includes(p.code));
    } else {
      otherPorts = allPorts;
    }

    // 其他港口按区域和名称排序
    otherPorts.sort((a, b) => {
      if (a.region !== b.region) {
        return (a.region || '').localeCompare(b.region || '');
      }
      return (a.nameEn || '').localeCompare(b.nameEn || '');
    });

    res.json({
      success: true,
      data: {
        preferred: preferredPorts,
        all: [...preferredPorts, ...otherPorts],
        hasPreferences: preferredPortCodes.length > 0
      }
    });
  } catch (error) {
    console.error('Get popular ports error:', error);
    res.status(500).json({
      success: false,
      message: '获取常用港口失败'
    });
  }
};

/**
 * 记录会员港口偏好
 * POST /api/ports/:code/preference
 */
const recordPortPreference = async (req, res) => {
  try {
    const { code } = req.params;
    const { type = 'ORIGIN' } = req.body;
    const memberId = req.user?.id;

    if (!memberId) {
      return res.json({ success: true }); // 未登录不记录
    }

    // 查找或创建偏好记录
    const existing = await prisma.memberPortPreference.findFirst({
      where: {
        memberId,
        portCode: code,
        portType: type
      }
    });

    if (existing) {
      // 更新查询次数和时间
      await prisma.memberPortPreference.update({
        where: { id: existing.id },
        data: {
          queryCount: { increment: 1 },
          lastQueryAt: new Date()
        }
      });
    } else {
      // 创建新记录
      await prisma.memberPortPreference.create({
        data: {
          memberId,
          portCode: code,
          portType: type,
          queryCount: 1,
          lastQueryAt: new Date()
        }
      });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Record port preference error:', error);
    // 不返回错误，不影响主流程
    res.json({ success: true });
  }
};

/**
 * 搜索港口（用于自动完成）
 * GET /api/ports/search?q=xxx
 */
const searchPorts = async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q || q.length < 1) {
      return res.json({
        success: true,
        data: { ports: [] }
      });
    }

    const ports = await prisma.port.findMany({
      where: {
        isActive: true,
        OR: [
          { code: { contains: q } },
          { nameEn: { contains: q } },
          { nameCn: { contains: q } }
        ]
      },
      take: parseInt(limit),
      orderBy: [
        { region: 'asc' },
        { nameEn: 'asc' }
      ],
      select: {
        id: true,
        code: true,
        nameEn: true,
        nameCn: true,
        countryCode: true,
        countryName: true,
        region: true
      }
    });

    res.json({
      success: true,
      data: { ports }
    });
  } catch (error) {
    console.error('Search ports error:', error);
    res.status(500).json({
      success: false,
      message: '搜索港口失败'
    });
  }
};

module.exports = {
  getPorts,
  getPopularPorts,
  recordPortPreference,
  searchPorts
};
