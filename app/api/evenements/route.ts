import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/prisma";
import { evenementSchema } from "@/lib/validation";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non autorise" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const sportId = searchParams.get("sportId");

  const evenements = await prisma.evenement.findMany({
    where: sportId ? { sportId: Number(sportId) } : undefined,
    include: {
      sport: { select: { id: true, nom: true } },
      match: {
        include: {
          equipesParticipantes: { include: { equipe: { select: { id: true, nom: true } } } },
          equipeGagnante: { select: { id: true, nom: true } },
        },
      },
      _count: { select: { reponses: true } },
    },
    orderBy: { dateHeure: "asc" },
  });

  return NextResponse.json(evenements);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non autorise" }, { status: 401 });

  try {
    const body = await request.json();
    const parsed = evenementSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const evenement = await prisma.evenement.create({
      data: {
        entitule: parsed.data.entitule,
        participants: parsed.data.participants,
        dateHeure: new Date(parsed.data.dateHeure),
        description: parsed.data.description,
        sportId: parsed.data.sportId,
      },
      include: { sport: true },
    });

    return NextResponse.json(evenement, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
  }
}
