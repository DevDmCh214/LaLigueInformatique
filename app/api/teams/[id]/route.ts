import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { teamSchema } from "@/lib/validation";

// GET /api/teams/:id
export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const team = await prisma.team.findUnique({
    where: { id: Number(params.id) },
    include: {
      players: true,
      members: { include: { user: { select: { id: true, name: true, email: true } } } },
      events: { orderBy: { date: "asc" } },
      _count: { select: { players: true, events: true } },
    },
  });

  if (!team) {
    return NextResponse.json({ error: "Équipe introuvable" }, { status: 404 });
  }

  return NextResponse.json(team);
}

// PUT /api/teams/:id
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = teamSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const team = await prisma.team.update({
      where: { id: Number(params.id) },
      data: parsed.data,
    });

    return NextResponse.json(team);
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// DELETE /api/teams/:id
export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  try {
    await prisma.team.delete({ where: { id: Number(params.id) } });
    return NextResponse.json({ message: "Équipe supprimée" });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
