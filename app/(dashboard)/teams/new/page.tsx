"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewTeamPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [sport, setSport] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/teams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, sport: sport || undefined }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Erreur lors de la création");
      return;
    }

    router.push(`/teams/${data.id}`);
    router.refresh();
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-xl font-semibold text-gray-700 mb-5">Créer une équipe</h1>

      <div className="border border-gray-300 rounded-lg overflow-hidden">
        <div className="bg-gray-500 text-white px-6 py-3">
          <h2 className="text-base font-semibold">Nouvelle équipe</h2>
        </div>

        <div className="p-6">
          {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm text-gray-600 mb-1">
                Nom de l&apos;équipe *
              </label>
              <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} className="input" required />
            </div>

            <div>
              <label htmlFor="sport" className="block text-sm text-gray-600 mb-1">
                Sport
              </label>
              <input id="sport" type="text" value={sport} onChange={(e) => setSport(e.target.value)} className="input" placeholder="Ex : Football, Basketball..." />
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? "Création..." : "Créer l'équipe"}
              </button>
              <Link href="/teams" className="btn-secondary">Annuler</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
