/**
 * Admin API client for the Curated Lodges admin panel.
 *
 * This is intentionally separate from the public `src/lib/api.ts` client:
 *  - It uses its own localStorage keys (`cl_admin_token`, `cl_admin_user`).
 *  - It attaches the admin JWT (type:'admin') as a Bearer token on every request.
 *  - It is framework-agnostic (no React imports) so it can be used from any
 *    context, hook, or server-less utility.
 *
 * Base URL resolves from `NEXT_PUBLIC_API_URL` and defaults to
 * `http://localhost:4000/api/v1`.
 *
 * Usage:
 * ```ts
 * import { adminApi } from '@/lib/adminApi';
 * const { token, admin } = await adminApi.login(email, password);
 * const stats = await adminApi.getDashboard();
 * const regions = await adminApi.regions.list();
 * ```
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

/** localStorage key for the admin JWT. */
export const ADMIN_TOKEN_KEY = 'cl_admin_token';
/** localStorage key for the serialized admin object. */
export const ADMIN_USER_KEY = 'cl_admin_user';

// ─── Types ────────────────────────────────────────────────────

export type AdminRole = 'super_admin' | 'admin' | 'editor' | string;

/** The admin object returned by the backend on login. */
export interface AdminUser {
    id: string;
    email: string;
    name: string;
    role: AdminRole;
}

/** Response shape of `POST /admin/auth/login`. Matches auth.service.ts#adminLogin. */
export interface AdminLoginResponse {
    token: string;
    admin: AdminUser;
}

/** Dashboard stats shape. Matches admin.controller.ts#getDashboard. */
export interface DashboardStats {
    totalBookings: number;
    totalRevenue: number;
    activeUsers: number;
    totalLodges: number;
    recentBookings: Array<{
        id: string;
        status: string;
        totalAmount: number;
        createdAt: string;
        lodge?: { name: string } | null;
        [key: string]: any;
    }>;
    topLodges: Array<{ name: string; bookings: number; revenue: number }>;
    bookingStatusBreakdown: Record<string, number>;
}

/** Generic key/value payload accepted by create/update methods. */
export type AdminPayload = Record<string, any>;

// ─── Error ────────────────────────────────────────────────────

/** Error thrown for any non-2xx admin API response. */
export class AdminApiError extends Error {
    status: number;
    data: any;
    constructor(message: string, status: number, data?: any) {
        super(message);
        this.name = 'AdminApiError';
        this.status = status;
        this.data = data;
    }
}

// ─── Token management ─────────────────────────────────────────

/** Returns the stored admin token, or null on the server / when absent. */
export function getAdminToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(ADMIN_TOKEN_KEY);
}

/** Persists the admin token and (optionally) the admin object. */
export function setAdminToken(token: string, admin?: AdminUser): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(ADMIN_TOKEN_KEY, token);
    if (admin) {
        localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(admin));
    }
}

/** Clears the stored admin token and admin object. */
export function clearAdminToken(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem(ADMIN_USER_KEY);
}

/** Returns the stored admin object, or null if absent / unparseable. */
export function getStoredAdmin(): AdminUser | null {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(ADMIN_USER_KEY);
    if (!raw) return null;
    try {
        return JSON.parse(raw) as AdminUser;
    } catch {
        return null;
    }
}

// ─── Core request helper ──────────────────────────────────────

/**
 * Low-level request helper. Prefixes the base URL, sets JSON Content-Type and
 * the admin Authorization header, and throws {@link AdminApiError} on non-2xx.
 *
 * @typeParam T - expected JSON response type
 * @param endpoint - path beginning with `/` (e.g. `/admin/regions`)
 * @param options - standard `fetch` RequestInit
 */
export async function request<T = any>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const url = `${API_BASE}${endpoint}`;
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...((options.headers as Record<string, string>) || {}),
    };

    const token = getAdminToken();
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(url, { ...options, headers });

    if (res.status === 204) {
        return undefined as unknown as T;
    }

    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new AdminApiError(
            data.error || data.message || `Request failed (${res.status})`,
            res.status,
            data
        );
    }

    // Some endpoints (exports) may return non-JSON; guard the parse.
    return res.json().catch(() => undefined) as Promise<T>;
}

/** Build a querystring (with leading `?`) from a params object, or '' if empty. */
function qs(params?: Record<string, string | number | boolean | undefined>): string {
    if (!params) return '';
    const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== null);
    if (entries.length === 0) return '';
    const sp = new URLSearchParams();
    for (const [k, v] of entries) sp.append(k, String(v));
    return `?${sp.toString()}`;
}

const body = (data: AdminPayload) => JSON.stringify(data);

// ─── adminApi ─────────────────────────────────────────────────

/**
 * Typed admin API surface. Methods are grouped by entity. Collection groups
 * follow a consistent convention:
 *  - `list(params?)`   → GET    collection
 *  - `create(data)`    → POST   collection
 *  - `update(id, data)`→ PUT    item
 *  - `remove(id)`      → DELETE item
 *
 * Entity-specific actions (publish, approve, images, etc.) are added per group.
 */
export const adminApi = {
    // ─── Auth ───────────────────────────────────────────────────
    /** POST /admin/auth/login → { token, admin }. Does NOT persist the token. */
    login: (email: string, password: string) =>
        request<AdminLoginResponse>('/admin/auth/login', {
            method: 'POST',
            body: body({ email, password }),
        }),

    // ─── Dashboard ──────────────────────────────────────────────
    /** GET /admin/dashboard → aggregate stats. */
    getDashboard: () => request<DashboardStats>('/admin/dashboard'),

    // ─── Regions ────────────────────────────────────────────────
    regions: {
        /** GET /admin/regions */
        list: () => request('/admin/regions'),
        /** POST /admin/regions */
        create: (data: AdminPayload) => request('/admin/regions', { method: 'POST', body: body(data) }),
        /** PUT /admin/regions/:id */
        update: (id: string, data: AdminPayload) =>
            request(`/admin/regions/${id}`, { method: 'PUT', body: body(data) }),
        /** DELETE /admin/regions/:id */
        remove: (id: string) => request(`/admin/regions/${id}`, { method: 'DELETE' }),
    },

    // ─── Parks ──────────────────────────────────────────────────
    parks: {
        /** GET /admin/parks */
        list: () => request('/admin/parks'),
        /** POST /admin/parks */
        create: (data: AdminPayload) => request('/admin/parks', { method: 'POST', body: body(data) }),
        /** PUT /admin/parks/:id */
        update: (id: string, data: AdminPayload) =>
            request(`/admin/parks/${id}`, { method: 'PUT', body: body(data) }),
        /** DELETE /admin/parks/:id */
        remove: (id: string) => request(`/admin/parks/${id}`, { method: 'DELETE' }),
    },

    // ─── Lodges ─────────────────────────────────────────────────
    lodges: {
        /** GET /admin/lodges */
        list: () => request('/admin/lodges'),
        /** POST /admin/lodges */
        create: (data: AdminPayload) => request('/admin/lodges', { method: 'POST', body: body(data) }),
        /** PUT /admin/lodges/:id */
        update: (id: string, data: AdminPayload) =>
            request(`/admin/lodges/${id}`, { method: 'PUT', body: body(data) }),
        /** DELETE /admin/lodges/:id */
        remove: (id: string) => request(`/admin/lodges/${id}`, { method: 'DELETE' }),

        /** POST /admin/lodges/:id/images */
        addImage: (lodgeId: string, data: AdminPayload) =>
            request(`/admin/lodges/${lodgeId}/images`, { method: 'POST', body: body(data) }),
        /** DELETE /admin/lodges/:id/images/:imageId */
        removeImage: (lodgeId: string, imageId: string) =>
            request(`/admin/lodges/${lodgeId}/images/${imageId}`, { method: 'DELETE' }),

        /** POST /admin/lodges/:id/amenities { amenityIds } */
        addAmenities: (lodgeId: string, amenityIds: string[]) =>
            request(`/admin/lodges/${lodgeId}/amenities`, { method: 'POST', body: body({ amenityIds }) }),
        /** DELETE /admin/lodges/:id/amenities/:amenityId */
        removeAmenity: (lodgeId: string, amenityId: string) =>
            request(`/admin/lodges/${lodgeId}/amenities/${amenityId}`, { method: 'DELETE' }),

        /** POST /admin/lodges/:id/room-types */
        createRoomType: (lodgeId: string, data: AdminPayload) =>
            request(`/admin/lodges/${lodgeId}/room-types`, { method: 'POST', body: body(data) }),

        /** POST /admin/lodges/:id/naturalists */
        createNaturalist: (lodgeId: string, data: AdminPayload) =>
            request(`/admin/lodges/${lodgeId}/naturalists`, { method: 'POST', body: body(data) }),
    },

    // ─── Room types ─────────────────────────────────────────────
    roomTypes: {
        /** PUT /admin/room-types/:id */
        update: (id: string, data: AdminPayload) =>
            request(`/admin/room-types/${id}`, { method: 'PUT', body: body(data) }),
        /** DELETE /admin/room-types/:id */
        remove: (id: string) => request(`/admin/room-types/${id}`, { method: 'DELETE' }),
    },

    // ─── Naturalists ────────────────────────────────────────────
    naturalists: {
        /** PUT /admin/naturalists/:id */
        update: (id: string, data: AdminPayload) =>
            request(`/admin/naturalists/${id}`, { method: 'PUT', body: body(data) }),
        /** DELETE /admin/naturalists/:id */
        remove: (id: string) => request(`/admin/naturalists/${id}`, { method: 'DELETE' }),
    },

    // ─── Bank offers ────────────────────────────────────────────
    bankOffers: {
        /** GET /admin/bank-offers */
        list: () => request('/admin/bank-offers'),
        /** POST /admin/bank-offers */
        create: (data: AdminPayload) => request('/admin/bank-offers', { method: 'POST', body: body(data) }),
        /** PUT /admin/bank-offers/:id */
        update: (id: string, data: AdminPayload) =>
            request(`/admin/bank-offers/${id}`, { method: 'PUT', body: body(data) }),
        /** DELETE /admin/bank-offers/:id */
        remove: (id: string) => request(`/admin/bank-offers/${id}`, { method: 'DELETE' }),
    },

    // ─── Field notes ────────────────────────────────────────────
    fieldNotes: {
        /** GET /admin/field-notes */
        list: () => request('/admin/field-notes'),
        /** POST /admin/field-notes */
        create: (data: AdminPayload) => request('/admin/field-notes', { method: 'POST', body: body(data) }),
        /** PUT /admin/field-notes/:id */
        update: (id: string, data: AdminPayload) =>
            request(`/admin/field-notes/${id}`, { method: 'PUT', body: body(data) }),
        /** DELETE /admin/field-notes/:id */
        remove: (id: string) => request(`/admin/field-notes/${id}`, { method: 'DELETE' }),
        /** PATCH /admin/field-notes/:id/publish */
        publish: (id: string, data?: AdminPayload) =>
            request(`/admin/field-notes/${id}/publish`, {
                method: 'PATCH',
                body: body(data || {}),
            }),
    },

    // ─── Testimonials ───────────────────────────────────────────
    testimonials: {
        /** GET /admin/testimonials */
        list: () => request('/admin/testimonials'),
        /** POST /admin/testimonials */
        create: (data: AdminPayload) => request('/admin/testimonials', { method: 'POST', body: body(data) }),
        /** PUT /admin/testimonials/:id */
        update: (id: string, data: AdminPayload) =>
            request(`/admin/testimonials/${id}`, { method: 'PUT', body: body(data) }),
        /** DELETE /admin/testimonials/:id */
        remove: (id: string) => request(`/admin/testimonials/${id}`, { method: 'DELETE' }),
    },

    // ─── Bookings ───────────────────────────────────────────────
    bookings: {
        /** GET /admin/bookings (optional filter params). */
        list: (params?: Record<string, string | number | boolean | undefined>) =>
            request(`/admin/bookings${qs(params)}`),
        /** GET /admin/bookings/:id */
        get: (id: string) => request(`/admin/bookings/${id}`),
        /** PATCH /admin/bookings/:id/status { status } */
        updateStatus: (id: string, status: string) =>
            request(`/admin/bookings/${id}/status`, { method: 'PATCH', body: body({ status }) }),
        /** GET /admin/bookings/:id/payments */
        payments: (id: string) => request(`/admin/bookings/${id}/payments`),
        /**
         * Full URL to the bookings CSV export. Append your own auth handling
         * (this endpoint is typically opened in a new tab with the token).
         */
        exportUrl: (params?: Record<string, string | number | boolean | undefined>) =>
            `${API_BASE}/admin/bookings/export${qs(params)}`,
    },

    // ─── Payments ───────────────────────────────────────────────
    payments: {
        /** GET /admin/payments */
        list: (params?: Record<string, string | number | boolean | undefined>) =>
            request(`/admin/payments${qs(params)}`),
        /** GET /admin/bookings/:id/payments */
        listForBooking: (bookingId: string) => request(`/admin/bookings/${bookingId}/payments`),
    },

    // ─── Amenities ──────────────────────────────────────────────
    amenities: {
        /** GET /admin/amenities */
        list: () => request('/admin/amenities'),
        /** POST /admin/amenities */
        create: (data: AdminPayload) => request('/admin/amenities', { method: 'POST', body: body(data) }),
        /** PUT /admin/amenities/:id */
        update: (id: string, data: AdminPayload) =>
            request(`/admin/amenities/${id}`, { method: 'PUT', body: body(data) }),
        /** DELETE /admin/amenities/:id */
        remove: (id: string) => request(`/admin/amenities/${id}`, { method: 'DELETE' }),
    },

    // ─── Users ──────────────────────────────────────────────────
    users: {
        /** GET /admin/users */
        list: (params?: Record<string, string | number | boolean | undefined>) =>
            request(`/admin/users${qs(params)}`),
        /** GET /admin/users/:id */
        get: (id: string) => request(`/admin/users/${id}`),
        /** PATCH /admin/users/:id */
        update: (id: string, data: AdminPayload) =>
            request(`/admin/users/${id}`, { method: 'PATCH', body: body(data) }),
    },

    // ─── Newsletter ─────────────────────────────────────────────
    newsletter: {
        /** GET /admin/newsletter */
        list: (params?: Record<string, string | number | boolean | undefined>) =>
            request(`/admin/newsletter${qs(params)}`),
        /** DELETE /admin/newsletter/:id */
        remove: (id: string) => request(`/admin/newsletter/${id}`, { method: 'DELETE' }),
        /** Full URL to the newsletter CSV export. */
        exportUrl: () => `${API_BASE}/admin/newsletter/export`,
    },

    // ─── Homepage settings ──────────────────────────────────────
    homepageSettings: {
        /** GET /admin/homepage-settings */
        get: () => request('/admin/homepage-settings'),
        /** PUT /admin/homepage-settings */
        update: (data: AdminPayload) =>
            request('/admin/homepage-settings', { method: 'PUT', body: body(data) }),
    },

    // ─── Admin users (super_admin only) ─────────────────────────
    adminUsers: {
        /** GET /admin/admin-users */
        list: () => request('/admin/admin-users'),
        /** POST /admin/admin-users */
        create: (data: AdminPayload) => request('/admin/admin-users', { method: 'POST', body: body(data) }),
        /** PUT /admin/admin-users/:id */
        update: (id: string, data: AdminPayload) =>
            request(`/admin/admin-users/${id}`, { method: 'PUT', body: body(data) }),
        /** DELETE /admin/admin-users/:id */
        remove: (id: string) => request(`/admin/admin-users/${id}`, { method: 'DELETE' }),
    },

    // ─── Reviews ────────────────────────────────────────────────
    reviews: {
        /** GET /admin/reviews */
        list: (params?: Record<string, string | number | boolean | undefined>) =>
            request(`/admin/reviews${qs(params)}`),
        /** PATCH /admin/reviews/:id/approve */
        approve: (id: string) => request(`/admin/reviews/${id}/approve`, { method: 'PATCH' }),
        /** DELETE /admin/reviews/:id */
        remove: (id: string) => request(`/admin/reviews/${id}`, { method: 'DELETE' }),
    },

    // ─── Seasonal rates ─────────────────────────────────────────
    seasonalRates: {
        /** GET /admin/room-types/:id/seasonal-rates */
        listForRoomType: (roomTypeId: string) =>
            request(`/admin/room-types/${roomTypeId}/seasonal-rates`),
        /** POST /admin/room-types/:id/seasonal-rates */
        create: (roomTypeId: string, data: AdminPayload) =>
            request(`/admin/room-types/${roomTypeId}/seasonal-rates`, { method: 'POST', body: body(data) }),
        /** PUT /admin/seasonal-rates/:id */
        update: (id: string, data: AdminPayload) =>
            request(`/admin/seasonal-rates/${id}`, { method: 'PUT', body: body(data) }),
        /** DELETE /admin/seasonal-rates/:id */
        remove: (id: string) => request(`/admin/seasonal-rates/${id}`, { method: 'DELETE' }),
    },

    // ─── Availability ───────────────────────────────────────────
    availability: {
        /** GET /admin/room-types/:id/availability?from&to */
        listForRoomType: (roomTypeId: string, from: string, to: string) =>
            request(`/admin/room-types/${roomTypeId}/availability${qs({ from, to })}`),
        /** PATCH /admin/room-availability/:id */
        update: (availabilityId: string, data: AdminPayload) =>
            request(`/admin/room-availability/${availabilityId}`, { method: 'PATCH', body: body(data) }),
    },
};

export default adminApi;
