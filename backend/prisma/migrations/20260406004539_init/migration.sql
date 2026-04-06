/*
  Warnings:

  - You are about to drop the column `sportId` on the `Equipe` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Equipe" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nom" TEXT NOT NULL,
    "nombrePlaces" INTEGER NOT NULL
);
INSERT INTO "new_Equipe" ("id", "nom", "nombrePlaces") SELECT "id", "nom", "nombrePlaces" FROM "Equipe";
DROP TABLE "Equipe";
ALTER TABLE "new_Equipe" RENAME TO "Equipe";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
