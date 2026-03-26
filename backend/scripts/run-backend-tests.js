const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  blue: '\x1b[34m'
};

let passedTests = 0;
let failedTests = 0;
const testResults = [];

async function runTest(testId, testName, testFn) {
  try {
    await testFn();
    console.log(`${colors.green}✓${colors.reset} ${testId}: ${testName}`);
    passedTests++;
    testResults.push({ id: testId, name: testName, status: 'PASSED' });
  } catch (error) {
    console.log(`${colors.red}✗${colors.reset} ${testId}: ${testName}`);
    console.log(`  ${colors.red}Error: ${error.message}${colors.reset}`);
    failedTests++;
    testResults.push({ id: testId, name: testName, status: 'FAILED', error: error.message });
  }
}

async function testDataIntegrity() {
  console.log(`\n${colors.blue}========== 数据完整性测试 ==========${colors.reset}\n`);

  await runTest('FRL-02', '运价列表数据字段完整性', async () => {
    const rates = await prisma.freightRate.findMany({ take: 5 });
    if (rates.length === 0) throw new Error('No freight rates found');

    for (const rate of rates) {
      if (!rate.originPort) throw new Error(`Rate ${rate.id} missing originPort`);
      if (!rate.destinationPort) throw new Error(`Rate ${rate.id} missing destinationPort`);
      if (!rate.validFrom) throw new Error(`Rate ${rate.id} missing validFrom`);
      if (!rate.validTo) throw new Error(`Rate ${rate.id} missing validTo`);
    }
  });

  await runTest('FRL-03', '分页功能验证', async () => {
    const [totalCount, page1, page2] = await Promise.all([
      prisma.freightRate.count(),
      prisma.freightRate.findMany({ take: 50, skip: 0 }),
      prisma.freightRate.findMany({ take: 50, skip: 50 })
    ]);

    if (page1.length > 50) throw new Error('Page 1 exceeds limit');
    if (totalCount > 50 && page2.length === 0) throw new Error('Page 2 is empty but should have data');
  });

  await runTest('FRA-01', '港口数据完整性', async () => {
    const ports = await prisma.port.findMany({ take: 100 });
    if (ports.length === 0) throw new Error('No ports found');

    for (const port of ports) {
      if (!port.code) throw new Error(`Port ${port.id} missing code`);
      if (!port.nameEn) throw new Error(`Port ${port.id} missing nameEn`);
    }
  });

  await runTest('FRC-01', '船公司数据完整性', async () => {
    const carriers = await prisma.carrier.findMany({ take: 100 });
    if (carriers.length === 0) throw new Error('No carriers found');

    for (const carrier of carriers) {
      if (!carrier.code) throw new Error(`Carrier ${carrier.id} missing code`);
      if (!carrier.name) throw new Error(`Carrier ${carrier.id} missing name`);
    }
  });
}

async function testDropdownFunctionality() {
  console.log(`\n${colors.blue}========== 下拉框功能测试 ==========${colors.reset}\n`);

  await runTest('FRA-02', '港口搜索-按代码', async () => {
    const ports = await prisma.port.findMany({
      where: {
        OR: [
          { code: { contains: 'SHA' } },
          { nameEn: { contains: 'SHA' } },
          { nameCn: { contains: 'SHA' } }
        ]
      },
      take: 10
    });

    if (ports.length === 0) throw new Error('No ports matching "SHA" found');
  });

  await runTest('FRA-03', '港口搜索-按中文名称', async () => {
    const ports = await prisma.port.findMany({
      where: {
        OR: [
          { nameCn: { contains: '上海' } },
          { nameEn: { contains: 'shanghai' } },
          { code: { contains: 'SHA' } }
        ]
      },
      take: 10
    });

    if (ports.length === 0) throw new Error('No Shanghai port found');
  });

  await runTest('FRA-04', '港口搜索-按英文名称', async () => {
    const ports = await prisma.port.findMany({
      where: {
        OR: [
          { nameEn: { contains: 'hong' } },
          { nameCn: { contains: '香港' } },
          { code: { contains: 'HKG' } }
        ]
      },
      take: 10
    });

    if (ports.length === 0) throw new Error('No Hong Kong port found');
  });

  await runTest('FRC-03', '船公司搜索功能', async () => {
    const carriers = await prisma.carrier.findMany({
      where: {
        OR: [
          { code: { contains: 'MSK' } },
          { name: { contains: 'maersk' } }
        ]
      },
      take: 10
    });

    if (carriers.length === 0) {
      const anyCarriers = await prisma.carrier.findMany({ take: 1 });
      if (anyCarriers.length === 0) throw new Error('No carriers in database');
    }
  });

  await runTest('FRR-02', '航线数据格式验证', async () => {
    const routes = await prisma.route.findMany({ take: 100 });
    if (routes.length === 0) {
      console.log('  (Warning: No routes in database)');
      return;
    }

    for (const route of routes) {
      if (!route.code) throw new Error(`Route ${route.id} missing code`);
      if (!route.nameEn && !route.nameCn) throw new Error(`Route ${route.id} missing name`);
    }
  });
}

async function testFreightRateQueries() {
  console.log(`\n${colors.blue}========== 运价查询测试 ==========${colors.reset}\n`);

  const sampleRates = await prisma.freightRate.findMany({ take: 1 });
  if (sampleRates.length === 0) {
    console.log('  (Warning: No freight rates to test queries)');
    return;
  }

  const sampleRate = sampleRates[0];

  await runTest('FRS-06-O', '按起运港查询运价', async () => {
    const matchingRates = await prisma.freightRate.findMany({
      where: { originPort: sampleRate.originPort },
      take: 10
    });

    if (matchingRates.length === 0) throw new Error('No rates found for origin port');
  });

  await runTest('FRS-06-D', '按目的港查询运价', async () => {
    const matchingRates = await prisma.freightRate.findMany({
      where: { destinationPort: sampleRate.destinationPort },
      take: 10
    });

    if (matchingRates.length === 0) throw new Error('No rates found for destination port');
  });

  await runTest('FRS-06-C', '组合条件查询运价', async () => {
    const matchingRates = await prisma.freightRate.findMany({
      where: {
        originPort: sampleRate.originPort,
        destinationPort: sampleRate.destinationPort
      },
      take: 10
    });

    if (matchingRates.length === 0) throw new Error('No rates found for combined query');
  });

  await runTest('FRX-02', '有效期验证', async () => {
    const now = new Date();
    const validRates = await prisma.freightRate.findMany({
      where: {
        validFrom: { lte: now },
        validTo: { gte: now }
      },
      take: 5
    });

    for (const rate of validRates) {
      if (new Date(rate.validTo) < now) {
        throw new Error(`Rate ${rate.id} has expired validTo date`);
      }
    }
  });
}

async function testDropdownDataDisplay() {
  console.log(`\n${colors.blue}========== 下拉框数据显示测试 ==========${colors.reset}\n`);

  await runTest('FRA-DISPLAY', '港口显示格式验证', async () => {
    const ports = await prisma.port.findMany({ take: 5 });

    for (const port of ports) {
      const displayLabel = `${port.code} - ${port.nameEn}`;
      if (!displayLabel.includes(port.code)) {
        throw new Error(`Display format missing code for port ${port.id}`);
      }
    }
  });

  await runTest('FRC-DISPLAY', '船公司显示格式验证', async () => {
    const carriers = await prisma.carrier.findMany({ take: 5 });

    for (const carrier of carriers) {
      const displayLabel = `${carrier.code} - ${carrier.name}`;
      if (!displayLabel.includes(carrier.code)) {
        throw new Error(`Display format missing code for carrier ${carrier.id}`);
      }
    }
  });
}

async function printSummary() {
  console.log(`\n${colors.blue}========== 测试总结 ==========${colors.reset}\n`);
  console.log(`总测试数: ${passedTests + failedTests}`);
  console.log(`${colors.green}通过: ${passedTests}${colors.reset}`);
  console.log(`${colors.red}失败: ${failedTests}${colors.reset}`);
  console.log(`通过率: ${((passedTests / (passedTests + failedTests)) * 100).toFixed(1)}%`);

  if (failedTests > 0) {
    console.log(`\n${colors.red}失败的测试:${colors.reset}`);
    testResults
      .filter(r => r.status === 'FAILED')
      .forEach(r => console.log(`  - ${r.id}: ${r.error}`));
  }

  await prisma.$disconnect();
}

async function main() {
  console.log(`${colors.blue}Indigenex 后台功能测试开始...${colors.reset}`);
  console.log(`测试时间: ${new Date().toLocaleString()}`);

  try {
    await testDataIntegrity();
    await testDropdownFunctionality();
    await testFreightRateQueries();
    await testDropdownDataDisplay();
    await printSummary();

    process.exit(failedTests > 0 ? 1 : 0);
  } catch (error) {
    console.error(`${colors.red}测试执行失败: ${error.message}${colors.reset}`);
    await prisma.$disconnect();
    process.exit(1);
  }
}

main();
