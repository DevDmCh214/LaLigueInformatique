import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import TeamActions from "./TeamActions";
import PlayerList from "./PlayerList";
import AddPlayerForm from "./AddPlayerForm";

export default async function TeamDetailPage({ params }: { params: { id: string } }) {
  const session = await getSession();
  const userId = Number(session!.user.id);
  const teamId = Number(params.id);

  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: {
      members: {
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { user: { name: "asc" } },
      },
      events: { orderBy: { date: "asc" }, take: 5, where: { date: { gte: new Date() } } },
    },
  });

  if (!team) notFound();

  const membership = team.members.find((m) => m.userId === userId);
  const isAdmin = membership?.role === "admin";

  return (
    <div>
      <div className="flex justify-between items-start mb-5">
        <div>
          <Link href="/teams" className="text-xs text-gray-400 hover:text-gray-600 mb-1 inline-block">
            &larr; Retour aux équipes
          </Link>
          <h1 className="text-xl font-semibold text-gray-700">{team.name}</h1>
          {team.sport && <p className="text-sm text-gray-400">{team.sport}</p>}
        </div>
        {isAdmin && <TeamActions teamId={team.id} />}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Colonne principale : Membres (N,N porteuse : User ↔ Team) */}
        <div className="lg:col-span-2">
          <div className="border border-gray-300 rounded-lg overflow-hidden">
            <div className="bg-gray-500 text-white px-5 py-3 flex justify-between items-center">
              <h2 className="text-sm font-semibold">Membres ({team.members.length})</h2>
            </div>
            <div className="p-5">
              {isAdmin && <AddPlayerForm teamId={team.id} />}
              <PlayerList players={team.members} isAdmin={isAdmin} />
            </div>
          </div>
        </div>

        {/* Sidebar : Prochains événements */}
        <div className="space-y-5">
          <div className="border border-gray-300 rounded-lg overflow-hidden">
            <div className="bg-gray-500 text-white px-5 py-3 flex justify-between items-center">
              <h2 className="text-sm font-semibold">Prochains événements</h2>
              <Link href={`/events/new?teamId=${team.id}`} className="text-xs text-white/80 hover:text-white">
                + Ajouter
              </Link>
            </div>
            <div className="p-4">
              {team.events.length === 0 ? (
                <p className="text-sm text-gray-400">Aucun événement à venir.</p>
              ) : (
                <ul className="space-y-2">
                  {team.events.map((event) => (
                    <li key={event.id}>
                      <Link href={`/events/${event.id}`} className="text-sm text-gray-600 hover:text-gray-800">
                        <span className="font-medium">{event.title}</span>
                        <br />
                        <span className="text-xs text-gray-400">
                          {new Date(event.date).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </Link>
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
