import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Insertion des donnees de demonstration...");

  // Nettoyage
  await prisma.equipeParticipante.deleteMany();
  await prisma.reponse.deleteMany();
  await prisma.match.deleteMany();
  await prisma.evenement.deleteMany();
  await prisma.sportInscription.deleteMany();
  await prisma.appartenir.deleteMany();
  await prisma.equipe.deleteMany();
  await prisma.sport.deleteMany();
  await prisma.utilisateur.deleteMany();

  await prisma.$executeRawUnsafe(`DELETE FROM sqlite_sequence`);

  // Sports
  const football = await prisma.sport.create({ data: { nom: "Football" } });
  const basketball = await prisma.sport.create({ data: { nom: "Basketball" } });
  const volleyball = await prisma.sport.create({ data: { nom: "Volleyball" } });
  const course = await prisma.sport.create({ data: { nom: "Course" } });

  // Utilisateurs — passwords match GSB-doctors pattern
  const passwords: Record<string, string> = {
    alice:    "Ligue@2025!a",
    bob:      "Sport#B8x",
    claire:   "Equipe$C94",
    david:    "Match&D7m",
    emma:     "Volley!E3v",
    francois: "Foot@F5f",
    gabriel:  "Basket#G2b",
    helene:   "Course$H6c",
    isaac:    "Ligue&I9l",
    julie:    "Sport!J4s",
    kevin:    "Match@K1m",
    laura:    "Equipe#L7e",
  };

  const hashes: Record<string, string> = {};
  for (const [key, pwd] of Object.entries(passwords)) {
    hashes[key] = await bcrypt.hash(pwd, 10);
  }

  // Default password for any user not listed above
  const defaultHash = await bcrypt.hash("Ligue_User!01", 10);

  // --- Admins ---
  const alice = await prisma.utilisateur.create({
    data: { nom: "Dupont", prenom: "Alice", email: "alice@example.com", mdp: hashes.alice, role: "admin" },
  });
  const bob = await prisma.utilisateur.create({
    data: { nom: "Martin", prenom: "Bob", email: "bob@example.com", mdp: hashes.bob, role: "admin" },
  });
  const claire = await prisma.utilisateur.create({
    data: { nom: "Petit", prenom: "Claire", email: "claire@example.com", mdp: hashes.claire, role: "admin" },
  });

  // --- Regular users ---
  const david = await prisma.utilisateur.create({
    data: { nom: "Leroy", prenom: "David", email: "david@example.com", mdp: hashes.david, role: "utilisateur" },
  });
  const emma = await prisma.utilisateur.create({
    data: { nom: "Bernard", prenom: "Emma", email: "emma@example.com", mdp: hashes.emma, role: "utilisateur" },
  });
  const francois = await prisma.utilisateur.create({
    data: { nom: "Moreau", prenom: "Francois", email: "francois@example.com", mdp: hashes.francois, role: "utilisateur" },
  });
  const gabriel = await prisma.utilisateur.create({
    data: { nom: "Roux", prenom: "Gabriel", email: "gabriel@example.com", mdp: hashes.gabriel, role: "utilisateur" },
  });
  const helene = await prisma.utilisateur.create({
    data: { nom: "Fournier", prenom: "Helene", email: "helene@example.com", mdp: hashes.helene, role: "utilisateur" },
  });
  const isaac = await prisma.utilisateur.create({
    data: { nom: "Girard", prenom: "Isaac", email: "isaac@example.com", mdp: hashes.isaac, role: "utilisateur" },
  });
  const julie = await prisma.utilisateur.create({
    data: { nom: "Blanc", prenom: "Julie", email: "julie@example.com", mdp: hashes.julie, role: "utilisateur" },
  });
  const kevin = await prisma.utilisateur.create({
    data: { nom: "Faure", prenom: "Kevin", email: "kevin@example.com", mdp: hashes.kevin, role: "utilisateur" },
  });
  const laura = await prisma.utilisateur.create({
    data: { nom: "Andre", prenom: "Laura", email: "laura@example.com", mdp: hashes.laura, role: "utilisateur" },
  });

  // Inscriptions aux sports — spread users across sports
  await prisma.sportInscription.createMany({
    data: [
      // Football subscribers
      { utilisateurId: alice.id, sportId: football.id },
      { utilisateurId: bob.id, sportId: football.id },
      { utilisateurId: david.id, sportId: football.id },
      { utilisateurId: francois.id, sportId: football.id },
      { utilisateurId: gabriel.id, sportId: football.id },
      { utilisateurId: isaac.id, sportId: football.id },
      { utilisateurId: kevin.id, sportId: football.id },
      // Basketball subscribers
      { utilisateurId: alice.id, sportId: basketball.id },
      { utilisateurId: claire.id, sportId: basketball.id },
      { utilisateurId: david.id, sportId: basketball.id },
      { utilisateurId: francois.id, sportId: basketball.id },
      { utilisateurId: gabriel.id, sportId: basketball.id },
      { utilisateurId: julie.id, sportId: basketball.id },
      { utilisateurId: laura.id, sportId: basketball.id },
      // Volleyball subscribers
      { utilisateurId: bob.id, sportId: volleyball.id },
      { utilisateurId: emma.id, sportId: volleyball.id },
      { utilisateurId: helene.id, sportId: volleyball.id },
      { utilisateurId: julie.id, sportId: volleyball.id },
      { utilisateurId: kevin.id, sportId: volleyball.id },
      // Course subscribers
      { utilisateurId: claire.id, sportId: course.id },
      { utilisateurId: emma.id, sportId: course.id },
      { utilisateurId: helene.id, sportId: course.id },
      { utilisateurId: isaac.id, sportId: course.id },
      { utilisateurId: laura.id, sportId: course.id },
    ],
  });

  // Equipes — 8 teams across 4 sports
  const fcParis = await prisma.equipe.create({ data: { nom: "FC Paris", nombrePlaces: 11, sportId: football.id } });
  const niceFC = await prisma.equipe.create({ data: { nom: "OGC Nice", nombrePlaces: 11, sportId: football.id } });
  const lyonFoot = await prisma.equipe.create({ data: { nom: "Olympique Lyon", nombrePlaces: 11, sportId: football.id } });

  const lyonBasket = await prisma.equipe.create({ data: { nom: "Lyon Basket", nombrePlaces: 5, sportId: basketball.id } });
  const parisBasket = await prisma.equipe.create({ data: { nom: "Paris Basket", nombrePlaces: 5, sportId: basketball.id } });

  const marseilleVolley = await prisma.equipe.create({ data: { nom: "Marseille Volley", nombrePlaces: 6, sportId: volleyball.id } });
  const niceVolley = await prisma.equipe.create({ data: { nom: "Nice Volley", nombrePlaces: 6, sportId: volleyball.id } });

  const clubCourse = await prisma.equipe.create({ data: { nom: "Club Course Paris", nombrePlaces: 8, sportId: course.id } });

  // Appartenir — team memberships
  await prisma.appartenir.createMany({
    data: [
      // FC Paris (4 members)
      { utilisateurId: alice.id, equipeId: fcParis.id },
      { utilisateurId: bob.id, equipeId: fcParis.id },
      { utilisateurId: david.id, equipeId: fcParis.id },
      { utilisateurId: francois.id, equipeId: fcParis.id },
      // OGC Nice (3 members)
      { utilisateurId: gabriel.id, equipeId: niceFC.id },
      { utilisateurId: isaac.id, equipeId: niceFC.id },
      { utilisateurId: kevin.id, equipeId: niceFC.id },
      // Olympique Lyon (2 members)
      { utilisateurId: francois.id, equipeId: lyonFoot.id },
      { utilisateurId: kevin.id, equipeId: lyonFoot.id },
      // Lyon Basket (4 members)
      { utilisateurId: claire.id, equipeId: lyonBasket.id },
      { utilisateurId: david.id, equipeId: lyonBasket.id },
      { utilisateurId: gabriel.id, equipeId: lyonBasket.id },
      { utilisateurId: julie.id, equipeId: lyonBasket.id },
      // Paris Basket (3 members)
      { utilisateurId: alice.id, equipeId: parisBasket.id },
      { utilisateurId: francois.id, equipeId: parisBasket.id },
      { utilisateurId: laura.id, equipeId: parisBasket.id },
      // Marseille Volley (3 members)
      { utilisateurId: emma.id, equipeId: marseilleVolley.id },
      { utilisateurId: bob.id, equipeId: marseilleVolley.id },
      { utilisateurId: helene.id, equipeId: marseilleVolley.id },
      // Nice Volley (3 members)
      { utilisateurId: julie.id, equipeId: niceVolley.id },
      { utilisateurId: kevin.id, equipeId: niceVolley.id },
      { utilisateurId: helene.id, equipeId: niceVolley.id },
      // Club Course Paris (3 members)
      { utilisateurId: claire.id, equipeId: clubCourse.id },
      { utilisateurId: emma.id, equipeId: clubCourse.id },
      { utilisateurId: isaac.id, equipeId: clubCourse.id },
    ],
  });

  // Evenements (non-matchs)
  const now = new Date();

  const entrainement1 = await prisma.evenement.create({
    data: {
      entitule: "Entrainement collectif Football",
      participants: 15,
      dateHeure: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3, 18, 0),
      description: "Seance de preparation physique et tactique",
      sportId: football.id,
    },
  });

  const entrainement2 = await prisma.evenement.create({
    data: {
      entitule: "Entrainement tirs a trois points",
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

  const courseSortie = await prisma.evenement.create({
    data: {
      entitule: "Sortie course 10km",
      participants: 8,
      dateHeure: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 5, 8, 0),
      description: "Course matinale en groupe autour du lac",
      sportId: course.id,
    },
  });

  const entrainement3 = await prisma.evenement.create({
    data: {
      entitule: "Seance de musculation",
      participants: 12,
      dateHeure: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 19, 0),
      description: "Renforcement musculaire pour tous",
      sportId: football.id,
    },
  });

  // ------- MATCHS -------

  // Match 1: FC Paris vs OGC Nice — upcoming, not yet fully responded
  const evMatch1 = await prisma.evenement.create({
    data: {
      entitule: "FC Paris vs OGC Nice",
      participants: 6, // 3 per team — achievable with current members
      dateHeure: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7, 15, 0),
      description: "Match de championnat - Journee 12",
      sportId: football.id,
    },
  });
  const match1 = await prisma.match.create({ data: { evenementId: evMatch1.id } });
  await prisma.equipeParticipante.createMany({
    data: [
      { matchId: match1.id, equipeId: fcParis.id },
      { matchId: match1.id, equipeId: niceFC.id },
    ],
  });

  // Match 2: Lyon Basket vs Paris Basket — FULLY READY (all participants present, winner can be set)
  const evMatch2 = await prisma.evenement.create({
    data: {
      entitule: "Lyon Basket vs Paris Basket",
      participants: 6, // 3 per team
      dateHeure: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 4, 20, 0),
      description: "Derby basket — finale de conference",
      sportId: basketball.id,
    },
  });
  const match2 = await prisma.match.create({ data: { evenementId: evMatch2.id } });
  await prisma.equipeParticipante.createMany({
    data: [
      { matchId: match2.id, equipeId: lyonBasket.id },
      { matchId: match2.id, equipeId: parisBasket.id },
    ],
  });

  // Match 3: Marseille Volley vs Nice Volley — upcoming
  const evMatch3 = await prisma.evenement.create({
    data: {
      entitule: "Marseille Volley vs Nice Volley",
      participants: 6,
      dateHeure: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 10, 14, 0),
      description: "Match de poule - Tournoi regional",
      sportId: volleyball.id,
    },
  });
  const match3 = await prisma.match.create({ data: { evenementId: evMatch3.id } });
  await prisma.equipeParticipante.createMany({
    data: [
      { matchId: match3.id, equipeId: marseilleVolley.id },
      { matchId: match3.id, equipeId: niceVolley.id },
    ],
  });

  // Match 4: FC Paris vs Olympique Lyon — past, with winner
  const evMatch4 = await prisma.evenement.create({
    data: {
      entitule: "FC Paris vs Olympique Lyon",
      participants: 4,
      dateHeure: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 5, 16, 0),
      description: "Match retour - Journee 8",
      sportId: football.id,
    },
  });
  const match4 = await prisma.match.create({ data: { evenementId: evMatch4.id, equipeGagnanteId: fcParis.id } });
  await prisma.equipeParticipante.createMany({
    data: [
      { matchId: match4.id, equipeId: fcParis.id },
      { matchId: match4.id, equipeId: lyonFoot.id },
    ],
  });

  // Match 5: OGC Nice vs Olympique Lyon — past, with winner
  const evMatch5 = await prisma.evenement.create({
    data: {
      entitule: "OGC Nice vs Olympique Lyon",
      participants: 4,
      dateHeure: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 10, 18, 0),
      description: "Match de coupe",
      sportId: football.id,
    },
  });
  const match5 = await prisma.match.create({ data: { evenementId: evMatch5.id, equipeGagnanteId: niceFC.id } });
  await prisma.equipeParticipante.createMany({
    data: [
      { matchId: match5.id, equipeId: niceFC.id },
      { matchId: match5.id, equipeId: lyonFoot.id },
    ],
  });

  // Reponses
  await prisma.reponse.createMany({
    data: [
      // Entrainement Football
      { utilisateurId: alice.id, evenementId: entrainement1.id, reponse: "present" },
      { utilisateurId: bob.id, evenementId: entrainement1.id, reponse: "present" },
      { utilisateurId: david.id, evenementId: entrainement1.id, reponse: "absent" },
      { utilisateurId: francois.id, evenementId: entrainement1.id, reponse: "present" },
      { utilisateurId: gabriel.id, evenementId: entrainement1.id, reponse: "peut-etre" },
      // Entrainement Basketball
      { utilisateurId: claire.id, evenementId: entrainement2.id, reponse: "present" },
      { utilisateurId: david.id, evenementId: entrainement2.id, reponse: "peut-etre" },
      { utilisateurId: julie.id, evenementId: entrainement2.id, reponse: "present" },
      { utilisateurId: laura.id, evenementId: entrainement2.id, reponse: "present" },
      // Tournoi volley
      { utilisateurId: emma.id, evenementId: tournoi.id, reponse: "present" },
      { utilisateurId: bob.id, evenementId: tournoi.id, reponse: "peut-etre" },
      { utilisateurId: helene.id, evenementId: tournoi.id, reponse: "present" },
      { utilisateurId: julie.id, evenementId: tournoi.id, reponse: "present" },
      // Course sortie
      { utilisateurId: claire.id, evenementId: courseSortie.id, reponse: "present" },
      { utilisateurId: emma.id, evenementId: courseSortie.id, reponse: "present" },
      { utilisateurId: helene.id, evenementId: courseSortie.id, reponse: "absent" },
      { utilisateurId: isaac.id, evenementId: courseSortie.id, reponse: "present" },
      // Seance musculation
      { utilisateurId: alice.id, evenementId: entrainement3.id, reponse: "present" },
      { utilisateurId: kevin.id, evenementId: entrainement3.id, reponse: "present" },
      // Match 1 (FC Paris vs OGC Nice) — partial responses
      { utilisateurId: alice.id, evenementId: evMatch1.id, reponse: "present" },
      { utilisateurId: bob.id, evenementId: evMatch1.id, reponse: "present" },
      { utilisateurId: david.id, evenementId: evMatch1.id, reponse: "present" },
      { utilisateurId: gabriel.id, evenementId: evMatch1.id, reponse: "present" },
      { utilisateurId: isaac.id, evenementId: evMatch1.id, reponse: "peut-etre" },
      // Match 2 (Lyon Basket vs Paris Basket) — FULLY PRESENT (6/6)
      { utilisateurId: claire.id, evenementId: evMatch2.id, reponse: "present" },
      { utilisateurId: david.id, evenementId: evMatch2.id, reponse: "present" },
      { utilisateurId: gabriel.id, evenementId: evMatch2.id, reponse: "present" },
      { utilisateurId: alice.id, evenementId: evMatch2.id, reponse: "present" },
      { utilisateurId: francois.id, evenementId: evMatch2.id, reponse: "present" },
      { utilisateurId: laura.id, evenementId: evMatch2.id, reponse: "present" },
      // Match 3 (Marseille vs Nice Volley) — some responses
      { utilisateurId: emma.id, evenementId: evMatch3.id, reponse: "present" },
      { utilisateurId: bob.id, evenementId: evMatch3.id, reponse: "present" },
      { utilisateurId: julie.id, evenementId: evMatch3.id, reponse: "absent" },
      // Match 4 (past, FC Paris vs Lyon) — all present
      { utilisateurId: alice.id, evenementId: evMatch4.id, reponse: "present" },
      { utilisateurId: bob.id, evenementId: evMatch4.id, reponse: "present" },
      { utilisateurId: francois.id, evenementId: evMatch4.id, reponse: "present" },
      { utilisateurId: kevin.id, evenementId: evMatch4.id, reponse: "present" },
      // Match 5 (past, Nice vs Lyon)
      { utilisateurId: gabriel.id, evenementId: evMatch5.id, reponse: "present" },
      { utilisateurId: isaac.id, evenementId: evMatch5.id, reponse: "present" },
      { utilisateurId: francois.id, evenementId: evMatch5.id, reponse: "present" },
      { utilisateurId: kevin.id, evenementId: evMatch5.id, reponse: "present" },
    ],
  });

  console.log("Donnees de demonstration inserees avec succes !");
  console.log("");
  console.log("Comptes de demonstration :");
  console.log("  alice@example.com    / Ligue@2025!a   (admin)");
  console.log("  bob@example.com      / Sport#B8x      (admin)");
  console.log("  claire@example.com   / Equipe$C94     (admin)");
  console.log("  david@example.com    / Match&D7m      (utilisateur)");
  console.log("  emma@example.com     / Volley!E3v     (utilisateur)");
  console.log("  francois@example.com / Foot@F5f       (utilisateur)");
  console.log("  gabriel@example.com  / Basket#G2b     (utilisateur)");
  console.log("  helene@example.com   / Course$H6c     (utilisateur)");
  console.log("  isaac@example.com    / Ligue&I9l      (utilisateur)");
  console.log("  julie@example.com    / Sport!J4s      (utilisateur)");
  console.log("  kevin@example.com    / Match@K1m      (utilisateur)");
  console.log("  laura@example.com    / Equipe#L7e     (utilisateur)");
  console.log("");
  console.log("Match pret a designer un gagnant : Lyon Basket vs Paris Basket (6/6 presents)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
