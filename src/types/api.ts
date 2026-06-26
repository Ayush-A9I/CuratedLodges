/**
 * API response models for the CuratedLodges backend.
 *
 * These interfaces mirror the response shapes documented in
 * `BACKEND_ARCHITECTURE.md` exactly (camelCase, as returned by the API).
 *
 * They are the compile-time contract enforcement mechanism: components consume
 * typed fields, so referencing a field that is absent from the documented
 * response shape is a type error.
 *
 * _Requirements: 1.2, 1.3_
 */

// ─── Auth & User ──────────────────────────────────────────────

export interface AuthUser {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    preferredLanguage?: string; // present on login/google/facebook
    preferredCurrency?: string;
}

export interface AuthResponse {
    user: AuthUser;
    token: string;
    refreshToken: string;
}

export interface MeResponse {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string | null;
    avatarUrl?: string | null;
    whatsappEnabled: boolean;
    preferredLanguage: string;
    preferredCurrency: string;
    emailVerified: boolean;
}

export interface UpdateMeRequest {
    firstName?: string;
    lastName?: string;
    phone?: string;
    whatsappEnabled?: boolean;
    preferredLanguage?: string;
    preferredCurrency?: string;
}

// ─── Regions, Parks, Lodges ───────────────────────────────────

export interface Region {
    id: string;
    name: string;
    slug: string;
}

export interface ParkSummary {
    id: string;
    name: string;
    slug: string;
    heroImage: string;
    lodgeCount: number;
}

export interface ParkFeature {
    icon: string;
    name: string;
}

export interface ParkFaq {
    question: string;
    answer: string;
}

export interface ParkDetail {
    id: string;
    name: string;
    slug: string;
    description: string;
    heroImage: string;
    bestTime?: string;
    wildlife?: string;
    features: ParkFeature[];
    faqs: ParkFaq[];
    region: { name: string; slug: string };
}

export interface LodgeListItem {
    id: string;
    name: string;
    slug: string;
    thumbnail: string;
    images?: string[];
    rating: number;
    pricePerNight?: number;
    minRoomPrice?: number;
    location: string;
    nearestGates?: string[];
    amenities?: string[];
    ecoCertified?: boolean;
    parkName?: string;
    parkSlug?: string;
    regionSlug?: string;
    about?: string;
}

// ─── Lodge Detail (booking source) ────────────────────────────

export interface RoomType {
    id: string;
    name: string;
    price: number;
    image: string;
    description?: string;
    amenities?: string[];
    maxOccupancy?: number;
}

export interface Naturalist {
    id: string;
    name: string;
    role: string;
    experience?: string;
    specialty?: string;
    pricePerSession: number;
    image?: string;
}

export interface BankOffer {
    id: string;
    title: string;
    shortDescription?: string;
    fullDescription?: string;
    termsAndConditions?: string;
    image?: string;
}

export interface LodgeDetail {
    id: string;
    name: string;
    slug: string;
    thumbnail: string;
    images: { url: string; altText?: string }[];
    rating: number;
    pricePerNight: number;
    location: string;
    nearestGates?: string[];
    amenities?: string[];
    ecoCertified?: boolean;
    externalLink?: string;
    about?: { description: string[] };
    jungloreStory?: { reasons: string[]; highlights: { icon: string; text: string }[] };
    roomTypes: RoomType[];
    naturalists: Naturalist[];
    bankOffers?: BankOffer[];
    faqs?: { question: string; answer: string }[];
    park: { name: string; slug: string; region: { name: string; slug: string } };
}

// ─── Bookings ─────────────────────────────────────────────────

export interface NaturalistSessionInput {
    naturalistId: string;
    sessionDate: string; // YYYY-MM-DD, within [checkIn, checkOut]
    numSessions: number; // 1..20
}

export interface CreateBookingRequest {
    lodgeId: string;
    roomTypeId: string;
    checkIn: string; // YYYY-MM-DD
    checkOut: string; // YYYY-MM-DD
    adults: number; // >= 1
    children: number; // >= 0
    guest: {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        whatsappEnabled?: boolean;
        specialRequests?: string;
    };
    naturalistSessions?: NaturalistSessionInput[]; // 0..20
    currencyPaid: string; // active currency code
}

export type BookingStatus =
    | 'held'
    | 'pending'
    | 'confirmed'
    | 'cancelled'
    | 'completed'
    | 'no_show';

export type PaymentStatus =
    | 'pending'
    | 'paid'
    | 'partially_paid'
    | 'refunded'
    | 'failed';

export interface Booking {
    id: string;
    bookingId: string; // human-readable, e.g. "JL12345678"
    lodge: { id?: string; name: string; thumbnail?: string };
    roomType: { name: string; price?: number };
    checkIn: string;
    checkOut: string;
    numNights: number;
    adults: number;
    children: number;
    roomTotal: number;
    experienceTotal: number;
    taxAmount: number;
    totalAmount: number;
    status: BookingStatus;
    paymentStatus: PaymentStatus;
    guestEmail?: string;
    createdAt?: string;
}

export interface MyBookingsResponse {
    bookings: Booking[];
    pagination?: { page: number; limit: number; total: number; totalPages: number };
}

export interface CancelBookingResponse {
    bookingId: string;
    status: BookingStatus;
    refundAmount?: number;
    message: string;
}

/**
 * Statuses for which the cancel-booking action is offered (Req 4.1).
 */
export const CANCELLABLE_STATUSES = ['held', 'pending', 'confirmed'] as const;

// ─── Field Notes, Testimonials, Homepage ──────────────────────

export interface FieldNoteListItem {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    author: string;
    park: string;
    image: string;
    publishedDate: string;
    readTime: string;
}

export interface FieldNotesResponse {
    fieldNotes: FieldNoteListItem[];
    filters: { parks: string[] };
    pagination: { page: number; limit: number; total: number; totalPages: number };
}

export interface FieldNoteDetail extends Omit<FieldNoteListItem, 'excerpt'> {
    excerpt: string;
    content: string[];
    bodyHtml?: string | null;
    relatedNotes: { id: string; slug: string; title: string; park: string; image: string }[];
}

export interface Testimonial {
    id: string;
    name: string;
    company?: string;
    text: string;
    image?: string;
}

export interface HomepageResponse {
    hero: { imageUrl: string; videoUrl: string | null };
    featuredLodges: LodgeListItem[];
    latestFieldNotes: {
        id: string;
        slug: string;
        title: string;
        author: string;
        park: string;
        image: string;
    }[];
    testimonials: Testimonial[];
}
