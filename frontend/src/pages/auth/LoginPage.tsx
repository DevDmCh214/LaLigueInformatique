import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Email ou mot de passe incorrect');
    } finally {
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
          <p className="text-gray-400 text-sm mt-1">Gestion d'equipes sportives</p>
        </div>

        <div className="border border-gray-300 rounded-lg overflow-hidden">
          <div className="bg-gray-500 text-white px-6 py-3">
            <h2 className="text-base font-semibold">Connexion</h2>
          </div>

          <div className="p-6 space-y-4">
            {error && <p className="text-red-500 text-sm">{error}</p>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm text-gray-600 mb-1">Email</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input"
                  required
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm text-gray-600 mb-1">Mot de passe</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input"
                  required
                />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? 'Connexion...' : 'Se connecter'}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500">
              Pas encore de compte ?{' '}
              <Link to="/signup" className="text-gray-700 hover:underline font-medium">
                S'inscrire
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
