import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'bencyubahiro77@gmail.com';
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        googleId: 'admin-google-id',
        email: adminEmail,
        firstName: 'benjamin',
        lastName: 'Cyubahiro',
        role: 'Admin',
      },
    });
    console.log('Admin user seeded successfully');
  } else {
    console.log('Admin user already exists');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
});
