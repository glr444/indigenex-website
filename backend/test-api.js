const axios = require('axios');

const BASE_URL = 'http://47.236.193.197/api';

async function test() {
  try {
    // 1. 登录获取token
    console.log('1. 登录测试...');
    const loginRes = await axios.post(`${BASE_URL}/member/auth/login`, {
      email: 'test@example.com',
      password: 'Test123456'
    });
    console.log('登录结果:', loginRes.data.success);

    if (!loginRes.data.success) {
      console.log('登录失败:', loginRes.data.message);
      return;
    }

    const token = loginRes.data.data.token;
    console.log('Token 前50字符:', token.substring(0, 50));

    // 2. 获取运价列表
    console.log('\n2. 获取运价列表...');
    const ratesRes = await axios.get(`${BASE_URL}/freight-rates`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('运价结果:', ratesRes.data.success);
    console.log('运价数量:', ratesRes.data.data?.rates?.length || 0);

  } catch (err) {
    console.error('错误:', err.response?.data || err.message);
  }
}

test();
