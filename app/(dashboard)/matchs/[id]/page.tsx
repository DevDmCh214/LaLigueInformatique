import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import ReponseButtons from "../../evenements/[id]/ReponseButtons";
import MatchWinner from "./MatchWinner";

export default async function MatchDetailPage({ params }: { params: { id: string } }) {
  const session = await getSession();
  const userId = Number(session!.user.id);

  const match = await prisma.match.findUnique({
    where: { id: Number(params.id) },
    include: {
      evenement: {
        include: {
          sport: true,
          reponses: {
            include: {
              utilisateur: { select: { id: true, nom: true, prenom: true } },
            },
          },
        },
      },
      equipesParticipantes: {
        include: {
          equipe: {
            select: { id: true, nom: true, nombrePlaces: true },
          },
        },
      },
      equipeGagnante: { select: { id: true, nom: true } },
    },
  });

  if (!match) notFound();

  const ev = match.evenement;
  const maReponse = ev.reponses.find((r) => r.utilisateurId === userId)?.reponse;
  const presents = ev.reponses.filter((r) => r.reponse === "present");
  const absents = ev.reponses.filter((r) => r.reponse === "absent");
  const peutEtre = ev.reponses.filter((r) => r.reponse === "peut-etre");
  const equipes = match.equipesParticipantes.map((ep) => ep.equipe);

  return (
    <div>
      <Link href="/matchs" className="text-sm text-gray-400 hover:text-gray-600">&larr; Retour</Link>

      <div className="mt-2 mb-5">
        <h1 className="text-xl font-semibold text-gray-700">{ev.entitule}</h1>
        <p className="text-sm text-gray-400">{ev.sport.nom} — Match</p>
      </div>

      {/* Score / Equipes */}
      <div className="card mb-6">
        <div className="flex items-center justify-center gap-8 py-4">
          {equipes.map((eq, i) => (
            <div key={eq.id} className="text-center">
              <Link href={`/equipes/${eq.id}`} className="text-lg font-bold text-gray-700 hover:underline">
                {eq.nom}
              </Link>
              {match.equipeGagnante?.id === eq.id && (
                <p className="badge-green mt-1 inline-block">Gagnant</p>
              )}
            </div>
          ))}
        </div>
        <div className="border-t border-gray-200 pt-4">
          <MatchWinner
            matchId={match.id}
            equipes={equipes}
            currentWinnerId={match.equipeGagnanteId}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Details */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card">
            <div className="card-header">Details</div>
            <div className="space-y-2 text-sm">
              <p><span className="text-gray-400">Date :</span> {new Date(ev.dateHeure).toLocaleDateString("fr-FR", {
                weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
              })}</p>
              <p><span className="text-gray-400">Sport :</span> {ev.sport.nom}</p>
              <p><span className="text-gray-400">Participants :</span> {ev.participants}</p>
              {ev.description && (
                <p><span className="text-gray-400">Description :</span> {ev.description}</p>
              )}
            </div>
          </div>

          {/* Reponses */}
          <div className="card">
            <div className="card-header">Reponses ({ev.reponses.length})</div>
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
          <ReponseButtons evenementId={ev.id} currentReponse={maReponse} />
        </div>
      </div>
    </div>
  );
}
