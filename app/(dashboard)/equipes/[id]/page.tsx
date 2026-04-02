import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import EquipeActions from "./EquipeActions";
import AddMembreForm from "./AddMembreForm";
import MembreList from "./MembreList";

export default async function EquipeDetailPage({ params }: { params: { id: string } }) {
  const session = await getSession();
  const userId = Number(session!.user.id);
  const equipeId = Number(params.id);

  const equipe = await prisma.equipe.findUnique({
    where: { id: equipeId },
    include: {
      membres: {
        include: {
          utilisateur: { select: { id: true, nom: true, prenom: true, email: true } },
        },
        orderBy: { utilisateur: { nom: "asc" } },
      },
      participations: {
        include: {
          match: {
            include: {
              evenement: { select: { id: true, entitule: true, dateHeure: true } },
              equipeGagnante: { select: { id: true, nom: true } },
              equipesParticipantes: { include: { equipe: { select: { id: true, nom: true } } } },
            },
          },
        },
        take: 10,
      },
    },
  });

  if (!equipe) notFound();

  const isMembre = equipe.membres.some((m) => m.utilisateurId === userId);
  const placesRestantes = equipe.nombrePlaces - equipe.membres.length;

  return (
    <div>
      <Link href="/equipes" className="text-sm text-gray-400 hover:text-gray-600">&larr; Retour aux equipes</Link>
      <div className="flex justify-between items-center mt-2 mb-5">
        <div>
          <h1 className="text-xl font-semibold text-gray-700">{equipe.nom}</h1>
          <p className="text-sm text-gray-400">
            {equipe.membres.length}/{equipe.nombrePlaces} membres
            {placesRestantes > 0 ? ` (${placesRestantes} place(s) restante(s))` : " (complet)"}
          </p>
        </div>
        <EquipeActions equipeId={equipe.id} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Membres */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="card-header">Membres</div>
            <MembreList
              membres={equipe.membres.map((m) => ({
                id: m.id,
                utilisateurId: m.utilisateurId,
                nom: m.utilisateur.nom,
                prenom: m.utilisateur.prenom,
                email: m.utilisateur.email,
              }))}
              equipeId={equipe.id}
              currentUserId={userId}
            />
            {placesRestantes > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <AddMembreForm equipeId={equipe.id} />
              </div>
            )}
          </div>
        </div>

        {/* Matchs */}
        <div className="card">
          <div className="card-header">Matchs ({equipe.participations.length})</div>
          {equipe.participations.length === 0 ? (
            <p className="text-gray-400 text-sm">Aucun match.</p>
          ) : (
            <div className="space-y-2">
              {equipe.participations.map((p) => {
                const adversaire = p.match.equipesParticipantes.find(
                  (ep) => ep.equipeId !== equipe.id
                );
                return (
                  <Link
                    key={p.id}
                    href={`/matchs/${p.match.id}`}
                    className="block p-3 border border-gray-200 rounded hover:bg-gray-50 transition-colors"
                  >
                    <p className="font-medium text-gray-700 text-sm">{p.match.evenement.entitule}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      vs {adversaire?.equipe.nom || "?"} — {new Date(p.match.evenement.dateHeure).toLocaleDateString("fr-FR", {
                        day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                      })}
                    </p>
                    {p.match.equipeGagnante && (
                      <span className={p.match.equipeGagnante.id === equipe.id ? "badge-green mt-1" : "badge-red mt-1"}>
                        {p.match.equipeGagnante.id === equipe.id ? "Victoire" : "Defaite"}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
