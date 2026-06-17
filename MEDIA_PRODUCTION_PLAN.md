# Media (Images) — Production Plan & Setup Instructions

Status of the **image** pipeline: **code is implemented** (AWS S3, direct
browser → S3 uploads via presigned URLs). What remains is **your AWS account
setup + a few env vars**, documented step-by-step below.

> **Hero video is intentionally deferred.** We are launching with images only.
> A hero-video field still exists in admin but is not part of this launch.

---

## 0. TL;DR — what you must do

1. Create an **S3 bucket**.
2. Put **CloudFront** in front of it (recommended) and note the CDN domain.
3. Create an **IAM user** with `PutObject` permission on that bucket → get an
   access key + secret.
4. Set the **bucket CORS** so the admin browser can `PUT` directly to S3.
5. Add the **backend env vars** (Section 4) and redeploy the backend.
6. (Optional) Add `NEXT_PUBLIC_MEDIA_HOST` to the frontend and redeploy.
7. Open the admin panel → any image field now has an **Upload** button. Re-upload
   real images and retire the Unsplash placeholders.

Everything downstream (public pages, admin display) already works with URLs, so
**no schema or page changes are needed.**

---

## 1. What's already done in code (no action needed)

- **Backend**
  - `src/config/storage.ts` — reads S3 config from env.
  - `src/services/upload.service.ts` — mints a short-lived **presigned PUT URL**,
    validates the file type, and returns the permanent public URL.
  - `src/controllers/upload.controller.ts` + route
    **`POST /api/v1/admin/uploads/presign`** (admin-only, reuses `adminAuth`).
  - `.env.example` — documents every variable in Section 4.
- **Frontend**
  - `src/components/admin/ImageUpload.tsx` — an **Upload** button **and** a
    paste-a-URL fallback, with a live preview. Already wired into:
    lodge gallery images, lodge thumbnail, room image, naturalist image,
    park hero, field note image, testimonial image, homepage hero image.
  - `src/lib/adminApi.ts` — `adminApi.uploads.presign(...)`.
  - `next.config.js` — `images.remotePatterns` for S3 / CloudFront / Unsplash.

**Upload flow:** admin picks a file → frontend asks the backend for a presigned
URL → browser uploads the bytes **directly to S3** → the returned public URL is
saved through the normal lodge/park/etc. forms. The backend never handles file
bytes. Uploads are restricted to authenticated admins (the presign endpoint is
admin-only). Object keys look like `uploads/<folder>/<YYYY-MM-DD>/<uuid>.<ext>`.

---

## 2. Create the S3 bucket (AWS Console)

1. AWS Console → **S3** → **Create bucket**.
2. **Bucket name:** e.g. `curated-lodges-assets` (must be globally unique).
3. **Region:** pick one close to your users, e.g. `ap-south-1` (Mumbai). **Write
   it down** — it must match `AWS_REGION`.
4. **Block Public Access:** leave **all blocks ON** if you will use CloudFront
   (recommended — Section 3A). Turn the public-read block OFF only if you choose
   the simpler public-bucket route (Section 3B).
5. Create the bucket.

---

## 3. Make uploaded images publicly viewable

Pick **ONE** option.

### Option 3A — CloudFront in front of a private bucket (recommended)

Cheaper egress, faster, and the bucket stays private.

1. AWS Console → **CloudFront** → **Create distribution**.
2. **Origin domain:** select your S3 bucket.
3. **Origin access:** choose **Origin access control settings (recommended)** →
   create an OAC. CloudFront will give you a **bucket policy to paste** — copy it
   into the bucket (S3 → bucket → **Permissions → Bucket policy**).
4. **Viewer protocol policy:** Redirect HTTP to HTTPS.
5. Create the distribution and note the domain, e.g.
   `d111111abcdef8.cloudfront.net` (or attach your own `cdn.curatedlodges.com`).
6. Set `AWS_S3_PUBLIC_BASE_URL=https://<that-domain>` (Section 4).

### Option 3B — Public-read bucket (simpler, slightly higher egress cost)

1. S3 → bucket → **Permissions** → turn **off** "Block all public access" (accept
   the warning).
2. S3 → bucket → **Permissions → Bucket policy** → paste (replace the bucket
   name). This makes **only** the `uploads/` prefix public-readable:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadUploads",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::curated-lodges-assets/uploads/*"
    }
  ]
}
```

3. Leave `AWS_S3_PUBLIC_BASE_URL` **blank** — the code will serve from
   `https://<bucket>.s3.<region>.amazonaws.com/<key>` automatically.

---

## 4. Set the bucket CORS (required for direct browser uploads)

S3 → bucket → **Permissions → Cross-origin resource sharing (CORS)** → paste.
Replace the origins with your real frontend URLs (keep `http://localhost:3000`
for local testing):

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["PUT", "GET"],
    "AllowedOrigins": [
      "http://localhost:3000",
      "https://your-production-frontend-domain.com"
    ],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

Without this, the browser `PUT` to S3 will be blocked by CORS.

---

## 5. Create an IAM user for uploads (backend credentials)

The backend only needs permission to **put** objects (to sign upload URLs).

1. AWS Console → **IAM** → **Users → Create user** (e.g. `curatedlodges-uploader`).
2. Attach an **inline policy** (replace the bucket name):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject"],
      "Resource": "arn:aws:s3:::curated-lodges-assets/uploads/*"
    }
  ]
}
```

3. Create an **access key** for this user → copy the **Access key ID** and
   **Secret access key** into the env vars below.

> On AWS-hosted backends (EC2/ECS/Lambda) you can instead attach this policy to
> the instance/task **role** and leave `AWS_ACCESS_KEY_ID` /
> `AWS_SECRET_ACCESS_KEY` blank — the SDK picks up the role automatically.

---

## 6. Backend environment variables

Add to `CuratedLodges_Backend/.env` (local) **and** to your production env:

```env
# Required
AWS_S3_BUCKET=curated-lodges-assets
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=AKIA...          # from the IAM user (omit if using an IAM role)
AWS_SECRET_ACCESS_KEY=...          # from the IAM user (omit if using an IAM role)

# Recommended (Option 3A — CloudFront). Leave blank for Option 3B.
AWS_S3_PUBLIC_BASE_URL=https://d111111abcdef8.cloudfront.net

# Optional tuning (defaults shown — fine to omit)
UPLOAD_PREFIX=uploads
UPLOAD_PRESIGN_EXPIRY=300
UPLOAD_MAX_FILE_MB=10
UPLOAD_ALLOWED_TYPES=image/jpeg,image/png,image/webp,image/avif,image/gif
```

Restart / redeploy the backend after changing these.

> If S3 is **not** configured, the presign endpoint returns a clear 503 and the
> admin can still paste image URLs manually — nothing breaks.

---

## 7. Frontend environment variable (optional)

Only needed if you later render images with `next/image` from a **custom CDN
domain** (e.g. `cdn.curatedlodges.com`). For `*.cloudfront.net` and
`*.amazonaws.com` it already works.

```env
# CuratedLodges/.env.local (and production)
NEXT_PUBLIC_MEDIA_HOST=cdn.curatedlodges.com   # hostname only, no https://
```

Redeploy the frontend after changing this.

---

## 8. Verify it works

1. Start backend + frontend (or use your deployed envs).
2. Admin panel → **Lodges → edit a lodge → Images → + Add image**.
3. Click **Upload**, pick a JPG/PNG/WebP.
4. You should see a preview, then **Save**. Reload — the image persists and is
   served from your S3/CloudFront URL.
5. If upload fails: check **bucket CORS** (Section 4), the **IAM policy**
   (Section 5), and that the env vars are set and the backend was restarted.

---

## 9. Replace placeholders (launch cleanup)

- [ ] Re-upload real lodge / park / field-note / testimonial / room / naturalist
      images via the admin (the Upload button is on every image field).
- [ ] Set the homepage **Hero Image** in **Admin → Homepage Settings**.
- [ ] Remove Unsplash URLs from the seed (`CuratedLodges_Backend/prisma/seed.ts`)
      or repoint them at hosted assets, so fresh environments don't reintroduce
      placeholders.

---

## 10. Definition of done

- [ ] No Unsplash / placeholder URLs remain in production data.
- [ ] Admins upload images from the panel (no URL pasting required); uploads are
      admin-only (presigned).
- [ ] Images are delivered via S3/CloudFront.
- [ ] Production secrets (AWS keys, JWT secrets) are set via env vars, not
      hardcoded.

---

## 11. Quick reference — where media lives in code

- Presign endpoint: `POST /api/v1/admin/uploads/presign`
  (`CuratedLodges_Backend/src/controllers/upload.controller.ts`)
- Upload signing: `CuratedLodges_Backend/src/services/upload.service.ts`
- S3 config: `CuratedLodges_Backend/src/config/storage.ts`
- Admin upload UI: `CuratedLodges/src/components/admin/ImageUpload.tsx`
- API client: `CuratedLodges/src/lib/adminApi.ts` (`adminApi.uploads.presign`)
- `next/image` hosts: `CuratedLodges/next.config.js`
