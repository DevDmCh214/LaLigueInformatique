import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import Link from "next/link";

export default async function TeamsPage() {
  const session = await getSession();
  const userId = Number(session!.user.id);

  const teams = await prisma.team.findMany({
    where: { members: { some: { userId } } },
    include: {
      _count: { select: { events: true, members: true } },
      members: { where: { userId }, select: { role: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-xl font-semibold text-gray-700">Mes équipes</h1>
        <Link href="/teams/new" className="btn-primary">+ Nouvelle équipe</Link>
      </div>

      {teams.length === 0 ? (
        <div className="card text-center py-10">
          <p className="text-gray-400 mb-4">Vous n&apos;avez pas encore d&apos;équipe.</p>
          <Link href="/teams/new" className="btn-primary">Créer une équipe</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.map((team) => (
            <Link key={team.id} href={`/teams/${team.id}`} className="card hover:shadow-md hover:border-gray-400 transition-all">
              <div className="flex justify-between items-start mb-2">
                <h2 className="font-semibold text-gray-700">{team.name}</h2>
                <span className={team.members[0]?.role === "admin" ? "badge-blue" : "badge-green"}>
                  {team.members[0]?.role === "admin" ? "Admin" : "Membre"}
                </span>
              </div>
              {team.sport && <p className="text-sm text-gray-400 mb-2">{team.sport}</p>}
              <div className="flex gap-3 text-xs text-gray-500">
                <span>{team._count.members} membre(s)</span>
                <span>{team._count.events} événement(s)</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
