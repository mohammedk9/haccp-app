// prisma/seed.ts
import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // كلمة المرور
  const hashedPassword = await bcrypt.hash('m7md', 12);

  // إنشاء المستخدم العام الوحيد (Super Admin)
  const superAdmin = await prisma.user.upsert({
    where: { email: 'mohammdk9559@gmail.com' },
    update: {},
    create: {
      email: 'mohammdk9559@gmail.com',
      password: hashedPassword,
      name: 'Super Admin',
       role: Role.SUPER_ADMIN,          // الدور الجديد الذي يرى جميع المنشآت
      isActive: true,
    },
  });

  console.log('✅ Super Admin ready:', superAdmin.email);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());