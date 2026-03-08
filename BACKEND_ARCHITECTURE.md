# CuratedLodges — Backend Architecture & API Contract

## 1. Overview

This document defines the complete backend architecture for **CuratedLodges** (powered by Junglore) — a premium wildlife safari lodge booking platform. It covers every data entity, relationship, API endpoint, and admin capability needed to replace the current frontend mock data with a real backend.

### Recommended Tech Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Runtime** | Node.js (v20+) | Same language as frontend, team familiarity |
| **Framework** | Express.js or Fastify | Lightweight, well-documented, massive ecosystem |
| **Database** | PostgreSQL | Relational data with strong relationships, ACID compliance |
| **ORM** | Prisma | Type-safe queries, auto-generated types, easy migrations |
| **Auth** | JWT + bcrypt | Stateless auth, easy to scale. OAuth via Passport.js |
| **File Storage** | AWS S3 / Cloudinary | Image hosting for lodges, rooms, field notes, profiles |
| **Admin Panel** | AdminJS or custom React app | AdminJS for rapid setup; custom if you need branded UI |
| **Email** | SendGrid / Resend | Transactional emails (booking confirmations, password resets) |
| **Deployment** | Railway / Render / AWS | Simple container deployment with managed Postgres |

---

## 2. Database Schema

### Entity Relationship Diagram

```mermaid
erDiagram
    REGION ||--o{ PARK : contains
    PARK ||--o{ LODGE : has
    PARK ||--o{ PARK_FEATURE : has
    PARK ||--o{ PARK_FAQ : has
    LODGE ||--o{ LODGE_IMAGE : has
    LODGE ||--o{ ROOM_TYPE : offers
    LODGE ||--o{ NATURALIST : employs
    LODGE ||--o{ BANK_OFFER : has
    LODGE ||--o{ LODGE_FAQ : has
    ROOM_TYPE ||--o{ ROOM_AMENITY : includes
    USER ||--o{ BOOKING : makes
    BOOKING ||--o{ NATURALIST_SESSION : includes
    BOOKING }o--|| LODGE : at
    BOOKING }o--|| ROOM_TYPE : for
    FIELD_NOTE }o--|| PARK : about
    TESTIMONIAL ||--|| USER : from
```

### Table Definitions

---

#### `regions`

Represents a geographic region (e.g., India, Africa).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, auto | Unique identifier |
| `name` | VARCHAR(100) | NOT NULL, UNIQUE | Display name (e.g., "India") |
| `slug` | VARCHAR(100) | NOT NULL, UNIQUE | URL-friendly slug (e.g., "india") |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Last update timestamp |

---

#### `parks`

A national park or game reserve within a region.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, auto | Unique identifier |
| `region_id` | UUID | FK → regions.id, NOT NULL | Parent region |
| `name` | VARCHAR(200) | NOT NULL | Full display name |
| `slug` | VARCHAR(200) | NOT NULL | URL slug (e.g., "tadoba-andhari-tiger-reserve") |
| `description` | TEXT | NOT NULL | Park description paragraph |
| `hero_image` | VARCHAR(500) | NOT NULL | Hero banner image URL |
| `best_time` | VARCHAR(100) | | Best time to visit (e.g., "October to May") |
| `wildlife` | VARCHAR(500) | | Key wildlife species CSV |
| `is_active` | BOOLEAN | DEFAULT true | Visibility toggle for admin |
| `sort_order` | INTEGER | DEFAULT 0 | Display ordering |
| `created_at` | TIMESTAMP | DEFAULT NOW() | |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | |

**Unique constraint:** `(region_id, slug)`

---

#### `park_features`

Small feature badges shown on park pages (e.g., "🐅 Tiger Reserve").

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, auto | |
| `park_id` | UUID | FK → parks.id, NOT NULL | |
| `icon` | VARCHAR(10) | NOT NULL | Emoji icon |
| `name` | VARCHAR(100) | NOT NULL | Feature label |
| `sort_order` | INTEGER | DEFAULT 0 | |

---

#### `park_faqs`

FAQs displayed on the park listing page. These are park-level, not lodge-level.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, auto | |
| `park_id` | UUID | FK → parks.id, NOT NULL | |
| `question` | VARCHAR(500) | NOT NULL | |
| `answer` | TEXT | NOT NULL | |
| `sort_order` | INTEGER | DEFAULT 0 | |

---

#### `lodges`

Individual lodges/accommodations within a park.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, auto | |
| `park_id` | UUID | FK → parks.id, NOT NULL | Parent park |
| `name` | VARCHAR(200) | NOT NULL | Lodge display name |
| `slug` | VARCHAR(200) | NOT NULL | URL slug |
| `thumbnail` | VARCHAR(500) | NOT NULL | Card thumbnail image URL |
| `rating` | DECIMAL(2,1) | DEFAULT 0 | Average rating (e.g., 4.8) |
| `price_per_night` | INTEGER | NOT NULL | Base price in INR (smallest room fallback) |
| `location` | VARCHAR(300) | NOT NULL | Full address string |
| `nearest_gates` | TEXT[] | | Array of gate names |
| `amenities` | TEXT[] | | Array of amenity keys (e.g., ["WiFi", "Pool", "Spa"]) |
| `eco_certified` | BOOLEAN | DEFAULT false | Eco-certification badge |
| `external_link` | VARCHAR(500) | | Link to external Junglore page |
| `about_description` | TEXT[] | | Array of about paragraphs |
| `junglore_story_reasons` | TEXT[] | | Why Junglore chose this lodge (paragraphs) |
| `junglore_story_highlights` | JSONB | | Array of `{icon, text}` objects |
| `is_active` | BOOLEAN | DEFAULT true | Visibility toggle |
| `is_featured` | BOOLEAN | DEFAULT false | Show on homepage "Founding Collection" |
| `sort_order` | INTEGER | DEFAULT 0 | |
| `created_at` | TIMESTAMP | DEFAULT NOW() | |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | |

**Unique constraint:** `(park_id, slug)`

---

#### `lodge_images`

Image gallery for a lodge (the carousel on the detail page).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, auto | |
| `lodge_id` | UUID | FK → lodges.id, NOT NULL | |
| `url` | VARCHAR(500) | NOT NULL | Image URL |
| `alt_text` | VARCHAR(200) | | Alt text for accessibility |
| `sort_order` | INTEGER | DEFAULT 0 | Display order |

---

#### `room_types`

Room type options within a lodge.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, auto | |
| `lodge_id` | UUID | FK → lodges.id, NOT NULL | |
| `name` | VARCHAR(100) | NOT NULL | e.g., "Deluxe Room", "Premium Suite" |
| `price` | INTEGER | NOT NULL | Price per night in INR |
| `image` | VARCHAR(500) | NOT NULL | Room photo URL |
| `description` | TEXT | | Room description |
| `amenities` | TEXT[] | | e.g., ["King Bed", "AC", "WiFi", "Mini Bar"] |
| `max_occupancy` | INTEGER | DEFAULT 2 | Max guests per room |
| `is_active` | BOOLEAN | DEFAULT true | |
| `sort_order` | INTEGER | DEFAULT 0 | |

---

#### `naturalists`

Expert guide/naturalist profiles attached to a lodge.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, auto | |
| `lodge_id` | UUID | FK → lodges.id, NOT NULL | |
| `name` | VARCHAR(100) | NOT NULL | Full name |
| `role` | VARCHAR(100) | NOT NULL | e.g., "Senior Naturalist" |
| `experience` | VARCHAR(50) | | e.g., "15 years" |
| `specialty` | VARCHAR(200) | | e.g., "Tiger behavior & tracking" |
| `price_per_session` | INTEGER | NOT NULL | Price in INR per session |
| `image` | VARCHAR(500) | | Profile photo URL |
| `is_active` | BOOLEAN | DEFAULT true | |

---

#### `bank_offers`

Banking/payment offers shown on the lodge detail page.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, auto | |
| `lodge_id` | UUID | FK → lodges.id, NULL | NULL = global offer for all lodges |
| `title` | VARCHAR(200) | NOT NULL | e.g., "10% Off with HDFC Bank" |
| `short_description` | VARCHAR(500) | NOT NULL | Card preview text |
| `full_description` | TEXT | NOT NULL | Full offer details |
| `terms_and_conditions` | TEXT | NOT NULL | Legal terms |
| `image` | VARCHAR(500) | | Offer card thumbnail |
| `is_active` | BOOLEAN | DEFAULT true | |
| `valid_from` | DATE | | Offer start date |
| `valid_until` | DATE | | Offer expiry date |
| `sort_order` | INTEGER | DEFAULT 0 | |

---

#### `lodge_faqs`

FAQs specific to a lodge, shown on the lodge detail page.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, auto | |
| `lodge_id` | UUID | FK → lodges.id, NOT NULL | |
| `question` | VARCHAR(500) | NOT NULL | |
| `answer` | TEXT | NOT NULL | |
| `sort_order` | INTEGER | DEFAULT 0 | |

---

#### `users`

Registered users (guests/travelers).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, auto | |
| `email` | VARCHAR(255) | NOT NULL, UNIQUE | Login email |
| `password_hash` | VARCHAR(255) | NULL | bcrypt hash (NULL for social-only users) |
| `first_name` | VARCHAR(100) | NOT NULL | |
| `last_name` | VARCHAR(100) | NOT NULL | |
| `phone` | VARCHAR(20) | | |
| `avatar_url` | VARCHAR(500) | | Profile picture |
| `auth_provider` | VARCHAR(20) | DEFAULT 'email' | 'email', 'google', 'facebook' |
| `auth_provider_id` | VARCHAR(255) | | OAuth provider user ID |
| `whatsapp_enabled` | BOOLEAN | DEFAULT false | Communication preference |
| `preferred_language` | VARCHAR(10) | DEFAULT 'en' | |
| `preferred_currency` | VARCHAR(5) | DEFAULT 'INR' | |
| `is_active` | BOOLEAN | DEFAULT true | |
| `email_verified` | BOOLEAN | DEFAULT false | |
| `created_at` | TIMESTAMP | DEFAULT NOW() | |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | |

---

#### `admin_users`

Separate table for admin panel access (not regular users).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, auto | |
| `email` | VARCHAR(255) | NOT NULL, UNIQUE | |
| `password_hash` | VARCHAR(255) | NOT NULL | |
| `name` | VARCHAR(100) | NOT NULL | |
| `role` | VARCHAR(20) | DEFAULT 'editor' | 'super_admin', 'admin', 'editor' |
| `is_active` | BOOLEAN | DEFAULT true | |
| `created_at` | TIMESTAMP | DEFAULT NOW() | |
| `last_login_at` | TIMESTAMP | | |

---

#### `bookings`

Booking records created through the checkout flow.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, auto | |
| `booking_id` | VARCHAR(20) | NOT NULL, UNIQUE | Human-readable ID (e.g., "JL12345678") |
| `user_id` | UUID | FK → users.id, NULL | NULL for guest checkout |
| `lodge_id` | UUID | FK → lodges.id, NOT NULL | |
| `room_type_id` | UUID | FK → room_types.id, NOT NULL | Selected room |
| `check_in` | DATE | NOT NULL | |
| `check_out` | DATE | NOT NULL | |
| `num_nights` | INTEGER | NOT NULL | Calculated: checkout - checkin |
| `adults` | INTEGER | NOT NULL, DEFAULT 2 | |
| `children` | INTEGER | NOT NULL, DEFAULT 0 | |
| `guest_first_name` | VARCHAR(100) | NOT NULL | |
| `guest_last_name` | VARCHAR(100) | NOT NULL | |
| `guest_email` | VARCHAR(255) | NOT NULL | |
| `guest_phone` | VARCHAR(20) | NOT NULL | |
| `whatsapp_enabled` | BOOLEAN | DEFAULT false | |
| `special_requests` | TEXT | | |
| `room_total` | INTEGER | NOT NULL | Room price × nights (INR) |
| `experience_total` | INTEGER | DEFAULT 0 | Naturalist sessions total (INR) |
| `tax_amount` | INTEGER | NOT NULL | 18% of subtotal |
| `total_amount` | INTEGER | NOT NULL | room + experience + tax |
| `currency_paid` | VARCHAR(5) | DEFAULT 'INR' | Currency at time of booking |
| `exchange_rate_used` | DECIMAL(10,6) | DEFAULT 1 | Exchange rate snapshot |
| `status` | VARCHAR(20) | DEFAULT 'confirmed' | 'pending', 'confirmed', 'cancelled', 'completed', 'no_show' |
| `payment_status` | VARCHAR(20) | DEFAULT 'pending' | 'pending', 'paid', 'refunded', 'failed' |
| `payment_id` | VARCHAR(200) | | Payment gateway transaction ID |
| `created_at` | TIMESTAMP | DEFAULT NOW() | |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | |

---

#### `naturalist_sessions`

Naturalist sessions booked as part of a booking (optional add-on).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, auto | |
| `booking_id` | UUID | FK → bookings.id, NOT NULL | |
| `naturalist_id` | UUID | FK → naturalists.id, NOT NULL | |
| `session_date` | DATE | NOT NULL | Date of the session |
| `num_sessions` | INTEGER | NOT NULL | 1 or 2 (max per day) |
| `price_per_session` | INTEGER | NOT NULL | Snapshot of price at booking time |

---

#### `field_notes`

Blog/journal articles (field notes).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, auto | |
| `slug` | VARCHAR(200) | NOT NULL, UNIQUE | URL-friendly slug |
| `title` | VARCHAR(300) | NOT NULL | |
| `excerpt` | TEXT | NOT NULL | Short summary for cards |
| `content` | TEXT[] | NOT NULL | Array of paragraph strings |
| `author` | VARCHAR(100) | NOT NULL | Author name/organization |
| `park_id` | UUID | FK → parks.id, NULL | Related park (for filtering) |
| `park_label` | VARCHAR(100) | NOT NULL | Display label (e.g., "KANHA NATIONAL PARK") |
| `image` | VARCHAR(500) | NOT NULL | Featured image URL |
| `published_date` | DATE | NOT NULL | |
| `read_time` | VARCHAR(20) | NOT NULL | e.g., "7 min read" |
| `is_published` | BOOLEAN | DEFAULT false | Draft/published toggle |
| `created_at` | TIMESTAMP | DEFAULT NOW() | |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | |

---

#### `testimonials`

Customer testimonials shown on the homepage.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, auto | |
| `name` | VARCHAR(100) | NOT NULL | Customer name |
| `company` | VARCHAR(200) | | Company/organization |
| `text` | TEXT | NOT NULL | Testimonial quote |
| `image` | VARCHAR(500) | NOT NULL | Profile picture URL |
| `is_active` | BOOLEAN | DEFAULT true | |
| `sort_order` | INTEGER | DEFAULT 0 | |

---

#### `newsletter_subscribers`

Email newsletter subscriptions from the footer form.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, auto | |
| `email` | VARCHAR(255) | NOT NULL, UNIQUE | |
| `is_active` | BOOLEAN | DEFAULT true | Unsubscribe toggle |
| `subscribed_at` | TIMESTAMP | DEFAULT NOW() | |

---

#### `homepage_settings`

Key-value storage for admin-controlled homepage content.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, auto | |
| `key` | VARCHAR(100) | NOT NULL, UNIQUE | e.g., "hero_image_url", "hero_video_url" |
| `value` | TEXT | NOT NULL | The setting value |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | |

---

## 3. Complete API Contract

**Base URL:** `/api/v1`  
**Content-Type:** `application/json`  
**Auth:** Bearer token in `Authorization` header where noted.

### 3.1 Authentication

---

#### `POST /auth/register`

**Purpose:** Create a new user account.

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "securePass123"
}
```

**Response (201):**
```json
{
  "user": {
    "id": "uuid",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe"
  },
  "token": "jwt-access-token",
  "refreshToken": "jwt-refresh-token"
}
```

**Errors:** `409 Conflict` (email exists), `400` (validation)

---

#### `POST /auth/login`

**Purpose:** Sign in with email + password.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePass123"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "preferredLanguage": "en",
    "preferredCurrency": "INR"
  },
  "token": "jwt-access-token",
  "refreshToken": "jwt-refresh-token"
}
```

**Errors:** `401 Unauthorized` (bad credentials)

---

#### `POST /auth/google`

**Purpose:** Sign in or register via Google OAuth.

**Request Body:**
```json
{
  "idToken": "google-id-token-from-frontend"
}
```

**Response (200):** Same shape as login response.

---

#### `POST /auth/facebook`

**Purpose:** Sign in or register via Facebook OAuth.

**Request Body:**
```json
{
  "accessToken": "facebook-access-token-from-frontend"
}
```

**Response (200):** Same shape as login response.

---

#### `POST /auth/forgot-password`

**Purpose:** Send a password reset email.

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Response (200):**
```json
{
  "message": "If an account with this email exists, a reset link has been sent."
}
```

> [!NOTE]
> Always return 200, even if email doesn't exist, to prevent user enumeration.

---

#### `POST /auth/reset-password`

**Purpose:** Reset password using the token from email link.

**Request Body:**
```json
{
  "token": "reset-token-from-email",
  "newPassword": "newSecurePass456"
}
```

**Response (200):**
```json
{
  "message": "Password has been reset successfully."
}
```

---

#### `POST /auth/refresh`

**Purpose:** Get a new access token using a refresh token.

**Request Body:**
```json
{
  "refreshToken": "jwt-refresh-token"
}
```

**Response (200):**
```json
{
  "token": "new-jwt-access-token",
  "refreshToken": "new-jwt-refresh-token"
}
```

---

### 3.2 User Profile

🔒 *All endpoints require authentication.*

---

#### `GET /users/me`

**Response (200):**
```json
{
  "id": "uuid",
  "email": "john@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+911234567890",
  "avatarUrl": "https://...",
  "whatsappEnabled": false,
  "preferredLanguage": "en",
  "preferredCurrency": "INR",
  "emailVerified": true
}
```

---

#### `PATCH /users/me`

**Request Body (partial update):**
```json
{
  "firstName": "John",
  "phone": "+911234567890",
  "whatsappEnabled": true,
  "preferredLanguage": "hi",
  "preferredCurrency": "USD"
}
```

**Response (200):** Updated user object.

---

#### `GET /users/me/bookings`

**Purpose:** Get all bookings for the logged-in user.

**Query Params:** `?status=confirmed&page=1&limit=10`

**Response (200):**
```json
{
  "bookings": [
    {
      "id": "uuid",
      "bookingId": "JL12345678",
      "lodge": { "id": "uuid", "name": "Tadoba Tiger Lodge", "thumbnail": "..." },
      "roomType": { "name": "Premium Suite" },
      "checkIn": "2026-03-15",
      "checkOut": "2026-03-18",
      "numNights": 3,
      "adults": 2,
      "children": 0,
      "totalAmount": 42480,
      "status": "confirmed",
      "paymentStatus": "paid",
      "createdAt": "2026-03-06T14:53:00Z"
    }
  ],
  "pagination": { "page": 1, "limit": 10, "total": 3, "totalPages": 1 }
}
```

---

### 3.3 Regions & Parks

---

#### `GET /regions`

**Purpose:** Get all regions (used by SearchBox dropdown).

**Response (200):**
```json
{
  "regions": [
    { "id": "uuid", "name": "India", "slug": "india" },
    { "id": "uuid", "name": "Africa", "slug": "africa" }
  ]
}
```

---

#### `GET /regions/:regionSlug/parks`

**Purpose:** Get all parks in a region (used by SearchBox dropdown when a region is selected).

**Response (200):**
```json
{
  "parks": [
    {
      "id": "uuid",
      "name": "Tadoba Andhari Tiger Reserve",
      "slug": "tadoba-andhari-tiger-reserve",
      "heroImage": "https://...",
      "lodgeCount": 3
    }
  ]
}
```

---

#### `GET /parks/:parkSlug`

**Purpose:** Get full park details (used by the park page at `/park/[region]/[park]`).

**Response (200):**
```json
{
  "id": "uuid",
  "name": "Tadoba Andhari Tiger Reserve",
  "slug": "tadoba-andhari-tiger-reserve",
  "description": "Maharashtra's oldest and largest...",
  "heroImage": "https://...",
  "bestTime": "October to May",
  "wildlife": "Tigers, Leopards, Sloth Bears...",
  "features": [
    { "icon": "🐅", "name": "Tiger Reserve" }
  ],
  "faqs": [
    { "question": "What amenities...", "answer": "Most lodges..." }
  ],
  "region": { "name": "India", "slug": "india" }
}
```

---

#### `GET /parks/:parkSlug/lodges`

**Purpose:** Get all lodges in a park (for the park page lodge grid).

**Query Params:** `?gate=moharli` (optional gate filter)

**Response (200):**
```json
{
  "lodges": [
    {
      "id": "uuid",
      "name": "Tadoba Tiger Lodge",
      "slug": "tadoba-tiger-lodge",
      "thumbnail": "https://...",
      "images": ["https://...", "https://..."],
      "rating": 4.8,
      "pricePerNight": 15000,
      "minRoomPrice": 9000,
      "location": "Moharli, Chandrapur, Maharashtra",
      "nearestGates": ["Moharli Gate", "Tadoba Gate"],
      "amenities": ["WiFi", "Pool", "Spa", "Safari", "AC"],
      "ecoCertified": true
    }
  ]
}
```

> [!IMPORTANT]
> `minRoomPrice` is the minimum price across all room types. If the lodge has no room types, fall back to `pricePerNight`. The frontend uses this for the "From ₹X/night" display on cards.

---

### 3.4 Lodge Details

---

#### `GET /lodges/:lodgeSlug`

**Purpose:** Get full lodge detail (used by the lodge detail page at `/park/[region]/[park]/[lodge]`). This is the most data-heavy endpoint.

**Response (200):**
```json
{
  "id": "uuid",
  "name": "Tadoba Tiger Lodge",
  "slug": "tadoba-tiger-lodge",
  "thumbnail": "https://...",
  "images": [
    { "url": "https://...", "altText": "Main view" }
  ],
  "rating": 4.8,
  "pricePerNight": 15000,
  "location": "Moharli, Chandrapur, Maharashtra",
  "nearestGates": ["Moharli Gate", "Tadoba Gate"],
  "amenities": ["WiFi", "Pool", "Spa", "Safari", "AC"],
  "ecoCertified": true,
  "externalLink": "https://www.junglore.com/tadoba-tiger-lodge",
  "about": {
    "description": [
      "Experience luxury in the heart...",
      "Each room is thoughtfully designed..."
    ]
  },
  "jungloreStory": {
    "reasons": [
      "After extensive research...",
      "What sets this property apart..."
    ],
    "highlights": [
      { "icon": "🌿", "text": "100% eco-friendly operations..." }
    ]
  },
  "roomTypes": [
    {
      "id": "uuid",
      "name": "Deluxe Room",
      "price": 9000,
      "image": "https://...",
      "description": "Spacious room with garden view...",
      "amenities": ["King Bed", "AC", "WiFi", "Mini Bar"],
      "maxOccupancy": 2
    }
  ],
  "naturalists": [
    {
      "id": "uuid",
      "name": "Arjun Singh",
      "role": "Senior Naturalist",
      "experience": "15 years",
      "specialty": "Tiger behavior & tracking",
      "pricePerSession": 150,
      "image": "https://..."
    }
  ],
  "bankOffers": [
    {
      "id": "uuid",
      "title": "10% Off with HDFC Bank",
      "shortDescription": "Get instant 10% discount...",
      "fullDescription": "Get an instant 10% discount...",
      "termsAndConditions": "Offer valid only on...",
      "image": "https://..."
    }
  ],
  "faqs": [
    {
      "question": "What's included in the room rate?",
      "answer": "All room rates include..."
    }
  ],
  "park": {
    "name": "Tadoba Andhari Tiger Reserve",
    "slug": "tadoba-andhari-tiger-reserve",
    "region": { "name": "India", "slug": "india" }
  }
}
```

---

### 3.5 Bookings

---

#### `POST /bookings`

**Purpose:** Create a new booking (from the checkout modal). Can be used by authenticated or guest users.

🔒 *Authentication optional* — if logged in, `user_id` is auto-populated.

**Request Body:**
```json
{
  "lodgeId": "uuid",
  "roomTypeId": "uuid",
  "checkIn": "2026-03-15",
  "checkOut": "2026-03-18",
  "adults": 2,
  "children": 0,
  "guest": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+911234567890",
    "whatsappEnabled": true,
    "specialRequests": "Vegetarian meals please"
  },
  "naturalistSessions": [
    {
      "naturalistId": "uuid",
      "sessionDate": "2026-03-15",
      "numSessions": 2
    },
    {
      "naturalistId": "uuid",
      "sessionDate": "2026-03-16",
      "numSessions": 1
    }
  ],
  "currencyPaid": "INR"
}
```

> [!IMPORTANT]
> The server calculates all prices server-side (room total, experience total, taxes, grand total). The frontend prices are for display only. Never trust client-sent prices.

**Response (201):**
```json
{
  "id": "uuid",
  "bookingId": "JL12345678",
  "lodge": { "name": "Tadoba Tiger Lodge" },
  "roomType": { "name": "Premium Suite", "price": 12000 },
  "checkIn": "2026-03-15",
  "checkOut": "2026-03-18",
  "numNights": 3,
  "adults": 2,
  "children": 0,
  "roomTotal": 36000,
  "experienceTotal": 750,
  "taxAmount": 6615,
  "totalAmount": 43365,
  "status": "confirmed",
  "paymentStatus": "pending",
  "guestEmail": "john@example.com",
  "createdAt": "2026-03-06T14:53:00Z"
}
```

**Server-Side Logic:**
1. Validate room type belongs to the specified lodge
2. Validate naturalist belongs to the specified lodge
3. Validate dates (check-in < check-out, not in the past)
4. Validate session constraints (max 2 per day, sessions within date range)
5. Calculate: `numNights = checkOut - checkIn`
6. Calculate: `roomTotal = roomType.price × numNights`
7. Calculate: `experienceTotal = sum(naturalist.price × numSessions)`
8. Calculate: `taxAmount = (roomTotal + experienceTotal) × 0.18`
9. Calculate: `totalAmount = roomTotal + experienceTotal + taxAmount`
10. Generate `bookingId` (e.g., "JL" + 8 random digits)
11. Send confirmation email to `guest.email`

---

#### `GET /bookings/:bookingId`

🔒 *Requires authentication.* User can only view their own bookings.

**Response (200):** Full booking object (same shape as POST response, plus naturalist session details).

---

#### `PATCH /bookings/:bookingId/cancel`

🔒 *Requires authentication.*

**Response (200):**
```json
{
  "bookingId": "JL12345678",
  "status": "cancelled",
  "refundAmount": 21682,
  "message": "Booking cancelled. 50% refund will be processed within 5-7 business days."
}
```

---

### 3.6 Field Notes

---

#### `GET /field-notes`

**Purpose:** List all published field notes (for the field notes listing page).

**Query Params:** `?park=KANHA+NATIONAL+PARK&page=1&limit=12`

**Response (200):**
```json
{
  "fieldNotes": [
    {
      "id": "uuid",
      "slug": "the-kanha-migration-patterns",
      "title": "THE KANHA MIGRATION PATTERNS",
      "excerpt": "Exploring the fascinating seasonal movement...",
      "author": "Kanha National Park",
      "park": "KANHA NATIONAL PARK",
      "image": "https://...",
      "publishedDate": "2025-12-20",
      "readTime": "7 min read"
    }
  ],
  "filters": {
    "parks": ["KANHA NATIONAL PARK", "PENCH TIGER RESERVE", "BANDHAVGARH NATIONAL PARK", "SERENGETI"]
  },
  "pagination": { "page": 1, "limit": 12, "total": 4, "totalPages": 1 }
}
```

---

#### `GET /field-notes/:slug`

**Purpose:** Get a single field note article (for `/field-notes/[slug]`).

**Response (200):**
```json
{
  "id": "uuid",
  "slug": "the-kanha-migration-patterns",
  "title": "THE KANHA MIGRATION PATTERNS",
  "excerpt": "...",
  "content": [
    "The Kanha Tiger Reserve represents...",
    "During the monsoon months..."
  ],
  "author": "Kanha National Park",
  "park": "KANHA NATIONAL PARK",
  "image": "https://...",
  "publishedDate": "2025-12-20",
  "readTime": "7 min read",
  "relatedNotes": [
    {
      "id": "uuid",
      "slug": "shadows-of-pench",
      "title": "SHADOWS OF PENCH",
      "park": "PENCH TIGER RESERVE",
      "image": "https://..."
    }
  ]
}
```

---

### 3.7 Homepage Data

---

#### `GET /homepage`

**Purpose:** Single endpoint to fetch all homepage data. Avoids multiple API calls on initial load.

**Response (200):**
```json
{
  "hero": {
    "imageUrl": "https://...",
    "videoUrl": null
  },
  "featuredLodges": [
    {
      "id": "uuid",
      "name": "Tadoba Tiger Lodge",
      "slug": "tadoba-tiger-lodge",
      "thumbnail": "https://...",
      "images": ["https://..."],
      "rating": 4.8,
      "minRoomPrice": 9000,
      "location": "Moharli, Chandrapur, Maharashtra",
      "amenities": ["WiFi", "Pool", "Spa", "Safari", "AC"],
      "ecoCertified": true,
      "parkName": "Tadoba Andhari Tiger Reserve",
      "regionSlug": "india",
      "parkSlug": "tadoba-andhari-tiger-reserve"
    }
  ],
  "latestFieldNotes": [
    {
      "id": "uuid",
      "slug": "the-kanha-migration-patterns",
      "title": "THE KANHA MIGRATION PATTERNS",
      "author": "Kanha National Park",
      "park": "KANHA NATIONAL PARK",
      "image": "https://..."
    }
  ],
  "testimonials": [
    {
      "id": "uuid",
      "name": "Leslie Alexander",
      "company": "The Walt Disney Company",
      "text": "Amet minim mollit...",
      "image": "https://..."
    }
  ]
}
```

---

### 3.8 Testimonials

---

#### `GET /testimonials`

**Purpose:** Get all active testimonials (if not using the `/homepage` bundle).

**Response (200):**
```json
{
  "testimonials": [
    {
      "id": "uuid",
      "name": "Leslie Alexander",
      "company": "The Walt Disney Company",
      "text": "...",
      "image": "https://..."
    }
  ]
}
```

---

### 3.9 Newsletter

---

#### `POST /newsletter/subscribe`

**Purpose:** Subscribe to the newsletter (from footer form).

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Response (201):**
```json
{
  "message": "Successfully subscribed to newsletter."
}
```

**Errors:** `409` (already subscribed)

---

### 3.10 All Lodges (Basecamps Page)

---

#### `GET /lodges`

**Purpose:** Get all lodges across all regions/parks (for `/basecamps` page).

**Query Params:** `?region=india&page=1&limit=20`

**Response (200):**
```json
{
  "lodges": [
    {
      "id": "uuid",
      "name": "Tadoba Tiger Lodge",
      "slug": "tadoba-tiger-lodge",
      "thumbnail": "https://...",
      "rating": 4.8,
      "minRoomPrice": 9000,
      "location": "Moharli, Chandrapur, Maharashtra",
      "amenities": ["WiFi", "Pool", "Spa"],
      "ecoCertified": true,
      "about": "Experience luxury in the heart...",
      "parkName": "Tadoba Andhari Tiger Reserve",
      "parkSlug": "tadoba-andhari-tiger-reserve",
      "regionSlug": "india"
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 5, "totalPages": 1 }
}
```

---

## 4. Admin Panel — Scope & Capabilities

The admin panel provides a full content management system for all dynamic data. Here's every CRUD operation needed:

### Content Management

| Entity | Create | Read | Update | Delete | Special |
|--------|--------|------|--------|--------|---------|
| **Regions** | ✅ | ✅ | ✅ | ✅ | Reorder |
| **Parks** | ✅ | ✅ | ✅ | ✅ | Toggle active, reorder, manage features & FAQs |
| **Lodges** | ✅ | ✅ | ✅ | ✅ | Toggle active/featured, reorder, manage images |
| **Room Types** | ✅ | ✅ | ✅ | ✅ | Reorder within lodge |
| **Naturalists** | ✅ | ✅ | ✅ | ✅ | Toggle active |
| **Bank Offers** | ✅ | ✅ | ✅ | ✅ | Set validity dates, attach to lodge or global |
| **Lodge FAQs** | ✅ | ✅ | ✅ | ✅ | Reorder |
| **Field Notes** | ✅ | ✅ | ✅ | ✅ | Draft/publish toggle, rich text editing |
| **Testimonials** | ✅ | ✅ | ✅ | ✅ | Toggle active, reorder |
| **Homepage Settings** | – | ✅ | ✅ | – | Hero image/video URL, featured section config |

### User & Booking Management

| Entity | Create | Read | Update | Delete | Special |
|--------|--------|------|--------|--------|---------|
| **Users** | – | ✅ | ✅ | ✅ (deactivate) | View booking history, toggle active |
| **Bookings** | – | ✅ | ✅ (status) | – | Change status, view details, export CSV |
| **Newsletter** | – | ✅ | – | ✅ (unsubscribe) | Export list CSV |
| **Admin Users** | ✅ | ✅ | ✅ | ✅ | Role management (super_admin only) |

### Admin API Endpoints

All prefixed with `/api/v1/admin/` and require admin JWT authentication.

| Method | Endpoint | Purpose |
|--------|----------|---------|
| **Regions** | | |
| GET | `/admin/regions` | List all regions |
| POST | `/admin/regions` | Create region |
| PUT | `/admin/regions/:id` | Update region |
| DELETE | `/admin/regions/:id` | Delete region |
| **Parks** | | |
| GET | `/admin/parks` | List all parks (with filters) |
| POST | `/admin/parks` | Create park with features & FAQs |
| PUT | `/admin/parks/:id` | Update park |
| DELETE | `/admin/parks/:id` | Delete park |
| **Lodges** | | |
| GET | `/admin/lodges` | List all lodges |
| POST | `/admin/lodges` | Create lodge |
| PUT | `/admin/lodges/:id` | Update lodge |
| DELETE | `/admin/lodges/:id` | Delete lodge |
| POST | `/admin/lodges/:id/images` | Upload/add images |
| DELETE | `/admin/lodges/:id/images/:imageId` | Remove image |
| **Room Types** | | |
| POST | `/admin/lodges/:id/room-types` | Add room type |
| PUT | `/admin/room-types/:id` | Update room type |
| DELETE | `/admin/room-types/:id` | Delete room type |
| **Naturalists** | | |
| POST | `/admin/lodges/:id/naturalists` | Add naturalist |
| PUT | `/admin/naturalists/:id` | Update naturalist |
| DELETE | `/admin/naturalists/:id` | Delete naturalist |
| **Bank Offers** | | |
| GET | `/admin/bank-offers` | List all offers |
| POST | `/admin/bank-offers` | Create offer |
| PUT | `/admin/bank-offers/:id` | Update offer |
| DELETE | `/admin/bank-offers/:id` | Delete offer |
| **Field Notes** | | |
| GET | `/admin/field-notes` | List all (incl. drafts) |
| POST | `/admin/field-notes` | Create field note |
| PUT | `/admin/field-notes/:id` | Update field note |
| DELETE | `/admin/field-notes/:id` | Delete field note |
| PATCH | `/admin/field-notes/:id/publish` | Toggle publish |
| **Testimonials** | | |
| GET | `/admin/testimonials` | List all |
| POST | `/admin/testimonials` | Create |
| PUT | `/admin/testimonials/:id` | Update |
| DELETE | `/admin/testimonials/:id` | Delete |
| **Bookings** | | |
| GET | `/admin/bookings` | List all (with filters, search, date range) |
| GET | `/admin/bookings/:id` | View detail |
| PATCH | `/admin/bookings/:id/status` | Change booking status |
| GET | `/admin/bookings/export` | Export as CSV |
| **Users** | | |
| GET | `/admin/users` | List all users |
| GET | `/admin/users/:id` | View user detail + bookings |
| PATCH | `/admin/users/:id` | Update user status |
| **Newsletter** | | |
| GET | `/admin/newsletter` | List subscribers |
| GET | `/admin/newsletter/export` | Export CSV |
| DELETE | `/admin/newsletter/:id` | Unsubscribe |
| **Dashboard** | | |
| GET | `/admin/dashboard` | Stats overview (see below) |
| **Admin Users** | | |
| GET | `/admin/admin-users` | List admin accounts |
| POST | `/admin/admin-users` | Create admin account |
| PUT | `/admin/admin-users/:id` | Update admin |
| DELETE | `/admin/admin-users/:id` | Delete admin |

### Admin Dashboard Stats (`GET /admin/dashboard`)

```json
{
  "totalBookings": 156,
  "totalRevenue": 5250000,
  "activeUsers": 420,
  "totalLodges": 5,
  "recentBookings": [...],
  "bookingsByMonth": { "2026-01": 12, "2026-02": 18 },
  "topLodges": [
    { "name": "Tadoba Tiger Lodge", "bookings": 45, "revenue": 1250000 }
  ],
  "bookingStatusBreakdown": {
    "confirmed": 120,
    "completed": 30,
    "cancelled": 6
  }
}
```

---

## 5. Authentication Architecture

```
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│   Frontend   │────────▶│   Backend    │────────▶│  PostgreSQL  │
│  (Next.js)   │◀────────│  (Express)   │◀────────│              │
└──────────────┘         └──────────────┘         └──────────────┘
       │                        │
       │   JWT Access Token     │   Google/Facebook
       │   (15 min expiry)      │   OAuth verification
       │                        │
       │   JWT Refresh Token    │   SendGrid/Resend
       │   (7 day expiry)       │   (password reset emails)
       │   (httpOnly cookie)    │
```

### Token Strategy
- **Access Token**: Short-lived JWT (15 min), stored in memory on frontend
- **Refresh Token**: Long-lived JWT (7 days), stored as httpOnly cookie
- **Admin Token**: Separate JWT with admin claims, 1-hour expiry

### Password Policy
- Minimum 8 characters
- Hashed with bcrypt (salt rounds: 12)
- Password reset tokens expire in 1 hour

---

## 6. Key Design Decisions

### Prices stored in INR
All prices in the database are in **INR (Indian Rupees)**. Currency conversion happens:
- On the **frontend** for display (using the exchange rate API as it does now)
- On the **backend** at booking time — snapshot the exchange rate into `exchange_rate_used` on the booking record

### Slug-based routing
All public entities (regions, parks, lodges, field notes) use URL slugs. Slugs are generated server-side on creation and stored in the database. The frontend routes use slugs, not UUIDs.

### Image hosting
Store image URLs in the database. Actual files stored on S3/Cloudinary. The admin panel handles upload → gets back a URL → saves URL to database.

### Soft deletes
Use `is_active` flags instead of hard deletes for regions, parks, lodges, users. This preserves booking history integrity.

### Experience page & Features section
The **Experience** page and **FeaturesSection** component are purely static marketing content. They don't need backend APIs — keep them hardcoded in the frontend. If the admin wants to edit these later, add them to `homepage_settings` as JSONB.

---

## 7. Environment Variables

```env
# Server
PORT=4000
NODE_ENV=production

# Database
DATABASE_URL=postgresql://user:pass@host:5432/curated_lodges

# JWT
JWT_SECRET=your-super-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# OAuth
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx
FACEBOOK_APP_ID=xxx
FACEBOOK_APP_SECRET=xxx

# Email
SENDGRID_API_KEY=xxx
FROM_EMAIL=bookings@curatedlodges.com

# Storage
AWS_S3_BUCKET=curated-lodges-assets
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
AWS_REGION=ap-south-1

# Frontend URL (for CORS & email links)
FRONTEND_URL=https://curatedlodges.com
```

---

## 8. Folder Structure (Suggested)

```
backend/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── migrations/            # Auto-generated migrations
├── src/
│   ├── index.ts               # App entry point
│   ├── config/
│   │   ├── database.ts        # Prisma client setup
│   │   ├── auth.ts            # JWT & OAuth config
│   │   └── email.ts           # Email service config
│   ├── middleware/
│   │   ├── authenticate.ts    # JWT verification middleware
│   │   ├── adminAuth.ts       # Admin-only middleware
│   │   ├── validate.ts        # Request validation (Zod)
│   │   └── errorHandler.ts    # Global error handler
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── user.routes.ts
│   │   ├── region.routes.ts
│   │   ├── park.routes.ts
│   │   ├── lodge.routes.ts
│   │   ├── booking.routes.ts
│   │   ├── fieldNote.routes.ts
│   │   ├── testimonial.routes.ts
│   │   ├── newsletter.routes.ts
│   │   ├── homepage.routes.ts
│   │   └── admin/
│   │       ├── admin.routes.ts     # Aggregates all admin routes
│   │       ├── adminAuth.routes.ts
│   │       ├── adminLodge.routes.ts
│   │       ├── adminBooking.routes.ts
│   │       └── ...
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── user.controller.ts
│   │   ├── region.controller.ts
│   │   ├── park.controller.ts
│   │   ├── lodge.controller.ts
│   │   ├── booking.controller.ts
│   │   ├── fieldNote.controller.ts
│   │   └── ...
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── booking.service.ts     # Business logic (price calc, validation)
│   │   ├── email.service.ts       # Send booking confirmations, reset emails
│   │   └── upload.service.ts      # S3/Cloudinary uploads
│   ├── validators/
│   │   ├── auth.validator.ts      # Zod schemas
│   │   ├── booking.validator.ts
│   │   └── ...
│   └── utils/
│       ├── slug.ts                # Slug generation
│       ├── pagination.ts          # Pagination helpers
│       └── errors.ts              # Custom error classes
├── .env
├── package.json
└── tsconfig.json
```
