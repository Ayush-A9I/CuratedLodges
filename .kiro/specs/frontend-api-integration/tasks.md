# Implementation Plan: Frontend API Integration

## Overview

This plan implements the design in `design.md` in dependency order: foundation models and pure helpers first, then shared data-fetching/UI/auth infrastructure, then the pure logic layer with its property-based tests, then the audit-and-fix pass on existing connections, then the new surfaces (checkout, booking, profile, reset-password, OAuth, park content), then localization/currency and auth↔localization sync, and finally build/test verification.

Implementation language is **TypeScript** (existing Next.js App Router codebase). All property-based tests use **fast-check** with a minimum of **100 iterations** (`fc.assert(fc.property(...), { numRuns: 100 })`) and a tag comment in the form `// Feature: frontend-api-integration, Property {n}: {text}`. Test runner is **Vitest**, executed with `vitest --run`.

Each of the 24 correctness properties in `design.md` is implemented as its own property-based test sub-task, placed next to the code it validates.

## Tasks

- [x] 1. Foundation: response models and core helpers
  - [x] 1.1 Define API response models in `src/types/api.ts`
    - Add interfaces mirroring `BACKEND_ARCHITECTURE.md` exactly (camelCase): `AuthUser`, `AuthResponse`, `MeResponse`, `UpdateMeRequest`, `Region`, `ParkSummary`, `ParkFeature`, `ParkFaq`, `ParkDetail`, `LodgeListItem`, `RoomType`, `Naturalist`, `LodgeDetail`, `NaturalistSessionInput`, `CreateBookingRequest`, `BookingStatus`, `PaymentStatus`, `Booking`, `MyBookingsResponse`, `CancelBookingResponse`, `FieldNoteListItem`, `FieldNotesResponse`, `FieldNoteDetail`, `Testimonial`, `HomepageResponse`
    - Export `CANCELLABLE_STATUSES = ['held','pending','confirmed']`
    - These types are the compile-time contract; undocumented fields must be a type error
    - _Requirements: 1.2, 1.3_

  - [x] 1.2 Create supported options and defaults in `src/logic/supported.ts`
    - Export `SUPPORTED_LANGUAGES`, `SUPPORTED_CURRENCIES`, `DEFAULT_LANGUAGE = 'en'`, `DEFAULT_CURRENCY = 'INR'`
    - Derive values from `i18n/config.ts` and the `LocalizationContext` currency map
    - _Requirements: 6.12, 15.6_

  - [x] 1.3 Implement `normalizeError` in `src/lib/errors.ts`
    - Define `NormalizedError` and map `ApiError` (with `data.error`/`data.message`) → server message, `ApiError` without message → generic fallback key, `TypeError`/fetch failure → network, hook timeout → timeout
    - Resolve all text through `react-i18next` i18n keys
    - _Requirements: 13.2, 13.4, 13.5, 13.8_

  - [x]* 1.4 Write property test for `normalizeError`
    - **Property 16: Error normalization derives the right message for each failure kind**
    - **Validates: Requirements 13.2, 13.4, 13.5**

  - [x] 1.5 Implement money formatting helpers in `src/lib/money.ts`
    - Wrap/guard `convertPrice`: prefix active currency symbol, multiply by exchange rate, round to whole number; safe with rate fallback of 1
    - _Requirements: 1.7, 2.5, 15.1_

  - [x]* 1.6 Write property test for money formatting
    - **Property 1: Price formatting prefixes the currency symbol and scales by the exchange rate**
    - **Validates: Requirements 1.7, 2.5, 3.6, 5.9, 10.5, 15.1**

- [x] 2. Shared data-fetching hooks
  - [x] 2.1 Implement `useApiResource` in `src/hooks/useApiResource.ts`
    - Loading state shown within 300 ms and cleared on terminal state; `enabled` gate; `deps` re-fetch; race against `timeoutMs` (default 30000); `normalizeError` on failure; `retry()` swaps error for loading
    - _Requirements: 13.1, 13.3, 13.6, 13.7_

  - [x]* 2.2 Write property test for `useApiResource` loading transition
    - **Property 18: useApiResource shows then clears a single loading state**
    - **Validates: Requirements 13.1**

  - [x]* 2.3 Write property test for `useApiResource` timeout
    - **Property 19: A non-responding request produces a timeout error after the configured timeout**
    - **Validates: Requirements 4.7, 5.7, 8.7, 9.8, 13.3**

  - [x]* 2.4 Write property test for `useApiResource` retry
    - **Property 20: Read errors expose a retry that re-issues the request**
    - **Validates: Requirements 13.6, 13.7**

  - [x]* 2.5 Write property test for disabled resource
    - **Property 21: A disabled resource never calls its fetcher**
    - **Validates: Requirements 3.7**

  - [x] 2.6 Implement `useApiMutation` in `src/hooks/useApiMutation.ts`
    - Single-flight submit guard (re-entrant submits resolve to `undefined`), 30 s timeout, `normalizeError`, no auto-retry, never clears caller values
    - _Requirements: 2.7, 4.5, 6.5, 7.6, 8.6_

  - [x]* 2.7 Write property test for `useApiMutation` single-flight guard
    - **Property 22: In-flight mutations invoke the underlying request at most once**
    - **Validates: Requirements 2.7, 4.5, 6.5, 7.6, 8.6**

- [x] 3. Feedback components and StateBoundary
  - [x] 3.1 Implement `LoadingState`, `ErrorState`, `EmptyState` under `src/components/feedback/`
    - Themed spinner/skeleton, message + optional retry, translated empty message; CSS modules + DM Sans; all text via `react-i18next`
    - _Requirements: 13.1, 13.8, 14.1_

  - [x] 3.2 Implement `StateBoundary` in `src/components/feedback/StateBoundary.tsx`
    - Render exactly one of loading/error/empty/data; never render data children while an error is present; optional `onRetry`
    - _Requirements: 1.4, 5.6, 10.7_

  - [x]* 3.3 Write property test for `StateBoundary`
    - **Property 17: StateBoundary never renders data children while an error is present**
    - **Validates: Requirements 1.4, 5.6**

- [x] 4. Shared form primitives
  - [x] 4.1 Implement form primitives under `src/components/form/`
    - `Field`, `TextInput`, `FieldError`, `SubmitButton` + `form.module.css` extracted from sign-in/forgot-password markup and classes for reuse
    - _Requirements: 14.7_

- [x] 5. Auth guard and post-login redirect
  - [x] 5.1 Implement `src/lib/auth-redirect.ts`
    - Store/read post-login destination path; default destination when none stored
    - _Requirements: 12.2, 12.4_

  - [x]* 5.2 Write property test for redirect path round-trip
    - **Property 24: Post-login redirect path round-trips**
    - **Validates: Requirements 12.4**

  - [x] 5.3 Implement `useProtectedRoute` and `ProtectedRoute`
    - While `isLoading` render `LoadingState` and withhold children; 10 s ceiling treats unresolved as unauthenticated; no user → store path + redirect to `/signin`; user present → render children; clear-and-redirect on post-refresh 401
    - _Requirements: 12.1, 12.2, 12.3, 12.5, 12.6_

  - [x]* 5.4 Write property test for `ProtectedRoute`
    - **Property 23: Protected content renders if and only if auth is resolved and authenticated**
    - **Validates: Requirements 12.1, 12.3**

- [x] 6. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Pure logic modules and property tests
  - [x] 7.1 Implement `src/logic/checkoutValidation.ts`
    - `validateCheckout` (required fields, adults ≥1, children ≥0, email format, check-in ≥ today, check-out > check-in), `validateSessions` (0–20 entries, date within range, count 1–20), `buildCreateBookingRequest` (documented keys + `currencyPaid`)
    - _Requirements: 2.2, 2.3, 2.6, 2.11, 2.12, 15.8_

  - [x]* 7.2 Write property test for `validateCheckout`
    - **Property 2: Checkout validation accepts a form state if and only if all field rules hold**
    - **Validates: Requirements 2.6, 2.11, 2.12**

  - [x]* 7.3 Write property test for `validateSessions`
    - **Property 3: Naturalist sessions validate against count and date-range bounds**
    - **Validates: Requirements 2.2**

  - [x]* 7.4 Write property test for `buildCreateBookingRequest`
    - **Property 4: The createBooking request body is well-formed and carries the active currency**
    - **Validates: Requirements 2.3, 15.8**

  - [x] 7.5 Implement `src/logic/profileValidation.ts`
    - `validateProfile` (name ≤100, phone 7–15 digits, language/currency supported) and `displayValue` (never leaks `"null"`/`"undefined"`)
    - _Requirements: 6.2, 6.12_

  - [x]* 7.6 Write property test for `validateProfile`
    - **Property 7: Profile validation accepts a profile if and only if all field rules hold**
    - **Validates: Requirements 6.12**

  - [x]* 7.7 Write property test for `displayValue`
    - **Property 8: Display normalization never leaks null or undefined literals**
    - **Validates: Requirements 6.2**

  - [x] 7.8 Implement `src/logic/passwordValidation.ts`
    - `validateResetPassword` (length 8–128, password equals confirmation)
    - _Requirements: 7.4, 7.5_

  - [x]* 7.9 Write property test for `validateResetPassword`
    - **Property 9: Password reset validation accepts a password if and only if length and confirmation rules hold**
    - **Validates: Requirements 7.4, 7.5**

  - [x] 7.10 Implement `src/logic/profileDiff.ts`
    - `diffProfile` returns only changed editable fields; empty when nothing changed
    - _Requirements: 6.3, 6.4_

  - [x]* 7.11 Write property test for `diffProfile`
    - **Property 6: Profile diff yields exactly the changed fields**
    - **Validates: Requirements 6.3, 6.4**

  - [x] 7.12 Implement `src/logic/bookingsSort.ts`
    - `sortByCheckInDesc` returns a permutation ordered by check-in date descending
    - _Requirements: 5.3_

  - [x]* 7.13 Write property test for `sortByCheckInDesc`
    - **Property 5: My Bookings sort is a descending permutation by check-in date**
    - **Validates: Requirements 5.3**

  - [x] 7.14 Implement `resolvePreferences` in `src/logic/supported.ts`
    - Returns a supported language and currency, falling back to `en`/`INR` for absent/null/unsupported candidates
    - _Requirements: 15.5, 15.6_

  - [x]* 7.15 Write property test for `resolvePreferences`
    - **Property 10: Preference resolution always yields a supported language and currency**
    - **Validates: Requirements 15.5, 15.6**

  - [x] 7.16 Implement predicates in `src/logic/predicates.ts`
    - `canSubmitSearch`, `canCancelBooking`, `shouldRenderTestimonials`, `resolveTestimonialImage`
    - _Requirements: 4.1, 9.6, 11.4, 11.5, 11.6_

  - [x]* 7.17 Write property test for `canSubmitSearch`
    - **Property 12: Search submission is enabled if and only if both region and park are selected**
    - **Validates: Requirements 9.6**

  - [x]* 7.18 Write property test for `canCancelBooking`
    - **Property 13: Booking cancel is offered if and only if status is cancellable and the viewer is the owner**
    - **Validates: Requirements 4.1**

  - [x]* 7.19 Write property test for `shouldRenderTestimonials`
    - **Property 14: Testimonials section visibility depends only on success and non-empty data**
    - **Validates: Requirements 11.4, 11.5**

  - [x]* 7.20 Write property test for `resolveTestimonialImage`
    - **Property 15: Testimonial image resolution is always non-empty**
    - **Validates: Requirements 11.6**

- [x] 8. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Audit and fix existing API connections
  - [x] 9.1 Fix `SearchBox` (`src/components/domain/SearchBox.tsx`)
    - Replace hardcoded regions with `getRegions`; `getParksByRegion` on region select; per-control loading/disable/empty/retry states; 10 s timeout; gate navigation with `canSubmitSearch`; field-level error on incomplete submit
    - _Requirements: 1.1, 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8_

  - [x]* 9.2 Write example tests for `SearchBox`
    - Endpoint/method conformance, region→park reload, navigation, empty state (mock client/router)
    - _Requirements: 9.1, 9.2, 9.5, 9.7_

  - [x] 9.3 Fix Park page (`src/app/park/[region]/[park]/page.tsx`)
    - Call `getParkBySlug` (name, description, hero, bestTime, features, FAQs) and `getLodgesByPark`; remove non-existent `data.parkName`; graceful degradation of sparse content; lodge-grid error alongside intact park content; park-not-found retryable error; money via `convertPrice`
    - _Requirements: 1.1, 1.2, 1.3, 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8_

  - [x]* 9.4 Write edge-case render tests for sparse park content
    - **Validates: Requirements 10.4, 10.8**

  - [x] 9.5 Fix `Testimonials` (`src/components/domain/Testimonials.tsx`)
    - Prefer homepage-bundle testimonials else `getTestimonials`; use `shouldRenderTestimonials` to omit section on error/empty (no fallback data); `resolveTestimonialImage` placeholder; render name/company/text/image
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6_

  - [x] 9.6 Fix `Basecamps` page (`src/app/basecamps/page.tsx`)
    - Replace `console.error` swallow with `StateBoundary` error state; remove `forceUpdate({})` currency hack (react to `LocalizationContext`); money via `convertPrice`
    - _Requirements: 1.1, 1.4, 1.7_

  - [x] 9.7 Fix Lodge detail page
    - Map `jungloreStory.highlights` as `{icon, text}[]`; stop reading `roomTypes[].totalUnits`; money via `convertPrice`
    - _Requirements: 1.2, 1.3, 1.7_

  - [x] 9.8 Conformance pass on Homepage, Field Notes list/detail, Footer newsletter
    - Verify endpoint path/method/body and field mappings against the contract using `types/api.ts`; preserve text, layout, and active language
    - _Requirements: 1.1, 1.2, 1.3, 1.6_

  - [x]* 9.9 Write example conformance tests for audited connections
    - Documented endpoint/method/body and field mapping per page (mock client)
    - _Requirements: 1.1, 1.2, 1.3, 1.5_

- [x] 10. OAuth client and controls
  - [x] 10.1 Extend `src/lib/api.ts` with `loginWithGoogle` and `loginWithFacebook`
    - `POST /auth/google` `{idToken}` and `POST /auth/facebook` `{accessToken}`, mirroring existing request style
    - _Requirements: 8.1, 8.2_

  - [x] 10.2 Implement `OAuthButtons` (`src/components/auth/OAuthButtons.tsx`)
    - Request provider credential; on cancel/no-credential show error and skip backend; on credential call client via `useApiMutation` (30 s timeout, disable controls in flight); on success store tokens + set `AuthContext` user + navigate; on error show derived message, store no tokens, stay, re-enable
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8_

  - [x] 10.3 Wire `OAuthButtons` into sign-in and sign-up views
    - Render on both views with existing `.socialButton` styling
    - _Requirements: 8.9_

  - [x]* 10.4 Write integration tests for OAuth seam
    - SDK → backend exchange → `AuthContext`; cancel, success, and error paths (mock SDK/client)
    - _Requirements: 8.3, 8.4, 8.8_

- [x] 11. Checkout flow
  - [x] 11.1 Implement `NaturalistSessionPicker` (`src/components/domain/`)
    - Add/remove 0–20 sessions, each with naturalist, date within `[checkIn, checkOut]`, count 1–20
    - _Requirements: 2.2_

  - [x] 11.2 Implement `BookingSummary` (`src/components/domain/`)
    - Display server-returned `roomTotal`, `experienceTotal`, `taxAmount`, `totalAmount` as authoritative, each via `convertPrice`
    - _Requirements: 2.4, 2.5_

  - [x] 11.3 Implement `CheckoutForm` + `CheckoutPage` (`src/app/checkout/`)
    - Enter via `?lodge=&room=`, fetch lodge detail, collect fields, pre-fill from `AuthContext`, validate via `checkoutValidation`, submit `createBooking` with active `currencyPaid` through `useApiMutation`, navigate to confirmation on success, retain values on error; Header/Footer + CSS modules + form primitives
    - _Requirements: 2.1, 2.3, 2.6, 2.7, 2.8, 2.9, 2.10, 2.11, 2.12, 15.8_

  - [x]* 11.4 Write example tests for checkout
    - Documented body, pre-fill, navigation on success (mock client/router)
    - _Requirements: 2.1, 2.8, 2.10_

- [x] 12. Booking confirmation and cancellation
  - [x] 12.1 Implement `BookingConfirmationPage` (`src/app/booking/[bookingId]/`)
    - `ProtectedRoute`; read `bookingId` (withhold `getBooking` + error when absent); display all documented fields incl. status/payment, `held` pending-payment status; money via `convertPrice`; loading/error+retry
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

  - [x] 12.2 Implement `CancelBookingDialog` and cancel wiring
    - Show cancel only when `canCancelBooking`; confirm prompt before `cancelBooking`; on success update status, show refund message, remove action; single-flight + 30 s timeout re-enables; error leaves status/details unchanged
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_

  - [x]* 12.3 Write example tests for cancellation interaction
    - Confirm gate, success update, error leaves state unchanged
    - _Requirements: 4.2, 4.3, 4.4, 4.6_

- [x] 13. My Bookings page
  - [x] 13.1 Implement `BookingCard` (`src/components/domain/`)
    - Display lodge name, room type, dates, nights, total (via `convertPrice`), status, payment status
    - _Requirements: 5.2, 5.9_

  - [x] 13.2 Implement `MyBookingsPage` (`src/app/my-bookings/`)
    - `ProtectedRoute`; `getMyBookings` once per load; `sortByCheckInDesc`; empty state via Translation_System; error+retry, no partial list; 30 s timeout; navigate to confirmation on select
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9_

  - [x]* 13.3 Write example tests for My Bookings
    - Single call per load, empty state, navigation (mock client/router)
    - _Requirements: 5.1, 5.5, 5.8_

- [x] 14. Profile page
  - [x] 14.1 Implement `ProfilePage` (`src/app/profile/`)
    - `ProtectedRoute`; `getMe` populate (empty for null via `displayValue`); validate via `profileValidation`; `diffProfile` → `updateMe` with only changed fields, withhold when unchanged; disable submit in flight; success confirmation ≥3 s + render updated values; push returned language/currency to `LocalizationContext`; loading/error retains values
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9, 6.10, 6.11, 6.12_

  - [x]* 14.2 Write example tests for Profile (fake timers)
    - Success confirmation persists ≥3 s; changed-fields-only update
    - _Requirements: 6.6_

- [x] 15. Reset password page
  - [x] 15.1 Implement `ResetPasswordPage` (`src/app/reset-password/`)
    - Read token from URL query (missing token → error + disabled submit, withhold call); validate via `passwordValidation`; submit `resetPassword` through `useApiMutation`; success confirmation + sign-in link; error retains values; reuse form primitives + Forgot/sign-in Theme_Conventions
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9_

  - [x]* 15.2 Write example tests for Reset Password
    - Token read + `resetPassword` call (mock client)
    - _Requirements: 7.3_

- [x] 16. Localization, currency, and auth sync
  - [x] 16.1 Extend `LocalizationContext` with rate-unavailable flag and persistence
    - On exchange-rate failure apply rate 1, set unavailable indicator, retain amounts, no crash; re-render within 2 s on currency change; persist active language/currency across sessions
    - _Requirements: 15.2, 15.3, 15.7_

  - [x]* 16.2 Write property test for language/currency persistence
    - **Property 11: Language and currency persistence round-trips**
    - **Validates: Requirements 15.7**

  - [x] 16.3 Implement auth↔localization sync effect
    - On `AuthContext` user resolution, push `preferredLanguage`/`preferredCurrency` into `LocalizationContext` via `resolvePreferences`; re-render translated text within 2 s on language change with default-locale fallback
    - _Requirements: 6.7, 6.8, 15.4, 15.5_

  - [x]* 16.4 Write integration tests for localization sync (fake timers)
    - Sign-in applies stored preferences; rate-unavailable fallback
    - _Requirements: 6.7, 6.8, 15.3_

- [x] 17. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 18. Final verification
  - [x] 18.1 Run the production build and fix compile/type errors
    - Run `next build`; resolve any type errors (these enforce contract field usage from `types/api.ts`)
    - _Requirements: 1.2, 1.3_

  - [x]* 18.2 Run the full property-based test suite
    - `vitest --run` for all 24 property tests (≥100 iterations each); confirm pass
    - _Requirements: all property-validated criteria_

  - [x]* 18.3 Run the example and integration test suite
    - `vitest --run` for example/integration/edge-case tests; confirm pass
    - _Requirements: non-PBT criteria per Testing Strategy_

## Notes

- Tasks marked with `*` are optional test sub-tasks and can be skipped for a faster MVP, but property tests are how the 24 design properties are verified.
- Each property test must use fast-check with `{ numRuns: 100 }` minimum and the tag comment `// Feature: frontend-api-integration, Property {n}: {text}`.
- Each task references the specific requirement clauses (and property number) it implements for traceability.
- Checkpoints provide incremental validation points.
- Money is server-authoritative; the client only formats via `convertPrice`.
- Network-exposed surfaces here are client pages; protected routes are gated by `ProtectedRoute` for UX, while the backend exchange endpoints remain the security trust boundary for OAuth.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2", "1.3", "1.5", "4.1"] },
    { "id": 1, "tasks": ["1.4", "1.6", "2.1", "7.1", "7.5", "7.8", "7.10", "7.12", "7.14", "7.16"] },
    { "id": 2, "tasks": ["2.2", "2.3", "2.4", "2.5", "2.6", "3.1", "7.2", "7.3", "7.4", "7.6", "7.7", "7.9", "7.11", "7.13", "7.15", "7.17", "7.18", "7.19", "7.20"] },
    { "id": 3, "tasks": ["2.7", "3.2", "5.1"] },
    { "id": 4, "tasks": ["3.3", "5.2", "5.3"] },
    { "id": 5, "tasks": ["5.4", "9.1", "9.3", "9.5", "9.6", "9.7", "9.8", "10.1", "11.1", "11.2", "13.1", "16.1"] },
    { "id": 6, "tasks": ["9.2", "9.4", "9.9", "10.2", "11.3", "12.1", "13.2", "14.1", "15.1", "16.2", "16.3"] },
    { "id": 7, "tasks": ["10.3", "10.4", "11.4", "12.2", "13.3", "14.2", "15.2", "16.4"] },
    { "id": 8, "tasks": ["12.3"] },
    { "id": 9, "tasks": ["18.1"] },
    { "id": 10, "tasks": ["18.2", "18.3"] }
  ]
}
```
