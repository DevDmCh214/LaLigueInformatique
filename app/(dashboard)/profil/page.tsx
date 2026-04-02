import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import Link from "next/link";
import SportSubscriptions from "./SportSubscriptions";

export default async function ProfilPage() {
  const session = await getSession();
  const userId = Number(session!.user.id);

  const [utilisateur, allSports, mesEquipes] = await Promise.all([
    prisma.utilisateur.findUnique({
      where: { id: userId },
      include: {
        sportsInscrits: { include: { sport: true } },
        appartenances: { include: { equipe: true } },
      },
    }),
    prisma.sport.findMany({ orderBy: { nom: "asc" } }),
    prisma.appartenir.findMany({
      where: { utilisateurId: userId },
      include: { equipe: true },
    }),
  ]);

  if (!utilisateur) return null;

  const mesSportsIds = new Set(utilisateur.sportsInscrits.map((s) => s.sportId));

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-700 mb-5">Mon profil</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Informations */}
        <div className="card">
          <div className="card-header">Informations</div>
          <div className="space-y-3 text-sm">
            <p><span className="text-gray-400">Nom :</span> {utilisateur.prenom} {utilisateur.nom}</p>
            <p><span className="text-gray-400">Email :</span> {utilisateur.email}</p>
            <p><span className="text-gray-400">Role :</span> <span className="badge-blue">{utilisateur.role}</span></p>
          </div>
        </div>

        {/* Mes equipes */}
        <div className="card">
          <div className="card-header">Mes equipes ({mesEquipes.length})</div>
          {mesEquipes.length === 0 ? (
            <p className="text-gray-400 text-sm">Aucune equipe.</p>
          ) : (
            <div className="space-y-2">
              {mesEquipes.map((a) => (
                <Link
                  key={a.id}
                  href={`/equipes/${a.equipe.id}`}
                  className="block p-2 border border-gray-200 rounded hover:bg-gray-50 transition-colors"
                >
                  <span className="font-medium text-gray-700 text-sm">{a.equipe.nom}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Inscriptions aux sports */}
        <div className="card lg:col-span-2">
          <div className="card-header">Mes sports (listeSportsInscript)</div>
          <SportSubscriptions
            allSports={allSports.map((s) => ({ id: s.id, nom: s.nom }))}
            inscritIds={Array.from(mesSportsIds)}
          />
        </div>
      </div>
    </div>
  );
}
