/*
  Warnings:

  - You are about to drop the column `target` on the `AuditLog` table. All the data in the column will be lost.
  - Added the required column `createdBy` to the `Facility` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Facility` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `HaccpStep` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `HaccpStep` table without a default value. This is not possible if the table is not empty.
  - Made the column `name` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateTable
CREATE TABLE "Hazard" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "severity" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "facilityId" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    CONSTRAINT "Hazard_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Facility" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Hazard_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CCP" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "criticalLimit" TEXT,
    "monitoringProcedure" TEXT,
    "correctiveActions" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "facilityId" TEXT NOT NULL,
    "hazardId" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    CONSTRAINT "CCP_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Facility" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CCP_hazardId_fkey" FOREIGN KEY ("hazardId") REFERENCES "Hazard" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CCP_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Record" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "value" TEXT NOT NULL,
    "status" TEXT,
    "notes" TEXT,
    "measuredAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "facilityId" TEXT NOT NULL,
    "ccpId" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    CONSTRAINT "Record_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Facility" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Record_ccpId_fkey" FOREIGN KEY ("ccpId") REFERENCES "CCP" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Record_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "action" TEXT NOT NULL,
    "targetId" TEXT,
    "targetType" TEXT,
    "details" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_AuditLog" ("action", "createdAt", "id", "userId") SELECT "action", "createdAt", "id", "userId" FROM "AuditLog";
DROP TABLE "AuditLog";
ALTER TABLE "new_AuditLog" RENAME TO "AuditLog";
CREATE TABLE "new_Facility" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "location" TEXT,
    "type" TEXT,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdBy" TEXT NOT NULL,
    CONSTRAINT "Facility_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Facility" ("createdAt", "id", "location", "name") SELECT "createdAt", "id", "location", "name" FROM "Facility";
DROP TABLE "Facility";
ALTER TABLE "new_Facility" RENAME TO "Facility";
CREATE TABLE "new_HaccpRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "value" TEXT NOT NULL,
    "note" TEXT,
    "measuredAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "stepId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "HaccpRecord_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "HaccpStep" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "HaccpRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_HaccpRecord" ("id", "measuredAt", "note", "stepId", "userId", "value") SELECT "id", "measuredAt", "note", "stepId", "userId", "value" FROM "HaccpRecord";
DROP TABLE "HaccpRecord";
ALTER TABLE "new_HaccpRecord" RENAME TO "HaccpRecord";
CREATE TABLE "new_HaccpStep" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "stepNumber" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "criticalLimit" TEXT,
    "monitoringProcedure" TEXT,
    "correctiveActions" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "planId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "HaccpStep_planId_fkey" FOREIGN KEY ("planId") REFERENCES "HaccpPlan" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "HaccpStep_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_HaccpStep" ("correctiveActions", "criticalLimit", "description", "id", "monitoringProcedure", "planId", "stepNumber") SELECT "correctiveActions", "criticalLimit", "description", "id", "monitoringProcedure", "planId", "stepNumber" FROM "HaccpStep";
DROP TABLE "HaccpStep";
ALTER TABLE "new_HaccpStep" RENAME TO "HaccpStep";
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'OPERATOR',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("createdAt", "email", "id", "name", "password", "role", "updatedAt") SELECT "createdAt", "email", "id", "name", "password", "role", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
