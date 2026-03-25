const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * 获取船公司列表
 */
const getCarriers = async (req, res) => {
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
        { name: { contains: search } },
        { nameEn: { contains: search } }
      ];
    }

    const [carriers, total] = await Promise.all([
      prisma.carrier.findMany({
        where,
        skip,
        take,
        orderBy: { updatedAt: 'desc' }
      }),
      prisma.carrier.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        carriers,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get carriers error:', error);
    res.status(500).json({ success: false, message: 'Failed to get carriers' });
  }
};

/**
 * 获取船公司详情
 */
const getCarrierById = async (req, res) => {
  try {
    const { id } = req.params;
    const carrier = await prisma.carrier.findUnique({ where: { id } });

    if (!carrier) {
      return res.status(404).json({ success: false, message: 'Carrier not found' });
    }

    res.json({ success: true, data: { carrier } });
  } catch (error) {
    console.error('Get carrier error:', error);
    res.status(500).json({ success: false, message: 'Failed to get carrier' });
  }
};

/**
 * 创建船公司
 */
const createCarrier = async (req, res) => {
  try {
    const { code, name, nameEn, logo, website, contactInfo } = req.body;

    if (!code || !name) {
      return res.status(400).json({
        success: false,
        message: 'Code and name are required'
      });
    }

    const existing = await prisma.carrier.findUnique({ where: { code } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Carrier code already exists' });
    }

    const carrier = await prisma.carrier.create({
      data: {
        code,
        name,
        nameEn,
        logo,
        website,
        contactInfo,
        isActive: true
      }
    });

    res.status(201).json({ success: true, message: 'Carrier created', data: { carrier } });
  } catch (error) {
    console.error('Create carrier error:', error);
    res.status(500).json({ success: false, message: 'Failed to create carrier' });
  }
};

/**
 * 更新船公司
 */
const updateCarrier = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, name, nameEn, logo, website, contactInfo, isActive } = req.body;

    const existing = await prisma.carrier.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Carrier not found' });
    }

    if (code && code !== existing.code) {
      const codeExists = await prisma.carrier.findUnique({ where: { code } });
      if (codeExists) {
        return res.status(400).json({ success: false, message: 'Carrier code already exists' });
      }
    }

    const carrier = await prisma.carrier.update({
      where: { id },
      data: {
        code: code || undefined,
        name: name !== undefined ? name : undefined,
        nameEn: nameEn !== undefined ? nameEn : undefined,
        logo: logo !== undefined ? logo : undefined,
        website: website !== undefined ? website : undefined,
        contactInfo: contactInfo !== undefined ? contactInfo : undefined,
        isActive: isActive !== undefined ? isActive : undefined
      }
    });

    res.json({ success: true, message: 'Carrier updated', data: { carrier } });
  } catch (error) {
    console.error('Update carrier error:', error);
    res.status(500).json({ success: false, message: 'Failed to update carrier' });
  }
};

/**
 * 删除船公司
 */
const deleteCarrier = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.carrier.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Carrier not found' });
    }

    await prisma.carrier.delete({ where: { id } });
    res.json({ success: true, message: 'Carrier deleted' });
  } catch (error) {
    console.error('Delete carrier error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete carrier' });
  }
};

module.exports = {
  getCarriers,
  getCarrierById,
  createCarrier,
  updateCarrier,
  deleteCarrier
};
