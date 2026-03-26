# Dead Code — Safe to Remove

These files are no longer imported anywhere in the codebase. They were used before the backend API integration and have been fully replaced.

> **Verified via `grep`** — zero imports of any of these files exist in `src/`.

---

## Mock Data Files

These contained hardcoded data that the frontend used before the backend existed. All pages now fetch from the API.

| File | Replaced By |
|---|---|
| `src/data/mock/LodgeData.tsx` | `GET /lodges`, `GET /lodges/:slug`, `GET /parks/:slug/lodges` |
| `src/data/mock/FieldNotesData.tsx` | `GET /field-notes`, `GET /field-notes/:slug` |
| `src/data/lodgeCards.ts` | `GET /lodges` (was never imported by any active component) |

```bash
# To delete:
rm src/data/mock/LodgeData.tsx
rm src/data/mock/FieldNotesData.tsx
rm src/data/lodgeCards.ts
rmdir src/data/mock  # remove empty directory
```

---

## Unused UI Components

These components exist but are not imported or rendered by any page or layout.

| File | What It Is | Why It's Unused |
|---|---|---|
| `src/components/ui/SignInModal.tsx` | A popup sign-in modal | The app uses the `/signin` page instead (fully wired to `POST /auth/login`) |
| `src/components/layout/HeaderLogin.tsx` | An alternate header for logged-in users | No page imports it — the main `Header.tsx` is used everywhere |

```bash
# To delete:
rm src/components/ui/SignInModal.tsx
rm src/components/ui/SignInModal.module.css  # if exists
rm src/components/layout/HeaderLogin.tsx
```

---

## How to Verify Before Deleting

Run this from the `CuratedLodges/` root to confirm nothing imports these files:

```bash
grep -r "LodgeData\|FieldNotesData\|lodgeCards\|SignInModal\|HeaderLogin" src/ --include="*.tsx" --include="*.ts"
```

If the output is empty, all files are safe to delete.
