import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import ReponseButtons from "./ReponseButtons";
import EvenementActions from "./EvenementActions";

export default async function EvenementDetailPage({ params }: { params: { id: string } }) {
  const session = await getSession();
  const userId = Number(session!.user.id);

  const evenement = await prisma.evenement.findUnique({
    where: { id: Number(params.id) },
    include: {
      sport: true,
      reponses: {
        include: {
          utilisateur: { select: { id: true, nom: true, prenom: true } },
        },
      },
      match: true,
    },
  });

  if (!evenement) notFound();

  // Si c'est un match, rediriger
  if (evenement.match) {
    return (
      <div className="card text-center py-10">
        <p className="text-gray-500 mb-4">Cet evenement est un match.</p>
        <Link href={`/matchs/${evenement.match.id}`} className="btn-primary">
          Voir le match
        </Link>
      </div>
    );
  }

  const maReponse = evenement.reponses.find((r) => r.utilisateurId === userId)?.reponse;

  const presents = evenement.reponses.filter((r) => r.reponse === "present");
  const absents = evenement.reponses.filter((r) => r.reponse === "absent");
  const peutEtre = evenement.reponses.filter((r) => r.reponse === "peut-etre");

  return (
    <div>
      <Link href="/evenements" className="text-sm text-gray-400 hover:text-gray-600">&larr; Retour</Link>

      <div className="flex justify-between items-start mt-2 mb-5">
        <div>
          <h1 className="text-xl font-semibold text-gray-700">{evenement.entitule}</h1>
          <p className="text-sm text-gray-400">
            {evenement.sport.nom} — {evenement.participants} participant(s)
          </p>
        </div>
        <EvenementActions evenementId={evenement.id} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Details */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card">
            <div className="card-header">Details</div>
            <div className="space-y-2 text-sm">
              <p><span className="text-gray-400">Date :</span> {new Date(evenement.dateHeure).toLocaleDateString("fr-FR", {
                weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
              })}</p>
              <p><span className="text-gray-400">Sport :</span> {evenement.sport.nom}</p>
              <p><span className="text-gray-400">Participants :</span> {evenement.participants}</p>
              {evenement.description && (
                <p><span className="text-gray-400">Description :</span> {evenement.description}</p>
              )}
            </div>
          </div>

          {/* Reponses */}
          <div className="card">
            <div className="card-header">Reponses ({evenement.reponses.length})</div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <h4 className="font-medium text-green-600 mb-2">Presents ({presents.length})</h4>
                {presents.map((r) => (
                  <p key={r.id} className="text-gray-600">{r.utilisateur.prenom} {r.utilisateur.nom}</p>
                ))}
              </div>
              <div>
                <h4 className="font-medium text-yellow-600 mb-2">Peut-etre ({peutEtre.length})</h4>
                {peutEtre.map((r) => (
                  <p key={r.id} className="text-gray-600">{r.utilisateur.prenom} {r.utilisateur.nom}</p>
                ))}
              </div>
              <div>
                <h4 className="font-medium text-red-600 mb-2">Absents ({absents.length})</h4>
                {absents.map((r) => (
                  <p key={r.id} className="text-gray-600">{r.utilisateur.prenom} {r.utilisateur.nom}</p>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Repondre */}
        <div className="card h-fit">
          <div className="card-header">Ma reponse</div>
          <ReponseButtons evenementId={evenement.id} currentReponse={maReponse} />
        </div>
      </div>
    </div>
  );
}
