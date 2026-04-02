import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import Link from "next/link";

export default async function SportsPage() {
  const session = await getSession();
  const userId = Number(session!.user.id);

  const [sports, mesSportsIds] = await Promise.all([
    prisma.sport.findMany({
      include: { _count: { select: { evenements: true, inscriptions: true } } },
      orderBy: { nom: "asc" },
    }),
    prisma.sportInscription.findMany({
      where: { utilisateurId: userId },
      select: { sportId: true },
    }),
  ]);

  const inscritsSet = new Set(mesSportsIds.map((s) => s.sportId));

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-xl font-semibold text-gray-700">Sports</h1>
        <Link href="/sports/new" className="btn-primary text-xs">+ Nouveau sport</Link>
      </div>

      {sports.length === 0 ? (
        <div className="card text-center py-10">
          <p className="text-gray-400 mb-4">Aucun sport enregistre.</p>
          <Link href="/sports/new" className="btn-primary">Creer un sport</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sports.map((sport) => (
            <Link key={sport.id} href={`/sports/${sport.id}`} className="card hover:shadow-md hover:border-gray-400 transition-all">
              <div className="flex justify-between items-start">
                <h3 className="font-semibold text-gray-700">{sport.nom}</h3>
                {inscritsSet.has(sport.id) && <span className="badge-green">Inscrit</span>}
              </div>
              <div className="flex gap-4 mt-2 text-xs text-gray-500">
                <span>{sport._count.inscriptions} inscrit(s)</span>
                <span>{sport._count.evenements} evenement(s)</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
