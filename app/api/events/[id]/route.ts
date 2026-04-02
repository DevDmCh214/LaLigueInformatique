import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// GET /api/events/:id
export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const event = await prisma.event.findUnique({
    where: { id: Number(params.id) },
    include: {
      team: { select: { id: true, name: true } },
      rsvps: {
        include: { user: { select: { id: true, name: true, email: true } } },
      },
    },
  });

  if (!event) {
    return NextResponse.json({ error: "Événement introuvable" }, { status: 404 });
  }

  return NextResponse.json(event);
}

// PUT /api/events/:id
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
    const event = await prisma.event.update({
      where: { id: Number(params.id) },
      data: {
        title: body.title,
        type: body.type,
        date: new Date(body.date),
        location: body.location || null,
        opponent: body.opponent || null,
        description: body.description || null,
      },
    });
    return NextResponse.json(event);
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// DELETE /api/events/:id
export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  try {
    await prisma.event.delete({ where: { id: Number(params.id) } });
    return NextResponse.json({ message: "Événement supprimé" });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
