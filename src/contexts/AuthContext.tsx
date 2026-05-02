import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api';
import { UserResponse } from '../api/types';

interface AuthContextType {
  user: UserResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; full_name: string; phone?: string }) => Promise<void>;
  logout: () => void;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  // Check auth status on mount
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      api.authMe()
        .then(setUser)
        .catch(() => {
          localStorage.removeItem('access_token');
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await api.authLogin({ email, password });
      if (!response.access_token || !response.user) {
        throw new Error('Phản hồi từ server không hợp lệ');
      }
      localStorage.setItem('access_token', response.access_token);
      setUser(response.user);
    } catch (error: any) {
      console.error('Login failed:', error);
      throw new Error(error.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
    }
  }, []);

  const register = useCallback(async (data: { email: string; password: string; full_name: string; phone?: string }) => {
    try {
      console.log('AuthContext: calling authRegister API...');
      const response = await api.authRegister(data);
      console.log('AuthContext: API response:', response);
      if (!response.access_token || !response.user) {
        console.error('AuthContext: Invalid response - missing access_token or user', response);
        throw new Error('Phản hồi từ server không hợp lệ (thiếu token hoặc user)');
      }
      localStorage.setItem('access_token', response.access_token);
      console.log('AuthContext: token saved, setting user...');
      setUser(response.user);
      console.log('AuthContext: user set successfully');
    } catch (error: any) {
      console.error('AuthContext: Register failed:', error);
      throw new Error(error.message || 'Đăng ký thất bại. Vui lòng thử lại.');
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('access_token');
    setUser(null);
  }, []);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    await api.authChangePassword({
      current_password: currentPassword,
      new_password: newPassword,
    });
  }, []);

  const refreshUser = useCallback(async () => {
    const userData = await api.authMe();
    setUser(userData);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        changePassword,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
