-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "utilisateurId" INTEGER NOT NULL,
    "ipAddress" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "Session_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "Utilisateur" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Connexion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ipAddress" TEXT NOT NULL,
    "utilisateurId" INTEGER,
    "attemptedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "success" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Connexion_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "Utilisateur" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "utilisateurId" INTEGER,
    "tableName" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "recordId" TEXT NOT NULL,
    "oldState" TEXT,
    "newState" TEXT
);

-- CreateIndex
CREATE INDEX "Session_utilisateurId_idx" ON "Session"("utilisateurId");

-- CreateIndex
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");

-- CreateIndex
CREATE INDEX "Connexion_ipAddress_attemptedAt_idx" ON "Connexion"("ipAddress", "attemptedAt");

-- CreateIndex
CREATE INDEX "Connexion_utilisateurId_idx" ON "Connexion"("utilisateurId");
