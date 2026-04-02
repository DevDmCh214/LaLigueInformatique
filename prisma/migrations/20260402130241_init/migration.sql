-- CreateTable
CREATE TABLE "Utilisateur" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "mdp" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'utilisateur'
);

-- CreateTable
CREATE TABLE "Sport" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nom" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Equipe" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nom" TEXT NOT NULL,
    "nombrePlaces" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "Evenement" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "participants" INTEGER NOT NULL,
    "entitule" TEXT NOT NULL,
    "dateHeure" DATETIME NOT NULL,
    "description" TEXT,
    "sportId" INTEGER NOT NULL,
    CONSTRAINT "Evenement_sportId_fkey" FOREIGN KEY ("sportId") REFERENCES "Sport" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Match" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "evenementId" INTEGER NOT NULL,
    "equipeGagnanteId" INTEGER,
    CONSTRAINT "Match_evenementId_fkey" FOREIGN KEY ("evenementId") REFERENCES "Evenement" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Match_equipeGagnanteId_fkey" FOREIGN KEY ("equipeGagnanteId") REFERENCES "Equipe" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Reponse" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "reponse" TEXT NOT NULL,
    "utilisateurId" INTEGER NOT NULL,
    "evenementId" INTEGER NOT NULL,
    CONSTRAINT "Reponse_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "Utilisateur" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Reponse_evenementId_fkey" FOREIGN KEY ("evenementId") REFERENCES "Evenement" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Appartenir" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "utilisateurId" INTEGER NOT NULL,
    "equipeId" INTEGER NOT NULL,
    CONSTRAINT "Appartenir_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "Utilisateur" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Appartenir_equipeId_fkey" FOREIGN KEY ("equipeId") REFERENCES "Equipe" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EquipeParticipante" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "matchId" INTEGER NOT NULL,
    "equipeId" INTEGER NOT NULL,
    CONSTRAINT "EquipeParticipante_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "EquipeParticipante_equipeId_fkey" FOREIGN KEY ("equipeId") REFERENCES "Equipe" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SportInscription" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "utilisateurId" INTEGER NOT NULL,
    "sportId" INTEGER NOT NULL,
    CONSTRAINT "SportInscription_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "Utilisateur" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SportInscription_sportId_fkey" FOREIGN KEY ("sportId") REFERENCES "Sport" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Utilisateur_email_key" ON "Utilisateur"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Sport_nom_key" ON "Sport"("nom");

-- CreateIndex
CREATE UNIQUE INDEX "Match_evenementId_key" ON "Match"("evenementId");

-- CreateIndex
CREATE UNIQUE INDEX "Reponse_utilisateurId_evenementId_key" ON "Reponse"("utilisateurId", "evenementId");

-- CreateIndex
CREATE UNIQUE INDEX "Appartenir_utilisateurId_equipeId_key" ON "Appartenir"("utilisateurId", "equipeId");

-- CreateIndex
CREATE UNIQUE INDEX "EquipeParticipante_matchId_equipeId_key" ON "EquipeParticipante"("matchId", "equipeId");

-- CreateIndex
CREATE UNIQUE INDEX "SportInscription_utilisateurId_sportId_key" ON "SportInscription"("utilisateurId", "sportId");
