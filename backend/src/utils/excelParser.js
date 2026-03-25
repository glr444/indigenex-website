const xlsx = require('xlsx');

/**
 * 解析Excel文件为JSON数组
 *
 * @param {Buffer} buffer - 文件Buffer
 * @returns {Array} - 解析后的数据数组
 */
function parseExcel(buffer) {
  const workbook = xlsx.read(buffer, { type: 'buffer' });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];

  // 转换为JSON，第一行作为表头
  const data = xlsx.utils.sheet_to_json(worksheet, {
    header: 1,
    raw: false,
    defval: '',
  });

  if (data.length < 2) {
    return [];
  }

  // 第一行作为表头
  const headers = data[0].map(h => String(h).trim());

  // 剩余行作为数据
  const rows = data.slice(1).map(row => {
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = row[index] || '';
    });
    return obj;
  });

  return rows;
}

/**
 * 将运价Excel数据转换为标准格式
 * 支持字段：航线, 航线代码, 起运港, 起运港英文, 目的港, 目的港英文, 中转港, 港区, 船公司,
 * 20GP运价, 40GP运价, 40HQ运价, 45HQ运价, 币种, 20GP成本, 40GP成本, 40HQ成本, 45HQ成本, ALL IN,
 * 航程, 船期, 船名, 航次, 开航日, ETD, 订舱代理, 订舱链接, 舱位状态,
 * 截文件天, 截文件时间, 提单类型, 运输条款, 限重, 有效期开始, 有效期结束, 有效期类型,
 * 运价趋势, 联系方式, 是否推荐, 附加费, 备注
 *
 * @param {Array} rows - Excel解析后的行数据
 * @returns {Array} - 标准化的运价数据
 */
function parseFreightRateExcel(rows) {
  const fieldMappings = {
    // 基本信息
    '航线': 'route',
    'Route': 'route',
    '航线代码': 'routeCode',
    'Route Code': 'routeCode',

    // 港口
    '起运港': 'originPort',
    'POL': 'originPort',
    'Origin Port': 'originPort',
    '装货港': 'originPort',
    '起运港英文': 'originPortEn',
    'Origin Port EN': 'originPortEn',
    '目的港': 'destinationPort',
    'POD': 'destinationPort',
    'Destination Port': 'destinationPort',
    '卸货港': 'destinationPort',
    '目的港英文': 'destinationPortEn',
    'Destination Port EN': 'destinationPortEn',
    '中转港': 'viaPort',
    'Via': 'viaPort',
    '中转港英文': 'viaPortEn',
    'Via EN': 'viaPortEn',
    '港区': 'portArea',
    'Port Area': 'portArea',

    // 船公司
    '船公司': 'carrier',
    'Carrier': 'carrier',
    '承运人': 'carrier',

    // 运价
    '20GP': 'price20GP',
    '20GP运价': 'price20GP',
    '20GP Price': 'price20GP',
    '40GP': 'price40GP',
    '40GP运价': 'price40GP',
    '40GP Price': 'price40GP',
    '40HQ': 'price40HQ',
    '40HQ运价': 'price40HQ',
    '40HQ Price': 'price40HQ',
    '45HQ': 'price45HQ',
    '45HQ运价': 'price45HQ',
    '45HQ Price': 'price45HQ',
    '币种': 'currency',
    'Currency': 'currency',
    '货币': 'currency',

    // 成本
    '20GP成本': 'cost20GP',
    '20GP Cost': 'cost20GP',
    '40GP成本': 'cost40GP',
    '40GP Cost': 'cost40GP',
    '40HQ成本': 'cost40HQ',
    '40HQ Cost': 'cost40HQ',
    '45HQ成本': 'cost45HQ',
    '45HQ Cost': 'cost45HQ',
    'ALL IN': 'isAllIn',
    'Is All In': 'isAllIn',
    '是否ALL IN': 'isAllIn',

    // 航程
    '航程': 'transitTime',
    'Transit Time': 'transitTime',
    '运输时间': 'transitTime',
    'T/T': 'transitTime',
    '船期': 'schedule',
    'Schedule': 'schedule',
    '船名': 'vesselName',
    'Vessel': 'vesselName',
    '航次': 'voyage',
    'Voyage': 'voyage',
    '开航日': 'sailingDate',
    'Sailing Date': 'sailingDate',
    'ETD': 'estimatedDeparture',
    '预计开船': 'estimatedDeparture',

    // 订舱
    '订舱代理': 'bookingAgent',
    'Booking Agent': 'bookingAgent',
    '订舱链接': 'bookingLink',
    'Booking Link': 'bookingLink',
    '舱位状态': 'spaceStatus',
    'Space Status': 'spaceStatus',

    // 文件截止
    '截文件天': 'docCutoffDay',
    'Doc Cutoff Day': 'docCutoffDay',
    '截文件时间': 'docCutoffTime',
    'Doc Cutoff Time': 'docCutoffTime',
    'SI Cutoff': 'docCutoffTime',

    // 提单
    '提单类型': 'billOfLadingType',
    'B/L Type': 'billOfLadingType',
    '运输条款': 'shippingTerms',
    'Shipping Terms': 'shippingTerms',
    'Terms': 'shippingTerms',
    '限重': 'weightLimit',
    'Weight Limit': 'weightLimit',

    // 有效期
    '有效期开始': 'validFrom',
    'Valid From': 'validFrom',
    '生效日期': 'validFrom',
    '有效期结束': 'validTo',
    'Valid To': 'validTo',
    '到期日期': 'validTo',
    '有效期类型': 'validityType',
    'Validity Type': 'validityType',

    // 其他
    '运价趋势': 'priceTrend',
    'Price Trend': 'priceTrend',
    'Trend': 'priceTrend',
    '联系方式': 'contactInfo',
    'Contact': 'contactInfo',
    '是否推荐': 'isRecommended',
    'Recommended': 'isRecommended',
    '附加费': 'surcharges',
    'Surcharges': 'surcharges',
    '备注': 'remarks',
    'Remarks': 'remarks',
    'Note': 'remarks'
  };

  return rows.map(row => {
    const standardRow = {};

    for (const [key, value] of Object.entries(row)) {
      const normalizedKey = String(key).trim();
      const standardField = fieldMappings[normalizedKey];

      if (standardField) {
        let normalizedValue = value;

        // 处理价格字段
        if (['price20GP', 'price40GP', 'price40HQ', 'price45HQ', 'cost20GP', 'cost40GP', 'cost40HQ', 'cost45HQ'].includes(standardField)) {
          normalizedValue = parseFloat(value) || null;
        }

        // 处理日期字段
        if (['validFrom', 'validTo', 'sailingDate', 'estimatedDeparture'].includes(standardField) && value) {
          const dateValue = parseDate(value);
          normalizedValue = dateValue ? dateValue.toISOString() : value;
        }

        // 处理航程
        if (standardField === 'transitTime') {
          normalizedValue = parseInt(value) || null;
        }

        // 处理布尔值
        if (['isRecommended', 'isAllIn'].includes(standardField)) {
          normalizedValue = value === true || value === 'true' || value === '是' || value === 'YES' || value === 'Y' || value === '1';
        }

        // 处理附加费（简单解析，可以扩展）
        if (standardField === 'surcharges' && value) {
          try {
            if (typeof value === 'string' && (value.startsWith('[') || value.startsWith('{'))) {
              normalizedValue = JSON.parse(value);
            } else if (value) {
              // 简单文本格式，存储为字符串
              normalizedValue = [{ name: '附加费', amount: parseFloat(value) || 0, unit: 'per_container' }];
            }
          } catch (e) {
            normalizedValue = null;
          }
        }

        standardRow[standardField] = normalizedValue;
      }
    }

    return standardRow;
  });
}

/**
 * 解析日期字符串
 * 支持格式：YYYY-MM-DD, YYYY/MM/DD, DD-MM-YYYY, DD/MM/YYYY, MM-DD-YYYY, MM/DD/YYYY
 *
 * @param {string} dateStr - 日期字符串
 * @returns {Date|null} - Date对象或null
 */
function parseDate(dateStr) {
  if (!dateStr) return null;

  // 如果是Excel序列号日期
  if (typeof dateStr === 'number') {
    // Excel日期序列号转换为JS日期
    // Excel日期从1900年1月1日开始计数（但有一个1900年闰年bug）
    const excelEpoch = new Date(1899, 11, 30);
    return new Date(excelEpoch.getTime() + dateStr * 24 * 60 * 60 * 1000);
  }

  const str = String(dateStr).trim();

  // 尝试直接解析
  let date = new Date(str);
  if (!isNaN(date.getTime())) {
    return date;
  }

  // 尝试常见格式
  const patterns = [
    // YYYY-MM-DD 或 YYYY/MM/DD
    { regex: /^(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})$/, order: [1, 2, 3] },
    // DD-MM-YYYY 或 DD/MM/YYYY
    { regex: /^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/, order: [3, 2, 1] },
    // MM-DD-YYYY 或 MM/DD/YYYY
    { regex: /^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/, order: [3, 1, 2] },
  ];

  for (const pattern of patterns) {
    const match = str.match(pattern.regex);
    if (match) {
      const year = parseInt(match[pattern.order[0]]);
      const month = parseInt(match[pattern.order[1]]) - 1;
      const day = parseInt(match[pattern.order[2]]);
      date = new Date(year, month, day);
      if (!isNaN(date.getTime())) {
        return date;
      }
    }
  }

  return null;
}

module.exports = {
  parseExcel,
  parseFreightRateExcel,
  parseDate,
};
