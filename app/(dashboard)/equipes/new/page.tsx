"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewEquipePage() {
  const router = useRouter();
  const [nom, setNom] = useState("");
  const [nombrePlaces, setNombrePlaces] = useState(11);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/equipes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nom, nombrePlaces }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Erreur");
      setLoading(false);
      return;
    }

    const equipe = await res.json();
    router.push(`/equipes/${equipe.id}`);
  }

  return (
    <div>
      <Link href="/equipes" className="text-sm text-gray-400 hover:text-gray-600">&larr; Retour aux equipes</Link>
      <h1 className="text-xl font-semibold text-gray-700 mt-2 mb-5">Nouvelle equipe</h1>

      <div className="card max-w-md">
        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-500 mb-1">Nom de l'equipe</label>
            <input
              type="text"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              required
              className="input"
              placeholder="Ex: FC Paris"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">Nombre de places</label>
            <input
              type="number"
              value={nombrePlaces}
              onChange={(e) => setNombrePlaces(Number(e.target.value))}
              min={1}
              required
              className="input"
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Creation..." : "Creer l'equipe"}
          </button>
        </form>
      </div>
    </div>
  );
}
