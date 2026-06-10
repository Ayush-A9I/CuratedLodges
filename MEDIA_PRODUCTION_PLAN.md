# Media (Images & Video) — Production Plan

A complete, pick-up-and-execute plan for moving images and videos from
build-time placeholders (Unsplash URLs, a local hero `.mp4`) to a real
production media pipeline.

---

## 1. The key insight (why this is low-risk)

The entire data model already stores media as **URLs** — lodge `thumbnail`,
`images[].url`, room `image`, naturalist `image`, park `heroImage`, field note
`image`, testimonial `image`, and the homepage `hero_image_url` / `hero_video_url`
settings, plus any media inside the flexible lodge content.

That means **no schema or page changes are required**. We only need:
1. A place to host media that returns a URL.
2. An **Upload** affordance in the admin that produces that URL (instead of
   pasting one).

Everything downstream (public pages, admin display) keeps working unchanged.

---

## 2. Current state (what must be replaced before launch)

- **Unsplash URLs** used as placeholders across seeded lodges, parks, field notes, testimonials. Not licensed for production — must be replaced.
- **Local hero video** at `public/assests/videos/Outpost12.mp4` — shipped in the app bundle. Fine for a placeholder, not for serving real hero videos at scale.
- **Admin "Add image" / image fields** currently accept a **URL string only** — there is no upload.

---

## 3. Options compared

| Option | Best for | Cost shape | Setup effort |
|---|---|---|---|
| **Cloudinary** | Images (+ light video) | Free tier (~25 GB storage + bandwidth/transforms); then usage-based | **Lowest** — drop-in upload, auto CDN + resize/compress |
| **Cloudflare R2 + Images/Stream** | Everything at scale | R2 has **zero egress fees**; Images ~$5/100k delivered; Stream ~$1/1000 min delivered + ~$5/1000 min stored | Medium |
| **Bunny.net (Storage + Stream)** | Cheapest overall + video | ~$0.01/GB storage, ~$0.005–0.01/GB CDN, cheap per-min video | Medium |
| **AWS S3 + CloudFront** | Already in backend `.env` | Storage cheap, but **egress ~$0.085/GB** makes video expensive | Higher |

**Videos are the cost driver.** Hero clips are large and stream a lot of
bandwidth — never serve big MP4s directly from the app server.

---

## 4. Recommendation

**Launch with Cloudinary for images + a dedicated video host for hero clips.**

1. **Images → Cloudinary.** Fastest to ship; free tier likely covers launch.
   Automatic format/quality (`f_auto,q_auto`), on-the-fly resizing via URL params,
   global CDN included (also speeds up pages).
2. **Hero videos → Cloudflare Stream or Bunny Stream.** Cheap per-minute adaptive
   streaming. Only a handful of hero videos, so cost stays low. Store the playback
   URL in the same `hero_video_url` / content fields.
3. **Check first: does Junglore (parent) already have a CDN / bucket / media
   pipeline?** If yes, **reuse it** — cheapest option since it's already paid for,
   and avoids a second vendor.

**Cost intuition (small launch — ~20–50 lodges, ~12 images each, a few hero videos):**
- Images: effectively free on Cloudinary's tier (or a few $/month on R2+Images).
- Video: a handful of clips on Bunny/Cloudflare Stream is typically single-digit
  to low-tens of dollars/month at modest traffic.

---

## 5. Security: use SIGNED uploads (do not skip)

- **Do not** use an open/unsigned upload preset in production — anyone with the
  preset could upload to your account.
- Add an **admin-only backend endpoint** that returns a short-lived upload
  **signature**; the browser uploads directly to the provider using that
  signature. Uploads stay restricted to authenticated admins.

---

## 6. Implementation plan (step-by-step)

> Estimated effort: ~half a day for images end-to-end; +0.5 day for video.

### Phase A — Decide & provision
- [ ] Confirm whether Junglore has existing media infra to reuse.
- [ ] If not: create a **Cloudinary** account → note `cloud_name`, `api_key`, `api_secret`.
- [ ] (Video) create a **Cloudflare Stream** or **Bunny Stream** account.
- [ ] Add credentials to backend `.env` (e.g. `CLOUDINARY_CLOUD_NAME`,
      `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`) and to deployment env vars.
      Add a `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` for the frontend.

### Phase B — Backend (signed uploads)
- [ ] Add `POST /api/v1/admin/upload-signature` (admin-protected, reuse `adminAuth`).
      It returns `{ timestamp, signature, apiKey, cloudName, folder }` computed
      with the Cloudinary API secret (server-side only).
- [ ] Restrict allowed formats and a max file size in the upload params.
- [ ] (Optional) Persist nothing here — the resulting URL is saved through the
      existing lodge/image/etc. update endpoints.

### Phase C — Frontend (admin upload UX)
- [ ] Build a reusable `ImageUpload` component (in `src/components/admin/`):
      file picker → request a signature from the backend → upload directly to
      Cloudinary → on success call `onChange(secure_url)`.
- [ ] Keep the existing URL text field as a fallback (paste-a-URL still works).
- [ ] Drop `ImageUpload` into every media field:
  - [ ] `LodgeImagesManager` ("Add image")
  - [ ] Lodge `thumbnail` (LodgeForm)
  - [ ] `RoomTypesManager` room `image`
  - [ ] `NaturalistsManager` `image`
  - [ ] Parks `heroImage`
  - [ ] Field Notes `image`
  - [ ] Testimonials `image`
  - [ ] Settings hero image (and a video upload/URL for `hero_video_url`)
- [ ] (Video) add a `VideoUpload` (or just a URL field that points at the Stream
      playback URL) for hero videos.

### Phase D — Replace placeholders
- [ ] Re-upload real lodge/park/field-note/testimonial images via the admin.
- [ ] Replace the local `public/assests/videos/Outpost12.mp4` hero with a real
      hosted video URL.
- [ ] Remove Unsplash URLs from the seed (or update the seed to point at hosted
      assets) so fresh environments don't reintroduce placeholders.

### Phase E — Delivery polish (optional but cheap wins)
- [ ] Render images with width/quality transforms (`f_auto,q_auto,w_…`) so the
      site serves appropriately sized images.
- [ ] Use `next/image` where practical (configure the provider domain in
      `next.config.js` `images.remotePatterns`).
- [ ] Lazy-load gallery images; preload only the hero.

---

## 7. Definition of done

- [ ] No Unsplash or other placeholder URLs remain in production data.
- [ ] No large video served from the app server / bundle.
- [ ] Admins can upload images (and set hero video) from the panel without
      pasting URLs; uploads are admin-only (signed).
- [ ] Images are CDN-delivered and auto-optimized.
- [ ] Production secrets (provider keys, JWT secrets) are set via env vars, not
      hardcoded.

---

## 8. Quick reference — where media lives in code

- Public lodge page: `src/app/park/[region]/[park]/[lodge]/page.tsx`
- Admin image managers: `src/components/admin/LodgeImagesManager.tsx`,
  `RoomTypesManager.tsx`, `NaturalistsManager.tsx`, `LodgeForm.tsx`
- Settings hero: `src/app/admin/homepage-settings/page.tsx`
- Backend admin upload route would go in: `CuratedLodges_Backend/src/routes/admin/admin.routes.ts`
  + a new controller in `src/controllers/admin.controller.ts`
- Existing reference plan in backend: `CuratedLodges_Backend/REMAINING_INTEGRATIONS.md` (Section 6 — S3 example)
