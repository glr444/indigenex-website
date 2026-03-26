const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixData() {
  try {
    console.log('开始修复运价数据...');

    // 获取所有港口
    const ports = await prisma.port.findMany();
    const portMap = new Map();
    ports.forEach(p => {
      portMap.set(p.code.toUpperCase(), p);
      portMap.set(p.nameEn.toUpperCase(), p);
      portMap.set(p.nameCn, p);
    });

    // 获取所有船公司
    const carriers = await prisma.carrier.findMany();
    const carrierMap = new Map();
    carriers.forEach(c => {
      carrierMap.set(c.code.toUpperCase(), c);
      carrierMap.set(c.name.toUpperCase(), c);
    });

    console.log(`找到 ${ports.length} 个港口, ${carriers.length} 个船公司`);

    // 获取所有运价
    const rates = await prisma.freightRate.findMany();
    console.log(`需要修复 ${rates.length} 条运价数据`);

    let fixedCount = 0;
    const now = new Date();
    const futureDate = new Date(now);
    futureDate.setMonth(futureDate.getMonth() + 3); // 3个月后过期

    for (const rate of rates) {
      const updates = {};

      // 修复港口名称（使用正确的首字母大写格式）
      const originPort = portMap.get(rate.originPort?.toUpperCase());
      const destPort = portMap.get(rate.destinationPort?.toUpperCase());
      const carrier = carrierMap.get(rate.carrier?.toUpperCase());

      if (originPort) {
        updates.originPort = originPort.nameEn;
        updates.originPortEn = originPort.nameEn;
      }

      if (destPort) {
        updates.destinationPort = destPort.nameEn;
        updates.destinationPortEn = destPort.nameEn;
      }

      if (carrier) {
        updates.carrier = carrier.name;
      }

      // 修复过期日期
      if (!rate.validTo || new Date(rate.validTo) < now) {
        updates.validTo = futureDate;
      }

      // 修复有效日期
      if (!rate.validFrom) {
        updates.validFrom = now;
      }

      if (Object.keys(updates).length > 0) {
        await prisma.freightRate.update({
          where: { id: rate.id },
          data: updates
        });
        fixedCount++;
        if (fixedCount % 10 === 0) {
          console.log(`已修复 ${fixedCount}/${rates.length} 条数据...`);
        }
      }
    }

    console.log(`\n修复完成！共修复 ${fixedCount} 条数据`);

  } catch (error) {
    console.error('修复失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixData();
