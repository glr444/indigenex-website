const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

const MEMBER_JWT_SECRET = process.env.MEMBER_JWT_SECRET || process.env.JWT_SECRET || 'fallback-secret';

console.log('JWT Secret:', MEMBER_JWT_SECRET.substring(0, 20) + '...');
console.log('');

async function test() {
  // 1. 登录获取新token
  console.log('1. 查找会员...');
  const member = await prisma.member.findFirst({
    where: { email: 'test@example.com' }
  });

  if (!member) {
    console.log('会员不存在!');
    return;
  }

  console.log('会员:', member.companyName);
  console.log('会员ID:', member.id);

  // 2. 验证密码
  const isValid = await bcrypt.compare('Test123456', member.password);
  console.log('密码验证:', isValid);

  // 3. 生成新token
  const token = jwt.sign(
    { memberId: member.id, role: 'MEMBER', type: 'member' },
    MEMBER_JWT_SECRET,
    { expiresIn: '7d' }
  );
  console.log('\n新Token:', token.substring(0, 60) + '...');

  // 4. 验证token
  try {
    const decoded = jwt.verify(token, MEMBER_JWT_SECRET);
    console.log('Token验证成功:', decoded);
  } catch (err) {
    console.error('Token验证失败:', err.message);
  }

  await prisma.$disconnect();
}

test();
