# Rione di Lugano

Public-facing website for the Lugano congregation (rione) of The Church of Jesus Christ of Latter-day Saints. Displays upcoming events, sacrament meeting programmes, and announcements. Includes a password-protected admin panel for content management.

Live: [rionelugano.com](https://rionelugano.com)

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router), React 19 |
| Styling | Tailwind CSS v4, shadcn/ui |
| Database | Firebase Firestore |
| File storage | Firebase Storage |
| Auth | Firebase Authentication (email/password) |
| Animations | Framer Motion |
| PDF rendering | react-pdf |
| OCR (admin) | Tesseract.js |
| Hosting | Vercel |

---

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

You need a `.env.local` file with your Firebase config:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

---

## Build & deploy

```bash
npm run build        # type-check + static export → out/
npx serve@latest out # preview the static export locally
```

Deployment is automatic via Vercel: every push to `main` triggers a production deploy. The environment variables above must be set in the Vercel project settings.

### Firebase deploy

```bash
firebase deploy                  # deploy everything (Firestore rules, Storage rules, hosting)
firebase deploy --only hosting   # deploy hosting only
```

Requires the [Firebase CLI](https://firebase.google.com/docs/cli) to be installed and authenticated (`firebase login`).

---

## Project structure

```
src/
  app/                  # Next.js App Router pages
    page.tsx            # Homepage (Hero only)
    sacramentale/       # Sacramentale category page
    annunci/            # Annunci category page
    calendario/         # Calendario page
    events/             # Generic event detail route
    admin/              # Admin panel (protected)
  components/
    home/               # Hero, EventList, EventCard, CalendarioView
    events/             # CategoryPageClient, FlyerFullscreen, PdfViewer, ImageViewer
    admin/              # Dashboard, EventFormDialog, LoginForm
    layout/             # Navbar
  lib/
    firebase.ts         # Firebase app init
    events.ts           # Firestore CRUD for events
    storage.ts          # Firebase Storage upload/delete helpers
    settings.ts         # Global site settings (Zoom URL etc.)
    types.ts            # Shared TypeScript types
    format.ts           # Date/time formatting helpers
    ocr.ts              # Tesseract.js OCR wrapper (admin only)
public/                 # Static assets (images, icons, manifest)
```

---

## Content management

Navigate to `/admin` and sign in with the configured Firebase email/password account.

### Events

Each event has:
- **Title** and optional description
- **Date/time**
- **Category**: `sacramentale`, `annunci`, or `generale`
- **Flyer**: none / PDF / image — uploaded to Firebase Storage
- **Zoom URL**: optional per-event meeting link
- **Published**: draft events are hidden from the public site

The admin table lists all events. Actions per row:
- **Link icon** (blue) — copies the direct deep-link URL to the clipboard (only shown when a flyer is attached, see below)
- **Pencil** — opens the edit form
- **Trash** — deletes the event and removes the flyer from storage

### OCR

When uploading a flyer (PDF or image), the admin panel runs Tesseract.js OCR and suggests a title and date extracted from the document. You can accept or ignore the suggestion.

---

## Flyer deep-links

Category pages (`/sacramentale`, `/annunci`) support URL-based control over what is shown:

| URL | Behaviour |
|---|---|
| `/sacramentale` | Shows the event list |
| `/sacramentale?open` | Auto-opens the most recent flyer fullscreen |
| `/sacramentale?id=<eventId>` | Opens that specific event's flyer fullscreen |

The **link icon** button in the admin panel copies a `?id=` link for any event with a flyer. Share that URL to send someone directly to a specific flyer.

Use `?open` on the homepage, in emails, or in QR codes to always open the latest document without specifying an ID.

---

## Static assets

Files placed in `public/` are served at the root path. The hero image at `public/hero-picture.jpeg` is rendered in the homepage Hero component.

---

## Firebase rules (summary)

- Firestore: read is public; write requires authentication
- Storage: read is public; write requires authentication
