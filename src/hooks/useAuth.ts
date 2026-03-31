import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/auth.service';
import { LoginRequest } from '@/types/auth.types';
import { message } from 'antd';

export const useAuth = () => {
  const { user, isAuthenticated, setAuth, clearAuth } = useAuthStore();

  const login = async (data: LoginRequest) => {
    const response = await authService.login(data);
    setAuth(response.user, response.accessToken, response.refreshToken);
    return response;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // ignore errors on logout
    } finally {
      clearAuth();
    }
  };

  return { user, isAuthenticated, login, logout };
};
