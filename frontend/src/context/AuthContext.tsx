import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '../api/client';

type User = {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: string;
  sportsInscrits?: { sportId: number; sport: { id: number; nom: string } }[];
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  hasSports: boolean;
  subscribedSportIds: number[];
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>(null!);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const profile = await api.get<User>('/auth/me');
      setUser(profile);
    } catch {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setToken(null);
      setUser(null);
    }
  };

  useEffect(() => {
    if (token) {
      fetchProfile().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    const data = await api.post<{ access_token: string; user: User }>('/auth/login', {
      email,
      password,
    });
    localStorage.setItem('token', data.access_token);
    setToken(data.access_token);
    // Fetch full profile (with sportsInscrits)
    const profile = await api.get<User>('/auth/me');
    setUser(profile);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const refreshProfile = async () => {
    await fetchProfile();
  };

  const subscribedSportIds = user?.sportsInscrits?.map((s) => s.sportId) ?? [];

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        refreshProfile,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        hasSports: subscribedSportIds.length > 0,
        subscribedSportIds,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
