import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { playerSchema } from "@/lib/validation";

// GET /api/players?teamId=1
export async function GET(request: Request) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const teamId = searchParams.get("teamId");

  const players = await prisma.player.findMany({
    where: teamId ? { teamId: Number(teamId) } : {},
    include: { team: { select: { id: true, name: true } } },
    orderBy: { lastName: "asc" },
  });

  return NextResponse.json(players);
}

// POST /api/players
export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = playerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const player = await prisma.player.create({ data: parsed.data });
    return NextResponse.json(player, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
