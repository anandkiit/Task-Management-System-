'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '../types';
import { authService } from '../lib/auth.service';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const initAuth = useCallback(async () => {
    const token = authService.getAccessToken();
    if (!token) {
      setIsLoading(false);
      return;
    }
    try {
      const me = await authService.getMe();
      setUser(me);
      authService.saveUser(me);
    } catch {
      authService.clearTokens();
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  const login = async (email: string, password: string) => {
    const result = await authService.login(email, password);
    authService.saveTokens({ accessToken: result.accessToken, refreshToken: result.refreshToken });
    authService.saveUser(result.user);
    setUser(result.user);
    router.push('/dashboard');
  };

  const register = async (name: string, email: string, password: string) => {
    const result = await authService.register(name, email, password);
    authService.saveTokens({ accessToken: result.accessToken, refreshToken: result.refreshToken });
    authService.saveUser(result.user);
    setUser(result.user);
    router.push('/dashboard');
  };

  const logout = async () => {
    const refreshToken = authService.getRefreshToken();
    if (refreshToken) {
      try {
        await authService.logout(refreshToken);
      } catch {
        // ignore errors on logout
      }
    }
    authService.clearTokens();
    setUser(null);
    router.push('/auth/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
