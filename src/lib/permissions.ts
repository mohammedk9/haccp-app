import { prisma } from './prisma';

export async function getUserFacilityIds(
  userId: string,
  role: string
): Promise<string[] | null> {
  if (role === 'SUPER_ADMIN') return null;

  const userFacilities = await prisma.userFacility.findMany({
    where: { userId },
    select: { facilityId: true },
  });

  return userFacilities.map((uf) => uf.facilityId);
}
