const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * 获取航线列表
 */
const getRoutes = async (req, res) => {
  try {
    const { page = 1, limit = 50, search, isActive } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = {};
    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }
    if (search) {
      where.OR = [
        { code: { contains: search } },
        { nameEn: { contains: search } },
        { nameCn: { contains: search } }
      ];
    }

    const [routes, total] = await Promise.all([
      prisma.route.findMany({
        where,
        skip,
        take,
        orderBy: { updatedAt: 'desc' }
      }),
      prisma.route.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        routes,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get routes error:', error);
    res.status(500).json({ success: false, message: 'Failed to get routes' });
  }
};

/**
 * 获取航线详情
 */
const getRouteById = async (req, res) => {
  try {
    const { id } = req.params;
    const route = await prisma.route.findUnique({
      where: { id },
      include: { ports: true }
    });

    if (!route) {
      return res.status(404).json({ success: false, message: 'Route not found' });
    }

    res.json({ success: true, data: { route } });
  } catch (error) {
    console.error('Get route error:', error);
    res.status(500).json({ success: false, message: 'Failed to get route' });
  }
};

/**
 * 创建航线
 */
const createRoute = async (req, res) => {
  try {
    const { code, nameEn, nameCn, description, regionFrom, regionTo } = req.body;

    if (!code || !nameEn || !nameCn) {
      return res.status(400).json({
        success: false,
        message: 'Code, English name and Chinese name are required'
      });
    }

    const existing = await prisma.route.findUnique({ where: { code } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Route code already exists' });
    }

    const route = await prisma.route.create({
      data: {
        code,
        nameEn,
        nameCn,
        description,
        regionFrom,
        regionTo,
        isActive: true
      }
    });

    res.status(201).json({ success: true, message: 'Route created', data: { route } });
  } catch (error) {
    console.error('Create route error:', error);
    res.status(500).json({ success: false, message: 'Failed to create route' });
  }
};

/**
 * 更新航线
 */
const updateRoute = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, nameEn, nameCn, description, regionFrom, regionTo, isActive } = req.body;

    const existing = await prisma.route.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Route not found' });
    }

    if (code && code !== existing.code) {
      const codeExists = await prisma.route.findUnique({ where: { code } });
      if (codeExists) {
        return res.status(400).json({ success: false, message: 'Route code already exists' });
      }
    }

    const route = await prisma.route.update({
      where: { id },
      data: {
        code: code || undefined,
        nameEn: nameEn !== undefined ? nameEn : undefined,
        nameCn: nameCn !== undefined ? nameCn : undefined,
        description: description !== undefined ? description : undefined,
        regionFrom: regionFrom !== undefined ? regionFrom : undefined,
        regionTo: regionTo !== undefined ? regionTo : undefined,
        isActive: isActive !== undefined ? isActive : undefined
      }
    });

    res.json({ success: true, message: 'Route updated', data: { route } });
  } catch (error) {
    console.error('Update route error:', error);
    res.status(500).json({ success: false, message: 'Failed to update route' });
  }
};

/**
 * 删除航线
 */
const deleteRoute = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.route.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Route not found' });
    }

    await prisma.route.delete({ where: { id } });
    res.json({ success: true, message: 'Route deleted' });
  } catch (error) {
    console.error('Delete route error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete route' });
  }
};

module.exports = {
  getRoutes,
  getRouteById,
  createRoute,
  updateRoute,
  deleteRoute
};
