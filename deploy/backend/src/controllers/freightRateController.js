const { PrismaClient } = require('@prisma/client');
const { parseExcel, parseFreightRateExcel } = require('../utils/excelParser');

const prisma = new PrismaClient();

/**
 * 获取运价列表
 * GET /api/admin/freight-rates
 */
const getFreightRates = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      originPort,
      destinationPort,
      carrier,
      status = 'ACTIVE',
      search
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // 构建查询条件
    const where = {};

    if (originPort) {
      where.originPort = { contains: originPort };
    }

    if (destinationPort) {
      where.destinationPort = { contains: destinationPort };
    }

    if (carrier) {
      where.carrier = { contains: carrier };
    }

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { originPort: { contains: search } },
        { destinationPort: { contains: search } },
        { carrier: { contains: search } },
        { route: { contains: search } }
      ];
    }

    // 查询总数
    const total = await prisma.freightRate.count({ where });

    // 查询数据
    const rates = await prisma.freightRate.findMany({
      where,
      skip,
      take,
      orderBy: { updatedAt: 'desc' }
    });

    res.json({
      success: true,
      data: {
        rates,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get freight rates error:', error);
    res.status(500).json({
      success: false,
      message: '获取运价列表失败'
    });
  }
};

/**
 * 获取运价详情
 * GET /api/admin/freight-rates/:id
 */
const getFreightRateById = async (req, res) => {
  try {
    const { id } = req.params;

    const rate = await prisma.freightRate.findUnique({
      where: { id }
    });

    if (!rate) {
      return res.status(404).json({
        success: false,
        message: '运价不存在'
      });
    }

    res.json({
      success: true,
      data: { rate }
    });
  } catch (error) {
    console.error('Get freight rate error:', error);
    res.status(500).json({
      success: false,
      message: '获取运价详情失败'
    });
  }
};

/**
 * 创建运价
 * POST /api/admin/freight-rates
 */
const createFreightRate = async (req, res) => {
  try {
    const {
      route,
      originPort,
      originPortEn,
      destinationPort,
      destinationPortEn,
      viaPort,
      viaPortEn,
      transportMode = 'SEA',
      price20GP,
      price40GP,
      price40HQ,
      price45HQ,
      priceLCL,
      currency = 'USD',
      surcharges,
      carrier,
      carrierLogo,
      transitTime,
      schedule,
      spaceStatus,
      validFrom,
      validTo,
      cutOffDate,
      estimatedDeparture,
      remarks,
      status = 'ACTIVE'
    } = req.body;

    // 验证必填字段
    if (!originPort || !destinationPort || !validFrom || !validTo) {
      return res.status(400).json({
        success: false,
        message: '请填写必填字段：起运港、目的港、生效日期、到期日期'
      });
    }

    const rate = await prisma.freightRate.create({
      data: {
        route,
        originPort,
        originPortEn,
        destinationPort,
        destinationPortEn,
        viaPort,
        viaPortEn,
        transportMode,
        price20GP: price20GP ? parseFloat(price20GP) : null,
        price40GP: price40GP ? parseFloat(price40GP) : null,
        price40HQ: price40HQ ? parseFloat(price40HQ) : null,
        price45HQ: price45HQ ? parseFloat(price45HQ) : null,
        priceLCL: priceLCL ? parseFloat(priceLCL) : null,
        currency,
        surcharges: surcharges ? JSON.stringify(surcharges) : null,
        carrier,
        carrierLogo,
        transitTime: transitTime ? parseInt(transitTime) : null,
        schedule,
        spaceStatus: spaceStatus || 'AVAILABLE',
        validFrom: new Date(validFrom),
        validTo: new Date(validTo),
        cutOffDate: cutOffDate ? new Date(cutOffDate) : null,
        estimatedDeparture: estimatedDeparture ? new Date(estimatedDeparture) : null,
        remarks,
        status,
        createdBy: req.user.id
      }
    });

    res.status(201).json({
      success: true,
      message: '运价创建成功',
      data: { rate }
    });
  } catch (error) {
    console.error('Create freight rate error:', error);
    res.status(500).json({
      success: false,
      message: '创建运价失败'
    });
  }
};

/**
 * 更新运价
 * PUT /api/admin/freight-rates/:id
 */
const updateFreightRate = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      route,
      originPort,
      originPortEn,
      destinationPort,
      destinationPortEn,
      viaPort,
      viaPortEn,
      transportMode,
      price20GP,
      price40GP,
      price40HQ,
      price45HQ,
      priceLCL,
      currency,
      surcharges,
      carrier,
      carrierLogo,
      transitTime,
      schedule,
      spaceStatus,
      validFrom,
      validTo,
      cutOffDate,
      estimatedDeparture,
      remarks,
      status
    } = req.body;

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
        route: route !== undefined ? route : undefined,
        originPort: originPort !== undefined ? originPort : undefined,
        originPortEn: originPortEn !== undefined ? originPortEn : undefined,
        destinationPort: destinationPort !== undefined ? destinationPort : undefined,
        destinationPortEn: destinationPortEn !== undefined ? destinationPortEn : undefined,
        viaPort: viaPort !== undefined ? viaPort : undefined,
        viaPortEn: viaPortEn !== undefined ? viaPortEn : undefined,
        transportMode: transportMode !== undefined ? transportMode : undefined,
        price20GP: price20GP !== undefined ? (price20GP ? parseFloat(price20GP) : null) : undefined,
        price40GP: price40GP !== undefined ? (price40GP ? parseFloat(price40GP) : null) : undefined,
        price40HQ: price40HQ !== undefined ? (price40HQ ? parseFloat(price40HQ) : null) : undefined,
        price45HQ: price45HQ !== undefined ? (price45HQ ? parseFloat(price45HQ) : null) : undefined,
        priceLCL: priceLCL !== undefined ? (priceLCL ? parseFloat(priceLCL) : null) : undefined,
        currency: currency !== undefined ? currency : undefined,
        surcharges: surcharges !== undefined ? (surcharges ? JSON.stringify(surcharges) : null) : undefined,
        carrier: carrier !== undefined ? carrier : undefined,
        carrierLogo: carrierLogo !== undefined ? carrierLogo : undefined,
        transitTime: transitTime !== undefined ? (transitTime ? parseInt(transitTime) : null) : undefined,
        schedule: schedule !== undefined ? schedule : undefined,
        spaceStatus: spaceStatus !== undefined ? spaceStatus : undefined,
        validFrom: validFrom !== undefined ? new Date(validFrom) : undefined,
        validTo: validTo !== undefined ? new Date(validTo) : undefined,
        cutOffDate: cutOffDate !== undefined ? (cutOffDate ? new Date(cutOffDate) : null) : undefined,
        estimatedDeparture: estimatedDeparture !== undefined ? (estimatedDeparture ? new Date(estimatedDeparture) : null) : undefined,
        remarks: remarks !== undefined ? remarks : undefined,
        status: status !== undefined ? status : undefined
      }
    });

    res.json({
      success: true,
      message: '运价更新成功',
      data: { rate }
    });
  } catch (error) {
    console.error('Update freight rate error:', error);
    res.status(500).json({
      success: false,
      message: '更新运价失败'
    });
  }
};

/**
 * 删除运价
 * DELETE /api/admin/freight-rates/:id
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
    console.error('Delete freight rate error:', error);
    res.status(500).json({
      success: false,
      message: '删除运价失败'
    });
  }
};

/**
 * 批量导入运价
 * POST /api/admin/freight-rates/import
 */
const importFreightRates = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: '请上传Excel文件'
      });
    }

    // 解析Excel
    const rawData = parseExcel(req.file.buffer);

    if (rawData.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Excel文件为空或格式错误'
      });
    }

    // 转换为标准格式
    const parsedData = parseFreightRateExcel(rawData);

    // 生成批次ID
    const importBatchId = `BATCH_${Date.now()}`;

    // 批量创建
    const createdRates = [];
    const errors = [];

    for (let i = 0; i < parsedData.length; i++) {
      const row = parsedData[i];

      // 验证必填字段
      if (!row.originPort || !row.destinationPort) {
        errors.push({ row: i + 1, message: '起运港和目的港为必填项' });
        continue;
      }

      try {
        const rate = await prisma.freightRate.create({
          data: {
            route: row.route || null,
            originPort: row.originPort,
            destinationPort: row.destinationPort,
            viaPort: row.viaPort || null,
            transportMode: row.transportMode || 'SEA',
            price20GP: row.price20GP,
            price40GP: row.price40GP,
            price40HQ: row.price40HQ,
            price45HQ: row.price45HQ,
            priceLCL: row.priceLCL,
            currency: row.currency || 'USD',
            surcharges: row.surcharges ? JSON.stringify(row.surcharges) : null,
            carrier: row.carrier || null,
            transitTime: row.transitTime,
            schedule: row.schedule || null,
            validFrom: row.validFrom ? new Date(row.validFrom) : new Date(),
            validTo: row.validTo ? new Date(row.validTo) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            remarks: row.remarks || null,
            status: 'ACTIVE',
            importBatchId,
            createdBy: req.user.id
          }
        });
        createdRates.push(rate);
      } catch (err) {
        errors.push({ row: i + 1, message: err.message });
      }
    }

    res.json({
      success: true,
      message: `导入完成：成功 ${createdRates.length} 条，失败 ${errors.length} 条`,
      data: {
        importBatchId,
        total: parsedData.length,
        success: createdRates.length,
        failed: errors.length,
        errors: errors.slice(0, 10) // 只返回前10个错误
      }
    });
  } catch (error) {
    console.error('Import freight rates error:', error);
    res.status(500).json({
      success: false,
      message: '导入运价失败：' + error.message
    });
  }
};

/**
 * 获取公开的运价列表（供客户查询）
 * GET /api/freight-rates
 */
const getPublicFreightRates = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      originPort,
      destinationPort,
      originPortCode,
      destinationPortCode,
      carrier,
      spaceStatus,
      search
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // 构建查询条件 - 只查询有效的运价
    const where = {
      status: 'ACTIVE',
      validTo: {
        gte: new Date()
      }
    };

    // 全局搜索
    if (search) {
      where.OR = [
        { originPort: { contains: search } },
        { originPortEn: { contains: search } },
        { destinationPort: { contains: search } },
        { destinationPortEn: { contains: search } },
        { carrier: { contains: search } },
        { route: { contains: search } },
        { viaPort: { contains: search } },
        { viaPortEn: { contains: search } }
      ];
    }

    // 处理港口代码查询 - 先查找港口名称
    let originPortNames = [];
    let destPortNames = [];

    if (originPortCode) {
      const originPortData = await prisma.port.findUnique({
        where: { code: originPortCode },
        select: { nameEn: true, nameCn: true }
      });
      if (originPortData) {
        originPortNames = [originPortData.nameEn, originPortData.nameCn].filter(Boolean);
      }
    }

    if (destinationPortCode) {
      const destPortData = await prisma.port.findUnique({
        where: { code: destinationPortCode },
        select: { nameEn: true, nameCn: true }
      });
      if (destPortData) {
        destPortNames = [destPortData.nameEn, destPortData.nameCn].filter(Boolean);
      }
    }

    // 处理起运港查询
    if (originPort || originPortNames.length > 0) {
      const allOriginNames = [...(originPort ? [originPort] : []), ...originPortNames];
      where.AND = where.AND || [];
      where.AND.push({
        OR: allOriginNames.flatMap(name => [
          { originPort: { contains: name } },
          { originPortEn: { contains: name } }
        ])
      });
    }

    // 处理目的港查询
    if (destinationPort || destPortNames.length > 0) {
      const allDestNames = [...(destinationPort ? [destinationPort] : []), ...destPortNames];
      where.AND = where.AND || [];
      where.AND.push({
        OR: allDestNames.flatMap(name => [
          { destinationPort: { contains: name } },
          { destinationPortEn: { contains: name } }
        ])
      });
    }

    if (carrier) {
      where.carrier = { contains: carrier };
    }

    if (spaceStatus) {
      where.spaceStatus = spaceStatus;
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
        originPortEn: true,
        destinationPort: true,
        destinationPortEn: true,
        viaPort: true,
        viaPortEn: true,
        transportMode: true,
        price20GP: true,
        price40GP: true,
        price40HQ: true,
        price45HQ: true,
        priceLCL: true,
        currency: true,
        surcharges: true,
        carrier: true,
        carrierLogo: true,
        transitTime: true,
        schedule: true,
        spaceStatus: true,
        validFrom: true,
        validTo: true,
        cutOffDate: true,
        estimatedDeparture: true,
        remarks: true
      }
    });

    res.json({
      success: true,
      data: {
        rates: rates.map(rate => ({
          ...rate,
          surcharges: rate.surcharges ? JSON.parse(rate.surcharges) : null
        })),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get public freight rates error:', error);
    res.status(500).json({
      success: false,
      message: '获取运价列表失败'
    });
  }
};

module.exports = {
  getFreightRates,
  getFreightRateById,
  createFreightRate,
  updateFreightRate,
  deleteFreightRate,
  importFreightRates,
  getPublicFreightRates
};
