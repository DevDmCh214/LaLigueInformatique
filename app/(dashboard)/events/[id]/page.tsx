import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import RSVPButtons from "./RSVPButtons";
import EventActions from "./EventActions";

export default async function EventDetailPage({ params }: { params: { id: string } }) {
  const session = await getSession();
  const userId = Number(session!.user.id);
  const eventId = Number(params.id);

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      team: {
        include: {
          members: { select: { userId: true, role: true } },
        },
      },
      rsvps: {
        include: { user: { select: { id: true, name: true, email: true } } },
      },
    },
  });

  if (!event) notFound();

  const isAdmin = event.team.members.some((m) => m.userId === userId && m.role === "admin");
  const myRsvp = event.rsvps.find((r) => r.userId === userId);

  const goingCount = event.rsvps.filter((r) => r.status === "going").length;
  const notGoingCount = event.rsvps.filter((r) => r.status === "not_going").length;
  const maybeCount = event.rsvps.filter((r) => r.status === "maybe").length;

  return (
    <div>
      <Link href="/events" className="text-xs text-gray-400 hover:text-gray-600 mb-4 inline-block">
        &larr; Retour aux événements
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Détail de l'événement */}
        <div className="lg:col-span-2">
          <div className="border border-gray-300 rounded-lg overflow-hidden">
            <div className="bg-gray-500 text-white px-5 py-3 flex justify-between items-center">
              <h2 className="text-sm font-semibold">Détail de l&apos;événement</h2>
              {isAdmin && <EventActions eventId={event.id} />}
            </div>
            <div className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className={event.type === "game" ? "badge-blue" : "badge-green"}>
                  {event.type === "game" ? "Match" : "Entraînement"}
                </span>
              </div>
              <h1 className="text-lg font-semibold text-gray-700 mb-4">{event.title}</h1>

              <div className="space-y-2 text-sm">
                <div className="flex gap-2">
                  <span className="font-medium text-gray-400 w-24">Équipe :</span>
                  <Link href={`/teams/${event.team.id}`} className="text-gray-600 hover:underline">
                    {event.team.name}
                  </Link>
                </div>
                <div className="flex gap-2">
                  <span className="font-medium text-gray-400 w-24">Date :</span>
                  <span className="text-gray-600">{new Date(event.date).toLocaleDateString("fr-FR", {
                    weekday: "long", day: "numeric", month: "long", year: "numeric",
                    hour: "2-digit", minute: "2-digit",
                  })}</span>
                </div>
                {event.location && (
                  <div className="flex gap-2">
                    <span className="font-medium text-gray-400 w-24">Lieu :</span>
                    <span className="text-gray-600">{event.location}</span>
                  </div>
                )}
                {event.opponent && (
                  <div className="flex gap-2">
                    <span className="font-medium text-gray-400 w-24">Adversaire :</span>
                    <span className="text-gray-600">{event.opponent}</span>
                  </div>
                )}
                {event.description && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="font-medium text-gray-400 mb-1 text-xs uppercase tracking-wide">Description</p>
                    <p className="text-gray-600">{event.description}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RSVP (relation N,N) */}
        <div className="space-y-5">
          {/* Mon RSVP */}
          <div className="border border-gray-300 rounded-lg overflow-hidden">
            <div className="bg-gray-500 text-white px-5 py-3">
              <h2 className="text-sm font-semibold">Ma réponse</h2>
            </div>
            <div className="p-4">
              <RSVPButtons eventId={event.id} currentStatus={myRsvp?.status || null} />
            </div>
          </div>

          {/* Résumé des réponses */}
          <div className="border border-gray-300 rounded-lg overflow-hidden">
            <div className="bg-gray-500 text-white px-5 py-3">
              <h2 className="text-sm font-semibold">Réponses</h2>
            </div>
            <div className="p-4">
              <div className="flex gap-4 mb-4">
                <div className="text-center flex-1">
                  <p className="text-2xl font-bold text-green-600">{goingCount}</p>
                  <p className="text-xs text-gray-400">Présent(s)</p>
                </div>
                <div className="text-center flex-1">
                  <p className="text-2xl font-bold text-yellow-500">{maybeCount}</p>
                  <p className="text-xs text-gray-400">Peut-être</p>
                </div>
                <div className="text-center flex-1">
                  <p className="text-2xl font-bold text-red-500">{notGoingCount}</p>
                  <p className="text-xs text-gray-400">Absent(s)</p>
                </div>
              </div>

              {event.rsvps.length > 0 && (
                <ul className="space-y-1.5 text-sm border-t border-gray-200 pt-3">
                  {event.rsvps.map((rsvp) => (
                    <li key={rsvp.id} className="flex justify-between items-center">
                      <span className="text-gray-600">{rsvp.user.name}</span>
                      <span className={
                        rsvp.status === "going" ? "badge-green" :
                        rsvp.status === "not_going" ? "badge-red" : "badge-yellow"
                      }>
                        {rsvp.status === "going" ? "Présent" :
                         rsvp.status === "not_going" ? "Absent" : "Peut-être"}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
