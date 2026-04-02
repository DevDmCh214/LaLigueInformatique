import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/prisma";
import { matchSchema } from "@/lib/validation";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non autorise" }, { status: 401 });

  const matchs = await prisma.match.findMany({
    include: {
      evenement: { include: { sport: { select: { id: true, nom: true } } } },
      equipesParticipantes: { include: { equipe: { select: { id: true, nom: true } } } },
      equipeGagnante: { select: { id: true, nom: true } },
    },
    orderBy: { evenement: { dateHeure: "asc" } },
  });

  return NextResponse.json(matchs);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non autorise" }, { status: 401 });

  try {
    const body = await request.json();
    const parsed = matchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { entitule, participants, dateHeure, description, sportId, equipe1Id, equipe2Id } = parsed.data;

    if (equipe1Id === equipe2Id) {
      return NextResponse.json({ error: "Les deux equipes doivent etre differentes" }, { status: 400 });
    }

    // Creer l'evenement parent puis le match (heritage XT)
    const evenement = await prisma.evenement.create({
      data: {
        entitule,
        participants,
        dateHeure: new Date(dateHeure),
        description,
        sportId,
        match: {
          create: {
            equipesParticipantes: {
              createMany: {
                data: [
                  { equipeId: equipe1Id },
                  { equipeId: equipe2Id },
                ],
              },
            },
          },
        },
      },
      include: {
        sport: true,
        match: {
          include: {
            equipesParticipantes: { include: { equipe: { select: { id: true, nom: true } } } },
          },
        },
      },
    });

    return NextResponse.json(evenement, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
  }
}
