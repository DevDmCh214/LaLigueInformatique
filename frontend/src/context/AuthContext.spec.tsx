import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';

// Mock api module
vi.mock('../api/client', () => ({
  api: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

import { api } from '../api/client';

function TestConsumer() {
  const { isAuthenticated, isAdmin, hasSports, subscribedSportIds, user } = useAuth();
  return (
    <div>
      <span data-testid="auth">{String(isAuthenticated)}</span>
      <span data-testid="admin">{String(isAdmin)}</span>
      <span data-testid="hasSports">{String(hasSports)}</span>
      <span data-testid="sportIds">{subscribedSportIds.join(',')}</span>
      <span data-testid="user">{user?.email || 'none'}</span>
    </div>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', {
      getItem: vi.fn().mockReturnValue(null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    });
    vi.clearAllMocks();
  });

  it('should start as unauthenticated when no token', async () => {
    await act(async () => {
      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>,
      );
    });

    expect(screen.getByTestId('auth').textContent).toBe('false');
    expect(screen.getByTestId('admin').textContent).toBe('false');
    expect(screen.getByTestId('user').textContent).toBe('none');
  });

  it('should load profile when token exists', async () => {
    (localStorage.getItem as any).mockReturnValue('existing-token');
    (api.get as any).mockResolvedValue({
      id: 1,
      nom: 'Dupont',
      prenom: 'Alice',
      email: 'alice@example.com',
      role: 'admin',
      sportsInscrits: [
        { sportId: 1, sport: { id: 1, nom: 'Football' } },
        { sportId: 2, sport: { id: 2, nom: 'Basketball' } },
      ],
    });

    await act(async () => {
      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>,
      );
    });

    expect(screen.getByTestId('auth').textContent).toBe('true');
    expect(screen.getByTestId('admin').textContent).toBe('true');
    expect(screen.getByTestId('hasSports').textContent).toBe('true');
    expect(screen.getByTestId('sportIds').textContent).toBe('1,2');
    expect(screen.getByTestId('user').textContent).toBe('alice@example.com');
  });

  it('should clear auth on profile fetch failure', async () => {
    (localStorage.getItem as any).mockReturnValue('bad-token');
    (api.get as any).mockRejectedValue(new Error('Unauthorized'));

    await act(async () => {
      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>,
      );
    });

    expect(screen.getByTestId('auth').textContent).toBe('false');
    expect(localStorage.removeItem).toHaveBeenCalledWith('token');
  });
});
