const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // 更新测试会员密码
  const hashedPassword = await bcrypt.hash('Demo123456', 12);

  const member = await prisma.member.update({
    where: { email: 'demo@example.com' },
    data: {
      password: hashedPassword,
      status: 'APPROVED'
    }
  });

  console.log('✓ 测试会员密码已更新');
  console.log('  邮箱: demo@example.com');
  console.log('  密码: Demo123456');
  console.log('  企业: ' + member.companyName);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
