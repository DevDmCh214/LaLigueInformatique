import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Insertion des données de démonstration...");

  // ── Utilisateurs ─────────────────────────────────────────
  const hash = await bcrypt.hash("Password1!", 10);

  const alice = await prisma.user.create({
    data: { email: "alice@example.com", password: hash, name: "Alice Dupont" },
  });
  const bob = await prisma.user.create({
    data: { email: "bob@example.com", password: hash, name: "Bob Martin" },
  });
  const claire = await prisma.user.create({
    data: { email: "claire@example.com", password: hash, name: "Claire Petit" },
  });
  const david = await prisma.user.create({
    data: { email: "david@example.com", password: hash, name: "David Leroy" },
  });

  // ── Équipes ──────────────────────────────────────────────
  const fcParis = await prisma.team.create({
    data: { name: "FC Paris", sport: "Football" },
  });
  const lyonBasket = await prisma.team.create({
    data: { name: "Lyon Basket", sport: "Basketball" },
  });

  // ── Membres d'équipe (fusion ancien Player + TeamMember) ─
  await prisma.teamMember.createMany({
    data: [
      { userId: alice.id, teamId: fcParis.id, role: "admin", position: "Entraîneur", phone: "06 10 00 00 01" },
      { userId: bob.id, teamId: fcParis.id, role: "member", position: "Attaquant", phone: "06 10 00 00 02" },
      { userId: claire.id, teamId: lyonBasket.id, role: "admin", position: "Entraîneur", phone: "06 10 00 00 03" },
      { userId: david.id, teamId: lyonBasket.id, role: "member", position: "Meneur", phone: "06 10 00 00 04" },
      { userId: bob.id, teamId: lyonBasket.id, role: "member", position: "Arrière", phone: "06 10 00 00 02" },
    ],
  });

  // ── Événements ───────────────────────────────────────────
  const now = new Date();
  const event1 = await prisma.event.create({
    data: {
      title: "Match contre Marseille",
      type: "game",
      date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7, 15, 0),
      location: "Stade de France",
      opponent: "Olympique de Marseille",
      teamId: fcParis.id,
    },
  });
  const event2 = await prisma.event.create({
    data: {
      title: "Entraînement collectif",
      type: "practice",
      date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3, 18, 0),
      location: "Centre sportif Dugommier",
      teamId: fcParis.id,
    },
  });
  const event3 = await prisma.event.create({
    data: {
      title: "Match contre Villeurbanne",
      type: "game",
      date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 10, 20, 0),
      location: "Palais des Sports",
      opponent: "ASVEL Villeurbanne",
      teamId: lyonBasket.id,
    },
  });
  const event4 = await prisma.event.create({
    data: {
      title: "Entraînement tirs",
      type: "practice",
      date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2, 17, 0),
      location: "Gymnase Jean Jaurès",
      teamId: lyonBasket.id,
    },
  });
  await prisma.event.create({
    data: {
      title: "Match amical contre Bordeaux",
      type: "game",
      date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 14, 16, 0),
      location: "Stade Chaban-Delmas",
      opponent: "Girondins de Bordeaux",
      teamId: fcParis.id,
    },
  });

  // ── RSVPs ────────────────────────────────────────────────
  await prisma.rSVP.createMany({
    data: [
      { userId: alice.id, eventId: event1.id, status: "going" },
      { userId: bob.id, eventId: event1.id, status: "going" },
      { userId: alice.id, eventId: event2.id, status: "maybe" },
      { userId: bob.id, eventId: event2.id, status: "going" },
      { userId: claire.id, eventId: event3.id, status: "going" },
      { userId: david.id, eventId: event3.id, status: "not_going" },
      { userId: bob.id, eventId: event3.id, status: "maybe" },
      { userId: claire.id, eventId: event4.id, status: "going" },
      { userId: david.id, eventId: event4.id, status: "going" },
    ],
  });

  console.log("✅ Données de démonstration insérées avec succès !");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
