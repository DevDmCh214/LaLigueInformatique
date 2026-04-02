import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non autorise" }, { status: 401 });

  const match = await prisma.match.findUnique({
    where: { id: Number(params.id) },
    include: {
      evenement: {
        include: {
          sport: true,
          reponses: {
            include: {
              utilisateur: { select: { id: true, nom: true, prenom: true } },
            },
          },
        },
      },
      equipesParticipantes: {
        include: {
          equipe: {
            select: { id: true, nom: true, nombrePlaces: true },
          },
        },
      },
      equipeGagnante: { select: { id: true, nom: true } },
    },
  });

  if (!match) return NextResponse.json({ error: "Match non trouve" }, { status: 404 });
  return NextResponse.json(match);
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non autorise" }, { status: 401 });

  try {
    const { equipeGagnanteId } = await req.json();

    if (equipeGagnanteId !== null && equipeGagnanteId !== undefined) {
      // Verifier que l'equipe gagnante participe au match
      const participation = await prisma.equipeParticipante.findFirst({
        where: { matchId: Number(params.id), equipeId: equipeGagnanteId },
      });
      if (!participation) {
        return NextResponse.json(
          { error: "L'equipe gagnante doit participer au match" },
          { status: 400 }
        );
      }
    }

    const match = await prisma.match.update({
      where: { id: Number(params.id) },
      data: { equipeGagnanteId: equipeGagnanteId ?? null },
      include: {
        evenement: { include: { sport: true } },
        equipesParticipantes: { include: { equipe: { select: { id: true, nom: true } } } },
        equipeGagnante: { select: { id: true, nom: true } },
      },
    });

    return NextResponse.json(match);
  } catch {
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non autorise" }, { status: 401 });

  try {
    // Supprimer le match et son evenement parent (cascade)
    const match = await prisma.match.findUnique({
      where: { id: Number(params.id) },
      select: { evenementId: true },
    });

    if (!match) return NextResponse.json({ error: "Match non trouve" }, { status: 404 });

    // Supprimer l'evenement parent supprime aussi le match (cascade)
    await prisma.evenement.delete({ where: { id: match.evenementId } });

    return NextResponse.json({ message: "Match supprime" });
  } catch {
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
  }
}
