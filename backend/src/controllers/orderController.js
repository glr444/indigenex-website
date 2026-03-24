const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const { buildRequestParams } = require('../utils/dzgSign');

const prisma = new PrismaClient();

const DZG_BASE_URL = process.env.DZG_BASE_URL || 'https://api.800jit.com/openplatform-rest/rest/api';
const DZG_APP_KEY = process.env.DZG_APP_KEY || 'ligang';
const DZG_APP_SECRET = process.env.DZG_APP_SECRET || '4b213ca8eda0491da9b13e9deb6f6668';

/**
 * 查询订单列表
 * GET /api/orders
 * 对接大掌柜 portal.sea.order.queryPage v1.0
 */
const getOrders = async (req, res) => {
  const startTime = Date.now();
  let logEntry = null;

  try {
    const memberId = req.member.memberId;
    const {
      page = 1,
      limit = 20,
      startDate,
      endDate,
      orderNo,
      pol,
      pod
    } = req.query;

    // 获取会员信息
    const member = await prisma.member.findUnique({
      where: { id: memberId }
    });

    if (!member || !member.dazhangguiEnterpriseId) {
      return res.status(400).json({
        success: false,
        message: '未绑定大掌柜企业信息，请联系客服'
      });
    }

    // 构建业务参数
    const businessParams = {
      c_company_id: member.dazhangguiEnterpriseId,
      page_no: parseInt(page),
      page_size: parseInt(limit),
    };

    // 可选参数
    if (startDate) {
      businessParams.start_date = startDate;
    }
    if (endDate) {
      businessParams.end_date = endDate;
    }
    if (orderNo) {
      businessParams.order_no = orderNo;
    }
    if (pol) {
      businessParams.pol = pol;
    }
    if (pod) {
      businessParams.pod = pod;
    }

    // 生成签名参数
    const requestParams = buildRequestParams(businessParams, DZG_APP_KEY, DZG_APP_SECRET);

    // 记录请求日志
    logEntry = await prisma.orderQueryLog.create({
      data: {
        memberId,
        dzgRequest: JSON.stringify(requestParams),
        status: 'SUCCESS'
      }
    });

    // 调用大掌柜API
    const response = await axios.post(
      DZG_BASE_URL,
      null,
      {
        params: {
          ...requestParams,
          method: 'portal.sea.order.queryPage',
          version: '1.0'
        },
        timeout: 30000
      }
    );

    const responseTimeMs = Date.now() - startTime;

    // 检查大掌柜返回结果
    if (response.data && response.data.success === false) {
      // 更新日志为失败
      await prisma.orderQueryLog.update({
        where: { id: logEntry.id },
        data: {
          status: 'FAILED',
          errorMessage: response.data.errorMessage || '大掌柜API返回错误',
          responseTimeMs
        }
      });

      return res.status(400).json({
        success: false,
        message: response.data.errorMessage || '查询订单失败',
        data: response.data
      });
    }

    // 更新日志
    await prisma.orderQueryLog.update({
      where: { id: logEntry.id },
      data: {
        dzgResponse: JSON.stringify(response.data),
        responseTimeMs
      }
    });

    // 处理返回数据
    const dzgData = response.data;
    const orders = dzgData.data?.list || [];
    const total = dzgData.data?.total || 0;

    // 格式化订单数据
    const formattedOrders = orders.map(order => ({
      orderNo: order.orderNo || order.order_no,
      bookingNo: order.bookingNo || order.booking_no,
      blNo: order.blNo || order.bl_no,
      pol: order.pol,
      pod: order.pod,
      carrier: order.carrier,
      vessel: order.vessel,
      voyage: order.voyage,
      containerType: order.containerType || order.container_type,
      containerCount: order.containerCount || order.container_count,
      status: order.status,
      eta: order.eta,
      etd: order.etd,
      createdAt: order.createTime || order.create_time,
      // 物流节点信息（如果接口返回）
      logisticsNodes: order.logisticsNodes || order.logistics_nodes || []
    }));

    res.json({
      success: true,
      data: {
        orders: formattedOrders,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    const responseTimeMs = Date.now() - startTime;
    console.error('Get orders error:', error);

    // 更新日志
    if (logEntry) {
      await prisma.orderQueryLog.update({
        where: { id: logEntry.id },
        data: {
          status: error.code === 'ECONNABORTED' ? 'TIMEOUT' : 'FAILED',
          errorMessage: error.message,
          responseTimeMs
        }
      });
    }

    res.status(500).json({
      success: false,
      message: '查询订单失败，请稍后重试',
      error: error.message
    });
  }
};

/**
 * 查询订单详情（待对接大掌柜详情接口）
 * GET /api/orders/:orderNo
 */
const getOrderByNo = async (req, res) => {
  try {
    const { orderNo } = req.params;
    const memberId = req.member.memberId;

    // 获取会员信息
    const member = await prisma.member.findUnique({
      where: { id: memberId }
    });

    if (!member || !member.dazhangguiEnterpriseId) {
      return res.status(400).json({
        success: false,
        message: '未绑定大掌柜企业信息'
      });
    }

    // TODO: 对接大掌柜订单详情接口
    // 目前返回模拟数据
    res.json({
      success: true,
      message: '订单详情功能开发中',
      data: {
        orderNo,
        mockData: true
      }
    });
  } catch (error) {
    console.error('Get order detail error:', error);
    res.status(500).json({
      success: false,
      message: '获取订单详情失败'
    });
  }
};

module.exports = {
  getOrders,
  getOrderByNo
};
