import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/prisma";
import { evenementSchema } from "@/lib/validation";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non autorise" }, { status: 401 });

  const evenement = await prisma.evenement.findUnique({
    where: { id: Number(params.id) },
    include: {
      sport: true,
      reponses: {
        include: {
          utilisateur: { select: { id: true, nom: true, prenom: true, email: true } },
        },
      },
      match: {
        include: {
          equipesParticipantes: { include: { equipe: { select: { id: true, nom: true } } } },
          equipeGagnante: { select: { id: true, nom: true } },
        },
      },
    },
  });

  if (!evenement) return NextResponse.json({ error: "Evenement non trouve" }, { status: 404 });
  return NextResponse.json(evenement);
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non autorise" }, { status: 401 });

  try {
    const body = await req.json();
    const parsed = evenementSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const evenement = await prisma.evenement.update({
      where: { id: Number(params.id) },
      data: {
        entitule: parsed.data.entitule,
        participants: parsed.data.participants,
        dateHeure: new Date(parsed.data.dateHeure),
        description: parsed.data.description,
        sportId: parsed.data.sportId,
      },
    });

    return NextResponse.json(evenement);
  } catch {
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non autorise" }, { status: 401 });

  try {
    await prisma.evenement.delete({ where: { id: Number(params.id) } });
    return NextResponse.json({ message: "Evenement supprime" });
  } catch {
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
  }
}
