const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// 航线基础数据
const routesData = [
  { code: 'FE1', nameEn: 'Far East - North America West Coast', nameCn: '远东-北美西岸', description: 'Main service connecting China to US West Coast', regionFrom: '远东', regionTo: '北美西岸' },
  { code: 'FE2', nameEn: 'Far East - North America East Coast', nameCn: '远东-北美东岸', description: 'Service via Panama Canal to US East Coast', regionFrom: '远东', regionTo: '北美东岸' },
  { code: 'FE3', nameEn: 'Far East - Europe', nameCn: '远东-欧洲', description: 'Main service to North Europe via Suez Canal', regionFrom: '远东', regionTo: '欧洲' },
  { code: 'FE4', nameEn: 'Far East - Mediterranean', nameCn: '远东-地中海', description: 'Service to Mediterranean ports', regionFrom: '远东', regionTo: '地中海' },
  { code: 'FE5', nameEn: 'Intra-Asia', nameCn: '亚洲区域内', description: 'Intra-Asia feeder and mainline services', regionFrom: '亚洲', regionTo: '亚洲' },
  { code: 'FE6', nameEn: 'Far East - Middle East', nameCn: '远东-中东', description: 'Service to Middle East Gulf ports', regionFrom: '远东', regionTo: '中东' },
  { code: 'FE7', nameEn: 'Far East - Australia', nameCn: '远东-澳洲', description: 'Service to Australia and New Zealand', regionFrom: '远东', regionTo: '澳洲' },
  { code: 'FE8', nameEn: 'Far East - South America', nameCn: '远东-南美', description: 'Service to East Coast of South America', regionFrom: '远东', regionTo: '南美' },
  { code: 'FE9', nameEn: 'Far East - Africa', nameCn: '远东-非洲', description: 'Service to South and East Africa', regionFrom: '远东', regionTo: '非洲' },
  { code: 'FE10', nameEn: 'Far East - Southeast Asia', nameCn: '远东-东南亚', description: 'Feeder service to Southeast Asia', regionFrom: '远东', regionTo: '东南亚' },
];

// 船公司基础数据
const carriersData = [
  { code: 'MSL', name: '马士基', nameEn: 'Maersk Line', website: 'https://www.maersk.com', contactInfo: '客服热线: 400-820-2088' },
  { code: 'MSC', name: '地中海航运', nameEn: 'MSC', website: 'https://www.msc.com', contactInfo: '客服热线: 400-888-8080' },
  { code: 'CMA', name: '达飞轮船', nameEn: 'CMA CGM', website: 'https://www.cma-cgm.com', contactInfo: '客服热线: 400-888-0088' },
  { code: 'COS', name: '中远海运', nameEn: 'COSCO Shipping', website: 'https://www.coscoshipping.com', contactInfo: '客服热线: 400-888-6666' },
  { code: 'HLC', name: '赫伯罗特', nameEn: 'Hapag-Lloyd', website: 'https://www.hapag-lloyd.com', contactInfo: '客服热线: 400-888-9666' },
  { code: 'ONE', name: '海洋网联船务', nameEn: 'Ocean Network Express', website: 'https://www.one-line.com', contactInfo: '客服热线: 400-888-0188' },
  { code: 'EMC', name: '长荣海运', nameEn: 'Evergreen Marine', website: 'https://www.evergreen-marine.com', contactInfo: '客服热线: 400-888-2888' },
  { code: 'HMM', name: '现代商船', nameEn: 'HMM', website: 'https://www.hmm21.com', contactInfo: '客服热线: 400-888-3888' },
  { code: 'YML', name: '阳明海运', nameEn: 'Yang Ming Line', website: 'https://www.yangming.com', contactInfo: '客服热线: 400-888-4888' },
  { code: 'ZIM', name: '以星轮船', nameEn: 'ZIM', website: 'https://www.zim.com', contactInfo: '客服热线: 400-888-5888' },
  { code: 'PIL', name: '太平船务', nameEn: 'Pacific International Lines', website: 'https://www.pilship.com', contactInfo: '客服热线: 400-888-6888' },
  { code: 'OOCL', name: '东方海外', nameEn: 'OOCL', website: 'https://www.oocl.com', contactInfo: '客服热线: 400-888-7888' },
  { code: 'WHL', name: '万海航运', nameEn: 'Wan Hai Lines', website: 'https://www.wanhai.com', contactInfo: '客服热线: 400-888-0888' },
  { code: 'SML', name: '森罗商船', nameEn: 'SM Line', website: 'https://www.smlines.com', contactInfo: '客服热线: 400-888-1888' },
  { code: 'KMD', name: '高丽海运', nameEn: 'Korea Marine Transport', website: 'https://www.kmtc.co.kr', contactInfo: '客服热线: 400-888-8888' },
];

// 港口基础数据
const portsData = [
  // 中国主要港口
  { code: 'SH', nameEn: 'Shanghai', nameCn: '上海', countryCode: 'CN', countryName: '中国', region: '远东' },
  { code: 'NGB', nameEn: 'Ningbo', nameCn: '宁波', countryCode: 'CN', countryName: '中国', region: '远东' },
  { code: 'SZ', nameEn: 'Shenzhen', nameCn: '深圳', countryCode: 'CN', countryName: '中国', region: '远东' },
  { code: 'QDG', nameEn: 'Qingdao', nameCn: '青岛', countryCode: 'CN', countryName: '中国', region: '远东' },
  { code: 'TSN', nameEn: 'Tianjin', nameCn: '天津', countryCode: 'CN', countryName: '中国', region: '远东' },
  { code: 'XMN', nameEn: 'Xiamen', nameCn: '厦门', countryCode: 'CN', countryName: '中国', region: '远东' },
  { code: 'DLC', nameEn: 'Dalian', nameCn: '大连', countryCode: 'CN', countryName: '中国', region: '远东' },
  { code: 'FZH', nameEn: 'Fuzhou', nameCn: '福州', countryCode: 'CN', countryName: '中国', region: '远东' },
  { code: 'GZ', nameEn: 'Guangzhou', nameCn: '广州', countryCode: 'CN', countryName: '中国', region: '远东' },
  { code: 'LYG', nameEn: 'Lianyungang', nameCn: '连云港', countryCode: 'CN', countryName: '中国', region: '远东' },

  // 东南亚主要港口
  { code: 'SIN', nameEn: 'Singapore', nameCn: '新加坡', countryCode: 'SG', countryName: '新加坡', region: '东南亚' },
  { code: 'BKK', nameEn: 'Bangkok', nameCn: '曼谷', countryCode: 'TH', countryName: '泰国', region: '东南亚' },
  { code: 'LCB', nameEn: 'Laem Chabang', nameCn: '林查班', countryCode: 'TH', countryName: '泰国', region: '东南亚' },
  { code: 'HCM', nameEn: 'Ho Chi Minh City', nameCn: '胡志明市', countryCode: 'VN', countryName: '越南', region: '东南亚' },
  { code: 'HAN', nameEn: 'Haiphong', nameCn: '海防', countryCode: 'VN', countryName: '越南', region: '东南亚' },
  { code: 'MNL', nameEn: 'Manila', nameCn: '马尼拉', countryCode: 'PH', countryName: '菲律宾', region: '东南亚' },
  { code: 'JKT', nameEn: 'Jakarta', nameCn: '雅加达', countryCode: 'ID', countryName: '印尼', region: '东南亚' },
  { code: 'KUL', nameEn: 'Port Klang', nameCn: '巴生港', countryCode: 'MY', countryName: '马来西亚', region: '东南亚' },
  { code: 'PEN', nameEn: 'Penang', nameCn: '槟城', countryCode: 'MY', countryName: '马来西亚', region: '东南亚' },
  { code: 'RGN', nameEn: 'Yangon', nameCn: '仰光', countryCode: 'MM', countryName: '缅甸', region: '东南亚' },

  // 东北亚主要港口
  { code: 'HK', nameEn: 'Hong Kong', nameCn: '香港', countryCode: 'HK', countryName: '中国香港', region: '远东' },
  { code: 'KHH', nameEn: 'Kaohsiung', nameCn: '高雄', countryCode: 'TW', countryName: '中国台湾', region: '远东' },
  { code: 'TYO', nameEn: 'Tokyo', nameCn: '东京', countryCode: 'JP', countryName: '日本', region: '远东' },
  { code: 'YOK', nameEn: 'Yokohama', nameCn: '横滨', countryCode: 'JP', countryName: '日本', region: '远东' },
  { code: 'OSA', nameEn: 'Osaka', nameCn: '大阪', countryCode: 'JP', countryName: '日本', region: '远东' },
  { code: 'NGO', nameEn: 'Nagoya', nameCn: '名古屋', countryCode: 'JP', countryName: '日本', region: '远东' },
  { code: 'KOB', nameEn: 'Kobe', nameCn: '神户', countryCode: 'JP', countryName: '日本', region: '远东' },
  { code: 'BUS', nameEn: 'Busan', nameCn: '釜山', countryCode: 'KR', countryName: '韩国', region: '远东' },
  { code: 'ICN', nameEn: 'Incheon', nameCn: '仁川', countryCode: 'KR', countryName: '韩国', region: '远东' },

  // 欧洲主要港口
  { code: 'RTM', nameEn: 'Rotterdam', nameCn: '鹿特丹', countryCode: 'NL', countryName: '荷兰', region: '欧洲' },
  { code: 'HAM', nameEn: 'Hamburg', nameCn: '汉堡', countryCode: 'DE', countryName: '德国', region: '欧洲' },
  { code: 'ANR', nameEn: 'Antwerp', nameCn: '安特卫普', countryCode: 'BE', countryName: '比利时', region: '欧洲' },
  { code: 'LEH', nameEn: 'Le Havre', nameCn: '勒阿弗尔', countryCode: 'FR', countryName: '法国', region: '欧洲' },
  { code: 'FXT', nameEn: 'Felixstowe', nameCn: '费利克斯托', countryCode: 'GB', countryName: '英国', region: '欧洲' },
  { code: 'LON', nameEn: 'London', nameCn: '伦敦', countryCode: 'GB', countryName: '英国', region: '欧洲' },
  { code: 'BCN', nameEn: 'Barcelona', nameCn: '巴塞罗那', countryCode: 'ES', countryName: '西班牙', region: '欧洲' },
  { code: 'VAL', nameEn: 'Valencia', nameCn: '瓦伦西亚', countryCode: 'ES', countryName: '西班牙', region: '欧洲' },
  { code: 'GOA', nameEn: 'Genoa', nameCn: '热那亚', countryCode: 'IT', countryName: '意大利', region: '欧洲' },
  { code: 'MIL', nameEn: 'Milan', nameCn: '米兰', countryCode: 'IT', countryName: '意大利', region: '欧洲' },

  // 地中海主要港口
  { code: 'PIR', nameEn: 'Piraeus', nameCn: '比雷埃夫斯', countryCode: 'GR', countryName: '希腊', region: '地中海' },
  { code: 'IST', nameEn: 'Istanbul', nameCn: '伊斯坦布尔', countryCode: 'TR', countryName: '土耳其', region: '地中海' },
  { code: 'ALG', nameEn: 'Algiers', nameCn: '阿尔及尔', countryCode: 'DZ', countryName: '阿尔及利亚', region: '地中海' },
  { code: 'CAS', nameEn: 'Casablanca', nameCn: '卡萨布兰卡', countryCode: 'MA', countryName: '摩洛哥', region: '地中海' },
  { code: 'MLA', nameEn: 'Malta', nameCn: '马耳他', countryCode: 'MT', countryName: '马耳他', region: '地中海' },
  { code: 'ALX', nameEn: 'Alexandria', nameCn: '亚历山大', countryCode: 'EG', countryName: '埃及', region: '地中海' },
  { code: 'HFA', nameEn: 'Haifa', nameCn: '海法', countryCode: 'IL', countryName: '以色列', region: '地中海' },

  // 北美西岸主要港口
  { code: 'LAX', nameEn: 'Los Angeles', nameCn: '洛杉矶', countryCode: 'US', countryName: '美国', region: '北美西岸' },
  { code: 'LGB', nameEn: 'Long Beach', nameCn: '长滩', countryCode: 'US', countryName: '美国', region: '北美西岸' },
  { code: 'OAK', nameEn: 'Oakland', nameCn: '奥克兰', countryCode: 'US', countryName: '美国', region: '北美西岸' },
  { code: 'SEA', nameEn: 'Seattle', nameCn: '西雅图', countryCode: 'US', countryName: '美国', region: '北美西岸' },
  { code: 'YVR', nameEn: 'Vancouver', nameCn: '温哥华', countryCode: 'CA', countryName: '加拿大', region: '北美西岸' },

  // 北美东岸主要港口
  { code: 'NYC', nameEn: 'New York', nameCn: '纽约', countryCode: 'US', countryName: '美国', region: '北美东岸' },
  { code: 'SAV', nameEn: 'Savannah', nameCn: '萨凡纳', countryCode: 'US', countryName: '美国', region: '北美东岸' },
  { code: 'ORF', nameEn: 'Norfolk', nameCn: '诺福克', countryCode: 'US', countryName: '美国', region: '北美东岸' },
  { code: 'MIA', nameEn: 'Miami', nameCn: '迈阿密', countryCode: 'US', countryName: '美国', region: '北美东岸' },
  { code: 'CHS', nameEn: 'Charleston', nameCn: '查尔斯顿', countryCode: 'US', countryName: '美国', region: '北美东岸' },
  { code: 'HOU', nameEn: 'Houston', nameCn: '休斯顿', countryCode: 'US', countryName: '美国', region: '北美东岸' },
  { code: 'TOR', nameEn: 'Toronto', nameCn: '多伦多', countryCode: 'CA', countryName: '加拿大', region: '北美东岸' },
  { code: 'MTL', nameEn: 'Montreal', nameCn: '蒙特利尔', countryCode: 'CA', countryName: '加拿大', region: '北美东岸' },

  // 中东主要港口
  { code: 'JEA', nameEn: 'Jebel Ali', nameCn: '杰贝阿里', countryCode: 'AE', countryName: '阿联酋', region: '中东' },
  { code: 'DWC', nameEn: 'Dammam', nameCn: '达曼', countryCode: 'SA', countryName: '沙特', region: '中东' },
  { code: 'HAMAD', nameEn: 'Hamad', nameCn: '哈马德', countryCode: 'QA', countryName: '卡塔尔', region: '中东' },
  { code: 'KWI', nameEn: 'Kuwait', nameCn: '科威特', countryCode: 'KW', countryName: '科威特', region: '中东' },
  { code: 'BAH', nameEn: 'Bahrain', nameCn: '巴林', countryCode: 'BH', countryName: '巴林', region: '中东' },
  { code: 'MCT', nameEn: 'Muscat', nameCn: '马斯喀特', countryCode: 'OM', countryName: '阿曼', region: '中东' },
  { code: 'ABB', nameEn: 'Abbas', nameCn: '阿巴斯', countryCode: 'IR', countryName: '伊朗', region: '中东' },

  // 澳洲主要港口
  { code: 'SYD', nameEn: 'Sydney', nameCn: '悉尼', countryCode: 'AU', countryName: '澳大利亚', region: '澳洲' },
  { code: 'MEL', nameEn: 'Melbourne', nameCn: '墨尔本', countryCode: 'AU', countryName: '澳大利亚', region: '澳洲' },
  { code: 'BNE', nameEn: 'Brisbane', nameCn: '布里斯班', countryCode: 'AU', countryName: '澳大利亚', region: '澳洲' },
  { code: 'PER', nameEn: 'Perth', nameCn: '珀斯', countryCode: 'AU', countryName: '澳大利亚', region: '澳洲' },
  { code: 'ADL', nameEn: 'Adelaide', nameCn: '阿德莱德', countryCode: 'AU', countryName: '澳大利亚', region: '澳洲' },
  { code: 'AKL', nameEn: 'Auckland', nameCn: '奥克兰', countryCode: 'NZ', countryName: '新西兰', region: '澳洲' },

  // 南美主要港口
  { code: 'SAO', nameEn: 'Santos', nameCn: '桑托斯', countryCode: 'BR', countryName: '巴西', region: '南美' },
  { code: 'BUE', nameEn: 'Buenos Aires', nameCn: '布宜诺斯艾利斯', countryCode: 'AR', countryName: '阿根廷', region: '南美' },
  { code: 'VAP', nameEn: 'Valparaiso', nameCn: '瓦尔帕莱索', countryCode: 'CL', countryName: '智利', region: '南美' },
  { code: 'CAI', nameEn: 'Callao', nameCn: '卡亚俄', countryCode: 'PE', countryName: '秘鲁', region: '南美' },
  { code: 'BAQ', nameEn: 'Barranquilla', nameCn: '巴兰基亚', countryCode: 'CO', countryName: '哥伦比亚', region: '南美' },

  // 非洲主要港口
  { code: 'JNB', nameEn: 'Johannesburg', nameCn: '约翰内斯堡', countryCode: 'ZA', countryName: '南非', region: '非洲' },
  { code: 'CPT', nameEn: 'Cape Town', nameCn: '开普敦', countryCode: 'ZA', countryName: '南非', region: '非洲' },
  { code: 'DUR', nameEn: 'Durban', nameCn: '德班', countryCode: 'ZA', countryName: '南非', region: '非洲' },
  { code: 'LAG', nameEn: 'Lagos', nameCn: '拉各斯', countryCode: 'NG', countryName: '尼日利亚', region: '非洲' },
  { code: 'MOM', nameEn: 'Mombasa', nameCn: '蒙巴萨', countryCode: 'KE', countryName: '肯尼亚', region: '非洲' },
];

async function main() {
  console.log('🌱 Starting base data seed...');

  // 检查是否已有数据
  const existingRoutes = await prisma.route.count();
  const existingCarriers = await prisma.carrier.count();
  const existingPorts = await prisma.port.count();

  console.log('📊 Current data status:');
  console.log(`   - Routes: ${existingRoutes}`);
  console.log(`   - Carriers: ${existingCarriers}`);
  console.log(`   - Ports: ${existingPorts}`);

  // 创建航线（如果不存在）
  let createdRoutes = [];
  if (existingRoutes === 0) {
    console.log('\n🚢 Creating routes...');
    createdRoutes = await Promise.all(
      routesData.map(route =>
        prisma.route.create({
          data: {
            code: route.code,
            nameEn: route.nameEn,
            nameCn: route.nameCn,
            description: route.description,
            regionFrom: route.regionFrom,
            regionTo: route.regionTo,
            isActive: true,
          },
        })
      )
    );
    console.log(`✅ Created ${createdRoutes.length} routes`);
  } else {
    console.log('\n⏭️  Skipping route creation (already exists)');
    createdRoutes = await prisma.route.findMany();
  }

  // 创建船公司（如果不存在）
  let createdCarriers = [];
  if (existingCarriers === 0) {
    console.log('\n🚢 Creating carriers...');
    createdCarriers = await Promise.all(
      carriersData.map(carrier =>
        prisma.carrier.create({
          data: {
            code: carrier.code,
            name: carrier.name,
            nameEn: carrier.nameEn,
            website: carrier.website,
            contactInfo: carrier.contactInfo,
            isActive: true,
          },
        })
      )
    );
    console.log(`✅ Created ${createdCarriers.length} carriers`);
  } else {
    console.log('\n⏭️  Skipping carrier creation (already exists)');
    createdCarriers = await prisma.carrier.findMany();
  }

  // 更新港口航线关联（如果航线刚创建）
  if (createdRoutes.length > 0 && existingPorts > 0) {
    console.log('\n⚓ Updating port route associations...');

    // 建立航线代码到ID的映射
    const routeCodeToId = {};
    createdRoutes.forEach(route => {
      routeCodeToId[route.code] = route.id;
    });

    // 区域到航线的映射规则
    const regionToRouteCode = {
      '远东': 'FE5',
      '东南亚': 'FE10',
      '东北亚': 'FE5',
      '欧洲': 'FE3',
      '地中海': 'FE4',
      '北美西岸': 'FE1',
      '北美东岸': 'FE2',
      '中东': 'FE6',
      '澳洲': 'FE7',
      '南美': 'FE8',
      '非洲': 'FE9',
    };

    // 获取所有港口并更新
    const allPorts = await prisma.port.findMany();
    let updatedCount = 0;

    for (const port of allPorts) {
      const routeCode = regionToRouteCode[port.region];
      const routeId = routeCode ? routeCodeToId[routeCode] : null;

      if (routeId && !port.routeId) {
        await prisma.port.update({
          where: { id: port.id },
          data: { routeId: routeId }
        });
        updatedCount++;
      }
    }
    console.log(`✅ Updated ${updatedCount} ports with route associations`);
  } else if (existingPorts === 0) {
    // 创建新港口
    console.log('\n⚓ Creating ports...');

    // 建立航线代码到ID的映射
    const routeCodeToId = {};
    createdRoutes.forEach(route => {
      routeCodeToId[route.code] = route.id;
    });

    // 区域到航线的映射规则
    const regionToRouteCode = {
      '远东': 'FE5',
      '东南亚': 'FE10',
      '东北亚': 'FE5',
      '欧洲': 'FE3',
      '地中海': 'FE4',
      '北美西岸': 'FE1',
      '北美东岸': 'FE2',
      '中东': 'FE6',
      '澳洲': 'FE7',
      '南美': 'FE8',
      '非洲': 'FE9',
    };

    const createdPorts = await Promise.all(
      portsData.map(port => {
        const routeCode = regionToRouteCode[port.region];
        const routeId = routeCode ? routeCodeToId[routeCode] : null;

        return prisma.port.create({
          data: {
            code: port.code,
            nameEn: port.nameEn,
            nameCn: port.nameCn,
            countryCode: port.countryCode,
            countryName: port.countryName,
            region: port.region,
            routeId: routeId,
            isActive: true,
          },
        });
      })
    );
    console.log(`✅ Created ${createdPorts.length} ports`);
  } else {
    console.log('\n⏭️  Skipping port creation (already exists)');
  }

  // 显示最终统计
  const finalRoutes = await prisma.route.count();
  const finalCarriers = await prisma.carrier.count();
  const finalPorts = await prisma.port.count();

  console.log('\n🎉 Base data seed completed!');
  console.log('\n📊 Final Summary:');
  console.log(`   - Routes: ${finalRoutes}`);
  console.log(`   - Carriers: ${finalCarriers}`);
  console.log(`   - Ports: ${finalPorts}`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
