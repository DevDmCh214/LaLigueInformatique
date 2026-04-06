import { describe, it, expect, vi, beforeEach } from 'vitest';
import { api } from './client';

describe('API Client', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', {
      getItem: vi.fn().mockReturnValue('test-token'),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    });
  });

  it('should send GET request with auth header', async () => {
    const mockResponse = { ok: true, status: 200, json: () => Promise.resolve({ id: 1 }) };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockResponse));

    const result = await api.get('/sports');

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/sports',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token',
        }),
      }),
    );
    expect(result).toEqual({ id: 1 });
  });

  it('should send POST request with body', async () => {
    const mockResponse = { ok: true, status: 200, json: () => Promise.resolve({ success: true }) };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockResponse));

    await api.post('/auth/login', { email: 'test@test.com', password: 'pass' });

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/auth/login',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ email: 'test@test.com', password: 'pass' }),
      }),
    );
  });

  it('should throw on error response', async () => {
    const mockResponse = { ok: false, status: 400, json: () => Promise.resolve({ message: 'Bad request' }) };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockResponse));

    await expect(api.get('/bad')).rejects.toThrow('Bad request');
  });

  it('should redirect on 401', async () => {
    const mockResponse = { ok: false, status: 401, json: () => Promise.resolve({}) };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockResponse));

    // Mock window.location
    delete (window as any).location;
    (window as any).location = { href: '' };

    await expect(api.get('/protected')).rejects.toThrow('Non autorise');
    expect(localStorage.removeItem).toHaveBeenCalledWith('token');
  });
});
