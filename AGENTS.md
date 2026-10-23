# AGENTS.md

Read this first. For depth, see [`project-requirements.md`](./project-requirements.md) (what to build) and [`architecture.md`](./architecture.md) (how). If this file and those documents disagree, the documents win. Then fix this file.

## Project in one paragraph

A multi-tenant web app where companies review videos together. Members upload a video, mark a **start/end time range**, attach a **comment**, and see all annotations below the player. Stack: **Next.js (App Router, TypeScript strict), Prisma + PostgreSQL, Better Auth (organization plugin), S3-compatible storage (MinIO locally), Zod, Tailwind + shadcn/ui**. Levels 2–3 add TanStack Query, a `pg-boss` worker (ffmpeg, sharp) and Sentry.

## Current scope

Work only on the level the maintainer has said is active (default: **Level 1**). Do not start Level 2+ features early. Requirement IDs (`ANN-3`, `SEC-2`, …) are in `project-requirements.md`; reference them in commits and tests.


## Non-negotiable rules

These exist for security and correctness. Violating them is a bug even if the app appears to work.

### Authorization and tenancy
1. **Every server action and route handler** runs in this order: **validate (zod) → session → membership (`requireMembership(slug)`) → policy → act.** Server actions are public HTTP endpoints.
2. **Every data function takes a `ctx`** and filters by `organizationId: ctx.org.id` (plus `deletedAt: null` where relevant). A function that accepts an ID but no `ctx` is a bug.
3. **Never rely on middleware or layouts for authorization.** They may redirect for convenience only.
4. Foreign or missing resources return **404**, never 403.
5. Adding an endpoint means adding it to the **cross-tenant test suite**.

### Storage and uploads
6. **Video bytes never go through the Next.js server.** Browser ⇄ storage via presigned URLs only.
7. The bucket is private. Presigned URLs are short-lived (upload 15 min, playback 1 h), are **never logged**, and are **never stored**. Store the object **key**, sign on demand.
8. Storage keys are built by `server/storage/keys.ts`. **Never use a user-supplied filename** in a key; derive the extension from the validated content type.
9. After upload, verify size, content type and **magic bytes** before marking a video `READY`.
10. Screenshots (L3): only JPEG/WebP, always re-encoded with `sharp`. Never SVG.

## Known gotchas

- **R2 does not support presigned POST.** Use presigned **PUT** with signed `Content-Type`/`Content-Length`, plus post-upload verification.
- **CORS:** the bucket must allow the app origin (`GET, HEAD, PUT`, expose `ETag`). Missing CORS breaks uploads and canvas screenshots silently.
- **CSP:** the storage origin must be listed in `media-src`, `img-src` and `connect-src`.
- **Timeline vs list:** the timeline needs **all** annotation ranges (lightweight endpoint); the list is paginated. Don't derive the timeline from the paginated list.
- **`currentTime` is not frame-accurate** and `timeupdate` is slow. Use `requestVideoFrameCallback` (fallback `requestAnimationFrame`) for pause-at-end and capture.
- **Demo company is shared** until Level 4. Keep the demo banner visible. Don't build features that assume company privacy among sign-ups.

## Definition of done

- [ ] Meets the requirement's acceptance criteria
- [ ] zod validation, session, membership and policy checks present
- [ ] Loading/empty/error states; keyboard and mobile (360 px) usable
- [ ] No new secrets, logs of sensitive data, or unreviewed dependencies
- [ ] Docs and `.env.example` updated if needed