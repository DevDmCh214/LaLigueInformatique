import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { addMemberSchema } from "@/lib/validation";

// GET /api/players?teamId=1 — liste les membres d'une équipe
export async function GET(request: Request) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const teamId = searchParams.get("teamId");

  const members = await prisma.teamMember.findMany({
    where: teamId ? { teamId: Number(teamId) } : {},
    include: {
      user: { select: { id: true, name: true, email: true } },
      team: { select: { id: true, name: true } },
    },
    orderBy: { user: { name: "asc" } },
  });

  return NextResponse.json(members);
}

// POST /api/players — ajouter un membre à une équipe (par email)
export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = addMemberSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    // Trouver l'utilisateur par email
    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Aucun utilisateur trouvé avec cet email" },
        { status: 404 }
      );
    }

    // Vérifier qu'il n'est pas déjà membre
    const existing = await prisma.teamMember.findUnique({
      where: { userId_teamId: { userId: user.id, teamId: parsed.data.teamId } },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Cet utilisateur est déjà membre de l'équipe" },
        { status: 409 }
      );
    }

    const member = await prisma.teamMember.create({
      data: {
        userId: user.id,
        teamId: parsed.data.teamId,
        role: parsed.data.role,
        position: parsed.data.position,
        phone: parsed.data.phone,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json(member, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
