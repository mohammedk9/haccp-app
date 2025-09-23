// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

enum Role {
  ADMIN = 'ADMIN',
  OPERATOR = 'OPERATOR',
  QUALITY_MANAGER = 'QUALITY_MANAGER',
}

async function main() {
  try {
    const hashedPassword = await bcrypt.hash('m7md', 12);

    const admin = await prisma.user.upsert({
      where: { email: 'mohammdk9559@gmail.com' },
      update: {},
      create: {
        email: 'admin@example.com',
        password: hashedPassword,
        name: 'Super Admin',
        role: Role.ADMIN,
        isActive: true,
      },
    });

    console.log('✅ Admin user created:', admin.email);
  } catch (error: any) {
    console.error('❌ Error:', error.message || error);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
