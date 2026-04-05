import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navLinks = [
  { href: '/dashboard', label: 'Tableau de bord' },
  { href: '/sports', label: 'Sports' },
  { href: '/equipes', label: 'Equipes' },
  { href: '/evenements', label: 'Evenements' },
  { href: '/matchs', label: 'Matchs' },
  { href: '/calendar', label: 'Calendrier' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) return null;

  return (
    <nav className="h-16" style={{ backgroundColor: '#a8bcc8' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex justify-between items-center h-full">
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  location.pathname.startsWith(link.href)
                    ? 'bg-white/25 text-white'
                    : 'text-white/80 hover:bg-white/15 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <Link
            to="/dashboard"
            className="text-2xl font-black text-white uppercase tracking-wider"
            style={{ fontFamily: "Impact, 'Arial Black', sans-serif" }}
          >
            LA LIGUE
          </Link>

          <div className="flex items-center gap-4">
            <Link to="/profil" className="text-sm text-white/80 hover:text-white transition-colors">
              {user.prenom} {user.nom}
            </Link>
            <button
              onClick={logout}
              className="text-sm text-white/90 hover:text-white hover:bg-white/15 px-2 py-1 rounded transition-colors"
            >
              Deconnexion
            </button>
          </div>
        </div>

        <div className="md:hidden flex gap-1 pb-2 overflow-x-auto -mt-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={`px-3 py-1 rounded text-sm font-medium whitespace-nowrap ${
                location.pathname.startsWith(link.href)
                  ? 'bg-white/25 text-white'
                  : 'text-white/80'
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
