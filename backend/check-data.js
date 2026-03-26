const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const count = await prisma.freightRate.count();
  console.log('FreightRate count:', count);

  if (count > 0) {
    const samples = await prisma.freightRate.findMany({ take: 2 });
    console.log('Sample records:', JSON.stringify(samples, null, 2));
  }

  // 检查会员账号
  const memberCount = await prisma.member.count();
  console.log('Member count:', memberCount);

  const testMember = await prisma.member.findFirst({
    where: { email: 'test@example.com' }
  });
  console.log('Test member exists:', !!testMember);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
