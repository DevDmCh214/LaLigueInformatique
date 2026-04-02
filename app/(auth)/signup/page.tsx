"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const formData = new FormData(e.currentTarget);
    const nom = formData.get("nom") as string;
    const prenom = formData.get("prenom") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nom, prenom, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erreur lors de l'inscription");
        setLoading(false);
        return;
      }

      router.push("/login?registered=1");
    } catch {
      setError("Erreur de connexion au serveur");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-80">
        <div className="text-center mb-6">
          <h1
            className="text-4xl font-black text-gray-600 uppercase tracking-wider"
            style={{ fontFamily: "Impact, 'Arial Black', sans-serif" }}
          >
            La Ligue
          </h1>
          <p className="text-gray-400 text-sm mt-1">Creer un compte</p>
        </div>

        <div className="border border-gray-300 rounded-lg overflow-hidden">
          <div className="bg-gray-500 text-white px-6 py-3">
            <h2 className="text-base font-semibold">Inscription</h2>
          </div>

          <div className="p-6 space-y-4">
            {error && <p className="text-red-500 text-sm">{error}</p>}

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Nom</label>
                  <input name="nom" type="text" required className="input" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Prenom</label>
                  <input name="prenom" type="text" required className="input" />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Email</label>
                <input name="email" type="email" required className="input" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Mot de passe</label>
                <input name="password" type="password" required className="input" />
                <p className="text-xs text-gray-400 mt-1">
                  Min. 8 car., 1 majuscule, 1 minuscule, 1 chiffre, 1 special
                </p>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Confirmer le mot de passe</label>
                <input name="confirmPassword" type="password" required className="input" />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? "Inscription..." : "S'inscrire"}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500">
              Deja un compte ?{" "}
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
