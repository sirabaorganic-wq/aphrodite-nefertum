import { apiClient } from './client';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  role: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  accessToken: string;
  user?: UserProfile;
}

/**
 * Authenticates user with email and password, saving token/profile to localStorage.
 */
export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
  if (typeof window !== 'undefined') {
    if (response.accessToken) {
      localStorage.setItem('accessToken', response.accessToken);
    }
    if (response.user) {
      localStorage.setItem('user', JSON.stringify(response.user));
    }
  }
  return response;
}

/**
 * Registers a new account, saving returned access token and profile to localStorage.
 */
export async function register(data: RegisterData): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>('/auth/register', data);
  if (typeof window !== 'undefined') {
    if (response.accessToken) {
      localStorage.setItem('accessToken', response.accessToken);
    }
    if (response.user) {
      localStorage.setItem('user', JSON.stringify(response.user));
    }
  }
  return response;
}

/**
 * Logs out of session on server and removes credentials from localStorage.
 */
export async function logout(): Promise<{ success: boolean; message?: string }> {
  try {
    const storedRefreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
    const body = storedRefreshToken ? { refreshToken: storedRefreshToken } : undefined;
    return await apiClient.post<{ success: boolean; message?: string }>('/auth/logout', body);
  } finally {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  }
}

/**
 * Manually rotates/refreshes the access token using cookie or stored refresh token.
 */
export async function refreshToken(): Promise<{ success: boolean; accessToken: string }> {
  const storedRefreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
  const body = storedRefreshToken ? { refreshToken: storedRefreshToken } : undefined;
  const response = await apiClient.post<{ success: boolean; accessToken: string }>('/auth/refresh', body);
  if (typeof window !== 'undefined' && response.accessToken) {
    localStorage.setItem('accessToken', response.accessToken);
  }
  return response;
}

/**
 * Retrieves profile details of the currently authenticated user.
 */
export async function getProfile(): Promise<{ success: boolean; user: UserProfile }> {
  const response = await apiClient.get<{ success: boolean; user: UserProfile }>('/auth/profile');
  if (typeof window !== 'undefined' && response.user) {
    localStorage.setItem('user', JSON.stringify(response.user));
  }
  return response;
}
