"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddPlayerForm({ teamId }: { teamId: number }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ email: "", role: "member", position: "", phone: "" });
  const [error, setError] = useState("");

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const res = await fetch("/api/players", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, teamId }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Erreur");
      return;
    }

    setForm({ email: "", role: "member", position: "", phone: "" });
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn-primary text-xs mb-4">
        + Ajouter un membre
      </button>
    );
  }

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
      <h3 className="font-semibold text-sm text-gray-600 mb-3">Ajouter un membre</h3>
      {error && <p className="text-red-500 text-xs mb-2">{error}</p>}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input placeholder="Email du compte *" type="email" value={form.email} onChange={(e) => updateField("email", e.target.value)} className="input" required />
        <select value={form.role} onChange={(e) => updateField("role", e.target.value)} className="input">
          <option value="member">Membre</option>
          <option value="admin">Admin</option>
        </select>
        <input placeholder="Poste (ex: Attaquant)" value={form.position} onChange={(e) => updateField("position", e.target.value)} className="input" />
        <input placeholder="Téléphone" value={form.phone} onChange={(e) => updateField("phone", e.target.value)} className="input" />
        <div className="flex gap-2 items-start">
          <button type="submit" className="btn-primary text-xs">Ajouter</button>
          <button type="button" onClick={() => setOpen(false)} className="btn-secondary text-xs">Annuler</button>
        </div>
      </form>
    </div>
  );
}
