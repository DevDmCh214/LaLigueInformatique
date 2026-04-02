import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/prisma";
import { sportSchema } from "@/lib/validation";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non autorise" }, { status: 401 });

  const sport = await prisma.sport.findUnique({
    where: { id: Number(params.id) },
    include: {
      evenements: { orderBy: { dateHeure: "asc" }, take: 10 },
      inscriptions: { include: { utilisateur: { select: { id: true, nom: true, prenom: true, email: true } } } },
    },
  });

  if (!sport) return NextResponse.json({ error: "Sport non trouve" }, { status: 404 });
  return NextResponse.json(sport);
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non autorise" }, { status: 401 });

  try {
    const body = await req.json();
    const parsed = sportSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const sport = await prisma.sport.update({
      where: { id: Number(params.id) },
      data: { nom: parsed.data.nom },
    });
    return NextResponse.json(sport);
  } catch {
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non autorise" }, { status: 401 });

  try {
    await prisma.sport.delete({ where: { id: Number(params.id) } });
    return NextResponse.json({ message: "Sport supprime" });
  } catch {
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
  }
}
