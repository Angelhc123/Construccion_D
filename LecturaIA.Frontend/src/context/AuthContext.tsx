import React, { createContext, useState, useEffect, type ReactNode } from 'react';
import type { AuthResponseDto } from '../types/auth.types';
import { authService } from '../services/authService';

export interface AuthContextType {
  user: AuthResponseDto | null;
  isAuthenticated: boolean;
  login: (data: AuthResponseDto) => void;
  logout: () => void;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthResponseDto | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = () => {
      try {
        const storedUser = authService.obtenerUsuario();
        if (storedUser && authService.estaAutenticado()) {
          setUser(storedUser);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
          // Limpiar si hay inconsistencia
          if (authService.estaAutenticado() && !storedUser) {
            authService.cerrarSesion();
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = (data: AuthResponseDto) => {
    authService.guardarSesion(data);
    setUser(data);
    setIsAuthenticated(true);
  };

  const logout = () => {
    authService.cerrarSesion();
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
