import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function MatchsPage() {
  const matchs = await prisma.match.findMany({
    include: {
      evenement: { include: { sport: { select: { nom: true } } } },
      equipesParticipantes: { include: { equipe: { select: { id: true, nom: true } } } },
      equipeGagnante: { select: { id: true, nom: true } },
    },
    orderBy: { evenement: { dateHeure: "asc" } },
  });

  const now = new Date();
  const futurs = matchs.filter((m) => new Date(m.evenement.dateHeure) >= now);
  const passes = matchs.filter((m) => new Date(m.evenement.dateHeure) < now);

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-xl font-semibold text-gray-700">Matchs</h1>
        <Link href="/matchs/new" className="btn-primary text-xs">+ Nouveau match</Link>
      </div>

      <h2 className="text-base font-semibold text-gray-600 mb-3">A venir ({futurs.length})</h2>
      {futurs.length === 0 ? (
        <p className="text-gray-400 text-sm mb-6">Aucun match a venir.</p>
      ) : (
        <div className="space-y-2 mb-6">
          {futurs.map((m) => <MatchCard key={m.id} m={m} />)}
        </div>
      )}

      {passes.length > 0 && (
        <>
          <h2 className="text-base font-semibold text-gray-600 mb-3">Termines ({passes.length})</h2>
          <div className="space-y-2 opacity-60">
            {passes.map((m) => <MatchCard key={m.id} m={m} />)}
          </div>
        </>
      )}
    </div>
  );
}

function MatchCard({ m }: { m: any }) {
  const equipes = m.equipesParticipantes.map((ep: any) => ep.equipe);
  return (
    <Link
      href={`/matchs/${m.id}`}
      className="card flex justify-between items-center hover:shadow-md hover:border-gray-400 transition-all"
    >
      <div>
        <h3 className="font-medium text-gray-700 text-sm">{m.evenement.entitule}</h3>
        <p className="text-xs text-gray-400">
          {m.evenement.sport.nom} — {new Date(m.evenement.dateHeure).toLocaleDateString("fr-FR", {
            weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit",
          })}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {equipes.map((e: any) => e.nom).join(" vs ")}
        </p>
      </div>
      <div className="flex gap-2 flex-shrink-0">
        {m.equipeGagnante ? (
          <span className="badge-green">Gagnant: {m.equipeGagnante.nom}</span>
        ) : (
          <span className="badge-yellow">En attente</span>
        )}
      </div>
    </Link>
  );
}
