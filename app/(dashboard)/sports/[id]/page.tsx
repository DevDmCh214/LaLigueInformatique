import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import SportActions from "./SportActions";

export default async function SportDetailPage({ params }: { params: { id: string } }) {
  const session = await getSession();
  const userId = Number(session!.user.id);

  const sport = await prisma.sport.findUnique({
    where: { id: Number(params.id) },
    include: {
      evenements: {
        orderBy: { dateHeure: "asc" },
        include: { match: true },
      },
      inscriptions: {
        include: { utilisateur: { select: { id: true, nom: true, prenom: true, email: true } } },
      },
    },
  });

  if (!sport) notFound();

  const isInscrit = sport.inscriptions.some((i) => i.utilisateurId === userId);

  return (
    <div>
      <Link href="/sports" className="text-sm text-gray-400 hover:text-gray-600">&larr; Retour aux sports</Link>
      <div className="flex justify-between items-center mt-2 mb-5">
        <h1 className="text-xl font-semibold text-gray-700">{sport.nom}</h1>
        <SportActions sportId={sport.id} isInscrit={isInscrit} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Inscrits */}
        <div className="card">
          <div className="card-header">Inscrits ({sport.inscriptions.length})</div>
          {sport.inscriptions.length === 0 ? (
            <p className="text-gray-400 text-sm">Aucun inscrit.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Email</th>
                </tr>
              </thead>
              <tbody>
                {sport.inscriptions.map((ins) => (
                  <tr key={ins.id}>
                    <td>{ins.utilisateur.prenom} {ins.utilisateur.nom}</td>
                    <td>{ins.utilisateur.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Evenements lies */}
        <div className="card">
          <div className="card-header">Evenements ({sport.evenements.length})</div>
          {sport.evenements.length === 0 ? (
            <p className="text-gray-400 text-sm">Aucun evenement pour ce sport.</p>
          ) : (
            <div className="space-y-2">
              {sport.evenements.map((ev) => (
                <Link
                  key={ev.id}
                  href={ev.match ? `/matchs/${ev.match.id}` : `/evenements/${ev.id}`}
                  className="block p-3 border border-gray-200 rounded hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700 text-sm">{ev.entitule}</span>
                    <span className={ev.match ? "badge-blue" : "badge-green"}>
                      {ev.match ? "Match" : "Evenement"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(ev.dateHeure).toLocaleDateString("fr-FR", {
                      weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit",
                    })}
                    {" — "}{ev.participants} participant(s)
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
