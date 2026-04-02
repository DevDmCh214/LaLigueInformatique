import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { teamSchema } from "@/lib/validation";

// GET /api/teams — liste les équipes de l'utilisateur connecté
export async function GET() {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const teams = await prisma.team.findMany({
    where: {
      members: { some: { userId: Number(session.user.id) } },
    },
    include: {
      _count: { select: { events: true, members: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(teams);
}

// POST /api/teams — créer une nouvelle équipe
export async function POST(request: Request) {
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

    const team = await prisma.team.create({
      data: {
        ...parsed.data,
        members: {
          create: { userId: Number(session.user.id), role: "admin" },
        },
      },
    });

    return NextResponse.json(team, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
