const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * 获取所有港口列表（后台管理）
 * GET /api/admin/ports
 */
const getAdminPorts = async (req, res) => {
  try {
    const { search, region, page = 1, limit = 50 } = req.query;

    const where = {};

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

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const [ports, total] = await Promise.all([
      prisma.port.findMany({
        where,
        skip,
        take,
        orderBy: [
          { region: 'asc' },
          { nameEn: 'asc' }
        ]
      }),
      prisma.port.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        ports,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get admin ports error:', error);
    res.status(500).json({
      success: false,
      message: '获取港口列表失败'
    });
  }
};

/**
 * 创建港口
 * POST /api/admin/ports
 */
const createPort = async (req, res) => {
  try {
    const {
      code,
      nameEn,
      nameCn,
      countryCode,
      countryName,
      region
    } = req.body;

    // 验证必填字段
    if (!code || !nameEn || !nameCn) {
      return res.status(400).json({
        success: false,
        message: '请填写必填字段：港口代码、英文名称、中文名称'
      });
    }

    // 检查代码是否已存在
    const existing = await prisma.port.findUnique({
      where: { code: code.toUpperCase() }
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: '港口代码已存在'
      });
    }

    const port = await prisma.port.create({
      data: {
        code: code.toUpperCase(),
        nameEn,
        nameCn,
        countryCode: countryCode?.toUpperCase(),
        countryName,
        region,
        isActive: true
      }
    });

    res.status(201).json({
      success: true,
      message: '港口创建成功',
      data: { port }
    });
  } catch (error) {
    console.error('Create port error:', error);
    res.status(500).json({
      success: false,
      message: '创建港口失败'
    });
  }
};

/**
 * 更新港口
 * PUT /api/admin/ports/:id
 */
const updatePort = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nameEn,
      nameCn,
      countryCode,
      countryName,
      region,
      isActive
    } = req.body;

    const port = await prisma.port.findUnique({ where: { id } });

    if (!port) {
      return res.status(404).json({
        success: false,
        message: '港口不存在'
      });
    }

    const updatedPort = await prisma.port.update({
      where: { id },
      data: {
        nameEn: nameEn !== undefined ? nameEn : undefined,
        nameCn: nameCn !== undefined ? nameCn : undefined,
        countryCode: countryCode !== undefined ? countryCode?.toUpperCase() : undefined,
        countryName: countryName !== undefined ? countryName : undefined,
        region: region !== undefined ? region : undefined,
        isActive: isActive !== undefined ? isActive : undefined
      }
    });

    res.json({
      success: true,
      message: '港口更新成功',
      data: { port: updatedPort }
    });
  } catch (error) {
    console.error('Update port error:', error);
    res.status(500).json({
      success: false,
      message: '更新港口失败'
    });
  }
};

/**
 * 删除港口
 * DELETE /api/admin/ports/:id
 */
const deletePort = async (req, res) => {
  try {
    const { id } = req.params;

    const port = await prisma.port.findUnique({ where: { id } });

    if (!port) {
      return res.status(404).json({
        success: false,
        message: '港口不存在'
      });
    }

    await prisma.port.delete({ where: { id } });

    res.json({
      success: true,
      message: '港口删除成功'
    });
  } catch (error) {
    console.error('Delete port error:', error);
    res.status(500).json({
      success: false,
      message: '删除港口失败'
    });
  }
};

/**
 * 批量导入港口
 * POST /api/admin/ports/import
 */
const importPorts = async (req, res) => {
  try {
    const { ports } = req.body;

    if (!Array.isArray(ports) || ports.length === 0) {
      return res.status(400).json({
        success: false,
        message: '请提供港口数据数组'
      });
    }

    const results = {
      success: 0,
      failed: 0,
      errors: []
    };

    for (const portData of ports) {
      try {
        const { code, nameEn, nameCn, countryCode, countryName, region } = portData;

        if (!code || !nameEn || !nameCn) {
          results.failed++;
          results.errors.push({ code, message: '缺少必填字段' });
          continue;
        }

        await prisma.port.upsert({
          where: { code: code.toUpperCase() },
          update: {
            nameEn,
            nameCn,
            countryCode: countryCode?.toUpperCase(),
            countryName,
            region,
            isActive: true
          },
          create: {
            code: code.toUpperCase(),
            nameEn,
            nameCn,
            countryCode: countryCode?.toUpperCase(),
            countryName,
            region,
            isActive: true
          }
        });

        results.success++;
      } catch (err) {
        results.failed++;
        results.errors.push({ code: portData.code, message: err.message });
      }
    }

    res.json({
      success: true,
      message: `导入完成：成功 ${results.success} 条，失败 ${results.failed} 条`,
      data: results
    });
  } catch (error) {
    console.error('Import ports error:', error);
    res.status(500).json({
      success: false,
      message: '导入港口失败'
    });
  }
};

/**
 * 获取区域列表（用于筛选）
 * GET /api/admin/ports/regions
 */
const getRegions = async (req, res) => {
  try {
    const regions = await prisma.port.findMany({
      select: { region: true },
      distinct: ['region'],
      where: { region: { not: null } }
    });

    res.json({
      success: true,
      data: { regions: regions.map(r => r.region).filter(Boolean) }
    });
  } catch (error) {
    console.error('Get regions error:', error);
    res.status(500).json({
      success: false,
      message: '获取区域列表失败'
    });
  }
};

module.exports = {
  getAdminPorts,
  createPort,
  updatePort,
  deletePort,
  importPorts,
  getRegions
};
