-- AlterEnum
ALTER TYPE "public"."Role" ADD VALUE 'SUPER_ADMIN';

-- AlterTable
ALTER TABLE "public"."Product" ADD COLUMN     "facilityId" TEXT;

-- AlterTable
ALTER TABLE "public"."Storage" ADD COLUMN     "facilityId" TEXT;

-- CreateTable
CREATE TABLE "public"."UserFacility" (
    "userId" TEXT NOT NULL,
    "facilityId" TEXT NOT NULL,

    CONSTRAINT "UserFacility_pkey" PRIMARY KEY ("userId","facilityId")
);

-- AddForeignKey
ALTER TABLE "public"."UserFacility" ADD CONSTRAINT "UserFacility_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserFacility" ADD CONSTRAINT "UserFacility_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "public"."Facility"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Product" ADD CONSTRAINT "Product_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "public"."Facility"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Storage" ADD CONSTRAINT "Storage_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "public"."Facility"("id") ON DELETE SET NULL ON UPDATE CASCADE;
