/**
 * API 测试用例 - 创建运价记录
 * 备注字段: "接口测试"
 * 用于验证 Open Claw 对接功能
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5001/api/v1';

async function testCreateFreightRate() {
  console.log('🚀 开始测试创建运价 API...\n');

  try {
    // 1. 查找一个已激活的会员和 API Key
    const member = await prisma.member.findFirst({
      where: { status: 'APPROVED' },
      include: { apiKeys: { where: { isActive: true } } }
    });

    if (!member) {
      console.error('❌ 未找到已激活的会员');
      process.exit(1);
    }

    let apiKey = member.apiKeys[0];

    // 如果没有 API Key，创建一个
    if (!apiKey) {
      console.log('📝 为会员创建新的 API Key...');
      const crypto = require('crypto');
      apiKey = await prisma.apiKey.create({
        data: {
          key: crypto.randomBytes(32).toString('hex'),
          name: 'Test API Key',
          memberId: member.id,
          isActive: true
        }
      });
      console.log('✅ API Key 创建成功:', apiKey.key.substring(0, 16) + '...\n');
    } else {
      console.log('✅ 使用现有 API Key:', apiKey.key.substring(0, 16) + '...\n');
    }

    // 2. 准备测试数据
    const testData = {
      route: "中美测试航线-API",
      originPort: "上海",
      originPortEn: "Shanghai",
      destinationPort: "洛杉矶",
      destinationPortEn: "Los Angeles",
      viaPort: "釜山",
      carrier: "COSCO",
      price20GP: 1250.00,
      price40GP: 1850.00,
      price40HQ: 1950.00,
      currency: "USD",
      transitTime: 14,
      schedule: "周一/三/五",
      validFrom: "2026-04-01",
      validTo: "2026-06-30",
      spaceStatus: "AVAILABLE",
      remarks: "接口测试",
      importBatchId: `test_${Date.now()}`
    };

    console.log('📦 请求数据:');
    console.log(JSON.stringify(testData, null, 2));
    console.log('\n');

    // 3. 发送 API 请求
    console.log('📡 发送 POST 请求到 /api/v1/freight-rates...\n');

    const response = await fetch(`${API_BASE_URL}/freight-rates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey.key
      },
      body: JSON.stringify(testData)
    });

    const result = await response.json();

    // 4. 验证响应
    if (response.ok && result.success) {
      console.log('✅ 测试成功！\n');
      console.log('📊 响应结果:');
      console.log(JSON.stringify(result, null, 2));

      // 5. 数据库验证
      const createdRate = result.data.rates[0];
      console.log('\n🔍 数据库验证:');
      console.log(`  - 记录 ID: ${createdRate.id}`);
      console.log(`  - 起运港: ${createdRate.originPort}`);
      console.log(`  - 目的港: ${createdRate.destinationPort}`);
      console.log(`  - 船公司: ${createdRate.carrier}`);
      console.log(`  - 备注: ${createdRate.remarks}`);
      console.log(`  - 状态: ${createdRate.status}`);
      console.log(`  - 创建时间: ${createdRate.createdAt}`);

      return { success: true, data: result };
    } else {
      console.error('❌ 测试失败！');
      console.error('HTTP 状态码:', response.status);
      console.error('错误响应:', JSON.stringify(result, null, 2));
      return { success: false, error: result };
    }

  } catch (error) {
    console.error('❌ 测试执行异常:', error.message);
    if (error.message.includes('fetch failed')) {
      console.error('\n💡 提示: 请确保后端服务器已启动');
      console.error(`   期望地址: ${API_BASE_URL}`);
    }
    return { success: false, error: error.message };
  } finally {
    await prisma.$disconnect();
  }
}

// 执行测试
testCreateFreightRate().then(result => {
  console.log('\n' + '='.repeat(50));
  if (result.success) {
    console.log('✅ 所有测试通过');
    process.exit(0);
  } else {
    console.log('❌ 测试未通过');
    process.exit(1);
  }
});
