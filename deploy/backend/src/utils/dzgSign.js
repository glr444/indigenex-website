const crypto = require('crypto');

/**
 * 生成大掌柜API签名
 * 签名算法: Sign = MD5(secret + sorted_param_string + secret)
 * 其中 sorted_param_string 是将所有参数按参数名升序排序后，拼接为 name=value 格式
 *
 * @param {Object} params - 请求参数对象（不包含 app_key, timestamp, sign）
 * @param {string} appKey - AppKey
 * @param {string} appSecret - Secret
 * @returns {Object} - 包含 app_key, timestamp, sign 的对象
 */
function generateDzgSign(params, appKey, appSecret) {
  // 添加必要参数
  const signParams = {
    ...params,
    app_key: appKey,
    timestamp: Date.now().toString(),
  };

  // 按参数名升序排序
  const sortedKeys = Object.keys(signParams).sort();

  // 拼接为 name=value 格式
  const signString = sortedKeys
    .map(key => `${key}=${signParams[key]}`)
    .join('');

  // 生成签名: secret + sorted_param_string + secret
  const finalString = appSecret + signString + appSecret;
  const sign = crypto
    .createHash('md5')
    .update(finalString)
    .digest('hex')
    .toUpperCase();

  return {
    app_key: appKey,
    timestamp: signParams.timestamp,
    sign,
  };
}

/**
 * 构建完整的请求参数（包含签名）
 *
 * @param {Object} businessParams - 业务参数
 * @param {string} appKey - AppKey
 * @param {string} appSecret - Secret
 * @returns {Object} - 完整的请求参数
 */
function buildRequestParams(businessParams, appKey, appSecret) {
  const signParams = generateDzgSign(businessParams, appKey, appSecret);

  return {
    ...businessParams,
    ...signParams,
  };
}

module.exports = {
  generateDzgSign,
  buildRequestParams,
};
