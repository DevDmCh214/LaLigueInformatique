import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getSession();
  const userId = Number(session!.user.id);

  const [teams, upcomingEvents, rsvpCount] = await Promise.all([
    prisma.team.findMany({
      where: { members: { some: { userId } } },
      include: { _count: { select: { players: true, events: true } } },
    }),
    prisma.event.findMany({
      where: {
        date: { gte: new Date() },
        team: { members: { some: { userId } } },
      },
      include: { team: { select: { name: true } } },
      orderBy: { date: "asc" },
      take: 5,
    }),
    prisma.rSVP.count({ where: { userId } }),
  ]);

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-700 mb-5">Tableau de bord</h1>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="card text-center">
          <p className="text-xs text-gray-400 uppercase tracking-wide">Mes équipes</p>
          <p className="text-3xl font-bold text-gray-600 mt-1">{teams.length}</p>
        </div>
        <div className="card text-center">
          <p className="text-xs text-gray-400 uppercase tracking-wide">Événements à venir</p>
          <p className="text-3xl font-bold text-gray-600 mt-1">{upcomingEvents.length}</p>
        </div>
        <div className="card text-center">
          <p className="text-xs text-gray-400 uppercase tracking-wide">Mes RSVPs</p>
          <p className="text-3xl font-bold text-gray-600 mt-1">{rsvpCount}</p>
        </div>
      </div>

      {/* Équipes */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-base font-semibold text-gray-600">Mes équipes</h2>
          <Link href="/teams/new" className="btn-primary text-xs">
            + Nouvelle équipe
          </Link>
        </div>
        {teams.length === 0 ? (
          <p className="text-gray-400 text-sm">Aucune équipe. Créez votre première équipe !</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teams.map((team) => (
              <Link key={team.id} href={`/teams/${team.id}`} className="card hover:shadow-md hover:border-gray-400 transition-all">
                <h3 className="font-semibold text-gray-700">{team.name}</h3>
                {team.sport && <p className="text-sm text-gray-400">{team.sport}</p>}
                <div className="flex gap-4 mt-2 text-xs text-gray-500">
                  <span>{team._count.players} joueur(s)</span>
                  <span>{team._count.events} événement(s)</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Événements à venir */}
      <div>
        <h2 className="text-base font-semibold text-gray-600 mb-3">Prochains événements</h2>
        {upcomingEvents.length === 0 ? (
          <p className="text-gray-400 text-sm">Aucun événement à venir.</p>
        ) : (
          <div className="space-y-2">
            {upcomingEvents.map((event) => (
              <Link key={event.id} href={`/events/${event.id}`} className="card flex justify-between items-center hover:shadow-md hover:border-gray-400 transition-all">
                <div>
                  <h3 className="font-medium text-gray-700 text-sm">{event.title}</h3>
                  <p className="text-xs text-gray-400">
                    {event.team.name} — {new Date(event.date).toLocaleDateString("fr-FR", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <span className={event.type === "game" ? "badge-blue" : "badge-green"}>
                  {event.type === "game" ? "Match" : "Entraînement"}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
