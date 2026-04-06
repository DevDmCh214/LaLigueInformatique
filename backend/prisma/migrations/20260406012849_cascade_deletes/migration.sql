-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Equipe" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nom" TEXT NOT NULL,
    "nombrePlaces" INTEGER NOT NULL,
    "sportId" INTEGER NOT NULL,
    CONSTRAINT "Equipe_sportId_fkey" FOREIGN KEY ("sportId") REFERENCES "Sport" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Equipe" ("id", "nom", "nombrePlaces", "sportId") SELECT "id", "nom", "nombrePlaces", "sportId" FROM "Equipe";
DROP TABLE "Equipe";
ALTER TABLE "new_Equipe" RENAME TO "Equipe";
CREATE TABLE "new_Evenement" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "participants" INTEGER NOT NULL,
    "entitule" TEXT NOT NULL,
    "dateHeure" DATETIME NOT NULL,
    "description" TEXT,
    "sportId" INTEGER NOT NULL,
    CONSTRAINT "Evenement_sportId_fkey" FOREIGN KEY ("sportId") REFERENCES "Sport" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Evenement" ("dateHeure", "description", "entitule", "id", "participants", "sportId") SELECT "dateHeure", "description", "entitule", "id", "participants", "sportId" FROM "Evenement";
DROP TABLE "Evenement";
ALTER TABLE "new_Evenement" RENAME TO "Evenement";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
