"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewSportPage() {
  const router = useRouter();
  const [nom, setNom] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/sports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nom }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Erreur");
      setLoading(false);
      return;
    }

    const sport = await res.json();
    router.push(`/sports/${sport.id}`);
  }

  return (
    <div>
      <Link href="/sports" className="text-sm text-gray-400 hover:text-gray-600">&larr; Retour aux sports</Link>
      <h1 className="text-xl font-semibold text-gray-700 mt-2 mb-5">Nouveau sport</h1>

      <div className="card max-w-md">
        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-500 mb-1">Nom du sport</label>
            <input
              type="text"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              required
              className="input"
              placeholder="Ex: Football, Basketball..."
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Creation..." : "Creer le sport"}
          </button>
        </form>
      </div>
    </div>
  );
}
