const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function clearFreightRates() {
  try {
    console.log('开始清理运价数据...');

    // 删除所有运价数据
    const result = await prisma.freightRate.deleteMany({});

    console.log(`已删除 ${result.count} 条运价数据`);
    console.log('运价数据清理完成');
  } catch (error) {
    console.error('清理失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  clearFreightRates();
}

module.exports = { clearFreightRates };
