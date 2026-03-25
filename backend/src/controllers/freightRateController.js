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
      spaceStatus,
      isRecommended,
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

    if (spaceStatus) {
      where.spaceStatus = spaceStatus;
    }

    if (isRecommended !== undefined) {
      where.isRecommended = isRecommended === 'true';
    }

    if (search) {
      where.OR = [
        { originPort: { contains: search } },
        { destinationPort: { contains: search } },
        { carrier: { contains: search } },
        { route: { contains: search } },
        { routeCode: { contains: search } },
        { bookingAgent: { contains: search } }
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
    const data = req.body;

    // 验证必填字段
    if (!data.originPort || !data.destinationPort || !data.validFrom || !data.validTo) {
      return res.status(400).json({
        success: false,
        message: '请填写必填字段：起运港、目的港、有效期开始、有效期结束'
      });
    }

    // 构建创建数据
    const createData = {
      // 基本信息
      route: data.route || null,
      originPort: data.originPort,
      originPortEn: data.originPortEn || null,
      destinationPort: data.destinationPort,
      destinationPortEn: data.destinationPortEn || null,
      viaPort: data.viaPort || null,
      viaPortEn: data.viaPortEn || null,
      portArea: data.portArea || null,

      // 有效期
      validFrom: new Date(data.validFrom),
      validTo: new Date(data.validTo),
      validityType: data.validityType || 'LONG',
      isRecommended: data.isRecommended || false,

      // 船公司
      carrier: data.carrier || null,
      carrierLogo: data.carrierLogo || null,

      // 运价
      price20GP: data.price20GP ? parseFloat(data.price20GP) : null,
      price40GP: data.price40GP ? parseFloat(data.price40GP) : null,
      price40HQ: data.price40HQ ? parseFloat(data.price40HQ) : null,
      price45HQ: data.price45HQ ? parseFloat(data.price45HQ) : null,
      currency: data.currency || 'USD',

      // 成本
      cost20GP: data.cost20GP ? parseFloat(data.cost20GP) : null,
      cost40GP: data.cost40GP ? parseFloat(data.cost40GP) : null,
      cost40HQ: data.cost40HQ ? parseFloat(data.cost40HQ) : null,
      cost45HQ: data.cost45HQ ? parseFloat(data.cost45HQ) : null,
      isAllIn: data.isAllIn || false,

      // 航程
      transitTime: data.transitTime ? parseInt(data.transitTime) : null,
      schedule: data.schedule || null,
      routeCode: data.routeCode || null,

      // 船期
      vesselName: data.vesselName || null,
      voyage: data.voyage || null,
      sailingDate: data.sailingDate ? new Date(data.sailingDate) : null,
      estimatedDeparture: data.estimatedDeparture ? new Date(data.estimatedDeparture) : null,

      // 订舱
      bookingAgent: data.bookingAgent || null,
      bookingLink: data.bookingLink || null,
      spaceStatus: data.spaceStatus || 'AVAILABLE',

      // 文件截止
      docCutoffDay: data.docCutoffDay || null,
      docCutoffTime: data.docCutoffTime || null,

      // 提单
      billOfLadingType: data.billOfLadingType || null,
      shippingTerms: data.shippingTerms || null,
      deliveryGuide: data.deliveryGuide || null,

      // 附加费
      surcharges: data.surcharges ? JSON.stringify(data.surcharges) : null,
      weightLimit: data.weightLimit || null,
      remarks: data.remarks || null,

      // 其他
      priceTrend: data.priceTrend || null,
      contactInfo: data.contactInfo || null,
      receiptGuide: data.receiptGuide || null,

      status: data.status || 'ACTIVE',
      createdBy: req.user.id
    };

    const rate = await prisma.freightRate.create({ data: createData });

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
    const data = req.body;

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

    // 构建更新数据
    const updateData = {};

    // 基本信息
    if (data.route !== undefined) updateData.route = data.route;
    if (data.originPort !== undefined) updateData.originPort = data.originPort;
    if (data.originPortEn !== undefined) updateData.originPortEn = data.originPortEn;
    if (data.destinationPort !== undefined) updateData.destinationPort = data.destinationPort;
    if (data.destinationPortEn !== undefined) updateData.destinationPortEn = data.destinationPortEn;
    if (data.viaPort !== undefined) updateData.viaPort = data.viaPort;
    if (data.viaPortEn !== undefined) updateData.viaPortEn = data.viaPortEn;
    if (data.portArea !== undefined) updateData.portArea = data.portArea;

    // 有效期
    if (data.validFrom !== undefined) updateData.validFrom = new Date(data.validFrom);
    if (data.validTo !== undefined) updateData.validTo = new Date(data.validTo);
    if (data.validityType !== undefined) updateData.validityType = data.validityType;
    if (data.isRecommended !== undefined) updateData.isRecommended = data.isRecommended;

    // 船公司
    if (data.carrier !== undefined) updateData.carrier = data.carrier;
    if (data.carrierLogo !== undefined) updateData.carrierLogo = data.carrierLogo;

    // 运价
    if (data.price20GP !== undefined) updateData.price20GP = data.price20GP ? parseFloat(data.price20GP) : null;
    if (data.price40GP !== undefined) updateData.price40GP = data.price40GP ? parseFloat(data.price40GP) : null;
    if (data.price40HQ !== undefined) updateData.price40HQ = data.price40HQ ? parseFloat(data.price40HQ) : null;
    if (data.price45HQ !== undefined) updateData.price45HQ = data.price45HQ ? parseFloat(data.price45HQ) : null;
    if (data.currency !== undefined) updateData.currency = data.currency;

    // 成本
    if (data.cost20GP !== undefined) updateData.cost20GP = data.cost20GP ? parseFloat(data.cost20GP) : null;
    if (data.cost40GP !== undefined) updateData.cost40GP = data.cost40GP ? parseFloat(data.cost40GP) : null;
    if (data.cost40HQ !== undefined) updateData.cost40HQ = data.cost40HQ ? parseFloat(data.cost40HQ) : null;
    if (data.cost45HQ !== undefined) updateData.cost45HQ = data.cost45HQ ? parseFloat(data.cost45HQ) : null;
    if (data.isAllIn !== undefined) updateData.isAllIn = data.isAllIn;

    // 航程
    if (data.transitTime !== undefined) updateData.transitTime = data.transitTime ? parseInt(data.transitTime) : null;
    if (data.schedule !== undefined) updateData.schedule = data.schedule;
    if (data.routeCode !== undefined) updateData.routeCode = data.routeCode;

    // 船期
    if (data.vesselName !== undefined) updateData.vesselName = data.vesselName;
    if (data.voyage !== undefined) updateData.voyage = data.voyage;
    if (data.sailingDate !== undefined) updateData.sailingDate = data.sailingDate ? new Date(data.sailingDate) : null;
    if (data.estimatedDeparture !== undefined) updateData.estimatedDeparture = data.estimatedDeparture ? new Date(data.estimatedDeparture) : null;

    // 订舱
    if (data.bookingAgent !== undefined) updateData.bookingAgent = data.bookingAgent;
    if (data.bookingLink !== undefined) updateData.bookingLink = data.bookingLink;
    if (data.spaceStatus !== undefined) updateData.spaceStatus = data.spaceStatus;

    // 文件截止
    if (data.docCutoffDay !== undefined) updateData.docCutoffDay = data.docCutoffDay;
    if (data.docCutoffTime !== undefined) updateData.docCutoffTime = data.docCutoffTime;

    // 提单
    if (data.billOfLadingType !== undefined) updateData.billOfLadingType = data.billOfLadingType;
    if (data.shippingTerms !== undefined) updateData.shippingTerms = data.shippingTerms;
    if (data.deliveryGuide !== undefined) updateData.deliveryGuide = data.deliveryGuide;

    // 附加费
    if (data.surcharges !== undefined) updateData.surcharges = data.surcharges ? JSON.stringify(data.surcharges) : null;
    if (data.weightLimit !== undefined) updateData.weightLimit = data.weightLimit;
    if (data.remarks !== undefined) updateData.remarks = data.remarks;

    // 其他
    if (data.priceTrend !== undefined) updateData.priceTrend = data.priceTrend;
    if (data.contactInfo !== undefined) updateData.contactInfo = data.contactInfo;
    if (data.receiptGuide !== undefined) updateData.receiptGuide = data.receiptGuide;
    if (data.status !== undefined) updateData.status = data.status;

    const rate = await prisma.freightRate.update({
      where: { id },
      data: updateData
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

    const existingRate = await prisma.freightRate.findUnique({
      where: { id }
    });

    if (!existingRate) {
      return res.status(404).json({
        success: false,
        message: '运价不存在'
      });
    }

    await prisma.freightRate.delete({ where: { id } });

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

      if (!row.originPort || !row.destinationPort) {
        errors.push({ row: i + 1, message: '起运港和目的港为必填项' });
        continue;
      }

      try {
        const rate = await prisma.freightRate.create({
          data: {
            route: row.route || null,
            originPort: row.originPort,
            originPortEn: row.originPortEn || null,
            destinationPort: row.destinationPort,
            destinationPortEn: row.destinationPortEn || null,
            viaPort: row.viaPort || null,
            viaPortEn: row.viaPortEn || null,
            portArea: row.portArea || null,

            validFrom: row.validFrom ? new Date(row.validFrom) : new Date(),
            validTo: row.validTo ? new Date(row.validTo) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            validityType: row.validityType || 'LONG',
            isRecommended: row.isRecommended || false,

            carrier: row.carrier || null,
            carrierLogo: row.carrierLogo || null,

            price20GP: row.price20GP,
            price40GP: row.price40GP,
            price40HQ: row.price40HQ,
            price45HQ: row.price45HQ,
            currency: row.currency || 'USD',

            cost20GP: row.cost20GP,
            cost40GP: row.cost40GP,
            cost40HQ: row.cost40HQ,
            cost45HQ: row.cost45HQ,
            isAllIn: row.isAllIn || false,

            transitTime: row.transitTime,
            schedule: row.schedule || null,
            routeCode: row.routeCode || null,

            vesselName: row.vesselName || null,
            voyage: row.voyage || null,
            sailingDate: row.sailingDate ? new Date(row.sailingDate) : null,
            estimatedDeparture: row.estimatedDeparture ? new Date(row.estimatedDeparture) : null,

            bookingAgent: row.bookingAgent || null,
            bookingLink: row.bookingLink || null,
            spaceStatus: row.spaceStatus || 'AVAILABLE',

            docCutoffDay: row.docCutoffDay || null,
            docCutoffTime: row.docCutoffTime || null,

            billOfLadingType: row.billOfLadingType || null,
            shippingTerms: row.shippingTerms || null,
            deliveryGuide: row.deliveryGuide || null,

            surcharges: row.surcharges ? JSON.stringify(row.surcharges) : null,
            weightLimit: row.weightLimit || null,
            remarks: row.remarks || null,

            priceTrend: row.priceTrend || null,
            contactInfo: row.contactInfo || null,
            receiptGuide: row.receiptGuide || null,

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
        errors: errors.slice(0, 10)
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
      validTo: { gte: new Date() }
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

    // 处理港口代码查询
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
      orderBy: { validFrom: 'desc' }
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
