const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  // 检查会员
  const member = await prisma.member.findFirst({
    where: { email: 'test@example.com' }
  });

  if (member) {
    console.log('Member found:', {
      id: member.id,
      email: member.email,
      companyName: member.companyName,
      status: member.status,
      hasPassword: !!member.password,
      passwordLength: member.password?.length
    });

    // 验证密码
    const testPassword = 'Test123456';
    if (member.password) {
      const isValid = await bcrypt.compare(testPassword, member.password);
      console.log('Password Test123456 valid:', isValid);
    }

    // 如果密码不对，重置密码
    if (!member.password || !(await bcrypt.compare(testPassword, member.password))) {
      const hashedPassword = await bcrypt.hash(testPassword, 10);
      await prisma.member.update({
        where: { id: member.id },
        data: { password: hashedPassword }
      });
      console.log('Password reset to: Test123456');
    }
  } else {
    console.log('Creating test member...');
    const hashedPassword = await bcrypt.hash('Test123456', 10);
    const newMember = await prisma.member.create({
      data: {
        companyName: 'Test Company',
        contactName: 'Test User',
        phone: '13800138000',
        email: 'test@example.com',
        password: hashedPassword,
        status: 'APPROVED'
      }
    });
    console.log('Test member created:', newMember.id);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
