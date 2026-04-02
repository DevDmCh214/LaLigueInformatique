import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non autorise" }, { status: 401 });

  try {
    const equipeId = Number(params.id);
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email requis" }, { status: 400 });
    }

    const utilisateur = await prisma.utilisateur.findUnique({ where: { email } });
    if (!utilisateur) {
      return NextResponse.json({ error: "Utilisateur non trouve" }, { status: 404 });
    }

    // Verifier si deja membre
    const existing = await prisma.appartenir.findUnique({
      where: { utilisateurId_equipeId: { utilisateurId: utilisateur.id, equipeId } },
    });
    if (existing) {
      return NextResponse.json({ error: "Deja membre de cette equipe" }, { status: 409 });
    }

    // Verifier places disponibles
    const equipe = await prisma.equipe.findUnique({
      where: { id: equipeId },
      include: { _count: { select: { membres: true } } },
    });
    if (!equipe) {
      return NextResponse.json({ error: "Equipe non trouvee" }, { status: 404 });
    }
    if (equipe._count.membres >= equipe.nombrePlaces) {
      return NextResponse.json({ error: "Equipe complete (plus de places)" }, { status: 400 });
    }

    const membre = await prisma.appartenir.create({
      data: { utilisateurId: utilisateur.id, equipeId },
      include: { utilisateur: { select: { id: true, nom: true, prenom: true, email: true } } },
    });

    return NextResponse.json(membre, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non autorise" }, { status: 401 });

  try {
    const equipeId = Number(params.id);
    const { utilisateurId } = await req.json();

    await prisma.appartenir.delete({
      where: { utilisateurId_equipeId: { utilisateurId: Number(utilisateurId), equipeId } },
    });

    return NextResponse.json({ message: "Membre retire" });
  } catch {
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
  }
}
