const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// 模拟港口数据
const ports = [
  { code: 'CNSHA', nameEn: 'SHANGHAI', nameCn: '上海' },
  { code: 'CNTAO', nameEn: 'QINGDAO', nameCn: '青岛' },
  { code: 'CNTXG', nameEn: 'TIANJIN', nameCn: '天津' },
  { code: 'CNNSA', nameEn: 'NINGBO', nameCn: '宁波' },
  { code: 'CNSZX', nameEn: 'SHENZHEN', nameCn: '深圳' },
  { code: 'JPTYO', nameEn: 'TOKYO', nameCn: '东京' },
  { code: 'JPYOK', nameEn: 'YOKOHAMA', nameCn: '横滨' },
  { code: 'KRPUS', nameEn: 'BUSAN', nameCn: '釜山' },
  { code: 'SGSIN', nameEn: 'SINGAPORE', nameCn: '新加坡' },
  { code: 'MYTPP', nameEn: 'PORT KLANG', nameCn: '巴生港' },
  { code: 'DEHAM', nameEn: 'HAMBURG', nameCn: '汉堡' },
  { code: 'NLRTM', nameEn: 'ROTTERDAM', nameCn: '鹿特丹' },
  { code: 'BEANR', nameEn: 'ANTWERP', nameCn: '安特卫普' },
  { code: 'GBFXT', nameEn: 'FELIXSTOWE', nameCn: '费利克斯托' },
  { code: 'USLAX', nameEn: 'LOS ANGELES', nameCn: '洛杉矶' },
  { code: 'USLGB', nameEn: 'LONG BEACH', nameCn: '长滩' },
  { code: 'USNYC', nameEn: 'NEW YORK', nameCn: '纽约' },
  { code: 'AEDXB', nameEn: 'DUBAI', nameCn: '迪拜' },
  { code: 'AUMEL', nameEn: 'MELBOURNE', nameCn: '墨尔本' },
  { code: 'AUSYD', nameEn: 'SYDNEY', nameCn: '悉尼' },
];

const carriers = ['MAERSK', 'COSCO', 'MSC', 'CMA CGM', 'ONE', 'EVERGREEN', 'HAPAG-LLOYD', 'OOCL', 'YANG MING'];
const routes = ['ME3', 'AEX2', 'AEU3', 'FAL5', 'MED1', 'PCS', 'COSCO_001', 'MSC_002'];
const currencies = ['USD', 'CNY'];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

async function generateMockData() {
  console.log('开始生成100条模拟运价数据...');

  const rates = [];
  const today = new Date();

  for (let i = 0; i < 100; i++) {
    const originPort = randomItem(ports.slice(0, 10)); // 主要使用中国港口作为起运港
    const destPort = randomItem(ports.slice(10)); // 使用国外港口作为目的港
    const carrier = randomItem(carriers);
    const route = randomItem(routes);
    const hasVia = Math.random() > 0.7; // 30% 概率有中转
    const viaPort = hasVia ? randomItem(ports.slice(5, 15)) : null;

    const price20GP = randomInt(800, 2500);
    const price40GP = Math.round(price20GP * 1.8);
    const price40HQ = Math.round(price40GP * 1.1);
    const transitTime = randomInt(12, 45);

    const validFrom = addDays(today, randomInt(-5, 5));
    const validTo = addDays(validFrom, randomInt(15, 60));

    const spaceStatuses = ['AVAILABLE', 'LIMITED', 'FULL'];
    const spaceStatus = randomItem(spaceStatuses);

    rates.push({
      route,
      originPort: originPort.nameEn,
      originPortEn: originPort.nameEn,
      destinationPort: destPort.nameEn,
      destinationPortEn: destPort.nameEn,
      viaPort: viaPort?.nameEn || null,
      viaPortEn: viaPort?.nameEn || null,
      transportMode: 'SEA',
      carrier,
      price20GP,
      price40GP,
      price40HQ,
      price45HQ: Math.random() > 0.5 ? Math.round(price40HQ * 1.15) : null,
      currency: randomItem(currencies),
      transitTime,
      schedule: `${randomItem(['周一', '周二', '周三', '周四', '周五', '周六', '周日'])}`,
      spaceStatus,
      validFrom,
      validTo,
      cutOffDate: addDays(validFrom, randomInt(-3, -1)),
      estimatedDeparture: validFrom,
      remarks: Math.random() > 0.8 ? '舱位紧张，请提前预订' : null,
      status: 'ACTIVE',
      createdBy: 'admin',
    });
  }

  // 批量创建
  let created = 0;
  for (const rate of rates) {
    try {
      await prisma.freightRate.create({ data: rate });
      created++;
      if (created % 10 === 0) {
        console.log(`已创建 ${created} 条...`);
      }
    } catch (err) {
      console.error('创建失败:', err.message);
    }
  }

  console.log(`\n完成！成功创建 ${created} 条运价数据`);
}

generateMockData()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
