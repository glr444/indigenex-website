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
      carrier
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
      where.originPort = { contains: originPort.toUpperCase() };
    }

    if (destinationPort) {
      where.destinationPort = { contains: destinationPort.toUpperCase() };
    }

    if (carrier) {
      where.carrier = { contains: carrier };
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
        portArea: true,
        validFrom: true,
        validTo: true,
        validityType: true,
        isRecommended: true,
        price20GP: true,
        price40GP: true,
        price40HQ: true,
        price45HQ: true,
        currency: true,
        cost20GP: true,
        cost40GP: true,
        cost40HQ: true,
        cost45HQ: true,
        isAllIn: true,
        carrier: true,
        carrierLogo: true,
        transitTime: true,
        schedule: true,
        routeCode: true,
        vesselName: true,
        voyage: true,
        sailingDate: true,
        estimatedDeparture: true,
        bookingAgent: true,
        bookingLink: true,
        spaceStatus: true,
        docCutoffDay: true,
        docCutoffTime: true,
        billOfLadingType: true,
        shippingTerms: true,
        deliveryGuide: true,
        surcharges: true,
        weightLimit: true,
        remarks: true,
        priceTrend: true,
        contactInfo: true,
        receiptGuide: true,
        status: true,
        importBatchId: true,
        createdBy: true,
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
        originPortEn: true,
        destinationPort: true,
        destinationPortEn: true,
        viaPort: true,
        viaPortEn: true,
        portArea: true,
        validFrom: true,
        validTo: true,
        validityType: true,
        isRecommended: true,
        price20GP: true,
        price40GP: true,
        price40HQ: true,
        price45HQ: true,
        currency: true,
        cost20GP: true,
        cost40GP: true,
        cost40HQ: true,
        cost45HQ: true,
        isAllIn: true,
        carrier: true,
        carrierLogo: true,
        transitTime: true,
        schedule: true,
        routeCode: true,
        vesselName: true,
        voyage: true,
        sailingDate: true,
        estimatedDeparture: true,
        bookingAgent: true,
        bookingLink: true,
        spaceStatus: true,
        docCutoffDay: true,
        docCutoffTime: true,
        billOfLadingType: true,
        shippingTerms: true,
        deliveryGuide: true,
        surcharges: true,
        weightLimit: true,
        remarks: true,
        priceTrend: true,
        contactInfo: true,
        receiptGuide: true,
        status: true,
        importBatchId: true,
        createdBy: true,
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
    const body = req.body;

    // 判断是单条还是批量
    const rates = Array.isArray(body) ? body : [body];

    if (rates.length === 0) {
      return res.status(400).json({
        success: false,
        message: '请求体不能为空'
      });
    }

    if (rates.length > 10000) {
      return res.status(400).json({
        success: false,
        message: '单次最多支持10000条运价批量创建'
      });
    }

    const createdRates = [];
    const errors = [];

    // 分批处理配置：每批100条，间隔100ms，控制CPU/内存压力
    const BATCH_SIZE = 100;
    const DELAY_MS = 100;
    const totalBatches = Math.ceil(rates.length / BATCH_SIZE);

    console.log(`[API] 开始批量创建运价，共 ${rates.length} 条，分 ${totalBatches} 批处理`);

    for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
      const start = batchIndex * BATCH_SIZE;
      const end = Math.min(start + BATCH_SIZE, rates.length);
      const batch = rates.slice(start, end);

      // 处理当前批次
      for (let i = 0; i < batch.length; i++) {
        const rateData = batch[i];
        const globalIndex = start + i;

        // 验证必填字段
        if (!rateData.originPort || !rateData.destinationPort) {
          errors.push({ index: globalIndex, message: '起运港和目的港为必填项' });
          continue;
        }

        try {
          const rate = await prisma.freightRate.create({
            data: {
              // 基础信息
              route: rateData.route || null,
              originPort: rateData.originPort.toUpperCase(),
              originPortEn: rateData.originPortEn || null,
              destinationPort: rateData.destinationPort.toUpperCase(),
              destinationPortEn: rateData.destinationPortEn || null,
              viaPort: rateData.viaPort ? rateData.viaPort.toUpperCase() : null,
              viaPortEn: rateData.viaPortEn || null,
              portArea: rateData.portArea || null,

              // 有效期
              validFrom: rateData.validFrom ? new Date(rateData.validFrom) : new Date(),
              validTo: rateData.validTo ? new Date(rateData.validTo) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
              validityType: rateData.validityType || 'LONG',
              isRecommended: rateData.isRecommended === true,

              // 运价 - FCL
              price20GP: rateData.price20GP ? parseFloat(rateData.price20GP) : null,
              price40GP: rateData.price40GP ? parseFloat(rateData.price40GP) : null,
              price40HQ: rateData.price40HQ ? parseFloat(rateData.price40HQ) : null,
              price45HQ: rateData.price45HQ ? parseFloat(rateData.price45HQ) : null,
              currency: rateData.currency || 'USD',

              // 成本价
              cost20GP: rateData.cost20GP ? parseFloat(rateData.cost20GP) : null,
              cost40GP: rateData.cost40GP ? parseFloat(rateData.cost40GP) : null,
              cost40HQ: rateData.cost40HQ ? parseFloat(rateData.cost40HQ) : null,
              cost45HQ: rateData.cost45HQ ? parseFloat(rateData.cost45HQ) : null,
              isAllIn: rateData.isAllIn === true,

              // 船公司
              carrier: rateData.carrier || null,
              carrierLogo: rateData.carrierLogo || null,

              // 航程信息
              transitTime: rateData.transitTime ? parseInt(rateData.transitTime) : null,
              schedule: rateData.schedule || null,
              routeCode: rateData.routeCode || null,

              // 船期信息
              vesselName: rateData.vesselName || null,
              voyage: rateData.voyage || null,
              sailingDate: rateData.sailingDate ? new Date(rateData.sailingDate) : null,
              estimatedDeparture: rateData.estimatedDeparture ? new Date(rateData.estimatedDeparture) : null,

              // 订舱信息
              bookingAgent: rateData.bookingAgent || null,
              bookingLink: rateData.bookingLink || null,
              spaceStatus: rateData.spaceStatus || 'AVAILABLE',

              // 文件截止
              docCutoffDay: rateData.docCutoffDay || null,
              docCutoffTime: rateData.docCutoffTime || null,

              // 提单信息
              billOfLadingType: rateData.billOfLadingType || null,
              shippingTerms: rateData.shippingTerms || null,
              deliveryGuide: rateData.deliveryGuide || null,

              // 附加费和说明
              surcharges: rateData.surcharges ? JSON.stringify(rateData.surcharges) : null,
              weightLimit: rateData.weightLimit || null,
              remarks: rateData.remarks || null,

              // 其他信息
              priceTrend: rateData.priceTrend || null,
              contactInfo: rateData.contactInfo || null,
              receiptGuide: rateData.receiptGuide || null,

              // 系统字段
              status: 'ACTIVE',
              importBatchId: rateData.importBatchId || null,
              createdBy: `api:${req.apiKeyInfo.apiKeyId}`
            }
          });
          createdRates.push(rate);
        } catch (err) {
          errors.push({ index: globalIndex, message: err.message });
        }
      }

      // 每10批输出一次进度日志
      if ((batchIndex + 1) % 10 === 0 || batchIndex === totalBatches - 1) {
        console.log(`[API] 批量创建进度: ${Math.min((batchIndex + 1) * BATCH_SIZE, rates.length)}/${rates.length} 条`);
      }

      // 批次间延迟，控制服务器压力（最后一批不延迟）
      if (batchIndex < totalBatches - 1) {
        await new Promise(resolve => setTimeout(resolve, DELAY_MS));
      }
    }

    console.log(`[API] 批量创建完成：成功 ${createdRates.length} 条，失败 ${errors.length} 条`);

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
        originPortEn: updateData.originPortEn !== undefined ? updateData.originPortEn : undefined,
        destinationPort: updateData.destinationPort !== undefined ? updateData.destinationPort.toUpperCase() : undefined,
        destinationPortEn: updateData.destinationPortEn !== undefined ? updateData.destinationPortEn : undefined,
        viaPort: updateData.viaPort !== undefined ? (updateData.viaPort ? updateData.viaPort.toUpperCase() : null) : undefined,
        viaPortEn: updateData.viaPortEn !== undefined ? updateData.viaPortEn : undefined,
        portArea: updateData.portArea !== undefined ? updateData.portArea : undefined,
        validFrom: updateData.validFrom !== undefined ? new Date(updateData.validFrom) : undefined,
        validTo: updateData.validTo !== undefined ? new Date(updateData.validTo) : undefined,
        validityType: updateData.validityType !== undefined ? updateData.validityType : undefined,
        isRecommended: updateData.isRecommended !== undefined ? updateData.isRecommended : undefined,
        price20GP: updateData.price20GP !== undefined ? (updateData.price20GP ? parseFloat(updateData.price20GP) : null) : undefined,
        price40GP: updateData.price40GP !== undefined ? (updateData.price40GP ? parseFloat(updateData.price40GP) : null) : undefined,
        price40HQ: updateData.price40HQ !== undefined ? (updateData.price40HQ ? parseFloat(updateData.price40HQ) : null) : undefined,
        price45HQ: updateData.price45HQ !== undefined ? (updateData.price45HQ ? parseFloat(updateData.price45HQ) : null) : undefined,
        currency: updateData.currency !== undefined ? updateData.currency : undefined,
        cost20GP: updateData.cost20GP !== undefined ? (updateData.cost20GP ? parseFloat(updateData.cost20GP) : null) : undefined,
        cost40GP: updateData.cost40GP !== undefined ? (updateData.cost40GP ? parseFloat(updateData.cost40GP) : null) : undefined,
        cost40HQ: updateData.cost40HQ !== undefined ? (updateData.cost40HQ ? parseFloat(updateData.cost40HQ) : null) : undefined,
        cost45HQ: updateData.cost45HQ !== undefined ? (updateData.cost45HQ ? parseFloat(updateData.cost45HQ) : null) : undefined,
        isAllIn: updateData.isAllIn !== undefined ? updateData.isAllIn : undefined,
        carrier: updateData.carrier !== undefined ? updateData.carrier : undefined,
        carrierLogo: updateData.carrierLogo !== undefined ? updateData.carrierLogo : undefined,
        transitTime: updateData.transitTime !== undefined ? (updateData.transitTime ? parseInt(updateData.transitTime) : null) : undefined,
        schedule: updateData.schedule !== undefined ? updateData.schedule : undefined,
        routeCode: updateData.routeCode !== undefined ? updateData.routeCode : undefined,
        vesselName: updateData.vesselName !== undefined ? updateData.vesselName : undefined,
        voyage: updateData.voyage !== undefined ? updateData.voyage : undefined,
        sailingDate: updateData.sailingDate !== undefined ? new Date(updateData.sailingDate) : undefined,
        estimatedDeparture: updateData.estimatedDeparture !== undefined ? new Date(updateData.estimatedDeparture) : undefined,
        bookingAgent: updateData.bookingAgent !== undefined ? updateData.bookingAgent : undefined,
        bookingLink: updateData.bookingLink !== undefined ? updateData.bookingLink : undefined,
        spaceStatus: updateData.spaceStatus !== undefined ? updateData.spaceStatus : undefined,
        docCutoffDay: updateData.docCutoffDay !== undefined ? updateData.docCutoffDay : undefined,
        docCutoffTime: updateData.docCutoffTime !== undefined ? updateData.docCutoffTime : undefined,
        billOfLadingType: updateData.billOfLadingType !== undefined ? updateData.billOfLadingType : undefined,
        shippingTerms: updateData.shippingTerms !== undefined ? updateData.shippingTerms : undefined,
        deliveryGuide: updateData.deliveryGuide !== undefined ? updateData.deliveryGuide : undefined,
        surcharges: updateData.surcharges !== undefined ? (updateData.surcharges ? JSON.stringify(updateData.surcharges) : null) : undefined,
        weightLimit: updateData.weightLimit !== undefined ? updateData.weightLimit : undefined,
        remarks: updateData.remarks !== undefined ? updateData.remarks : undefined,
        priceTrend: updateData.priceTrend !== undefined ? updateData.priceTrend : undefined,
        contactInfo: updateData.contactInfo !== undefined ? updateData.contactInfo : undefined,
        receiptGuide: updateData.receiptGuide !== undefined ? updateData.receiptGuide : undefined,
        status: updateData.status !== undefined ? updateData.status : undefined,
        importBatchId: updateData.importBatchId !== undefined ? updateData.importBatchId : undefined
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
