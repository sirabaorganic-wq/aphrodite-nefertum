/**
 * Base API client instance with interceptors, token management, and automatic retry on 401.
 * Uses NEXT_PUBLIC_API_URL as base URL and native fetch for optimal Next.js compatibility.
 */

export class ApiError extends Error {
  public status: number;
  public data: any;
  public url?: string;

  constructor(message: string, status: number, data?: any, url?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
    this.url = url;
  }
}

export interface RequestOptions extends Omit<RequestInit, 'headers'> {
  headers?: Record<string, string>;
  params?: Record<string, any>;
  _retry?: boolean;
}

// Mutex / promise queue for concurrent requests during 401 token refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

/**
 * Resolves full endpoint URL properly handling NEXT_PUBLIC_API_URL and query parameters.
 */
const getFullUrl = (endpoint: string, params?: Record<string, any>): string => {
  let url = endpoint;
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    const base = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/+$/, '');
    if (endpoint.startsWith('/api/v1')) {
      url = `${base}${endpoint}`;
    } else {
      const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
      if (base.endsWith('/api/v1')) {
        url = `${base}${cleanEndpoint}`;
      } else {
        url = `${base}/api/v1${cleanEndpoint}`;
      }
    }
  }

  if (params && Object.keys(params).length > 0) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(v => searchParams.append(key, String(v)));
        } else {
          searchParams.append(key, String(value));
        }
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
  }

  return url;
};

/**
 * Core request execution function with request/response error handling and 401 retry.
 */
async function request<T = any>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { params, _retry = false, ...customConfig } = options;
  const url = getFullUrl(endpoint, params);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...customConfig.headers,
  };

  // If FormData is sent, omit Content-Type so browser sets multipart boundary automatically
  if (customConfig.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  if (typeof window !== 'undefined') {
    const token =
      localStorage.getItem('accessToken') ||
      localStorage.getItem('token') ||
      localStorage.getItem('jwt');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const sessionId =
      localStorage.getItem('sessionId') || localStorage.getItem('guestSessionId');
    if (sessionId) {
      headers['x-session-id'] = sessionId;
    }
  }

  const config: RequestInit = {
    ...customConfig,
    headers,
    credentials: customConfig.credentials || 'include',
  };

  let response: Response;
  try {
    response = await fetch(url, config);
  } catch (err: any) {
    throw new ApiError(
      err.message || 'Network error: Failed to connect to server.',
      0,
      null,
      url
    );
  }

  // Handle 401 Unauthorized: Refresh token & retry once
  if (response.status === 401 && !_retry && !endpoint.includes('/auth/refresh') && !endpoint.includes('/auth/login')) {
    if (isRefreshing) {
      try {
        const newToken = await new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        });
        headers['Authorization'] = `Bearer ${newToken}`;
        return request<T>(endpoint, { ...options, headers, _retry: true });
      } catch (err) {
        throw err;
      }
    }

    options._retry = true;
    isRefreshing = true;

    try {
      const refreshUrl = getFullUrl('/auth/refresh');
      const storedRefreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
      const refreshBody = storedRefreshToken ? JSON.stringify({ refreshToken: storedRefreshToken }) : undefined;

      const refreshRes = await fetch(refreshUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: refreshBody,
      });

      if (!refreshRes.ok) {
        throw new ApiError('Session expired. Please log in again.', 401);
      }

      const refreshData = await refreshRes.json();
      const newToken = refreshData.accessToken || refreshData.token;

      if (typeof window !== 'undefined' && newToken) {
        localStorage.setItem('accessToken', newToken);
        if (refreshData.refreshToken) {
          localStorage.setItem('refreshToken', refreshData.refreshToken);
        }
      }

      processQueue(null, newToken);
      headers['Authorization'] = `Bearer ${newToken}`;
      return request<T>(endpoint, { ...options, headers, _retry: true });
    } catch (refreshError) {
      processQueue(refreshError, null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      throw new ApiError('Authentication failed. Redirecting to login.', 401, null, url);
    } finally {
      isRefreshing = false;
    }
  }

  // Parse JSON or text payload
  let data: any = null;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  } else {
    try {
      data = await response.text();
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    const errorMessage =
      (typeof data === 'object' && data !== null && (data.message || data.error)) ||
      (typeof data === 'string' && data.length < 200 ? data : response.statusText) ||
      `Request failed with status ${response.status}`;

    throw new ApiError(errorMessage, response.status, data, url);
  }

  return data as T;
}

export const apiClient = {
  get: <T = any>(endpoint: string, options?: RequestOptions): Promise<T> =>
    request<T>(endpoint, { ...options, method: 'GET' }),

  post: <T = any>(endpoint: string, body?: any, options?: RequestOptions): Promise<T> =>
    request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body instanceof FormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
    }),

  put: <T = any>(endpoint: string, body?: any, options?: RequestOptions): Promise<T> =>
    request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body instanceof FormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
    }),

  patch: <T = any>(endpoint: string, body?: any, options?: RequestOptions): Promise<T> =>
    request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body instanceof FormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
    }),

  delete: <T = any>(endpoint: string, options?: RequestOptions): Promise<T> =>
    request<T>(endpoint, { ...options, method: 'DELETE' }),

  request,
};

export default apiClient;
