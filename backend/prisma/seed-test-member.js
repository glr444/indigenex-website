const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // 创建测试会员
  const testEmail = 'test@example.com';

  const existingMember = await prisma.member.findUnique({
    where: { email: testEmail }
  });

  if (!existingMember) {
    const hashedPassword = await bcrypt.hash('Test123456', 12);

    const member = await prisma.member.create({
      data: {
        email: testEmail,
        password: hashedPassword,
        companyName: '测试公司',
        contactName: '测试用户',
        phone: '13800138000',
        position: '经理',
        status: 'APPROVED',  // 已通过审核，可直接登录
        role: 'MEMBER'
      }
    });

    console.log('✓ Test member created');
    console.log('  Email: test@example.com');
    console.log('  Password: Test123456');
    console.log('  Status: APPROVED');
  } else {
    console.log('✓ Test member already exists');
    console.log('  Email: test@example.com');
    console.log('  Password: Test123456');
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
