"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface Member {
  id: number;
  role: string;
  position: string | null;
  phone: string | null;
  user: { id: number; name: string; email: string };
}

export default function PlayerList({ players: members, isAdmin }: { players: Member[]; isAdmin: boolean }) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<{ role?: string; position?: string; phone?: string }>({});

  function startEdit(member: Member) {
    setEditingId(member.id);
    setEditForm({ role: member.role, position: member.position || "", phone: member.phone || "" });
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

  async function deleteMember(id: number) {
    if (!confirm("Retirer ce membre de l'équipe ?")) return;
    await fetch(`/api/players/${id}`, { method: "DELETE" });
    router.refresh();
  }

  if (members.length === 0) {
    return <p className="text-gray-400 text-sm">Aucun membre dans cette équipe.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table>
        <thead>
          <tr>
            <th>Nom</th>
            <th>Email</th>
            <th>Rôle</th>
            <th>Poste</th>
            <th>Téléphone</th>
            {isAdmin && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {members.map((member) =>
            editingId === member.id ? (
              <tr key={member.id} className="bg-gray-50">
                <td className="font-medium text-gray-700">{member.user.name}</td>
                <td className="text-gray-500">{member.user.email}</td>
                <td>
                  <select
                    value={editForm.role || "member"}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                    className="input text-xs"
                  >
                    <option value="member">Membre</option>
                    <option value="admin">Admin</option>
                  </select>
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
              <tr key={member.id}>
                <td className="font-medium text-gray-700">{member.user.name}</td>
                <td className="text-gray-500">{member.user.email}</td>
                <td>
                  <span className={member.role === "admin" ? "badge-blue" : "badge-green"}>
                    {member.role === "admin" ? "Admin" : "Membre"}
                  </span>
                </td>
                <td>{member.position || "—"}</td>
                <td>{member.phone || "—"}</td>
                {isAdmin && (
                  <td>
                    <div className="flex gap-2">
                      <button onClick={() => startEdit(member)} className="text-gray-500 hover:text-gray-700 hover:underline text-xs">
                        Modifier
                      </button>
                      <button onClick={() => deleteMember(member.id)} className="text-red-500 hover:text-red-700 hover:underline text-xs">
                        Retirer
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
