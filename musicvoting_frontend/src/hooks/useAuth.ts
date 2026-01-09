import { useState, useCallback } from 'react';
import { validateUser } from '../config';

interface AuthState {
  isAuthenticated: boolean;
  username: string | null;
  displayName: string | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>(() => {
    const stored = sessionStorage.getItem('musicvoting_auth');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return { isAuthenticated: false, username: null, displayName: null };
      }
    }
    return { isAuthenticated: false, username: null, displayName: null };
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (username: string, pin: string) => {
    setIsLoading(true);
    setError(null);

    // Small delay for UX
    await new Promise((resolve) => setTimeout(resolve, 200));

    const result = validateUser(username, pin);
    if (result.valid && result.username) {
      const newState: AuthState = {
        isAuthenticated: true,
        username: result.username,
        displayName: result.displayName || result.username,
      };
      setAuthState(newState);
      sessionStorage.setItem('musicvoting_auth', JSON.stringify(newState));
      setIsLoading(false);
      return true;
    } else {
      setError('Invalid username or PIN');
      setIsLoading(false);
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    setAuthState({ isAuthenticated: false, username: null, displayName: null });
    sessionStorage.removeItem('musicvoting_auth');
  }, []);

  return {
    ...authState,
    isLoading,
    error,
    login,
    logout,
  };
}
