import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function EquipesPage() {
  const equipes = await prisma.equipe.findMany({
    include: {
      _count: { select: { membres: true, participations: true } },
    },
    orderBy: { nom: "asc" },
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-xl font-semibold text-gray-700">Equipes</h1>
        <Link href="/equipes/new" className="btn-primary text-xs">+ Nouvelle equipe</Link>
      </div>

      {equipes.length === 0 ? (
        <div className="card text-center py-10">
          <p className="text-gray-400 mb-4">Aucune equipe.</p>
          <Link href="/equipes/new" className="btn-primary">Creer une equipe</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {equipes.map((eq) => (
            <Link key={eq.id} href={`/equipes/${eq.id}`} className="card hover:shadow-md hover:border-gray-400 transition-all">
              <h3 className="font-semibold text-gray-700">{eq.nom}</h3>
              <div className="flex gap-4 mt-2 text-xs text-gray-500">
                <span>{eq._count.membres}/{eq.nombrePlaces} membres</span>
                <span>{eq._count.participations} match(s)</span>
              </div>
              {eq._count.membres >= eq.nombrePlaces && (
                <span className="badge-red mt-2">Complet</span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
