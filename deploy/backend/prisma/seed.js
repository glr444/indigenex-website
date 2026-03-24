const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const adminExists = await prisma.user.findUnique({
    where: { username: 'admin' }
  });

  if (!adminExists) {
    const hashedPassword = await bcrypt.hash('Ab1234567', 12);

    await prisma.user.create({
      data: {
        username: 'admin',
        password: hashedPassword,
        role: 'ADMIN',
        isFirstLogin: true
      }
    });

    console.log('✓ Initial admin user created');
    console.log('  Username: admin');
    console.log('  Password: Ab1234567');
    console.log('  ⚠️  You will be prompted to change password on first login');
  } else {
    console.log('✓ Admin user already exists');
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
