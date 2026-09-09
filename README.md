# PlaceFinder

A single-page Angular app where users sign in, browse a list of places,
view place details, and see each place on a map. Built for the Angular
Developer technical assignment.

- **Frontend:** Angular (v22), standalone components, signals
- **Backend:** json-server over a local `db.json`
- **Map:** Leaflet + OpenStreetMap tiles

---

## Prerequisites

- Node.js 24 and npm
- Angular CLI (`npm install -g @angular/cli`)

---

## Setup

```bash
npm install
```

This also installs Leaflet and its types, which the map feature depends on:

```bash
npm install leaflet
npm install -D @types/leaflet
```

---

## Running the app

You need **two terminals** running at the same time, the mock API and the
Angular dev server.

**Terminal 1 — mock API (json-server)**

```bash
npm run db

or

npx json-server --watch db.json --port 3000
```

This serves `db.json` at `http://localhost:3000`.

**Terminal 2 — Angular app**

```bash
ng serve
```

Then open `http://localhost:4200`.

---

## Test login

Use the seeded user in `db.json`:

| Email           | Password   |
| --------------- | ---------- |
| `test@test.com` | `test1234` |

---

## Project structure

```
src/app/
  core/
    models/          # User, Place, AuthUser interfaces
    services/        # AuthService, PlacesService
    guards/          # authGuard, guestGuard
    interceptors/     # authInterceptor
  shared/
    avatar/          # initials-fallback avatar component
  features/
    auth/login/      # login form
    profile/         # editable name, shared via AuthService's signal
    places/
      places-list/   # search + list, lazy-loaded
      place-details/ # details + map
      map/           # Leaflet wrapper
  app.routes.ts
  app.config.ts
src/environments/     # apiUrl config (never hardcoded in components)
db.json                # seeded users + places for json-server
```

---

## Features implemented

- **Auth (mocked):** reactive login form, validated against `db.json` users,
  fake token in `localStorage`, session persists across refresh, loading +
  error states, `authGuard` protects feature routes, `guestGuard` redirects
  an already-logged-in user away from `/login`, `authInterceptor` attaches
  the token to outgoing requests, logout clears the session.
- **Profile:** name/email/avatar, typed reactive form, `PATCH /users/{id}`,
  Save disabled while pristine/invalid, name updates reflected instantly in
  the header via a shared signal on `AuthService` — no reload needed.
- **Places list & details:** `GET /places`, debounced client-side search,
  explicit loading/empty/error states, lazy-loaded `/places` route, details
  route bound via `:id`, graceful "not found" handling for a bad id.
- **Map:** Leaflet + OSM tiles centered on the place, a second marker for
  the user's browser geolocation when permission is granted, degrades
  quietly on permission denial, map instance cleaned up on destroy.

---

## Assumptions

- **Mocked auth:** json-server has no real authentication endpoint, so login
  works by querying `GET /users?email=...&password=...` and checking for a
  single match. The "token" is a base64 string (`btoa(userId:timestamp)`) —
  good enough to demonstrate the `HttpInterceptor`/guard pattern, not real
  security.
- **Search:** the search box filters the already-fetched `/places` list
  client-side (debounced 500ms), rather than re-querying json-server per
  keystroke. With 20 seeded places this is simpler and just as
  responsive; a server-side `?name_like=` query would be the equivalent
  approach for a larger dataset.
- **Guest guard:** not required by the brief, but added so a logged-in user
  visiting `/login` directly is redirected to `/places` instead of seeing
  the form again.
- **Thumbnails:** place thumbnail URLs in db.json point to free Unsplash images.
  If Unsplash is ever unreachable or a URL changes, the list still renders. It
  just falls back to a broken image icon since no placeholder/fallback image is implemented.
- **Leaflet default marker icons:** Leaflet's built-in icon-path
  auto-detection doesn't play well with Angular's build output, causing
  404s or malformed URLs for the marker images. Fixed by copying the icon
  images into the app's static assets at build time and pointing
  `L.Icon.Default` at them directly (see `map.component.ts`).

---

## Troubleshooting

- **"Failed to fetch" / network errors in the app:** make sure json-server
  is running on port 3000 _before_ loading the app, and that
  `src/environments/environment.ts` / `environment.development.ts` point at
  `http://localhost:3000`.
- **Map markers don't appear / 404s for `marker-icon.png`:** confirm the
  Leaflet image assets entry is present in `angular.json`'s `assets`
  config, then restart `ng serve` (asset config changes require a restart,
  not just a save).
