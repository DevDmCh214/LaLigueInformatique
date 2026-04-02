import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/prisma";
import { equipeSchema } from "@/lib/validation";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non autorise" }, { status: 401 });

  const equipes = await prisma.equipe.findMany({
    include: {
      _count: { select: { membres: true, participations: true } },
    },
    orderBy: { nom: "asc" },
  });

  return NextResponse.json(equipes);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non autorise" }, { status: 401 });

  try {
    const body = await request.json();
    const parsed = equipeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const userId = Number(session.user.id);
    const equipe = await prisma.equipe.create({
      data: {
        nom: parsed.data.nom,
        nombrePlaces: parsed.data.nombrePlaces,
        membres: { create: { utilisateurId: userId } },
      },
    });

    return NextResponse.json(equipe, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
  }
}
