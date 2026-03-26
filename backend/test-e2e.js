const axios = require('axios');

const BASE_URL = 'http://47.236.193.197/api';

async function test() {
  try {
    console.log('=== 会员登录测试 ===');
    const loginRes = await axios.post(`${BASE_URL}/member/auth/login`, {
      email: 'test@example.com',
      password: 'Test123456'
    });

    console.log('登录状态:', loginRes.data.success);
    console.log('登录消息:', loginRes.data.message);

    if (!loginRes.data.success) {
      console.log('登录失败');
      return;
    }

    const token = loginRes.data.data.token;
    console.log('Token:', token.substring(0, 50) + '...');

    console.log('\n=== 运价查询测试 ===');
    const ratesRes = await axios.get(`${BASE_URL}/freight-rates`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    console.log('运价API状态:', ratesRes.data.success);
    console.log('运价数量:', ratesRes.data.data?.rates?.length || 0);

  } catch (err) {
    console.error('错误:', err.response?.data || err.message);
  }
}

test();
