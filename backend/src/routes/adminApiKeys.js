const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const { authenticate } = require('../middleware/auth');

const prisma = new PrismaClient();

// 所有 API Key 管理接口都需要管理员认证
router.use(authenticate);

/**
 * 获取所有API Keys
 * GET /api/admin/api-keys
 */
router.get('/', async (req, res) => {
  try {
    const apiKeys = await prisma.apiKey.findMany({
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: apiKeys
    });
  } catch (error) {
    console.error('Get API keys error:', error);
    res.status(500).json({
      success: false,
      message: '获取API Key列表失败'
    });
  }
});

/**
 * 创建API Key
 * POST /api/admin/api-keys
 */
router.post('/', async (req, res) => {
  try {
    const { name, description } = req.body;
    const adminId = req.user.id; // 从管理员认证获取

    if (!name) {
      return res.status(400).json({
        success: false,
        message: '名称为必填项'
      });
    }

    // 生成API Key
    const apiKey = crypto.randomBytes(32).toString('hex');

    const newKey = await prisma.apiKey.create({
      data: {
        key: apiKey,
        name,
        description,
        createdByAdminId: adminId,
        isActive: true
      }
    });

    res.status(201).json({
      success: true,
      message: 'API Key创建成功',
      data: newKey
    });
  } catch (error) {
    console.error('Create API key error:', error);
    res.status(500).json({
      success: false,
      message: '创建API Key失败'
    });
  }
});

/**
 * 删除API Key
 * DELETE /api/admin/api-keys/:id
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.apiKey.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'API Key删除成功'
    });
  } catch (error) {
    console.error('Delete API key error:', error);
    res.status(500).json({
      success: false,
      message: '删除API Key失败'
    });
  }
});

/**
 * 切换API Key状态
 * POST /api/admin/api-keys/:id/toggle
 */
router.post('/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params;

    const apiKey = await prisma.apiKey.findUnique({
      where: { id }
    });

    if (!apiKey) {
      return res.status(404).json({
        success: false,
        message: 'API Key不存在'
      });
    }

    const updated = await prisma.apiKey.update({
      where: { id },
      data: { isActive: !apiKey.isActive }
    });

    res.json({
      success: true,
      message: `API Key已${updated.isActive ? '启用' : '禁用'}`,
      data: updated
    });
  } catch (error) {
    console.error('Toggle API key error:', error);
    res.status(500).json({
      success: false,
      message: '操作失败'
    });
  }
});

module.exports = router;
