import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import Link from "next/link";

export default async function CalendarPage() {
  const session = await getSession();
  const userId = Number(session!.user.id);

  const evenements = await prisma.evenement.findMany({
    where: { dateHeure: { gte: new Date() } },
    include: {
      sport: { select: { nom: true } },
      reponses: { where: { utilisateurId: userId }, select: { reponse: true } },
      match: {
        include: {
          equipesParticipantes: { include: { equipe: { select: { nom: true } } } },
        },
      },
    },
    orderBy: { dateHeure: "asc" },
  });

  // Grouper par mois
  const grouped: Record<string, typeof evenements> = {};
  for (const ev of evenements) {
    const key = new Date(ev.dateHeure).toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(ev);
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-700 mb-5">Calendrier</h1>

      {evenements.length === 0 ? (
        <div className="card text-center py-10">
          <p className="text-gray-400 mb-4">Aucun evenement a venir.</p>
          <Link href="/evenements/new" className="btn-primary">Creer un evenement</Link>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([month, monthEvents]) => (
            <div key={month}>
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3 capitalize">{month}</h2>
              <div className="space-y-2">
                {monthEvents.map((ev) => {
                  const d = new Date(ev.dateHeure);
                  const maReponse = ev.reponses[0]?.reponse;
                  return (
                    <Link
                      key={ev.id}
                      href={ev.match ? `/matchs/${ev.match.id}` : `/evenements/${ev.id}`}
                      className="card flex items-center gap-4 hover:shadow-md hover:border-gray-400 transition-all"
                    >
                      {/* Date block */}
                      <div className="flex-shrink-0 w-12 h-12 bg-gray-100 border border-gray-200 rounded flex flex-col items-center justify-center">
                        <span className="text-[10px] text-gray-400 uppercase leading-none">
                          {d.toLocaleDateString("fr-FR", { weekday: "short" })}
                        </span>
                        <span className="text-lg font-bold text-gray-600 leading-tight">{d.getDate()}</span>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-700 text-sm truncate">{ev.entitule}</h3>
                        <p className="text-xs text-gray-400">
                          {ev.sport.nom} — {d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                          {" — "}{ev.participants} participant(s)
                        </p>
                        {ev.match && (
                          <p className="text-xs text-gray-500">
                            {ev.match.equipesParticipantes.map((ep) => ep.equipe.nom).join(" vs ")}
                          </p>
                        )}
                      </div>

                      {/* Badges */}
                      <div className="flex gap-2 flex-shrink-0">
                        {maReponse && (
                          <span className={
                            maReponse === "present" ? "badge-green" :
                            maReponse === "absent" ? "badge-red" : "badge-yellow"
                          }>
                            {maReponse === "present" ? "Present" :
                             maReponse === "absent" ? "Absent" : "Peut-etre"}
                          </span>
                        )}
                        <span className={ev.match ? "badge-blue" : "badge-green"}>
                          {ev.match ? "Match" : "Evenement"}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
