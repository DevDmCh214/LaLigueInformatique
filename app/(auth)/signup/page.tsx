"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function validatePassword(pwd: string): string | null {
    if (pwd.length < 8) return "Le mot de passe doit contenir au moins 8 caractères";
    if (!/[A-Z]/.test(pwd)) return "Le mot de passe doit contenir au moins une majuscule";
    if (!/[a-z]/.test(pwd)) return "Le mot de passe doit contenir au moins une minuscule";
    if (!/[0-9]/.test(pwd)) return "Le mot de passe doit contenir au moins un chiffre";
    if (!/[^A-Za-z0-9]/.test(pwd)) return "Le mot de passe doit contenir au moins un caractère spécial (!@#$...)";
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    const pwdError = validatePassword(form.password);
    if (pwdError) {
      setError(pwdError);
      return;
    }

    setLoading(true);

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Erreur lors de l'inscription");
      return;
    }

    router.push("/login?registered=1");
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-80">
        {/* Branding */}
        <div className="text-center mb-6">
          <h1
            className="text-4xl font-black text-gray-600 uppercase tracking-wider"
            style={{ fontFamily: "Impact, 'Arial Black', sans-serif" }}
          >
            La Ligue
          </h1>
          <p className="text-gray-400 text-sm mt-1">Créer un compte</p>
        </div>

        {/* Card */}
        <div className="border border-gray-300 rounded-lg overflow-hidden">
          {/* Header gris */}
          <div className="bg-gray-500 text-white px-6 py-3">
            <h2 className="text-base font-semibold">Inscription</h2>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4">
            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label htmlFor="name" className="block text-sm text-gray-600 mb-1">
                  Nom complet
                </label>
                <input
                  id="name"
                  type="text"
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  className="input"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm text-gray-600 mb-1">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  className="input"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm text-gray-600 mb-1">
                  Mot de passe
                </label>
                <input
                  id="password"
                  type="password"
                  value={form.password}
                  onChange={(e) => updateField("password", e.target.value)}
                  className="input"
                  required
                />
                <p className="text-xs text-gray-400 mt-1">
                  Min. 8 car., 1 majuscule, 1 minuscule, 1 chiffre, 1 spécial
                </p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm text-gray-600 mb-1">
                  Confirmer le mot de passe
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) => updateField("confirmPassword", e.target.value)}
                  className="input"
                  required
                />
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? "Inscription..." : "S'inscrire"}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500">
              Déjà un compte ?{" "}
              <Link href="/login" className="text-gray-700 hover:underline font-medium">
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
