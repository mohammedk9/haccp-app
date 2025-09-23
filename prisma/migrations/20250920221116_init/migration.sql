/*
  Warnings:

  - You are about to drop the column `correctiveActions` on the `HaccpStep` table. All the data in the column will be lost.
  - You are about to drop the column `criticalLimit` on the `HaccpStep` table. All the data in the column will be lost.
  - You are about to drop the column `monitoringProcedure` on the `HaccpStep` table. All the data in the column will be lost.
  - Added the required column `title` to the `HaccpStep` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_HaccpStep" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "stepNumber" INTEGER,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "planId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "HaccpStep_planId_fkey" FOREIGN KEY ("planId") REFERENCES "HaccpPlan" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "HaccpStep_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_HaccpStep" ("createdAt", "description", "id", "planId", "stepNumber", "updatedAt", "userId") SELECT "createdAt", "description", "id", "planId", "stepNumber", "updatedAt", "userId" FROM "HaccpStep";
DROP TABLE "HaccpStep";
ALTER TABLE "new_HaccpStep" RENAME TO "HaccpStep";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
