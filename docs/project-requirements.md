# Project Requirements — Collaborative Video Review

> **Status:** Draft v1.0, ready to build · **Companion document:** [`architecture.md`](./architecture.md)
> **Working title:** *Video Review Workspace* (rename freely)

---

## 1. Summary

A web application where **companies review videos together in detail**. A member uploads a video, and any colleague can mark a **time range** (start → end) on it, attach a **comment** to that range, and see every comment listed below the player. Clicking a comment jumps the player to that moment.

This is deliberately **not** a YouTube clone. The product is about *precise, in-context feedback inside a private company workspace*. Catalog, upload and playback exist to support that.

The original assignment asked for: *upload/select a video → mark start/end timestamps → add a comment → save and display the annotation below the player.* Everything in **Level 1** below covers that and a little more. Levels 2–4 are optional growth.

---

## 2. Guiding principles

1. **Level 1 is the assignment.** It must be complete, polished, tested, and documented before any Level 2 work starts. A smaller feature set that works end to end beats a larger one that doesn't.
2. **Every level ends in a shippable state.** No level leaves the app half-broken.
3. **Multi-tenant from day one, single-tenant in practice.** All data belongs to a company, even though only one demo company exists until Level 4. This avoids a painful retrofit later.
4. **Security is a Level 1 requirement, not a Level 4 feature.** See §9 and the security section of `architecture.md`.
5. **Prefer boring technology** and a small number of moving parts.

### Priority levels

| Level | Meaning | Rough share of effort |
|---|---|---|
| **L1** | Core product and the assignment itself. Mandatory. | Most of the work |
| **L2** | Polish and completeness: what makes it feel like a real product | Medium |
| **L3** | Advanced features: screenshots, background uploads, processing pipeline | Large, technically harder |
| **L4** | Platform features: self-serve companies, invitations, enterprise hardening | Future work |

---

## 3. What I changed from your original brief

You gave me creative liberty, so here is every change and why. Push back on any of them.

| # | Change | Reason |
|---|---|---|
| 1 | **Routes are company-scoped and consolidated** (see §6). `catalog/videos/anything-else` and `catalog/<id>` become `/{company}/catalog` and `/{company}/catalog/{videoId}`. Upload moves under the company too. | Matches your own "company specific videos" goal and removes one redundant route. |
| 2 | **Company membership uses a real `Membership` model** (via Better Auth's *organization* plugin), not a `companyId` column on the user. | One user can later belong to several companies. The plugin already provides roles, invitations and slugs, which is most of Level 4 for free. |
| 4 | **Two landing pages clarified.** "Product specific landing page" and "Landing page" are treated as (a) a public marketing page at `/` and (b) a company home at `/{company}`. | Your list had two entries that overlap. **Please confirm this reading** (see §11). |
| 5 | **Cursor pagination is built in Level 1**, even though infinite scroll is Level 2. | Level 1 ships a simple "Load more" button on the same API. Level 2 swaps the UI only, with no backend rework. |
| 6 | **Security baseline added to Level 1** (new `SEC-*` requirements). | Retrofitting authorization and upload safety is expensive and error-prone. |
| 7 | **Added small but necessary features:** delete own annotation (L1); edit own annotation, delete own video, password reset, search (L2); replies (L2); resolve/unresolve (L3). | Review tools without these feel broken. Each is small. |
| 8 | **Video thumbnails placed in Level 2**, captured client-side at upload time. | Reuses the same frame-capture code needed for Level 3 screenshots. |
| 9 | **Level 4 expanded** with realistic platform features (invitations, RLS, 2FA, share links, etc.). | Gives the roadmap a coherent end state. |
| 10 | **Timestamps stored as integer milliseconds.** | Avoids floating-point drift; allows precise range checks and sorting. |

---

## 4. Users and roles

| Role | Description | Capabilities |
|---|---|---|
| **Visitor** | Not logged in | See the landing page (L2), sign up, log in |
| **Member** | Logged-in user in a company | View company videos, upload videos, create annotations, edit/delete **own** annotations and videos |

Until Level 4, every new account joins the **demo company** as a **Member**. A seed script creates one Owner for the demo company.

### Terminology

- **Company**: a workspace that owns videos. (Implemented as a Better Auth *organization*.)
- **Video**: an uploaded file plus its metadata.
- **Annotation**: a comment attached to a time range `[startMs, endMs]` on one video.
- **Reply**: a response to an annotation (L2).

---

## 5. Product scope at a glance

```
L1  Auth · Catalog · Upload · Watch · Annotate · List annotations · Security baseline
L2  Profile · Landing/company home · Infinite scroll · Thumbnails · Search · Replies · Edit/delete · Email flows
L3  Screenshots on annotations · Background uploader · Processing pipeline · Resolve · Audit log
L4  Create/join companies · Invitations & roles · @mentions · Share links · RLS · 2FA/SSO · Managed streaming
```

---

## 6. Route map

| Route | Purpose | Auth | Level |
|---|---|---|---|
| `/` | Public marketing landing page (redirects to your company catalog when logged in) | Public | L2 (L1: simple redirect/login page) |
| `/login`, `/signup` | Authentication | Public | L1 |
| `/{company}` | Company home: recent videos and activity | Member | L2 |
| `/{company}/catalog` | Grid of all company videos | Member | L1 |
| `/{company}/catalog/{videoId}` | Watch + annotate one video | Member | L1 |
| `/{company}/upload` | Upload form | Member | L1 |
| `/settings` | Account settings (name, password) | Member | L2 |

**Notes**

- Visiting `/{company}/…` as a non-member returns **404**, not 403, so the existence of other companies is not revealed.

---

## 7. Functional requirements

Each requirement has an ID so it can be referenced in commits, tests and the README.

### 7.1 Level 1: Core (the assignment)

#### Authentication

| ID | Requirement | Acceptance criteria |
|---|---|---|
| AUTH-1 | Sign up with name, email, password | Valid input creates the account, logs the user in, and adds them to the demo company as Member. Duplicate email shows a clear, non-leaky error. |
| AUTH-2 | Log in and log out | Session persists across refreshes. Logging out invalidates the session server-side. |
| AUTH-3 | Protected routes | Unauthenticated access to any `/{company}/…` route redirects to `/login` and returns the user to the original page afterwards (relative paths only). |
| AUTH-4 | Password rules | Minimum 10 characters, maximum 128, no composition rules (they reduce security). |

#### Catalog

| ID | Requirement | Acceptance criteria |
|---|---|---|
| CAT-1 | Company video grid at `/{company}/catalog` | Shows the company's videos, newest first: title, uploader, upload date, duration, annotation count. |
| CAT-2 | Pagination | Cursor-based, 12–24 per page, with a "Load more" button (L2 replaces it with infinite scroll). |
| CAT-3 | States | Empty state with an upload call-to-action, loading skeletons, and an error state with retry. |
| CAT-4 | Visibility | Only `READY` videos are listed to everyone. The uploader also sees their own `UPLOADING`/`FAILED` videos with a status badge. |

#### Upload

| ID | Requirement | Acceptance criteria |
|---|---|---|
| UP-1 | Upload form at `/{company}/upload` | Fields: **title** (required, 3–120 chars), **description** (optional, ≤ 1000 chars), **video file** (required). Inline validation errors. |
| UP-2 | File rules | MP4 and WebM only; maximum 500 MB (configurable). Checked in the browser for fast feedback **and** again on the server. |
| UP-3 | Direct-to-storage upload | The browser uploads straight to object storage using a short-lived presigned URL. **The Next.js server never receives the video bytes.** |
| UP-4 | Progress and cancel | Visible progress bar with percentage, a cancel button, and a clear error with retry on failure. |
| UP-5 | Post-upload verification | The server confirms the stored object's size, content type and file signature (magic bytes) before marking the video `READY`. |
| UP-6 | Completion | On success, redirect to the new video page. |

#### Watch page

| ID | Requirement | Acceptance criteria |
|---|---|---|
| VID-1 | Video page at `/{company}/catalog/{videoId}` | Player with native controls, title, uploader, date, description. |
| VID-2 | Access control | Non-members and non-existent IDs both get 404. |
| VID-3 | Seeking | Seeking anywhere in the video works (HTTP range requests supported by storage). |
| VID-4 | Expiring playback URL | If the playback URL expires mid-session, the player silently fetches a fresh one and resumes at the same position. |

#### Annotations: the heart of the product

| ID | Requirement | Acceptance criteria |
|---|---|---|
| ANN-1 | Mark start / mark end | Two buttons capture the player's current time. The captured times are also editable as text (`mm:ss.SSS`). |
| ANN-2 | Comment | Required, 1–2000 characters, plain text. |
| ANN-3 | Range validation | `0 ≤ start < end ≤ video duration`. Enforced in the UI (disabled Save + message) **and** on the server (the server is the authority). |
| ANN-4 | Save and display | After saving, the annotation appears in the list below the player without a full page reload. Form resets. |
| ANN-5 | Annotation list below player | Sorted by start time. Each item shows range (`00:12 – 00:20`), author, relative time, and comment. |
| ANN-6 | Jump to annotation | Clicking an item seeks to its start and plays; playback pauses at its end. |
| ANN-7 | Timeline track | A strip under the player draws every annotation as a range bar. Overlapping annotations stack in lanes. The active one(s) are highlighted during playback. Clicking a bar behaves like ANN-6. |
| ANN-8 | Delete own annotation | Author (or Admin/Owner) can delete with confirmation. |

#### Platform and quality

| ID | Requirement | Acceptance criteria |
|---|---|---|
| PLT-1 | One-command local setup | `docker compose up` starts PostgreSQL and MinIO (S3-compatible). README steps get a fresh clone running. |
| PLT-2 | Seed data | A seed script creates the demo company, two demo users and a sample video. |
| PLT-3 | Responsive and accessible | Usable at 360 px width. Keyboard operable. Visible focus. Timeline bars are real buttons with descriptive labels. |
| PLT-4 | Tests | Unit tests for annotation validation, time parsing/formatting and authorization policies. One end-to-end test for the happy path (sign up → upload → annotate → see it listed). |
| PLT-5 | README | Setup, a short architecture overview with diagram, key decisions, known limitations. (Outline in `architecture.md` §19.) |

### 7.2 Level 2: Polish and completeness

| ID | Requirement | Notes |
|---|---|---|
| PRO-1 | Profile page `/{company}/profile` | Two tabs: *My uploads* and *My annotations* (each links to the exact timestamp). Cursor-paginated. |
| MKT-1 | Marketing landing page `/` | Value proposition, short feature tour, sign-up CTA. Logged-in users are redirected to their company. |
| MKT-2 | Company home `/{company}` | Recent videos and recent annotations across the company. |
| CAT-5 | Infinite scroll | On the catalog, the annotation list, and profile lists. Same cursor API as L1. |
| CAT-6 | Thumbnails | Poster image captured client-side at upload (a frame near 1 s) and uploaded alongside the video. |
| CAT-7 | Search and sort | Title search; sort by newest / most annotated. |
| ANN-9 | Edit own annotation | Text and range. Shows an "edited" marker. |
| ANN-10 | Replies | One level of replies under an annotation. |
| ANN-11 | Loop and keyboard shortcuts | "Loop this range" toggle. `[` sets start, `]` sets end, `Esc` clears. Shortcuts are disabled while typing. |
| VID-5 | Delete own video | Uploader or Admin. Removes storage objects, annotations and replies. |
| AUTH-5 | Email verification and password reset | Via a transactional email provider (Mailpit locally). |
| AUTH-6 | Breached-password check | Reject passwords known from public breaches. |
| AUTH-7 | Account settings | Change name and password; list and revoke active sessions. |
| SEC-8 | Hardening round | CSP enforced (was report-only), write-endpoint rate limits, per-user upload quotas. See §9. |

### 7.3 Level 3: Advanced

| ID | Requirement | Notes |
|---|---|---|
| SHOT-1 | Screenshot on annotation | "Attach frame" captures the video frame at the range start (or current time), shown as a thumbnail in the annotation, with a lightbox. |
| SHOT-2 | Optional markup on screenshot | Draw a rectangle or arrow over the frame before saving. *(Stretch)* |
| UPL-1 | Background uploader | Uploads continue while the user navigates around the app. A global indicator shows progress; multiple uploads queue. |
| UPL-2 | Resumable multipart uploads | Large files are uploaded in parts; a failed part retries without restarting. Resume after page reload. *(Stretch)* |
| PIPE-1 | Processing pipeline | A background worker validates, extracts metadata (duration, resolution, fps, codecs), transcodes to a browser-safe MP4, and creates a poster. Videos move `UPLOADING → PROCESSING → READY / FAILED`. |
| PIPE-2 | Processing status in UI | "Processing…" badge, auto-updates when ready. |
| ANN-12 | Resolve / unresolve | Mark an annotation resolved; filter by open/resolved. |
| OPS-1 | Audit log | Records uploads, deletions, role changes, and failed authorization attempts. |
| OPS-2 | Scheduled cleanup | Removes abandoned uploads and orphaned files. |
| OPS-3 | Error monitoring | Sentry (or equivalent) on the web app and the worker. |

### 7.4 Level 4: Platform

| ID | Requirement |
|---|---|
| ORG-1 | Self-serve company creation; creator becomes Owner |
| ORG-2 | Invite members by email; accept/decline; expiring invitations |
| ORG-3 | Role management (Owner / Admin / Member); remove members; leave company |
| ORG-4 | Company switcher for users in multiple companies |
| ORG-5 | Company settings (name, slug, logo) |
| NTF-1 | `@mentions` with in-app and email notifications |
| NTF-2 | Live updates of new annotations (server-sent events) |
| SHR-1 | Expiring share links for external reviewers (view + comment only) |
| EXP-1 | Export annotations as CSV or PDF |
| VER-1 | Video versions (v1, v2) with comments carried per version |
| STR-1 | Adaptive streaming (HLS) and CDN with signed cookies, or a managed video service |
| SEC-10 | Postgres Row-Level Security, 2FA (TOTP), SSO (OIDC/SAML), malware scanning of uploads, external security review |
| BIL-1 | Storage quotas per company *(only if monetising)* |

---

## 8. Non-functional requirements

| Area | Requirement |
|---|---|
| **Performance** | Catalog and video pages render the first useful content in under ~2 s on a normal connection. List endpoints always paginate, with a hard cap (≤ 50 items). Video bytes never pass through the app server. Playback starts quickly (MP4 with metadata at the front). |
| **Scalability** | Stateless web tier (horizontally scalable). Storage and processing scale independently of the web app. Database indexes for every list query (see `architecture.md` §6). |
| **Reliability** | Uploads tolerate failures (retry, cleanup). Abandoned uploads never leave orphaned records or files. Background jobs are idempotent and retried with backoff. |
| **Security** | See §9 and `architecture.md` §17. |

### Default limits (all configurable via environment)

| Item | L1 | Later |
|---|---|---|
| Video size | 500 MB | 2 GB with multipart (L3) |
| Video formats | MP4, WebM | Any common format, transcoded (L3) |
| Title / description / comment | 120 / 1000 / 2000 chars | |
| Annotations per video | 1000 | |
| Screenshot | n/a | JPEG or WebP, ≤ 2 MB |
| Upload URL lifetime | 15 minutes | |
| Playback URL lifetime | 1 hour | |
| Uploads per user per day | 10 | Quota by total storage (L2) |
| Page size | 12–24 videos, 20–30 annotations | Max 50 |

---

## 9. Security requirements

Full design is in `architecture.md` §17. These are the **requirements** the design must satisfy.

| ID | Requirement | Level |
|---|---|---|
| SEC-1 | Every read and write is authorized **on the server**, scoped to the user's company. Cross-company access returns 404. | L1 |
| SEC-2 | Object storage is private. Uploads and downloads use short-lived presigned URLs. No public objects, no public listing. | L1 |
| SEC-3 | All input is validated server-side with a schema. User text is rendered as text (escaped), never as HTML. | L1 |
| SEC-4 | Secure, HTTP-only, SameSite session cookies. CSRF protection. Standard security headers; CSP in report-only mode. | L1 |
| SEC-5 | Passwords hashed with a modern algorithm. Generic auth error messages. Rate limiting on sign-in and sign-up. | L1 |
| SEC-6 | Secrets only in environment variables, validated at startup, never committed. `.env.example` documents them. | L1 |
| SEC-7 | Uploaded files are verified (size, declared type, file signature) before use. Filenames from users are never used in storage paths. | L1 |
| SEC-8 | CSP enforced. Email verification. Breached-password check. Rate limits and quotas on write endpoints. | L2 |
| SEC-9 | Images re-encoded server-side. Media processing isolated in a locked-down worker. Audit log. Dependency and secret scanning in CI. | L3 |
| SEC-10 | Row-Level Security, 2FA, SSO, malware scanning, signed CDN access, external review. | L4 |

---

## 10. Out of scope

- Live streaming, video editing, screen recording
- Public, cross-company video discovery (explicitly *not* a YouTube clone)
- Mobile native apps
- Payments and billing (unless L4 monetisation is pursued)
- AI features (auto-transcripts, summaries). Possible future direction, not planned

---

## 13. Suggested build order

**Level 1** (in this order; each step is testable on its own)

1. Project scaffold: Next.js, TypeScript strict, Tailwind, lint, env validation, PostgreSQL (Neon), Cloudflare R2
2. Database schema, Prisma migration, seed script
3. Auth with Better Auth + demo-company auto-join + route protection
4. Authorization helper (`requireMembership`) and the scoped data-access layer, **with cross-tenant tests**
5. Storage service (presign PUT/GET) + upload flow with verification
6. Catalog page with cursor pagination
7. Video page with player and playback-URL refresh
8. Annotation create/list/delete, validation, timeline track
9. Polish: states, accessibility, responsive
10. Tests, README, security checklist pass

**Then:** Level 2 security items (SEC-8) → profile and infinite scroll → thumbnails and search → replies and edits → landing pages → email flows.
