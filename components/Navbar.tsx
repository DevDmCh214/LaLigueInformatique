"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/dashboard", label: "Tableau de bord" },
  { href: "/sports", label: "Sports" },
  { href: "/equipes", label: "Equipes" },
  { href: "/evenements", label: "Evenements" },
  { href: "/matchs", label: "Matchs" },
  { href: "/calendar", label: "Calendrier" },
];

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  if (!session) return null;

  return (
    <nav className="h-16" style={{ backgroundColor: "#a8bcc8" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex justify-between items-center h-full">
          {/* Left: nav links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  pathname.startsWith(link.href)
                    ? "bg-white/25 text-white"
                    : "text-white/80 hover:bg-white/15 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Center: branding */}
          <Link
            href="/dashboard"
            className="text-2xl font-black text-white uppercase tracking-wider"
            style={{ fontFamily: "Impact, 'Arial Black', sans-serif" }}
          >
            LA LIGUE
          </Link>

          {/* Right: user */}
          <div className="flex items-center gap-4">
            <Link href="/profil" className="text-sm text-white/80 hover:text-white transition-colors">
              {session.user?.name}
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="text-sm text-white/90 hover:text-white hover:bg-white/15 px-2 py-1 rounded transition-colors"
            >
              Deconnexion
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        <div className="md:hidden flex gap-1 pb-2 overflow-x-auto -mt-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-1 rounded text-sm font-medium whitespace-nowrap ${
                pathname.startsWith(link.href)
                  ? "bg-white/25 text-white"
                  : "text-white/80"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
