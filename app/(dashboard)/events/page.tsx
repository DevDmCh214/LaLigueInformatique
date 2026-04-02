import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import Link from "next/link";

export default async function EventsPage() {
  const session = await getSession();
  const userId = Number(session!.user.id);

  const events = await prisma.event.findMany({
    where: { team: { members: { some: { userId } } } },
    include: {
      team: { select: { id: true, name: true } },
      _count: { select: { rsvps: true } },
      rsvps: { where: { userId }, select: { status: true } },
    },
    orderBy: { date: "asc" },
  });

  const upcoming = events.filter((e) => new Date(e.date) >= new Date());
  const past = events.filter((e) => new Date(e.date) < new Date());

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-xl font-semibold text-gray-700">Événements</h1>
        <Link href="/events/new" className="btn-primary">+ Nouvel événement</Link>
      </div>

      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">À venir ({upcoming.length})</h2>
      {upcoming.length === 0 ? (
        <p className="text-gray-400 text-sm mb-6">Aucun événement à venir.</p>
      ) : (
        <div className="space-y-2 mb-6">
          {upcoming.map((event) => (
            <Link key={event.id} href={`/events/${event.id}`} className="card flex justify-between items-center hover:shadow-md hover:border-gray-400 transition-all">
              <div>
                <h3 className="font-medium text-gray-700 text-sm">{event.title}</h3>
                <p className="text-xs text-gray-400">
                  {event.team.name} — {new Date(event.date).toLocaleDateString("fr-FR", {
                    weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit",
                  })}
                </p>
                {event.location && <p className="text-xs text-gray-400">{event.location}</p>}
              </div>
              <div className="flex items-center gap-2">
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
          ))}
        </div>
      )}

      {past.length > 0 && (
        <>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">Passés ({past.length})</h2>
          <div className="space-y-2 opacity-50">
            {past.map((event) => (
              <Link key={event.id} href={`/events/${event.id}`} className="card flex justify-between items-center">
                <div>
                  <h3 className="font-medium text-gray-700 text-sm">{event.title}</h3>
                  <p className="text-xs text-gray-400">
                    {event.team.name} — {new Date(event.date).toLocaleDateString("fr-FR", {
                      day: "numeric", month: "long", year: "numeric",
                    })}
                  </p>
                </div>
                <span className={event.type === "game" ? "badge-blue" : "badge-green"}>
                  {event.type === "game" ? "Match" : "Entraînement"}
                </span>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
