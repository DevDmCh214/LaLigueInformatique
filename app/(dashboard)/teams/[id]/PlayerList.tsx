"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface Player {
  id: number;
  firstName: string;
  lastName: string;
  position: string | null;
  email: string | null;
  phone: string | null;
}

export default function PlayerList({ players, isAdmin }: { players: Player[]; isAdmin: boolean }) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<Player>>({});

  function startEdit(player: Player) {
    setEditingId(player.id);
    setEditForm(player);
  }

  async function saveEdit() {
    if (!editingId) return;
    await fetch(`/api/players/${editingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });
    setEditingId(null);
    router.refresh();
  }

  async function deletePlayer(id: number) {
    if (!confirm("Supprimer ce joueur ?")) return;
    await fetch(`/api/players/${id}`, { method: "DELETE" });
    router.refresh();
  }

  if (players.length === 0) {
    return <p className="text-gray-400 text-sm">Aucun joueur dans cette équipe.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table>
        <thead>
          <tr>
            <th>Nom</th>
            <th>Poste</th>
            <th>Email</th>
            <th>Téléphone</th>
            {isAdmin && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {players.map((player) =>
            editingId === player.id ? (
              <tr key={player.id} className="bg-gray-50">
                <td>
                  <div className="flex gap-1">
                    <input
                      value={editForm.firstName || ""}
                      onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                      className="input text-xs w-20"
                    />
                    <input
                      value={editForm.lastName || ""}
                      onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                      className="input text-xs w-20"
                    />
                  </div>
                </td>
                <td>
                  <input
                    value={editForm.position || ""}
                    onChange={(e) => setEditForm({ ...editForm, position: e.target.value })}
                    className="input text-xs"
                  />
                </td>
                <td>
                  <input
                    value={editForm.email || ""}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="input text-xs"
                  />
                </td>
                <td>
                  <input
                    value={editForm.phone || ""}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="input text-xs"
                  />
                </td>
                <td>
                  <div className="flex gap-2">
                    <button onClick={saveEdit} className="text-green-600 hover:underline text-xs">Sauver</button>
                    <button onClick={() => setEditingId(null)} className="text-gray-400 hover:underline text-xs">Annuler</button>
                  </div>
                </td>
              </tr>
            ) : (
              <tr key={player.id}>
                <td className="font-medium text-gray-700">{player.firstName} {player.lastName}</td>
                <td>{player.position || "—"}</td>
                <td>{player.email || "—"}</td>
                <td>{player.phone || "—"}</td>
                {isAdmin && (
                  <td>
                    <div className="flex gap-2">
                      <button onClick={() => startEdit(player)} className="text-gray-500 hover:text-gray-700 hover:underline text-xs">
                        Modifier
                      </button>
                      <button onClick={() => deletePlayer(player.id)} className="text-red-500 hover:text-red-700 hover:underline text-xs">
                        Supprimer
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  );
}
