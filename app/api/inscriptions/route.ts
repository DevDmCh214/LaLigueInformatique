import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non autorise" }, { status: 401 });

  const userId = Number(session.user.id);
  const inscriptions = await prisma.sportInscription.findMany({
    where: { utilisateurId: userId },
    include: { sport: true },
  });

  return NextResponse.json(inscriptions);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non autorise" }, { status: 401 });

  try {
    const { sportId } = await request.json();
    const utilisateurId = Number(session.user.id);

    const existing = await prisma.sportInscription.findUnique({
      where: { utilisateurId_sportId: { utilisateurId, sportId } },
    });
    if (existing) {
      return NextResponse.json({ error: "Deja inscrit a ce sport" }, { status: 409 });
    }

    const inscription = await prisma.sportInscription.create({
      data: { utilisateurId, sportId },
      include: { sport: true },
    });

    return NextResponse.json(inscription, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non autorise" }, { status: 401 });

  try {
    const { sportId } = await request.json();
    const utilisateurId = Number(session.user.id);

    await prisma.sportInscription.delete({
      where: { utilisateurId_sportId: { utilisateurId, sportId } },
    });

    return NextResponse.json({ message: "Desinscrit du sport" });
  } catch {
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
  }
}
