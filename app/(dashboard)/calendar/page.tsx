import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import Link from "next/link";

export default async function CalendarPage() {
  const session = await getSession();
  const userId = Number(session!.user.id);

  const events = await prisma.event.findMany({
    where: {
      date: { gte: new Date() },
      team: { members: { some: { userId } } },
    },
    include: {
      team: { select: { id: true, name: true } },
      rsvps: { where: { userId }, select: { status: true } },
    },
    orderBy: { date: "asc" },
  });

  // Grouper par mois
  const grouped: Record<string, typeof events> = {};
  for (const event of events) {
    const key = new Date(event.date).toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(event);
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-700 mb-5">Calendrier</h1>

      {events.length === 0 ? (
        <div className="card text-center py-10">
          <p className="text-gray-400 mb-4">Aucun événement à venir.</p>
          <Link href="/events/new" className="btn-primary">Créer un événement</Link>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([month, monthEvents]) => (
            <div key={month}>
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3 capitalize">{month}</h2>
              <div className="space-y-2">
                {monthEvents.map((event) => {
                  const d = new Date(event.date);
                  return (
                    <Link key={event.id} href={`/events/${event.id}`} className="card flex items-center gap-4 hover:shadow-md hover:border-gray-400 transition-all">
                      {/* Date block */}
                      <div className="flex-shrink-0 w-12 h-12 bg-gray-100 border border-gray-200 rounded flex flex-col items-center justify-center">
                        <span className="text-[10px] text-gray-400 uppercase leading-none">
                          {d.toLocaleDateString("fr-FR", { weekday: "short" })}
                        </span>
                        <span className="text-lg font-bold text-gray-600 leading-tight">{d.getDate()}</span>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-700 text-sm truncate">{event.title}</h3>
                        <p className="text-xs text-gray-400">
                          {event.team.name} — {d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                          {event.location && ` — ${event.location}`}
                        </p>
                      </div>

                      {/* Badges */}
                      <div className="flex gap-2 flex-shrink-0">
                        {event.rsvps[0] && (
                          <span className={
                            event.rsvps[0].status === "going" ? "badge-green" :
                            event.rsvps[0].status === "not_going" ? "badge-red" : "badge-yellow"
                          }>
                            {event.rsvps[0].status === "going" ? "Présent" :
                             event.rsvps[0].status === "not_going" ? "Absent" : "Peut-être"}
                          </span>
                        )}
                        <span className={event.type === "game" ? "badge-blue" : "badge-green"}>
                          {event.type === "game" ? "Match" : "Entraînement"}
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
