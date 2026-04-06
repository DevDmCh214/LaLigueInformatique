-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Equipe" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nom" TEXT NOT NULL,
    "nombrePlaces" INTEGER NOT NULL,
    "sportId" INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT "Equipe_sportId_fkey" FOREIGN KEY ("sportId") REFERENCES "Sport" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Equipe" ("id", "nom", "nombrePlaces", "sportId") SELECT "id", "nom", "nombrePlaces", 1 FROM "Equipe";
DROP TABLE "Equipe";
ALTER TABLE "new_Equipe" RENAME TO "Equipe";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
