// 常用港口数据
const commonPorts = [
  // 中国主要港口
  { code: 'CNSHA', nameEn: 'SHANGHAI', nameCn: '上海', countryCode: 'CN', countryName: '中国', region: '东亚' },
  { code: 'CNTAO', nameEn: 'QINGDAO', nameCn: '青岛', countryCode: 'CN', countryName: '中国', region: '东亚' },
  { code: 'CNTXG', nameEn: 'TIANJIN', nameCn: '天津', countryCode: 'CN', countryName: '中国', region: '东亚' },
  { code: 'CNDLC', nameEn: 'DALIAN', nameCn: '大连', countryCode: 'CN', countryName: '中国', region: '东亚' },
  { code: 'CNNSA', nameEn: 'NINGBO', nameCn: '宁波', countryCode: 'CN', countryName: '中国', region: '东亚' },
  { code: 'CNSZX', nameEn: 'SHENZHEN', nameCn: '深圳', countryCode: 'CN', countryName: '中国', region: '东亚' },
  { code: 'CNXMN', nameEn: 'XIAMEN', nameCn: '厦门', countryCode: 'CN', countryName: '中国', region: '东亚' },
  { code: 'CNFOS', nameEn: 'FOSHAN', nameCn: '佛山', countryCode: 'CN', countryName: '中国', region: '东亚' },
  { code: 'CNHKG', nameEn: 'HONG KONG', nameCn: '香港', countryCode: 'HK', countryName: '中国香港', region: '东亚' },
  { code: 'CNHUI', nameEn: 'HUIZHOU', nameCn: '惠州', countryCode: 'CN', countryName: '中国', region: '东亚' },

  // 日本
  { code: 'JPTYO', nameEn: 'TOKYO', nameCn: '东京', countryCode: 'JP', countryName: '日本', region: '东亚' },
  { code: 'JPYOK', nameEn: 'YOKOHAMA', nameCn: '横滨', countryCode: 'JP', countryName: '日本', region: '东亚' },
  { code: 'JPNGO', nameEn: 'NAGOYA', nameCn: '名古屋', countryCode: 'JP', countryName: '日本', region: '东亚' },
  { code: 'JPOSA', nameEn: 'OSAKA', nameCn: '大阪', countryCode: 'JP', countryName: '日本', region: '东亚' },
  { code: 'JPKOB', nameEn: 'KOBE', nameCn: '神户', countryCode: 'JP', countryName: '日本', region: '东亚' },
  { code: 'JPMOJ', nameEn: 'MOJI', nameCn: '门司', countryCode: 'JP', countryName: '日本', region: '东亚' },

  // 韩国
  { code: 'KRINC', nameEn: 'INCHEON', nameCn: '仁川', countryCode: 'KR', countryName: '韩国', region: '东亚' },
  { code: 'KRKRP', nameEn: 'GYEONGIN', nameCn: '京仁', countryCode: 'KR', countryName: '韩国', region: '东亚' },
  { code: 'KRPUS', nameEn: 'BUSAN', nameCn: '釜山', countryCode: 'KR', countryName: '韩国', region: '东亚' },

  // 东南亚
  { code: 'SGSIN', nameEn: 'SINGAPORE', nameCn: '新加坡', countryCode: 'SG', countryName: '新加坡', region: '东南亚' },
  { code: 'MYTPP', nameEn: 'PORT KLANG', nameCn: '巴生港', countryCode: 'MY', countryName: '马来西亚', region: '东南亚' },
  { code: 'IDJKT', nameEn: 'JAKARTA', nameCn: '雅加达', countryCode: 'ID', countryName: '印尼', region: '东南亚' },
  { code: 'THBKK', nameEn: 'BANGKOK', nameCn: '曼谷', countryCode: 'TH', countryName: '泰国', region: '东南亚' },
  { code: 'VNSGN', nameEn: 'HO CHI MINH', nameCn: '胡志明', countryCode: 'VN', countryName: '越南', region: '东南亚' },
  { code: 'VNHPH', nameEn: 'HAIPHONG', nameCn: '海防', countryCode: 'VN', countryName: '越南', region: '东南亚' },
  { code: 'PHMNL', nameEn: 'MANILA', nameCn: '马尼拉', countryCode: 'PH', countryName: '菲律宾', region: '东南亚' },

  // 欧洲
  { code: 'DEHAM', nameEn: 'HAMBURG', nameCn: '汉堡', countryCode: 'DE', countryName: '德国', region: '欧洲' },
  { code: 'NLRTM', nameEn: 'ROTTERDAM', nameCn: '鹿特丹', countryCode: 'NL', countryName: '荷兰', region: '欧洲' },
  { code: 'BEANR', nameEn: 'ANTWERP', nameCn: '安特卫普', countryCode: 'BE', countryName: '比利时', region: '欧洲' },
  { code: 'GBFXT', nameEn: 'FELIXSTOWE', nameCn: '费利克斯托', countryCode: 'GB', countryName: '英国', region: '欧洲' },
  { code: 'FRLEH', nameEn: 'LE HAVRE', nameCn: '勒阿弗尔', countryCode: 'FR', countryName: '法国', region: '欧洲' },
  { code: 'ESBCN', nameEn: 'BARCELONA', nameCn: '巴塞罗那', countryCode: 'ES', countryName: '西班牙', region: '欧洲' },
  { code: 'ITGOA', nameEn: 'GENOA', nameCn: '热那亚', countryCode: 'IT', countryName: '意大利', region: '欧洲' },

  // 北美
  { code: 'USLAX', nameEn: 'LOS ANGELES', nameCn: '洛杉矶', countryCode: 'US', countryName: '美国', region: '北美' },
  { code: 'USLGB', nameEn: 'LONG BEACH', nameCn: '长滩', countryCode: 'US', countryName: '美国', region: '北美' },
  { code: 'USOAK', nameEn: 'OAKLAND', nameCn: '奥克兰', countryCode: 'US', countryName: '美国', region: '北美' },
  { code: 'USSEA', nameEn: 'SEATTLE', nameCn: '西雅图', countryCode: 'US', countryName: '美国', region: '北美' },
  { code: 'USNYC', nameEn: 'NEW YORK', nameCn: '纽约', countryCode: 'US', countryName: '美国', region: '北美' },
  { code: 'USSAV', nameEn: 'SAVANNAH', nameCn: '萨凡纳', countryCode: 'US', countryName: '美国', region: '北美' },
  { code: 'CAVAN', nameEn: 'VANCOUVER', nameCn: '温哥华', countryCode: 'CA', countryName: '加拿大', region: '北美' },

  // 中东
  { code: 'AEDXB', nameEn: 'DUBAI', nameCn: '迪拜', countryCode: 'AE', countryName: '阿联酋', region: '中东' },
  { code: 'SAJED', nameEn: 'JEDDAH', nameCn: '吉达', countryCode: 'SA', countryName: '沙特', region: '中东' },

  // 澳洲
  { code: 'AUMEL', nameEn: 'MELBOURNE', nameCn: '墨尔本', countryCode: 'AU', countryName: '澳大利亚', region: '澳洲' },
  { code: 'AUSYD', nameEn: 'SYDNEY', nameCn: '悉尼', countryCode: 'AU', countryName: '澳大利亚', region: '澳洲' },
];

async function seedPorts() {
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();

  try {
    console.log('开始导入港口数据...');

    for (const port of commonPorts) {
      await prisma.port.upsert({
        where: { code: port.code },
        update: port,
        create: port,
      });
    }

    console.log(`成功导入 ${commonPorts.length} 个港口`);
  } catch (error) {
    console.error('导入失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedPorts();
