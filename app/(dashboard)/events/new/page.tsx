"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

interface Team {
  id: number;
  name: string;
}

export default function NewEventPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedTeamId = searchParams.get("teamId");

  const [teams, setTeams] = useState<Team[]>([]);
  const [form, setForm] = useState({
    title: "",
    type: "game",
    date: "",
    location: "",
    opponent: "",
    description: "",
    teamId: preselectedTeamId || "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/teams")
      .then((r) => r.json())
      .then(setTeams);
  }, []);

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        teamId: Number(form.teamId),
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Erreur lors de la création");
      return;
    }

    router.push(`/events/${data.id}`);
    router.refresh();
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-xl font-semibold text-gray-700 mb-5">Nouvel événement</h1>

      <div className="border border-gray-300 rounded-lg overflow-hidden">
        <div className="bg-gray-500 text-white px-6 py-3">
          <h2 className="text-base font-semibold">Créer un événement</h2>
        </div>

        <div className="p-6">
          {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Équipe *</label>
              <select value={form.teamId} onChange={(e) => updateField("teamId", e.target.value)} className="input" required>
                <option value="">Sélectionner une équipe</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Titre *</label>
              <input value={form.title} onChange={(e) => updateField("title", e.target.value)} className="input" required />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Type *</label>
              <select value={form.type} onChange={(e) => updateField("type", e.target.value)} className="input">
                <option value="game">Match</option>
                <option value="practice">Entraînement</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Date et heure *</label>
              <input type="datetime-local" value={form.date} onChange={(e) => updateField("date", e.target.value)} className="input" required />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Lieu</label>
              <input value={form.location} onChange={(e) => updateField("location", e.target.value)} className="input" />
            </div>

            {form.type === "game" && (
              <div>
                <label className="block text-sm text-gray-600 mb-1">Adversaire</label>
                <input value={form.opponent} onChange={(e) => updateField("opponent", e.target.value)} className="input" />
              </div>
            )}

            <div>
              <label className="block text-sm text-gray-600 mb-1">Description</label>
              <textarea value={form.description} onChange={(e) => updateField("description", e.target.value)} className="input" rows={3} />
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? "Création..." : "Créer l'événement"}
              </button>
              <Link href="/events" className="btn-secondary">Annuler</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
