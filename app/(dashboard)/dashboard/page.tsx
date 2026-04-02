import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getSession();
  const userId = Number(session!.user.id);

  const [equipes, evenements, reponseCount, sportsInscrits] = await Promise.all([
    prisma.equipe.findMany({
      where: { membres: { some: { utilisateurId: userId } } },
      include: { _count: { select: { membres: true } } },
    }),
    prisma.evenement.findMany({
      where: { dateHeure: { gte: new Date() } },
      include: {
        sport: { select: { nom: true } },
        match: {
          include: {
            equipesParticipantes: { include: { equipe: { select: { nom: true } } } },
          },
        },
      },
      orderBy: { dateHeure: "asc" },
      take: 5,
    }),
    prisma.reponse.count({ where: { utilisateurId: userId } }),
    prisma.sportInscription.count({ where: { utilisateurId: userId } }),
  ]);

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-700 mb-5">Tableau de bord</h1>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="card text-center">
          <p className="text-xs text-gray-400 uppercase tracking-wide">Mes equipes</p>
          <p className="text-3xl font-bold text-gray-600 mt-1">{equipes.length}</p>
        </div>
        <div className="card text-center">
          <p className="text-xs text-gray-400 uppercase tracking-wide">Evenements a venir</p>
          <p className="text-3xl font-bold text-gray-600 mt-1">{evenements.length}</p>
        </div>
        <div className="card text-center">
          <p className="text-xs text-gray-400 uppercase tracking-wide">Mes reponses</p>
          <p className="text-3xl font-bold text-gray-600 mt-1">{reponseCount}</p>
        </div>
        <div className="card text-center">
          <p className="text-xs text-gray-400 uppercase tracking-wide">Sports inscrits</p>
          <p className="text-3xl font-bold text-gray-600 mt-1">{sportsInscrits}</p>
        </div>
      </div>

      {/* Equipes */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-base font-semibold text-gray-600">Mes equipes</h2>
          <Link href="/equipes/new" className="btn-primary text-xs">+ Nouvelle equipe</Link>
        </div>
        {equipes.length === 0 ? (
          <p className="text-gray-400 text-sm">Aucune equipe. Rejoignez ou creez une equipe !</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {equipes.map((eq) => (
              <Link key={eq.id} href={`/equipes/${eq.id}`} className="card hover:shadow-md hover:border-gray-400 transition-all">
                <h3 className="font-semibold text-gray-700">{eq.nom}</h3>
                <div className="flex gap-4 mt-2 text-xs text-gray-500">
                  <span>{eq._count.membres}/{eq.nombrePlaces} membres</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Evenements a venir */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-base font-semibold text-gray-600">Prochains evenements</h2>
          <Link href="/evenements/new" className="btn-primary text-xs">+ Nouvel evenement</Link>
        </div>
        {evenements.length === 0 ? (
          <p className="text-gray-400 text-sm">Aucun evenement a venir.</p>
        ) : (
          <div className="space-y-2">
            {evenements.map((ev) => (
              <Link
                key={ev.id}
                href={ev.match ? `/matchs/${ev.match.id}` : `/evenements/${ev.id}`}
                className="card flex justify-between items-center hover:shadow-md hover:border-gray-400 transition-all"
              >
                <div>
                  <h3 className="font-medium text-gray-700 text-sm">{ev.entitule}</h3>
                  <p className="text-xs text-gray-400">
                    {ev.sport.nom} — {new Date(ev.dateHeure).toLocaleDateString("fr-FR", {
                      weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit",
                    })}
                  </p>
                </div>
                <span className={ev.match ? "badge-blue" : "badge-green"}>
                  {ev.match ? "Match" : "Evenement"}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
