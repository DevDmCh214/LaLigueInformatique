import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/prisma";
import { reponseSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non autorise" }, { status: 401 });

  try {
    const body = await request.json();
    const parsed = reponseSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const utilisateurId = Number(session.user.id);
    const { evenementId, reponse } = parsed.data;

    const result = await prisma.reponse.upsert({
      where: {
        utilisateurId_evenementId: { utilisateurId, evenementId },
      },
      update: { reponse },
      create: { utilisateurId, evenementId, reponse },
    });

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
  }
}
