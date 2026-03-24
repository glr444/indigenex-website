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
 * 期望的列名：航线, 起运港, 目的港, 船公司, 20GP, 40GP, 40HQ, 币种, 生效日期, 到期日期
 *
 * @param {Array} rows - Excel解析后的行数据
 * @returns {Array} - 标准化的运价数据
 */
function parseFreightRateExcel(rows) {
  const fieldMappings = {
    // 中文列名映射
    '航线': 'route',
    '起运港': 'originPort',
    'POL': 'originPort',
    '装货港': 'originPort',
    '目的港': 'destinationPort',
    'POD': 'destinationPort',
    '卸货港': 'destinationPort',
    '中转港': 'viaPort',
    '船公司': 'carrier',
    '承运人': 'carrier',
    '20GP': 'price20GP',
    '40GP': 'price40GP',
    '40HQ': 'price40HQ',
    '45HQ': 'price45HQ',
    '拼箱': 'priceLCL',
    'LCL': 'priceLCL',
    '币种': 'currency',
    '货币': 'currency',
    '生效日期': 'validFrom',
    '生效日': 'validFrom',
    '有效期从': 'validFrom',
    '到期日期': 'validTo',
    '到期日': 'validTo',
    '有效期至': 'validTo',
    '船期': 'schedule',
    '运输时间': 'transitTime',
    '航程': 'transitTime',
    '备注': 'remarks',
  };

  return rows.map(row => {
    const standardRow = {};

    for (const [key, value] of Object.entries(row)) {
      const normalizedKey = String(key).trim();
      const standardField = fieldMappings[normalizedKey];

      if (standardField) {
        let normalizedValue = value;

        // 处理价格字段
        if (['price20GP', 'price40GP', 'price40HQ', 'price45HQ', 'priceLCL'].includes(standardField)) {
          normalizedValue = parseFloat(value) || null;
        }

        // 处理日期字段
        if (['validFrom', 'validTo'].includes(standardField) && value) {
          // 尝试解析日期（支持多种格式）
          const dateValue = parseDate(value);
          normalizedValue = dateValue ? dateValue.toISOString() : value;
        }

        // 处理运输时间
        if (standardField === 'transitTime') {
          normalizedValue = parseInt(value) || null;
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
