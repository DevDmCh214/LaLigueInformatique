import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// POST /api/rsvp — créer ou mettre à jour un RSVP
export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  try {
    const { eventId, status } = await request.json();

    if (!eventId || !["going", "not_going", "maybe"].includes(status)) {
      return NextResponse.json({ error: "Données invalides" }, { status: 400 });
    }

    const userId = Number(session.user.id);

    // Upsert : crée ou met à jour le RSVP
    const rsvp = await prisma.rSVP.upsert({
      where: { userId_eventId: { userId, eventId: Number(eventId) } },
      update: { status },
      create: { userId, eventId: Number(eventId), status },
    });

    return NextResponse.json(rsvp);
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
