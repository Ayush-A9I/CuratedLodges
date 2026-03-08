# Phase 2 — Hyper-Personalized Intent Mapping

> **Prerequisite:** Complete the Phase 1 backend (see `BACKEND_ARCHITECTURE.md`) before starting this phase. Phase 2 extends the existing backend — it does not replace or modify any Phase 1 tables or APIs.

---  

## 1. The Concept

Standard travel platforms ask "Where do you want to go?" CuratedLodges asks **"Who do you want to be?"**

This system treats a traveler's search as a search for **meaning**, not just a destination. It uses AI to bridge the gap between "Where do I go?" and "Who do I want to be?" by reading **Digital Body Language** through three intent layers:

| Intent Layer | What It Reads | Example |
|-------------|---------------|---------|
| **Explicit Intent** | What they typed into search | "best eco-friendly safaris" |
| **Implicit Intent** | How they behave on-site | Scrolling past price, lingering on sustainability section |
| **Contextual Intent** | Global variables | Local time, weather, cultural nuances, device type |

---

## 2. The 5-Stage Pipeline

| Stage | Technology | Purpose | New Backend Components |
|-------|-----------|---------|----------------------|
| **Capture** | Customer Data Platform (CDP) | Unify data from web, social, apps into one profile | `user_events` table, event tracking API |
| **Interpret** | Natural Language Processing (NLP) | Decode search queries to find *meaning* (semantic search) | NLP search service, `search_queries` table |
| **Predict** | Machine Learning (ML) Models | Predict if user is "Just Browsing," "Comparing," or "Ready to Buy" | ML scoring service, `user_intent_profiles` table |
| **Deliver** | Dynamic Content Optimization (DCO) | Swap images, headlines, prices to match user's intent | Personalized content API endpoints |

---

## 3. New Database Tables

These tables are **additions** to the Phase 1 schema. No existing tables are modified.

---

### `connection_themes`

Emotional/psychographic categories that destinations map to.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | |
| `name` | VARCHAR(100) | NOT NULL, UNIQUE | e.g., "Patience & Stillness" |
| `slug` | VARCHAR(100) | NOT NULL, UNIQUE | URL slug |
| `description` | TEXT | | Theme description |
| `wildlife_profile` | TEXT | NOT NULL | e.g., "Slow-moving or rare sightings (Snow Leopards, Sloths)" |
| `icon` | VARCHAR(10) | | Emoji or icon reference |
| `sort_order` | INTEGER | DEFAULT 0 | |
| `is_active` | BOOLEAN | DEFAULT true | |
| `created_at` | TIMESTAMP | DEFAULT NOW() | |

**Seed data from the concept:**

| Theme | Wildlife Profile | Example Destinations |
|-------|-----------------|---------------------|
| Patience & Stillness | Slow-moving or rare sightings (Snow Leopards, Sloths) | Hemis (India), Costa Rican Cloud Forests, Tadoba Bamboo Forest |
| Vastness & Perspective | Massive migrations or infinite horizons (Wildebeests, Whales) | Serengeti (Tanzania), Peninsula Valdes (Argentina) |

---

### `park_themes`

Join table linking parks to connection themes (many-to-many).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | |
| `park_id` | UUID | FK → parks.id, NOT NULL | |
| `theme_id` | UUID | FK → connection_themes.id, NOT NULL | |
| `relevance_score` | DECIMAL(3,2) | DEFAULT 1.00 | How strongly the park matches this theme (0.00–1.00) |

**Unique constraint:** `(park_id, theme_id)`

---

### `user_events`

Raw event tracking for user behavior on the platform (the CDP data layer).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | |
| `user_id` | UUID | FK → users.id, NULL | NULL for anonymous visitors |
| `session_id` | VARCHAR(100) | NOT NULL | Browser session identifier |
| `event_type` | VARCHAR(50) | NOT NULL | See event types below |
| `event_data` | JSONB | | Event-specific payload |
| `page_url` | VARCHAR(500) | | Page where event occurred |
| `referrer` | VARCHAR(500) | | Where user came from |
| `device_type` | VARCHAR(20) | | 'desktop', 'mobile', 'tablet' |
| `country` | VARCHAR(50) | | Geo-IP detected country |
| `created_at` | TIMESTAMP | DEFAULT NOW() | |

**Event Types:**

| Event Type | Tracked When | `event_data` Example |
|-----------|-------------|---------------------|
| `page_view` | User views any page | `{ "page": "/park/india/tadoba", "duration_ms": 45000 }` |
| `search` | User uses SearchBox | `{ "region": "india", "park": "Tadoba Andhari Tiger Reserve" }` |
| `lodge_view` | User opens lodge detail page | `{ "lodgeId": "uuid", "lodgeName": "Tadoba Tiger Lodge" }` |
| `lodge_card_click` | User clicks a lodge card | `{ "lodgeId": "uuid", "source": "homepage" }` |
| `image_gallery_view` | User browses lodge gallery | `{ "lodgeId": "uuid", "imagesViewed": 5 }` |
| `room_view` | User clicks room details | `{ "roomTypeId": "uuid", "roomName": "Premium Suite" }` |
| `checkout_start` | User opens checkout modal | `{ "lodgeId": "uuid" }` |
| `checkout_step` | User progresses in checkout | `{ "step": "personal", "lodgeId": "uuid" }` |
| `booking_complete` | Booking confirmed | `{ "bookingId": "JL12345678" }` |
| `field_note_read` | User reads a field note | `{ "slug": "the-kanha-migration-patterns", "readPercentage": 85 }` |
| `section_dwell` | User lingers on a page section | `{ "section": "junglore_story", "duration_ms": 12000 }` |
| `price_hover` | User hovers/taps on price | `{ "lodgeId": "uuid", "price": 9000 }` |
| `filter_use` | User uses filters | `{ "filterType": "gate", "value": "Moharli Gate" }` |
| `share` | User shares a lodge/article | `{ "method": "whatsapp", "itemType": "lodge" }` |
| `nlp_search` | User types a natural language query | `{ "query": "quiet places to see animals alone" }` |

---

### `search_queries`

Stores NLP-processed search queries with their interpreted intent.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | |
| `user_id` | UUID | FK → users.id, NULL | |
| `session_id` | VARCHAR(100) | | |
| `raw_query` | TEXT | NOT NULL | What the user typed |
| `detected_language` | VARCHAR(10) | | e.g., "en", "hi", "es" |
| `interpreted_intent` | VARCHAR(100) | | e.g., "Introspective Solitude" |
| `matched_themes` | UUID[] | | Array of connection_theme IDs |
| `matched_parks` | UUID[] | | Array of park IDs returned |
| `confidence_score` | DECIMAL(3,2) | | ML confidence (0.00–1.00) |
| `created_at` | TIMESTAMP | DEFAULT NOW() | |

**Sentimental Keyword → Intent Mapping Examples:**

| Search Query | Psychographic Intent |
|-------------|---------------------|
| "Quiet places to see animals alone" | Introspective Solitude |
| "Meaningful wildlife volunteering" | Altruistic Connection |
| "Pristine nature, no cell service" | Digital Detox / Self-Reset |
| "Best safari for family with kids" | Family Bonding / Adventure |
| "Luxury wildlife experience" | Premium Comfort / Status |
| "Conservation-focused lodges" | Eco-Conscious / Purpose-Driven |

---

### `user_intent_profiles`

ML-computed profile representing a user's predicted intent and psychographic segment.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | |
| `user_id` | UUID | FK → users.id, NULL | |
| `session_id` | VARCHAR(100) | NOT NULL | |
| `intent_stage` | VARCHAR(30) | NOT NULL | 'just_browsing', 'comparing', 'ready_to_buy' |
| `primary_theme` | UUID | FK → connection_themes.id, NULL | Best-matching theme |
| `secondary_theme` | UUID | FK → connection_themes.id, NULL | Second-best theme |
| `psychographic_tags` | TEXT[] | | e.g., ["eco_conscious", "adventure_seeker", "luxury_traveler"] |
| `price_sensitivity` | VARCHAR(20) | | 'budget', 'mid_range', 'premium', 'luxury' |
| `engagement_score` | DECIMAL(5,2) | | Higher = more engaged |
| `confidence` | DECIMAL(3,2) | | ML model confidence |
| `computed_at` | TIMESTAMP | DEFAULT NOW() | |
| `expires_at` | TIMESTAMP | | Profile TTL (recompute after) |

---

### `personalized_content`

Admin-configured content variants that the DCO layer picks from based on user intent.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | |
| `content_key` | VARCHAR(100) | NOT NULL | e.g., "hero_headline", "cta_text", "lodge_sort_strategy" |
| `target_intent` | VARCHAR(30) | NOT NULL | Which intent stage this is for |
| `target_theme` | UUID | FK → connection_themes.id, NULL | Which theme this targets (NULL = all) |
| `content_value` | JSONB | NOT NULL | The actual content variant |
| `is_active` | BOOLEAN | DEFAULT true | |

**Example content variants:**

| Content Key | Target Intent | Content Value |
|-------------|--------------|---------------|
| `hero_headline` | just_browsing | `{ "text": "Discover Your Wild Side", "image": "exploration.jpg" }` |
| `hero_headline` | ready_to_buy | `{ "text": "Your Adventure Awaits — Book Now", "image": "lodge-sunset.jpg" }` |
| `lodge_sort_strategy` | eco_conscious | `{ "strategy": "eco_certified_first" }` |
| `lodge_sort_strategy` | luxury_traveler | `{ "strategy": "highest_price_first" }` |
| `cta_text` | comparing | `{ "text": "Compare Lodges Side by Side" }` |
| `cta_text` | ready_to_buy | `{ "text": "Reserve Your Dates" }` |

---

## 4. New API Endpoints

All prefixed with `/api/v1`. These are **additions** to the Phase 1 API.

---

### 4.1 Event Tracking

#### `POST /events`

**Purpose:** Track user behavior events from the frontend. Fire-and-forget, non-blocking.

**Request Body:**
```json
{
  "sessionId": "sess_abc123",
  "eventType": "lodge_view",
  "eventData": { "lodgeId": "uuid", "lodgeName": "Tadoba Tiger Lodge" },
  "pageUrl": "/park/india/tadoba-andhari-tiger-reserve/tadoba-tiger-lodge"
}
```

**Response (202 Accepted):**
```json
{ "status": "recorded" }
```

> Should be async — write to a queue (Redis/SQS) and process in background to not slow down the user.

---

### 4.2 NLP Search

#### `POST /search/intelligent`

**Purpose:** Accept a natural language query and return matching parks/lodges based on semantic meaning.

**Request Body:**
```json
{
  "query": "quiet places to see animals alone",
  "language": "en",
  "sessionId": "sess_abc123"
}
```

**Response (200):**
```json
{
  "interpretedIntent": "Introspective Solitude",
  "confidence": 0.87,
  "matchedThemes": [
    { "id": "uuid", "name": "Patience & Stillness", "relevance": 0.92 }
  ],
  "results": [
    {
      "type": "park",
      "id": "uuid",
      "name": "Tadoba Andhari Tiger Reserve",
      "slug": "tadoba-andhari-tiger-reserve",
      "region": "india",
      "heroImage": "https://...",
      "matchReason": "Known for quiet bamboo forest zones and solitary wildlife encounters",
      "relevanceScore": 0.91
    },
    {
      "type": "lodge",
      "id": "uuid",
      "name": "Barasingha Wilderness Camp",
      "slug": "barasingha-wilderness-camp",
      "parkName": "Kanha National Park",
      "thumbnail": "https://...",
      "matchReason": "Small, intimate lodge with max 8 guests",
      "relevanceScore": 0.85
    }
  ],
  "suggestedFilters": ["eco_certified", "low_guest_count"]
}
```

---

### 4.3 User Intent Profile

#### `GET /users/me/intent-profile`

🔒 *Requires authentication.*

**Purpose:** Get the current user's computed intent profile.

**Response (200):**
```json
{
  "intentStage": "comparing",
  "primaryTheme": { "id": "uuid", "name": "Patience & Stillness" },
  "psychographicTags": ["eco_conscious", "solo_traveler"],
  "priceSensitivity": "mid_range",
  "engagementScore": 72.5,
  "computedAt": "2026-03-06T15:00:00Z"
}
```

---

### 4.4 Personalized Homepage

#### `GET /homepage/personalized`

**Purpose:** Returns personalized homepage content based on the user's intent profile. Falls back to default content if no profile exists.

**Query Params:** `?sessionId=sess_abc123`

**Response (200):**
```json
{
  "hero": {
    "headline": "Find Your Stillness in the Wild",
    "subtitle": "Curated lodges for travelers seeking solitude and rare wildlife encounters",
    "imageUrl": "https://..."
  },
  "recommendedLodges": [
    {
      "id": "uuid",
      "name": "Barasingha Wilderness Camp",
      "matchReason": "Perfect for your preference for eco-certified, intimate properties",
      "relevanceScore": 0.94
    }
  ],
  "recommendedThemes": [
    { "id": "uuid", "name": "Patience & Stillness", "description": "..." }
  ],
  "ctaText": "Explore Lodges That Match Your Vibe",
  "contentVariant": "eco_solitude"
}
```

---

### 4.5 Connection Themes

#### `GET /themes`

**Purpose:** List all connection themes (for a new "Explore by Vibe" UI section).

**Response (200):**
```json
{
  "themes": [
    {
      "id": "uuid",
      "name": "Patience & Stillness",
      "slug": "patience-and-stillness",
      "description": "For those who find peace in waiting and wonder in silence",
      "wildlifeProfile": "Slow-moving or rare sightings (Snow Leopards, Sloths)",
      "icon": "🧘",
      "parkCount": 3
    }
  ]
}
```

#### `GET /themes/:slug`

**Purpose:** Get a theme with its matching parks and lodges.

**Response (200):**
```json
{
  "id": "uuid",
  "name": "Patience & Stillness",
  "slug": "patience-and-stillness",
  "description": "...",
  "wildlifeProfile": "...",
  "parks": [
    {
      "id": "uuid",
      "name": "Tadoba Andhari Tiger Reserve",
      "slug": "tadoba-andhari-tiger-reserve",
      "region": "india",
      "heroImage": "https://...",
      "relevanceScore": 0.95,
      "lodgeCount": 3
    }
  ]
}
```

---

## 5. AI/ML Services Architecture

```
┌────────────────────────────────────────────────────────────┐
│                        FRONTEND                            │
│  (Sends events, NLP queries, receives personalized content)│
└──────────┬──────────────────────────────────┬──────────────┘
           │                                  │
           ▼                                  ▼
┌──────────────────┐              ┌──────────────────────┐
│  Event Tracking  │              │   NLP Search API     │
│  POST /events    │              │ POST /search/intel.  │
└────────┬─────────┘              └──────────┬───────────┘
         │                                   │
         ▼                                   ▼
┌──────────────────┐              ┌──────────────────────┐
│  Event Queue     │              │  NLP Service         │
│  (Redis / SQS)   │              │  (OpenAI / custom)   │
└────────┬─────────┘              │                      │
         │                        │  - Query embedding   │
         ▼                        │  - Intent classific. │
┌──────────────────┐              │  - Theme matching    │
│  Event Processor │              └──────────────────────┘
│  (Background)    │
│                  │
│  - Store events  │              ┌──────────────────────┐
│  - Update intent │─────────────▶│  ML Prediction       │
│    profiles      │              │  Service             │
└──────────────────┘              │                      │
                                  │  - Intent stage      │
                                  │  - Price sensitivity  │
                                  │  - Psycho. tags      │
                                  └──────────┬───────────┘
                                             │
                                             ▼
                                  ┌──────────────────────┐
                                  │  DCO Service         │
                                  │                      │
                                  │  - Select content    │
                                  │    variants          │
                                  │  - Reorder lodges    │
                                  │  - Customize CTAs    │
                                  └──────────────────────┘
```

### Technology Options for NLP/ML

| Component | Option A (Fast/Easy) | Option B (Custom/Advanced) |
|-----------|---------------------|---------------------------|
| **NLP Query Processing** | OpenAI API (GPT-4) with embeddings | Fine-tuned model on travel queries |
| **Intent Classification** | OpenAI function calling | Custom classifier trained on user behavior data |
| **Theme Matching** | Vector similarity (pgvector) | Custom recommendation engine |
| **Intent Stage Prediction** | Rule-based heuristics initially | Gradient boosted model after you have data |

### Recommended Approach

**Start simple, get smarter over time:**

1. **Month 1:** Rule-based intent prediction (page views > 5 = "comparing", checkout opened = "ready to buy")
2. **Month 2:** Add OpenAI for NLP search interpretation
3. **Month 3+:** Train custom ML models once you have real user data

---

## 6. Admin Panel Additions (Phase 2)

| Entity | CRUD | Special Features |
|--------|------|-----------------|
| **Connection Themes** | ✅ Full CRUD | Link to parks, set relevance scores |
| **Personalized Content** | ✅ Full CRUD | Configure content variants per intent/theme |
| **Analytics Dashboard** | Read-only | Search query analysis, intent distribution, conversion by segment |
| **User Segments** | Read-only | View users grouped by intent stage and psychographic tags |

### New Admin Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/admin/themes` | List all themes |
| POST | `/admin/themes` | Create theme |
| PUT | `/admin/themes/:id` | Update theme |
| DELETE | `/admin/themes/:id` | Delete theme |
| POST | `/admin/themes/:id/parks` | Link park to theme |
| DELETE | `/admin/themes/:id/parks/:parkId` | Unlink park |
| GET | `/admin/personalized-content` | List content variants |
| POST | `/admin/personalized-content` | Create variant |
| PUT | `/admin/personalized-content/:id` | Update variant |
| DELETE | `/admin/personalized-content/:id` | Delete variant |
| GET | `/admin/analytics/search-queries` | Search query analytics |
| GET | `/admin/analytics/intent-distribution` | User intent breakdown |
| GET | `/admin/analytics/conversion-by-segment` | Conversion rates by segment |

---

## 7. Frontend Integration Points

These are the frontend changes needed **after** the backend Phase 2 APIs are ready:

| Area | Current State | Phase 2 Change |
|------|--------------|----------------|
| **SearchBox** | Region → Park dropdowns | Add a free-text NLP search bar ("Describe your ideal safari...") |
| **Homepage Hero** | Static image + text | Dynamic headline/image based on intent profile |
| **Lodge Ordering** | Static order from database | Personalized sort based on user preferences |
| **Lodge Cards** | Same for everyone | Highlight different amenities per user (eco badges for eco-conscious, luxury badges for luxury seekers) |
| **CTA Buttons** | "Search" everywhere | Dynamic text: "Explore Lodges" → "Compare Options" → "Reserve Your Dates" |
| **New Section** | — | "Explore by Vibe" theme cards on homepage |
| **Event Tracking** | None | Add event tracking calls on key interactions (see event types table) |

---

## 8. Environment Variables (Phase 2 Additions)

```env
# AI/ML
OPENAI_API_KEY=sk-xxx
OPENAI_MODEL=gpt-4

# Vector Search (if using pgvector)
PGVECTOR_ENABLED=true

# Event Queue
REDIS_URL=redis://localhost:6379
EVENT_QUEUE_NAME=user_events

# Intent Profile
INTENT_PROFILE_TTL_HOURS=24
ML_MODEL_VERSION=v1.0
```

---

## 9. Implementation Order

| Step | What | Depends On |
|------|------|-----------|
| 1 | Create new DB tables (`connection_themes`, `park_themes`, `user_events`, etc.) | Phase 1 complete |
| 2 | Build event tracking API (`POST /events`) + frontend event hooks | Step 1 |
| 3 | Seed connection themes and link to existing parks | Step 1 |
| 4 | Build themes API (`GET /themes`, `GET /themes/:slug`) | Step 3 |
| 5 | Add "Explore by Vibe" section to frontend | Step 4 |
| 6 | Build NLP search service (start with OpenAI) | Step 1 |
| 7 | Build `POST /search/intelligent` endpoint | Step 6 |
| 8 | Add NLP search bar to frontend | Step 7 |
| 9 | Build rule-based intent prediction from collected events | Step 2 (needs data) |
| 10 | Build personalized homepage endpoint | Steps 4, 9 |
| 11 | Admin panel: theme management + content variants | Steps 3, 10 |
| 12 | Upgrade to ML-based prediction (when sufficient data) | Step 9 |
