# Requirements Document

## Introduction

CuratedLodges is a premium wildlife safari lodge booking platform built with Next.js (App Router), TypeScript, and CSS modules. The frontend communicates with an existing backend via a typed API client (`src/lib/api.ts`) whose base URL comes from `NEXT_PUBLIC_API_URL`. The backend exposes a complete contract (documented in `BACKEND_ARCHITECTURE.md`) covering regions, parks, lodges, bookings, payments, users, field notes, testimonials, and newsletter.

A previous integration effort left two gaps:

1. **Existing connections may be incorrect.** Pages already wired to the API (Homepage, Basecamps, Field Notes, Park page, Lodge detail, SearchBox, Footer newsletter, Forgot Password, AuthContext, signin/signup) must be audited against the documented contract and corrected where request shapes, response field mappings, error handling, or loading behavior diverge.

2. **Several backend capabilities have no frontend UI.** The API client defines methods that no component consumes: `createBooking`, `getBooking`, `cancelBooking`, `getMyBookings`, `getMe`/`updateMe`, `getRegions`, `getParkBySlug`, `getTestimonials`, `resetPassword`, plus Google/Facebook OAuth sign-in. Pages and flows must be built for these.

This feature delivers a complete, correct, and consistent connection between the entire frontend and the backend API. Every newly added page or flow must match the existing frontend's theme, styling, and conventions (CSS modules, DM Sans typography, existing component patterns, `react-i18next` localization, and the currency/localization contexts). All new and audited surfaces must present consistent loading and error states, respect authentication on protected routes, and honor the user's language and currency preferences.

## Glossary

- **Frontend_App**: The CuratedLodges Next.js application that renders all user-facing pages and flows.
- **API_Client**: The typed client module at `src/lib/api.ts` that issues HTTP requests to the backend, stores JWT tokens, and auto-refreshes the access token on a 401 response.
- **Backend_API**: The existing backend service exposed at the base URL `NEXT_PUBLIC_API_URL` (default `http://localhost:4000/api/v1`), defined by `BACKEND_ARCHITECTURE.md`.
- **Auth_Context**: The React context (`src/contexts/AuthContext.tsx`) that holds the authenticated user, token, and authentication actions.
- **Localization_Context**: The React context (`src/contexts/LocalizationContext.tsx`) that holds the active language, active currency, exchange rate, and the `convertPrice` formatter.
- **Translation_System**: The `react-i18next` setup (`src/i18n/config.ts` and locale JSON files) used for all user-visible text.
- **Theme_Conventions**: The established visual and structural patterns of the Frontend_App: CSS modules, DM Sans fonts, existing component composition (Header, Footer, form layouts), color palette, and spacing.
- **Checkout_Flow**: The booking creation flow that collects room, dates, guests, and optional naturalist sessions, and submits to `createBooking`.
- **Booking_Confirmation_Page**: The page that displays a single booking's details retrieved via `getBooking`.
- **My_Bookings_Page**: The authenticated page that lists the current user's bookings retrieved via `getMyBookings`.
- **Profile_Page**: The authenticated account page that displays and edits the current user's profile via `getMe` and `updateMe`.
- **Reset_Password_Page**: The page that completes a password reset via `resetPassword` using a token from a reset email link.
- **Park_Detail_Page**: The page at `/park/[region]/[park]` that displays park content retrieved via `getParkBySlug` and lodges via `getLodgesByPark`.
- **Search_Box**: The region/park selection component (`src/components/domain/SearchBox.tsx`) that sources regions via `getRegions` and parks via `getParksByRegion`.
- **Testimonials_Section**: The homepage component that displays testimonials via `getTestimonials` (or the `/homepage` bundle).
- **OAuth_Sign_In**: The Google and Facebook sign-in actions that exchange a provider credential with the Backend_API.
- **Protected_Route**: Any page that requires an authenticated user (Profile_Page, My_Bookings_Page, Booking_Confirmation_Page, booking cancellation).
- **Loading_State**: A visible indication that data is being fetched and not yet available.
- **Error_State**: A visible indication that a request failed, including a user-readable message and, where applicable, a retry affordance.
- **Booking_Hold**: A booking created with status `held` that expires 15 minutes after creation if payment is not completed.

## Requirements

### Requirement 1: Audit and Correct Existing API Connections

**User Story:** As a developer, I want the already-connected pages verified against the documented API contract, so that existing data flows are correct and free of silent mismatches.

#### Acceptance Criteria

1. WHEN a page initiates a data request from the Homepage, Basecamps, Field Notes list, Field Note detail, Park_Detail_Page lodges, Lodge detail, Search_Box, or Footer newsletter, THE Frontend_App SHALL issue that request using the endpoint path, HTTP method, and request body shape defined in `BACKEND_ARCHITECTURE.md`.
2. THE Frontend_App SHALL map response fields from each already-connected endpoint to the rendered UI using the field names defined in `BACKEND_ARCHITECTURE.md`.
3. WHEN an already-connected page receives a response matching the documented success response shape, THE Frontend_App SHALL render the returned data without referencing fields that are absent from the documented response shape.
4. IF an already-connected page receives a response that does not match the documented success response shape, OR receives no response, THEN THE Frontend_App SHALL display an error indication and SHALL NOT render placeholder or partial data.
5. IF an audited connection sends a request body shape, an endpoint path, an HTTP method, or a response field mapping that diverges from `BACKEND_ARCHITECTURE.md`, THEN THE Frontend_App SHALL be corrected so that its request body shape, endpoint path, HTTP method, and field mapping match the documented contract.
6. WHEN an audited connection is corrected, THE Frontend_App SHALL preserve the existing page's Theme_Conventions and localization behavior, making no change to the page's text content, layout, or active language.
7. WHERE an audited page displays a monetary amount, THE Frontend_App SHALL format that amount through the Localization_Context `convertPrice` function.

### Requirement 2: Booking and Checkout Flow

**User Story:** As a traveler, I want to book a lodge with my chosen room, dates, guests, and optional naturalist sessions, so that I can reserve a stay.

#### Acceptance Criteria

1. WHEN a user initiates a booking from a lodge detail context, THE Checkout_Flow SHALL collect room type, check-in date, check-out date, number of adults (minimum 1), number of children (minimum 0), guest first name, guest last name, guest email, and guest phone.
2. THE Checkout_Flow SHALL allow a user to add between 0 and 20 naturalist sessions, each specifying a naturalist, a session date within the check-in to check-out date range, and a session count between 1 and 20.
3. WHEN a user submits a complete booking, THE Checkout_Flow SHALL call `createBooking` with a request body matching the `POST /bookings` contract, including `lodgeId`, `roomTypeId`, `checkIn`, `checkOut`, `adults`, `children`, the `guest` object, any `naturalistSessions`, and the active `currencyPaid`.
4. THE Checkout_Flow SHALL display the server-returned booking totals (`roomTotal`, `experienceTotal`, `taxAmount`, `totalAmount`) as the authoritative amounts.
5. WHILE the active currency is not INR, THE Checkout_Flow SHALL display monetary amounts formatted through the Localization_Context `convertPrice` function.
6. IF, on submission, room type, check-in date, check-out date, guest first name, guest last name, guest email, or guest phone is empty, OR the number of adults is less than 1, OR the number of children is less than 0, THEN THE Checkout_Flow SHALL display a field-level Error_State identifying each affected field and SHALL withhold the submission.
7. WHILE a booking submission is in progress, THE Checkout_Flow SHALL display a Loading_State, SHALL disable the submit control, and SHALL ignore additional submit activations until the `createBooking` request completes.
8. WHEN `createBooking` returns a successful response, THE Frontend_App SHALL navigate the user to the Booking_Confirmation_Page for the returned booking.
9. IF `createBooking` returns an error response, THEN THE Checkout_Flow SHALL display an Error_State containing a user-readable message and SHALL retain the user's entered values.
10. WHERE the user is authenticated, THE Checkout_Flow SHALL pre-fill guest first name, last name, and email from the Auth_Context user.
11. IF the check-in date is earlier than the current date, OR the check-out date is not later than the check-in date, THEN THE Checkout_Flow SHALL display a field-level Error_State on the affected date field and SHALL withhold the submission.
12. IF the guest email is not in a valid email address format, THEN THE Checkout_Flow SHALL display a field-level Error_State on the email field and SHALL withhold the submission.

### Requirement 3: Booking Confirmation and Retrieval

**User Story:** As a traveler, I want to view a confirmation of my booking, so that I can verify the details of my reservation.

#### Acceptance Criteria

1. WHEN the Booking_Confirmation_Page loads, THE Frontend_App SHALL read the booking identifier from the page's URL and SHALL call `getBooking` with that identifier.
2. WHEN `getBooking` returns a successful response, THE Booking_Confirmation_Page SHALL display the human-readable booking ID, lodge name, room type, check-in date, check-out date, number of nights, room total, experience total, tax amount, total amount, number of adults, number of children, booking status, and payment status.
3. WHILE the booking request is in progress, THE Booking_Confirmation_Page SHALL display a Loading_State.
4. IF `getBooking` returns an error response, THEN THE Booking_Confirmation_Page SHALL display an Error_State with a user-readable message and a retry affordance.
5. WHERE the booking status is `held`, THE Booking_Confirmation_Page SHALL display the pending-payment status returned by the Backend_API.
6. THE Booking_Confirmation_Page SHALL format every displayed monetary amount through the Localization_Context `convertPrice` function.
7. IF the page URL contains no booking identifier, THEN THE Booking_Confirmation_Page SHALL withhold the `getBooking` call and SHALL display an Error_State with a user-readable message.

### Requirement 4: Booking Cancellation

**User Story:** As a traveler, I want to cancel a booking, so that I can release a reservation I no longer need.

#### Acceptance Criteria

1. WHERE a booking's status returned by the backend is one of the cancellable statuses, THE Frontend_App SHALL present a cancel-booking action to the authenticated owner of that booking.
2. WHEN a user invokes the cancel-booking action, THE Frontend_App SHALL display a confirmation prompt and SHALL NOT call `cancelBooking` until the user explicitly confirms.
3. WHEN a user confirms cancellation of a booking, THE Frontend_App SHALL call `cancelBooking` with that booking's identifier.
4. WHEN `cancelBooking` returns a successful response, THE Frontend_App SHALL display the returned cancellation status and refund message, SHALL update the booking's displayed status to the returned cancellation status, and SHALL remove the cancel-booking action for that booking.
5. WHILE a cancellation request is in progress, THE Frontend_App SHALL display a Loading_State and SHALL disable the confirm action so that no additional `cancelBooking` request for the same booking can be issued.
6. IF `cancelBooking` returns an error response, THEN THE Frontend_App SHALL display an Error_State containing a human-readable message describing the failure and SHALL leave the booking's displayed status and details unchanged.
7. IF `cancelBooking` does not return a response within 30 seconds, THEN THE Frontend_App SHALL stop displaying the Loading_State, SHALL display an Error_State indicating the request timed out, and SHALL re-enable the cancel-booking action.

### Requirement 5: My Bookings Page

**User Story:** As a registered user, I want to see all of my bookings in one place, so that I can track my reservations.

#### Acceptance Criteria

1. WHEN an authenticated user opens the My_Bookings_Page, THE Frontend_App SHALL call `getMyBookings` exactly once per page load.
2. WHEN `getMyBookings` returns a successful response, THE My_Bookings_Page SHALL display each booking's lodge name, room type, check-in date, check-out date, number of nights, total amount, booking status, and payment status.
3. WHEN `getMyBookings` returns a successful response with one or more bookings, THE My_Bookings_Page SHALL order the displayed bookings by check-in date in descending order.
4. WHILE the bookings request is in progress, THE My_Bookings_Page SHALL display a Loading_State.
5. IF `getMyBookings` returns an empty list, THEN THE My_Bookings_Page SHALL display an empty-state message rendered through the Translation_System.
6. IF `getMyBookings` returns an error response, THEN THE My_Bookings_Page SHALL display an Error_State with a user-readable message and a retry affordance, and SHALL NOT display a partial list of bookings.
7. IF `getMyBookings` does not return a response within 30 seconds, THEN THE My_Bookings_Page SHALL end the Loading_State and SHALL display an Error_State with a user-readable message and a retry affordance.
8. WHEN a user selects a booking from the My_Bookings_Page, THE Frontend_App SHALL navigate to the Booking_Confirmation_Page using the selected booking's identifier.
9. THE My_Bookings_Page SHALL format all monetary amounts through the Localization_Context `convertPrice` function.

### Requirement 6: User Profile and Account Settings

**User Story:** As a registered user, I want to view and update my profile, so that my contact details and preferences stay current.

#### Acceptance Criteria

1. WHEN an authenticated user opens the Profile_Page, THE Frontend_App SHALL call `getMe` and SHALL display the returned first name, last name, email, phone, WhatsApp preference, preferred language, and preferred currency.
2. WHERE a field returned by `getMe` is absent or null, THE Profile_Page SHALL display an empty value for that field without rendering the literal text "null" or "undefined".
3. WHEN a user submits profile changes, THE Frontend_App SHALL call `updateMe` with only the changed fields among first name, last name, phone, WhatsApp preference, preferred language, and preferred currency.
4. IF a user submits the profile form when no field differs from the values returned by `getMe`, THEN THE Profile_Page SHALL withhold the `updateMe` call.
5. WHILE an `updateMe` request is in progress, THE Profile_Page SHALL disable the submit control so that no duplicate `updateMe` request is issued.
6. WHEN `updateMe` returns a successful response, THE Profile_Page SHALL display a success confirmation for at least 3 seconds and SHALL render the updated values.
7. WHEN `updateMe` returns an updated preferred language, THE Frontend_App SHALL set the Localization_Context language to the returned value.
8. WHEN `updateMe` returns an updated preferred currency, THE Frontend_App SHALL set the Localization_Context currency to the returned value.
9. WHILE a `getMe` request is in progress, THE Profile_Page SHALL display a Loading_State.
10. WHILE an `updateMe` request is in progress, THE Profile_Page SHALL display a Loading_State.
11. IF `getMe` or `updateMe` returns an error response, THEN THE Profile_Page SHALL display an Error_State with a user-readable message and SHALL retain the user's entered values.
12. IF a submitted first name or last name exceeds 100 characters, OR a submitted phone contains fewer than 7 or more than 15 digits, OR a submitted preferred language or preferred currency is not among the supported options, THEN THE Profile_Page SHALL display a field-level Error_State and SHALL withhold the submission.

### Requirement 7: Reset Password Page

**User Story:** As a user who requested a password reset, I want to set a new password using the link from my email, so that I can regain access to my account.

#### Acceptance Criteria

1. WHEN the Reset_Password_Page loads, THE Frontend_App SHALL read the reset token from the page's URL query parameters.
2. IF the Reset_Password_Page loads without a reset token present in the URL, THEN THE Reset_Password_Page SHALL display an Error_State with a user-readable message and SHALL disable the password submission control.
3. WHEN a user submits a new password, THE Reset_Password_Page SHALL call `resetPassword` with the token and the new password.
4. IF the new password is shorter than 8 characters or longer than 128 characters, THEN THE Reset_Password_Page SHALL display a field-level Error_State and SHALL withhold the submission.
5. IF the new password and its confirmation entry do not match, THEN THE Reset_Password_Page SHALL display a field-level Error_State and SHALL withhold the submission.
6. WHILE a password reset submission is in progress, THE Reset_Password_Page SHALL display a Loading_State and SHALL prevent duplicate submissions.
7. WHEN `resetPassword` returns a successful response, THE Reset_Password_Page SHALL display a success confirmation and SHALL present a link to the sign-in page.
8. IF `resetPassword` returns an error response, THEN THE Reset_Password_Page SHALL display an Error_State with a user-readable message and SHALL retain the user's entered values.
9. THE Reset_Password_Page SHALL follow the same Theme_Conventions as the Forgot Password and sign-in pages.

### Requirement 8: Google and Facebook OAuth Sign-In

**User Story:** As a user, I want to sign in with Google or Facebook, so that I can access my account without a separate password.

#### Acceptance Criteria

1. WHEN a user activates the Google sign-in control, THE OAuth_Sign_In SHALL request a Google credential and, upon receiving it, SHALL send the credential to the Backend_API Google authentication endpoint.
2. WHEN a user activates the Facebook sign-in control, THE OAuth_Sign_In SHALL request a Facebook credential and, upon receiving it, SHALL send the credential to the Backend_API Facebook authentication endpoint.
3. IF the OAuth provider credential request is cancelled by the user or fails to return a credential, THEN THE OAuth_Sign_In SHALL NOT send a request to the Backend_API and SHALL display an Error_State with a user-readable message indicating that sign-in was not completed.
4. WHEN an OAuth authentication request returns a successful response containing the expected authentication tokens and user data, THE Frontend_App SHALL store the returned tokens and SHALL set the Auth_Context user from the response.
5. WHEN OAuth authentication succeeds and the Auth_Context user is set, THE Frontend_App SHALL navigate the user to the post-sign-in destination.
6. WHILE an OAuth authentication request is in progress, THE OAuth_Sign_In SHALL display a Loading_State and SHALL disable the Google and Facebook sign-in controls to prevent duplicate submissions.
7. IF an OAuth authentication request does not return a response within 30 seconds, THEN THE OAuth_Sign_In SHALL cancel the request and SHALL display an Error_State with a user-readable message indicating that the request timed out, while retaining the current view.
8. IF an OAuth authentication request returns an error response, THEN THE OAuth_Sign_In SHALL display an Error_State with a user-readable message derived from the error response, SHALL NOT store any tokens, SHALL NOT navigate away from the current view, and SHALL re-enable the sign-in controls.
9. THE OAuth_Sign_In controls SHALL be presented on both the sign-in and sign-up views using the existing social-button Theme_Conventions.

### Requirement 9: Regions and Park Search Source

**User Story:** As a visitor, I want the search box to offer real regions and parks, so that I can navigate to actual destinations.

#### Acceptance Criteria

1. WHEN the Search_Box mounts, THE Frontend_App SHALL call `getRegions` and SHALL populate the region control with the returned regions, each identified by its display name and slug.
2. WHEN a user selects a region in the Search_Box, THE Frontend_App SHALL call `getParksByRegion` with the selected region's slug and SHALL replace any previously loaded park options with the returned parks.
3. WHILE region or park options are being fetched, THE Search_Box SHALL display a Loading_State on the affected control and SHALL disable that control until the response resolves.
4. IF `getRegions` or `getParksByRegion` returns an error response, THEN THE Search_Box SHALL display an Error_State on the affected control containing a user-readable message and a retry affordance, and SHALL leave that control's previously loaded options unchanged.
5. WHEN a user has selected both a region and a park and submits the Search_Box, THE Frontend_App SHALL navigate to the Park_Detail_Page for the selected region slug and park slug.
6. IF a user submits the Search_Box without a selected region or without a selected park, THEN THE Search_Box SHALL display a field-level Error_State and SHALL withhold navigation.
7. IF `getRegions` or `getParksByRegion` returns an empty list, THEN THE Search_Box SHALL display an empty-state message on the affected control and SHALL leave that control with no selectable options.
8. IF `getRegions` or `getParksByRegion` does not resolve within 10 seconds, THEN THE Search_Box SHALL end the Loading_State and SHALL display an Error_State with a user-readable message and a retry affordance.

### Requirement 10: Park Detail Content

**User Story:** As a visitor, I want the park page to show the park's description, hero image, features, and FAQs, so that I can learn about the destination before viewing lodges.

#### Acceptance Criteria

1. WHEN the Park_Detail_Page loads for the route `/park/[region]/[park]`, THE Frontend_App SHALL call `getParkBySlug` with the park slug and SHALL call `getLodgesByPark` with the park slug, using the region slug and park slug from the route.
2. WHEN `getParkBySlug` returns a successful response, THE Park_Detail_Page SHALL display the park name, description, hero image, best time, features, and FAQs from the response.
3. WHEN `getLodgesByPark` returns a successful response, THE Park_Detail_Page SHALL display the lodge grid alongside the park content.
4. WHERE the park's best time, features, or FAQs content is empty or absent, THE Park_Detail_Page SHALL render the remaining park content without breaking the page layout.
5. WHERE the lodge grid displays a monetary amount, THE Park_Detail_Page SHALL format that amount through the Localization_Context `convertPrice` function.
6. WHILE the park request is in progress, THE Park_Detail_Page SHALL display a Loading_State.
7. IF `getParkBySlug` returns an error response or indicates the park was not found, THEN THE Park_Detail_Page SHALL display an Error_State with a user-readable message and a retry affordance.
8. IF `getLodgesByPark` returns an error response, THEN THE Park_Detail_Page SHALL display an Error_State for the lodge grid while still rendering the park content from `getParkBySlug`.

### Requirement 11: Testimonials Display

**User Story:** As a visitor, I want to see real customer testimonials on the homepage, so that I can gauge the quality of the service.

#### Acceptance Criteria

1. WHEN the homepage mounts and the homepage bundle does not include testimonial data, THE Testimonials_Section SHALL call `getTestimonials`.
2. WHEN testimonial data containing one or more testimonials is available, THE Testimonials_Section SHALL display, for each testimonial, the name, company, testimonial text, and image fields returned by the Backend_API.
3. WHILE testimonial data is being fetched and no testimonial data is yet available, THE Testimonials_Section SHALL display a Loading_State.
4. IF the testimonials request returns an error response, THEN THE Testimonials_Section SHALL omit the testimonials section while leaving the layout and rendering of all other homepage sections unchanged.
5. IF the available testimonial data contains zero testimonials, THEN THE Testimonials_Section SHALL omit the testimonials section while leaving the layout and rendering of all other homepage sections unchanged.
6. WHERE a displayed testimonial has no image value, THE Testimonials_Section SHALL render that testimonial with a placeholder image and SHALL still display its name, company, and testimonial text.

### Requirement 12: Authentication-Protected Routes

**User Story:** As a user, I want account and booking pages restricted to authenticated users, so that private information stays protected.

#### Acceptance Criteria

1. WHILE the Auth_Context is determining authentication state for a Protected_Route, THE Frontend_App SHALL display a Loading_State and SHALL withhold the Protected_Route content until the authentication state is resolved.
2. WHEN the Auth_Context resolves to no authenticated user for a Protected_Route, THE Frontend_App SHALL record the originally requested route path and SHALL redirect access to the sign-in page.
3. WHEN the Auth_Context resolves to an authenticated user for a Protected_Route, THE Frontend_App SHALL grant access and SHALL render the Protected_Route without redirecting.
4. WHEN an unauthenticated user signs in successfully after being redirected from a Protected_Route, THE Frontend_App SHALL navigate the user to the recorded route path.
5. IF a Backend_API request from a Protected_Route returns an authentication failure after the API_Client token refresh attempt, THEN THE Frontend_App SHALL clear the Auth_Context user and SHALL redirect the user to the sign-in page.
6. IF the Auth_Context does not resolve authentication state within 10 seconds, THEN THE Frontend_App SHALL treat the user as unauthenticated and SHALL redirect access to the sign-in page.

### Requirement 13: Consistent Loading and Error States

**User Story:** As a user, I want consistent loading and error feedback across the app, so that I always understand the current state of the page.

#### Acceptance Criteria

1. WHEN a page or flow added or corrected by this feature begins awaiting a Backend_API response, THE Frontend_App SHALL display a Loading_State that follows the Theme_Conventions within 300 milliseconds, and SHALL remove the Loading_State when the response or an error arrives.
2. WHEN a Backend_API request fails with a network error, THE Frontend_App SHALL display an Error_State with a user-readable message.
3. IF a Backend_API request does not return a response within 30 seconds, THEN THE Frontend_App SHALL end the Loading_State and SHALL display an Error_State indicating the request timed out.
4. WHEN a Backend_API request fails with a server error response that includes an error message, THE Frontend_App SHALL display an Error_State whose text is derived from the response's error message.
5. WHEN a Backend_API request fails with a server error response that includes no error message, THE Frontend_App SHALL display an Error_State with a generic user-readable fallback message.
6. WHERE a failed request is a read-only retrieval that does not create, modify, or delete Backend_API data, THE Frontend_App SHALL present a retry affordance in the Error_State.
7. WHEN a user activates the retry affordance, THE Frontend_App SHALL re-issue the failed request and SHALL replace the Error_State with a Loading_State.
8. THE Frontend_App SHALL render all Loading_State and Error_State text through the Translation_System.

### Requirement 14: Theme and Styling Consistency

**User Story:** As a brand owner, I want every new page to match the existing design, so that the experience feels cohesive.

#### Acceptance Criteria

1. THE Frontend_App SHALL style every page and flow added by this feature using component-scoped CSS modules, without introducing inline styles or global CSS rules for those pages.
2. WHEN a page added by this feature renders text, THE Frontend_App SHALL apply the DM Sans typeface in the weights and sizes defined by the existing typography styles.
3. IF the DM Sans typeface fails to load, THEN THE Frontend_App SHALL fall back to a system sans-serif font and SHALL render page content without blocking display.
4. THE Frontend_App SHALL render the existing Header and Footer components on every full-page surface added by this feature, excluding modal, overlay, and embedded partial surfaces.
5. WHEN a page added by this feature renders user-visible text, THE Frontend_App SHALL retrieve every text string through the Translation_System rather than from hardcoded literals.
6. IF a translation key has no value for the active locale, THEN THE Frontend_App SHALL display the default-locale text for that key and SHALL NOT display the raw key or an empty string.
7. WHERE an added page presents forms, THE Frontend_App SHALL reuse the input field, label, button, and validation-message components and layout used by the sign-in and forgot-password pages.

### Requirement 15: Localization and Currency Handling

**User Story:** As an international user, I want prices and text shown in my chosen currency and language, so that the platform is usable in my context.

#### Acceptance Criteria

1. THE Frontend_App SHALL format every monetary amount on added and corrected surfaces through the Localization_Context `convertPrice` function, displaying the active currency symbol as a prefix followed by the amount multiplied by the active exchange rate.
2. WHEN the active currency changes, THE Frontend_App SHALL retrieve the exchange rate for the new currency and SHALL re-render displayed monetary amounts using the updated currency and exchange rate within 2 seconds.
3. IF retrieval of the exchange rate for the active currency fails, THEN THE Localization_Context SHALL apply a fallback exchange rate of 1, SHALL display an indication that the exchange rate is unavailable, SHALL continue operating without crashing, and SHALL retain the displayed monetary amounts.
4. WHEN the active language changes, THE Frontend_App SHALL re-render translated text on added pages in the updated language within 2 seconds, displaying the default-locale fallback text for any key that has no value in the active language.
5. WHERE an authenticated user has a stored preferred language and preferred currency, THE Frontend_App SHALL apply those preferences to the Localization_Context on sign-in.
6. WHERE no stored language or currency preference exists, THE Frontend_App SHALL default the active language to `en` and the active currency to `INR`.
7. THE Frontend_App SHALL persist the active language and active currency across browser sessions.
8. WHEN a booking is submitted, THE Checkout_Flow SHALL send the active currency code as `currencyPaid` in the `createBooking` request.
