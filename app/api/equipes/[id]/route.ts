import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/prisma";
import { equipeSchema } from "@/lib/validation";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non autorise" }, { status: 401 });

  const equipe = await prisma.equipe.findUnique({
    where: { id: Number(params.id) },
    include: {
      membres: {
        include: {
          utilisateur: { select: { id: true, nom: true, prenom: true, email: true } },
        },
      },
      participations: {
        include: {
          match: {
            include: {
              evenement: true,
              equipeGagnante: { select: { id: true, nom: true } },
              equipesParticipantes: { include: { equipe: { select: { id: true, nom: true } } } },
            },
          },
        },
        take: 10,
      },
      _count: { select: { membres: true } },
    },
  });

  if (!equipe) return NextResponse.json({ error: "Equipe non trouvee" }, { status: 404 });
  return NextResponse.json(equipe);
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non autorise" }, { status: 401 });

  try {
    const body = await req.json();
    const parsed = equipeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const equipe = await prisma.equipe.update({
      where: { id: Number(params.id) },
      data: { nom: parsed.data.nom, nombrePlaces: parsed.data.nombrePlaces },
    });
    return NextResponse.json(equipe);
  } catch {
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non autorise" }, { status: 401 });

  try {
    await prisma.equipe.delete({ where: { id: Number(params.id) } });
    return NextResponse.json({ message: "Equipe supprimee" });
  } catch {
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
  }
}
