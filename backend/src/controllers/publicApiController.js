const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * 对外API - 查询运价列表
 * GET /api/v1/freight-rates
 * 认证方式: X-API-Key Header
 */
const getFreightRates = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      originPort,
      destinationPort,
      carrier,
      transportMode
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // 构建查询条件
    const where = {
      status: 'ACTIVE',
      validTo: {
        gte: new Date()
      }
    };

    if (originPort) {
      where.originPort = { contains: originPort.toUpperCase(), mode: 'insensitive' };
    }

    if (destinationPort) {
      where.destinationPort = { contains: destinationPort.toUpperCase(), mode: 'insensitive' };
    }

    if (carrier) {
      where.carrier = { contains: carrier, mode: 'insensitive' };
    }

    if (transportMode) {
      where.transportMode = transportMode.toUpperCase();
    }

    // 查询总数
    const total = await prisma.freightRate.count({ where });

    // 查询数据
    const rates = await prisma.freightRate.findMany({
      where,
      skip,
      take,
      orderBy: { validFrom: 'desc' },
      select: {
        id: true,
        route: true,
        originPort: true,
        destinationPort: true,
        viaPort: true,
        transportMode: true,
        price20GP: true,
        price40GP: true,
        price40HQ: true,
        price45HQ: true,
        priceLCL: true,
        currency: true,
        surcharges: true,
        carrier: true,
        transitTime: true,
        schedule: true,
        validFrom: true,
        validTo: true,
        remarks: true,
        createdAt: true,
        updatedAt: true
      }
    });

    // 格式化响应
    const formattedRates = rates.map(rate => ({
      ...rate,
      surcharges: rate.surcharges ? JSON.parse(rate.surcharges) : null
    }));

    res.json({
      success: true,
      data: {
        rates: formattedRates,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Public API get freight rates error:', error);
    res.status(500).json({
      success: false,
      message: '获取运价列表失败'
    });
  }
};

/**
 * 对外API - 获取运价详情
 * GET /api/v1/freight-rates/:id
 */
const getFreightRateById = async (req, res) => {
  try {
    const { id } = req.params;

    const rate = await prisma.freightRate.findUnique({
      where: { id },
      select: {
        id: true,
        route: true,
        originPort: true,
        destinationPort: true,
        viaPort: true,
        transportMode: true,
        price20GP: true,
        price40GP: true,
        price40HQ: true,
        price45HQ: true,
        priceLCL: true,
        currency: true,
        surcharges: true,
        carrier: true,
        transitTime: true,
        schedule: true,
        validFrom: true,
        validTo: true,
        remarks: true,
        status: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!rate) {
      return res.status(404).json({
        success: false,
        message: '运价不存在'
      });
    }

    res.json({
      success: true,
      data: {
        rate: {
          ...rate,
          surcharges: rate.surcharges ? JSON.parse(rate.surcharges) : null
        }
      }
    });
  } catch (error) {
    console.error('Public API get freight rate error:', error);
    res.status(500).json({
      success: false,
      message: '获取运价详情失败'
    });
  }
};

/**
 * 对外API - 创建运价
 * POST /api/v1/freight-rates
 * 支持单条或批量创建
 */
const createFreightRate = async (req, res) => {
  try {
    const { member } = req;
    const body = req.body;

    // 判断是单条还是批量
    const rates = Array.isArray(body) ? body : [body];

    if (rates.length === 0) {
      return res.status(400).json({
        success: false,
        message: '请求体不能为空'
      });
    }

    if (rates.length > 100) {
      return res.status(400).json({
        success: false,
        message: '单次最多支持100条运价批量创建'
      });
    }

    const createdRates = [];
    const errors = [];

    for (let i = 0; i < rates.length; i++) {
      const rateData = rates[i];

      // 验证必填字段
      if (!rateData.originPort || !rateData.destinationPort) {
        errors.push({ index: i, message: '起运港和目的港为必填项' });
        continue;
      }

      try {
        const rate = await prisma.freightRate.create({
          data: {
            route: rateData.route || null,
            originPort: rateData.originPort.toUpperCase(),
            destinationPort: rateData.destinationPort.toUpperCase(),
            viaPort: rateData.viaPort ? rateData.viaPort.toUpperCase() : null,
            transportMode: rateData.transportMode || 'SEA',
            price20GP: rateData.price20GP ? parseFloat(rateData.price20GP) : null,
            price40GP: rateData.price40GP ? parseFloat(rateData.price40GP) : null,
            price40HQ: rateData.price40HQ ? parseFloat(rateData.price40HQ) : null,
            price45HQ: rateData.price45HQ ? parseFloat(rateData.price45HQ) : null,
            priceLCL: rateData.priceLCL ? parseFloat(rateData.priceLCL) : null,
            currency: rateData.currency || 'USD',
            surcharges: rateData.surcharges ? JSON.stringify(rateData.surcharges) : null,
            carrier: rateData.carrier || null,
            transitTime: rateData.transitTime ? parseInt(rateData.transitTime) : null,
            schedule: rateData.schedule || null,
            validFrom: rateData.validFrom ? new Date(rateData.validFrom) : new Date(),
            validTo: rateData.validTo ? new Date(rateData.validTo) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            remarks: rateData.remarks || null,
            status: 'ACTIVE',
            createdBy: `api:${member.memberId}`
          }
        });
        createdRates.push(rate);
      } catch (err) {
        errors.push({ index: i, message: err.message });
      }
    }

    res.status(201).json({
      success: true,
      message: `创建完成：成功 ${createdRates.length} 条，失败 ${errors.length} 条`,
      data: {
        total: rates.length,
        success: createdRates.length,
        failed: errors.length,
        rates: createdRates,
        errors: errors.slice(0, 10)
      }
    });
  } catch (error) {
    console.error('Public API create freight rate error:', error);
    res.status(500).json({
      success: false,
      message: '创建运价失败'
    });
  }
};

/**
 * 对外API - 更新运价
 * PUT /api/v1/freight-rates/:id
 */
const updateFreightRate = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // 检查运价是否存在
    const existingRate = await prisma.freightRate.findUnique({
      where: { id }
    });

    if (!existingRate) {
      return res.status(404).json({
        success: false,
        message: '运价不存在'
      });
    }

    const rate = await prisma.freightRate.update({
      where: { id },
      data: {
        route: updateData.route !== undefined ? updateData.route : undefined,
        originPort: updateData.originPort !== undefined ? updateData.originPort.toUpperCase() : undefined,
        destinationPort: updateData.destinationPort !== undefined ? updateData.destinationPort.toUpperCase() : undefined,
        viaPort: updateData.viaPort !== undefined ? (updateData.viaPort ? updateData.viaPort.toUpperCase() : null) : undefined,
        transportMode: updateData.transportMode !== undefined ? updateData.transportMode : undefined,
        price20GP: updateData.price20GP !== undefined ? (updateData.price20GP ? parseFloat(updateData.price20GP) : null) : undefined,
        price40GP: updateData.price40GP !== undefined ? (updateData.price40GP ? parseFloat(updateData.price40GP) : null) : undefined,
        price40HQ: updateData.price40HQ !== undefined ? (updateData.price40HQ ? parseFloat(updateData.price40HQ) : null) : undefined,
        price45HQ: updateData.price45HQ !== undefined ? (updateData.price45HQ ? parseFloat(updateData.price45HQ) : null) : undefined,
        priceLCL: updateData.priceLCL !== undefined ? (updateData.priceLCL ? parseFloat(updateData.priceLCL) : null) : undefined,
        currency: updateData.currency !== undefined ? updateData.currency : undefined,
        surcharges: updateData.surcharges !== undefined ? (updateData.surcharges ? JSON.stringify(updateData.surcharges) : null) : undefined,
        carrier: updateData.carrier !== undefined ? updateData.carrier : undefined,
        transitTime: updateData.transitTime !== undefined ? (updateData.transitTime ? parseInt(updateData.transitTime) : null) : undefined,
        schedule: updateData.schedule !== undefined ? updateData.schedule : undefined,
        validFrom: updateData.validFrom !== undefined ? new Date(updateData.validFrom) : undefined,
        validTo: updateData.validTo !== undefined ? new Date(updateData.validTo) : undefined,
        remarks: updateData.remarks !== undefined ? updateData.remarks : undefined,
        status: updateData.status !== undefined ? updateData.status : undefined
      }
    });

    res.json({
      success: true,
      message: '运价更新成功',
      data: { rate }
    });
  } catch (error) {
    console.error('Public API update freight rate error:', error);
    res.status(500).json({
      success: false,
      message: '更新运价失败'
    });
  }
};

/**
 * 对外API - 删除运价
 * DELETE /api/v1/freight-rates/:id
 */
const deleteFreightRate = async (req, res) => {
  try {
    const { id } = req.params;

    // 检查运价是否存在
    const existingRate = await prisma.freightRate.findUnique({
      where: { id }
    });

    if (!existingRate) {
      return res.status(404).json({
        success: false,
        message: '运价不存在'
      });
    }

    await prisma.freightRate.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: '运价删除成功'
    });
  } catch (error) {
    console.error('Public API delete freight rate error:', error);
    res.status(500).json({
      success: false,
      message: '删除运价失败'
    });
  }
};

module.exports = {
  getFreightRates,
  getFreightRateById,
  createFreightRate,
  updateFreightRate,
  deleteFreightRate
};
