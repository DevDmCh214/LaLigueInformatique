import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Insertion des donnees de demonstration...");

  // ── Nettoyage (suppression + reset auto-increment SQLite) ──
  await prisma.equipeParticipante.deleteMany();
  await prisma.reponse.deleteMany();
  await prisma.match.deleteMany();
  await prisma.evenement.deleteMany();
  await prisma.sportInscription.deleteMany();
  await prisma.appartenir.deleteMany();
  await prisma.equipe.deleteMany();
  await prisma.sport.deleteMany();
  await prisma.utilisateur.deleteMany();

  // Reset auto-increment counters (SQLite)
  await prisma.$executeRawUnsafe(`DELETE FROM sqlite_sequence`);


  // ── Sports ──────────────────────────────────────────────────
  const football = await prisma.sport.create({ data: { nom: "Football" } });
  const basketball = await prisma.sport.create({ data: { nom: "Basketball" } });
  const volleyball = await prisma.sport.create({ data: { nom: "Volleyball" } });
  const tennis = await prisma.sport.create({ data: { nom: "Tennis" } });

  // ── Utilisateurs ────────────────────────────────────────────
  const hash = await bcrypt.hash("Password1!", 10);

  const alice = await prisma.utilisateur.create({
    data: { nom: "Dupont", prenom: "Alice", email: "alice@example.com", mdp: hash, role: "admin" },
  });
  const bob = await prisma.utilisateur.create({
    data: { nom: "Martin", prenom: "Bob", email: "bob@example.com", mdp: hash, role: "admin" },
  });
  const claire = await prisma.utilisateur.create({
    data: { nom: "Petit", prenom: "Claire", email: "claire@example.com", mdp: hash, role: "admin" },
  });
  const david = await prisma.utilisateur.create({
    data: { nom: "Leroy", prenom: "David", email: "david@example.com", mdp: hash, role: "utilisateur" },
  });
  const emma = await prisma.utilisateur.create({
    data: { nom: "Bernard", prenom: "Emma", email: "emma@example.com", mdp: hash, role: "utilisateur" },
  });
  const francois = await prisma.utilisateur.create({
    data: { nom: "Moreau", prenom: "Francois", email: "francois@example.com", mdp: hash, role: "utilisateur" },
  });

  // ── Inscriptions aux sports (listeSportsInscript) ───────────
  await prisma.sportInscription.createMany({
    data: [
      { utilisateurId: alice.id, sportId: football.id },
      { utilisateurId: alice.id, sportId: basketball.id },
      { utilisateurId: bob.id, sportId: football.id },
      { utilisateurId: bob.id, sportId: volleyball.id },
      { utilisateurId: claire.id, sportId: basketball.id },
      { utilisateurId: claire.id, sportId: tennis.id },
      { utilisateurId: david.id, sportId: football.id },
      { utilisateurId: david.id, sportId: basketball.id },
      { utilisateurId: emma.id, sportId: volleyball.id },
      { utilisateurId: emma.id, sportId: tennis.id },
      { utilisateurId: francois.id, sportId: football.id },
      { utilisateurId: francois.id, sportId: basketball.id },
    ],
  });

  // ── Equipes ─────────────────────────────────────────────────
  const fcParis = await prisma.equipe.create({
    data: { nom: "FC Paris", nombrePlaces: 11 },
  });
  const lyonBasket = await prisma.equipe.create({
    data: { nom: "Lyon Basket", nombrePlaces: 5 },
  });
  const marseilleVolley = await prisma.equipe.create({
    data: { nom: "Marseille Volley", nombrePlaces: 6 },
  });
  const niceFC = await prisma.equipe.create({
    data: { nom: "OGC Nice", nombrePlaces: 11 },
  });

  // ── Appartenir (Utilisateur <-> Equipe) ─────────────────────
  await prisma.appartenir.createMany({
    data: [
      { utilisateurId: alice.id, equipeId: fcParis.id },
      { utilisateurId: bob.id, equipeId: fcParis.id },
      { utilisateurId: david.id, equipeId: fcParis.id },
      { utilisateurId: francois.id, equipeId: fcParis.id },
      { utilisateurId: claire.id, equipeId: lyonBasket.id },
      { utilisateurId: david.id, equipeId: lyonBasket.id },
      { utilisateurId: bob.id, equipeId: lyonBasket.id },
      { utilisateurId: emma.id, equipeId: marseilleVolley.id },
      { utilisateurId: bob.id, equipeId: marseilleVolley.id },
      { utilisateurId: francois.id, equipeId: niceFC.id },
      { utilisateurId: emma.id, equipeId: niceFC.id },
    ],
  });

  // ── Evenements (non-matchs) ─────────────────────────────────
  const now = new Date();

  const entrainement1 = await prisma.evenement.create({
    data: {
      entitule: "Entrainement collectif",
      participants: 15,
      dateHeure: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3, 18, 0),
      description: "Seance de preparation physique et tactique",
      sportId: football.id,
    },
  });

  const entrainement2 = await prisma.evenement.create({
    data: {
      entitule: "Entrainement tirs",
      participants: 10,
      dateHeure: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2, 17, 0),
      description: "Travail des tirs a trois points",
      sportId: basketball.id,
    },
  });

  const tournoi = await prisma.evenement.create({
    data: {
      entitule: "Tournoi amical de volley",
      participants: 24,
      dateHeure: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 15, 9, 0),
      description: "Tournoi inter-clubs sur la journee",
      sportId: volleyball.id,
    },
  });

  // ── Evenements qui sont des Matchs ──────────────────────────
  const evMatch1 = await prisma.evenement.create({
    data: {
      entitule: "FC Paris vs OGC Nice",
      participants: 22,
      dateHeure: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7, 15, 0),
      description: "Match de championnat - Journee 12",
      sportId: football.id,
    },
  });
  const match1 = await prisma.match.create({
    data: { evenementId: evMatch1.id },
  });
  await prisma.equipeParticipante.createMany({
    data: [
      { matchId: match1.id, equipeId: fcParis.id },
      { matchId: match1.id, equipeId: niceFC.id },
    ],
  });

  const evMatch2 = await prisma.evenement.create({
    data: {
      entitule: "Lyon Basket vs Marseille Volley",
      participants: 12,
      dateHeure: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 10, 20, 0),
      description: "Match amical inter-sports",
      sportId: basketball.id,
    },
  });
  const match2 = await prisma.match.create({
    data: { evenementId: evMatch2.id },
  });
  await prisma.equipeParticipante.createMany({
    data: [
      { matchId: match2.id, equipeId: lyonBasket.id },
      { matchId: match2.id, equipeId: marseilleVolley.id },
    ],
  });

  // Un match deja joue avec un gagnant
  const evMatch3 = await prisma.evenement.create({
    data: {
      entitule: "FC Paris vs Lyon Basket",
      participants: 16,
      dateHeure: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 3, 16, 0),
      description: "Match retour",
      sportId: football.id,
    },
  });
  const match3 = await prisma.match.create({
    data: { evenementId: evMatch3.id, equipeGagnanteId: fcParis.id },
  });
  await prisma.equipeParticipante.createMany({
    data: [
      { matchId: match3.id, equipeId: fcParis.id },
      { matchId: match3.id, equipeId: lyonBasket.id },
    ],
  });

  // ── Reponses (doit repondre) ────────────────────────────────
  await prisma.reponse.createMany({
    data: [
      { utilisateurId: alice.id, evenementId: entrainement1.id, reponse: "present" },
      { utilisateurId: bob.id, evenementId: entrainement1.id, reponse: "present" },
      { utilisateurId: david.id, evenementId: entrainement1.id, reponse: "absent" },
      { utilisateurId: claire.id, evenementId: entrainement2.id, reponse: "present" },
      { utilisateurId: david.id, evenementId: entrainement2.id, reponse: "peut-etre" },
      { utilisateurId: alice.id, evenementId: evMatch1.id, reponse: "present" },
      { utilisateurId: bob.id, evenementId: evMatch1.id, reponse: "present" },
      { utilisateurId: francois.id, evenementId: evMatch1.id, reponse: "present" },
      { utilisateurId: claire.id, evenementId: evMatch2.id, reponse: "present" },
      { utilisateurId: david.id, evenementId: evMatch2.id, reponse: "absent" },
      { utilisateurId: emma.id, evenementId: tournoi.id, reponse: "present" },
      { utilisateurId: bob.id, evenementId: tournoi.id, reponse: "peut-etre" },
    ],
  });

  console.log("Donnees de demonstration inserees avec succes !");
  console.log("Comptes de test : alice@example.com / bob@example.com / ... (mdp: Password1!)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
