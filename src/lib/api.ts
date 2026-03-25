const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

class ApiError extends Error {
  status: number;
  data: any;
  constructor(message: string, status: number, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('cl_token');
}

function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('cl_refresh_token');
}

export function setTokens(token: string, refreshToken: string) {
  localStorage.setItem('cl_token', token);
  localStorage.setItem('cl_refresh_token', refreshToken);
}

export function clearTokens() {
  localStorage.removeItem('cl_token');
  localStorage.removeItem('cl_refresh_token');
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) {
      clearTokens();
      return null;
    }
    const data = await res.json();
    setTokens(data.token, data.refreshToken);
    return data.token;
  } catch {
    clearTokens();
    return null;
  }
}

async function request<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let res = await fetch(url, { ...options, headers });

  // Auto-refresh on 401
  if (res.status === 401 && token) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      headers['Authorization'] = `Bearer ${newToken}`;
      res = await fetch(url, { ...options, headers });
    }
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new ApiError(data.error || data.message || 'Request failed', res.status, data);
  }

  return res.json();
}

// ─── Public API Methods ───────────────────────────────────────

export const api = {
  // Homepage
  getHomepage: () => request('/homepage'),

  // Regions & Parks
  getRegions: () => request('/regions'),
  getParksByRegion: (regionSlug: string) => request(`/regions/${regionSlug}/parks`),
  getParkBySlug: (parkSlug: string) => request(`/parks/${parkSlug}`),
  getLodgesByPark: (parkSlug: string) => request(`/parks/${parkSlug}/lodges`),

  // Lodges
  getAllLodges: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request(`/lodges${qs}`);
  },
  getLodgeBySlug: (slug: string) => request(`/lodges/${slug}`),

  // Field Notes
  getFieldNotes: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request(`/field-notes${qs}`);
  },
  getFieldNoteBySlug: (slug: string) => request(`/field-notes/${slug}`),

  // Testimonials
  getTestimonials: () => request('/testimonials'),

  // Bookings
  createBooking: (data: any) => request('/bookings', { method: 'POST', body: JSON.stringify(data) }),
  getBooking: (bookingId: string) => request(`/bookings/${bookingId}`),
  cancelBooking: (bookingId: string) => request(`/bookings/${bookingId}/cancel`, { method: 'POST' }),

  // Auth
  login: (email: string, password: string) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (data: { firstName: string; lastName: string; email: string; password: string }) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  forgotPassword: (email: string) =>
    request('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
  resetPassword: (token: string, newPassword: string) =>
    request('/auth/reset-password', { method: 'POST', body: JSON.stringify({ token, newPassword }) }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  refreshTokens: (refreshToken: string) =>
    request('/auth/refresh', { method: 'POST', body: JSON.stringify({ refreshToken }) }),

  // User
  getMe: () => request('/users/me'),
  updateMe: (data: any) => request('/users/me', { method: 'PATCH', body: JSON.stringify(data) }),
  getMyBookings: () => request('/users/me/bookings'),

  // Newsletter
  subscribe: (email: string) =>
    request('/newsletter', { method: 'POST', body: JSON.stringify({ email }) }),
};

export default api;
export { ApiError };
