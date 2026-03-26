const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

// 模拟数据池
const ports = [
  { code: 'SHANGHAI', nameEn: 'Shanghai', nameCn: '上海' },
  { code: 'NINGBO', nameEn: 'Ningbo', nameCn: '宁波' },
  { code: 'SHENZHEN', nameEn: 'Shenzhen', nameCn: '深圳' },
  { code: 'QINGDAO', nameEn: 'Qingdao', nameCn: '青岛' },
  { code: 'TIANJIN', nameEn: 'Tianjin', nameCn: '天津' },
  { code: 'DALIAN', nameEn: 'Dalian', nameCn: '大连' },
  { code: 'XIAMEN', nameEn: 'Xiamen', nameCn: '厦门' },
  { code: 'GUANGZHOU', nameEn: 'Guangzhou', nameCn: '广州' },
  { code: 'HONGKONG', nameEn: 'Hong Kong', nameCn: '香港' },
  { code: 'BUSAN', nameEn: 'Busan', nameCn: '釜山' },
  { code: 'SINGAPORE', nameEn: 'Singapore', nameCn: '新加坡' },
  { code: 'ROTTERDAM', nameEn: 'Rotterdam', nameCn: '鹿特丹' },
  { code: 'HAMBURG', nameEn: 'Hamburg', nameCn: '汉堡' },
  { code: 'ANTWERP', nameEn: 'Antwerp', nameCn: '安特卫普' },
  { code: 'FELIXSTOWE', nameEn: 'Felixstowe', nameCn: '费利克斯托' },
  { code: 'LOS ANGELES', nameEn: 'Los Angeles', nameCn: '洛杉矶' },
  { code: 'LONG BEACH', nameEn: 'Long Beach', nameCn: '长滩' },
  { code: 'NEW YORK', nameEn: 'New York', nameCn: '纽约' },
  { code: 'SAVANNAH', nameEn: 'Savannah', nameCn: '萨凡纳' },
  { code: 'SYDNEY', nameEn: 'Sydney', nameCn: '悉尼' },
  { code: 'MELBOURNE', nameEn: 'Melbourne', nameCn: '墨尔本' },
  { code: 'DUBAI', nameEn: 'Dubai', nameCn: '迪拜' },
  { code: 'JEDDAH', nameEn: 'Jeddah', nameCn: '吉达' },
  { code: 'COLOMBO', nameEn: 'Colombo', nameCn: '科伦坡' },
]

const carriers = [
  'MAERSK', 'MSC', 'COSCO', 'CMA CGM', 'HPL', 'ONE', 'EVERGREEN', 'HMM', 'OOCL', 'YML',
  'ZIM', 'PIL', 'WAN HAI', 'SITC', 'RCL', 'KMTC', 'TSL', 'SML', 'EMC', 'HYUNDAI'
]

const routes = [
  '美西线', '美东线', '欧洲线', '地中海线', '中东线', '印巴线', '东南亚线', '澳洲线', '南美线', '非洲线',
  '北美线', '远东线', '日韩线', '台湾线', '红海线', '波斯湾线', '黑海线', '波罗的海线', '加勒比线'
]

const schedules = ['Mon/Wed/Fri', 'Tue/Thu/Sat', 'Mon/Tue/Fri', 'Wed/Sat', 'Daily', 'Mon/Wed', 'Fri/Sat']

const spaceStatuses = ['AVAILABLE', 'LIMITED', 'FULL', 'SUSPENDED']
const statuses = ['ACTIVE', 'ACTIVE', 'ACTIVE', 'ACTIVE', 'INACTIVE', 'EXPIRED']
const currencies = ['USD', 'USD', 'USD', 'CNY', 'EUR']

// 随机选择
const random = (arr) => arr[Math.floor(Math.random() * arr.length)]
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
const randomFloat = (min, max) => parseFloat((Math.random() * (max - min) + min).toFixed(2))

// 生成日期
const generateDate = (daysFromNow) => {
  const date = new Date()
  date.setDate(date.getDate() + daysFromNow)
  return date
}

// 生成单条运价数据
const generateRate = (index) => {
  const originPort = random(ports.slice(0, 10)) // 中国港口
  const destinationPort = random(ports.slice(10)) // 国外港口
  const viaPort = Math.random() > 0.5 ? random(ports.slice(10)) : null
  const carrier = random(carriers)
  const route = random(routes)
  const currency = random(currencies)

  // 根据航线调整价格范围
  const isLongRoute = ['欧洲线', '地中海线', '美东线', '南美线', '非洲线'].includes(route)
  const basePrice = isLongRoute ? 1500 : 800

  const validFrom = generateDate(-randomInt(10, 30))
  const validTo = generateDate(randomInt(15, 90))

  return {
    route,
    originPort: originPort.code,
    originPortEn: originPort.nameEn,
    destinationPort: destinationPort.code,
    destinationPortEn: destinationPort.nameEn,
    viaPort: viaPort?.code || null,
    viaPortEn: viaPort?.nameEn || null,
    portArea: Math.random() > 0.7 ? ['Yangshan', 'Waigaoqiao', 'Yantian', 'Shekou'][randomInt(0, 3)] : null,

    validFrom,
    validTo,
    validityType: Math.random() > 0.3 ? 'LONG' : 'SHORT',
    isRecommended: Math.random() > 0.85,

    carrier,
    carrierLogo: null,

    price20GP: randomFloat(basePrice, basePrice * 1.8),
    price40GP: randomFloat(basePrice * 1.8, basePrice * 3.2),
    price40HQ: randomFloat(basePrice * 1.9, basePrice * 3.4),
    price45HQ: randomFloat(basePrice * 2.2, basePrice * 4.0),
    currency,

    cost20GP: randomFloat(basePrice * 0.7, basePrice * 1.2),
    cost40GP: randomFloat(basePrice * 1.3, basePrice * 2.2),
    cost40HQ: randomFloat(basePrice * 1.4, basePrice * 2.4),
    cost45HQ: randomFloat(basePrice * 1.6, basePrice * 2.8),
    isAllIn: Math.random() > 0.8,

    transitTime: randomInt(isLongRoute ? 20 : 10, isLongRoute ? 45 : 25),
    schedule: random(schedules),
    routeCode: `${route.substring(0, 2).toUpperCase()}${randomInt(100, 999)}`,

    vesselName: Math.random() > 0.5 ? `VESSEL ${String.fromCharCode(65 + randomInt(0, 25))}${randomInt(100, 999)}` : null,
    voyage: Math.random() > 0.5 ? `${randomInt(100, 999)}E` : null,
    sailingDate: Math.random() > 0.3 ? generateDate(randomInt(3, 20)) : null,
    estimatedDeparture: Math.random() > 0.3 ? generateDate(randomInt(3, 20)) : null,

    bookingAgent: Math.random() > 0.6 ? `Agent ${randomInt(1, 100)}` : null,
    spaceStatus: random(spaceStatuses),

    docCutoffDay: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'][randomInt(0, 4)],
    docCutoffTime: `${randomInt(8, 17)}:00`,

    status: random(statuses),
    createdBy: 'system-seed',
    priceTrend: random(['UP', 'DOWN', 'STABLE', 'STABLE', 'STABLE', null]),
    contactInfo: Math.random() > 0.5 ? `Contact: ${randomInt(10000000000, 19999999999)}` : null,
    remarks: Math.random() > 0.7 ? `Test remark ${index + 1}` : null,
  }
}

async function main() {
  console.log('开始生成100条模拟运价数据...')

  const rates = []
  for (let i = 0; i < 100; i++) {
    rates.push(generateRate(i))
  }

  // 批量插入
  const batchSize = 10
  for (let i = 0; i < rates.length; i += batchSize) {
    const batch = rates.slice(i, i + batchSize)
    await Promise.all(
      batch.map(rate => prisma.freightRate.create({ data: rate }))
    )
    console.log(`已插入 ${Math.min(i + batchSize, 100)}/100 条数据`)
  }

  console.log('✅ 模拟数据生成完成！')
}

main()
  .catch((e) => {
    console.error('错误:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
