import { apiClient } from './apiClient';
import { User, AuthTokens } from '@/store/slices/authSlice';

// Types
interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'buyer' | 'seller';
}

interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    tokens: AuthTokens;
  };
  message: string;
}

interface RefreshResponse {
  success: boolean;
  data: {
    tokens: AuthTokens;
  };
  message: string;
}

interface ProfileResponse {
  success: boolean;
  data: {
    user: User;
  };
  message: string;
}

class AuthService {
  /**
   * Login user with email and password
   */
  async login(credentials: LoginCredentials): Promise<{ user: User; tokens: AuthTokens }> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Login failed');
      }
      
      return response.data.data;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error(error.message || 'Network error during login');
    }
  }

  /**
   * Register new user
   */
  async register(userData: RegisterData): Promise<{ user: User; tokens: AuthTokens }> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/register', userData);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Registration failed');
      }
      
      return response.data.data;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error(error.message || 'Network error during registration');
    }
  }

  /**
   * Logout user
   */
  async logout(refreshToken: string): Promise<void> {
    try {
      await apiClient.post('/auth/logout', { refreshToken });
    } catch (error: any) {
      // Don't throw error for logout - we want to clear local data regardless
      console.warn('Logout request failed:', error.message);
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<{ tokens: AuthTokens }> {
    try {
      const response = await apiClient.post<RefreshResponse>('/auth/refresh', {
        refreshToken,
      });
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Token refresh failed');
      }
      
      return response.data.data;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error(error.message || 'Network error during token refresh');
    }
  }

  /**
   * Get user profile
   */
  async getProfile(accessToken: string): Promise<User> {
    try {
      const response = await apiClient.get<ProfileResponse>('/users/profile', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to get profile');
      }
      
      return response.data.data.user;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error(error.message || 'Network error while fetching profile');
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(updates: Partial<User>, accessToken: string): Promise<User> {
    try {
      const response = await apiClient.put<ProfileResponse>('/users/profile', updates, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Profile update failed');
      }
      
      return response.data.data.user;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error(error.message || 'Network error during profile update');
    }
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<void> {
    try {
      const response = await apiClient.post('/auth/forgot-password', { email });
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Password reset request failed');
      }
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error(error.message || 'Network error during password reset request');
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      const response = await apiClient.post('/auth/reset-password', {
        token,
        password: newPassword,
      });
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Password reset failed');
      }
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error(error.message || 'Network error during password reset');
    }
  }

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<void> {
    try {
      const response = await apiClient.post('/auth/verify-email', { token });
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Email verification failed');
      }
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error(error.message || 'Network error during email verification');
    }
  }

  /**
   * Resend verification email
   */
  async resendVerificationEmail(email: string): Promise<void> {
    try {
      const response = await apiClient.post('/auth/resend-verification', { email });
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to resend verification email');
      }
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error(error.message || 'Network error while resending verification email');
    }
  }
}

export const authService = new AuthService();

