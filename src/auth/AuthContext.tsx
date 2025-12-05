import React, { createContext, useContext, useEffect, useState } from 'react';

export type Role = 'Admin' | 'Doctor' | 'Receptionist' | 'WarehouseStaff' | 'Patient' | null;

interface AuthContextType {
  role: Role;
  token: string | null;
  login: (role: Role, token: string) => void;
  logout: () => void;
  isInitialized: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [role, setRoleState] = useState<Role>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const storedRole = localStorage.getItem('role') as Role | null;
    const storedToken = localStorage.getItem('token');
    if (storedRole !== null) {
      setRoleState(storedRole);
    }
    if (storedToken) {
      setTokenState(storedToken);
    }
    setIsInitialized(true);
  }, []);

  const setRole = (newRole: Role) => {
    setRoleState(newRole);
    if (newRole) {
      localStorage.setItem('role', newRole);
    } else {
      localStorage.removeItem('role');
    }
  };

  const setToken = (newToken: string | null) => {
    setTokenState(newToken);
    if (newToken) {
      localStorage.setItem('token', newToken);
    } else {
      localStorage.removeItem('token');
    }
  };

  const login = (newRole: Role, newToken: string) => {
    setRole(newRole);
    setToken(newToken);
  };

  const logout = () => {
    setRole(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ role, token, login, logout, isInitialized }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
