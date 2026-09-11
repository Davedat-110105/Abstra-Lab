# Astra Labs website

Public site and member dashboard for Astra Labs, the student rocketry club at
Seneca Polytechnic (Team 06, Launch Canada 2026). Live at
<https://astralab.space>.

- **Stack:** Next.js 16 (App Router) · React 19 · Prisma 6 · PostgreSQL (Neon) · S3-compatible uploads
- **Hosting:** Vercel project `astra-lab`, production domain `astralab.space`
- **Code:** <https://github.com/Davedat-110105/Abstra-Lab>

## Quick start (new developer)

You need Node.js 22 or newer and npm. You do **not** need Docker; the database
is a hosted Neon Postgres.

```sh
git clone https://github.com/Davedat-110105/Abstra-Lab.git
cd Abstra-Lab
npm install
cp .env.example .env.local
```

Open `.env.local` and set at least:

| Variable | What to put |
|---|---|
| `DATABASE_URL` | The Neon connection string. Ask Dat or pull it with `vercel env pull` (see below). |
| `AUTH_SECRET` | Any long random string for local dev, e.g. `openssl rand -base64 48`. |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` |

Then:

```sh
npm run db:generate   # builds the Prisma client from prisma/schema.prisma
npm run dev           # http://localhost:3000
```

All public pages work with no database at all. Login, signup, and the
dashboard need `DATABASE_URL`.

If you have access to the Vercel project, the fastest way to get every
variable is:

```sh
npm i -g vercel
vercel link            # pick team "daveta", project "astra-lab"
vercel env pull .env.local
```

## Project layout

```
app/
  page.tsx               Home
  content.ts             All site copy, galleries, partners, judging phases,
                         Discord invite, contact details. Edit this first.
  page-sections.tsx      Shared building blocks (PageHero, Rows, Gallery, SectionPage)
  site-shell.tsx         Header, burger menu (navItems), footer
  globals.css            Every style. No Tailwind.
  seo.ts / sitemap.ts / robots.ts
  pioneer/               Vehicle page: subsystems, projects (#projects), judging, galleries
  launch-canada/         Competition page: judging phases, scoring, gallery, video clips
  sponsorship/           Sponsor deck, tiers, supporter logos  (/sponsor redirects here)
  contact/  about/  join/  events/  posts/  members/  discord/
  accounts/              login, signup, pending (server actions)
  dashboard/             Member area; dashboard/staff/ is the admin CMS
  api/                   auth, upload, files, telemetry, public feeds
lib/
  accounts.ts            registerUser / authenticate, master-admin promotion
  auth.ts                Session cookie (HMAC), password hashing, requireUser/requireStaff
  prisma.ts  s3.ts  rate-limit.ts
prisma/
  schema.prisma          User, MemberProfile, BlogPost, ClubEvent, BuildMaterial,
                         LibraryFolder/Asset, TelemetryFrame
  sql/                   Hand-run SQL notes (dated)
public/
  images/pick/           Site photography (resized to 1920px, EXIF stripped)
  media/events/          Video clips + posters
  docs/                  Sponsorship package PDF
scripts/
  e2e-smoke.mjs          Dependency-free end-to-end check (see Testing)
```

## Editing content

Almost everything a non-developer would want to change lives in
[`app/content.ts`](app/content.ts):

- **Galleries** are arrays of `[image, title, caption, modifier]`. `image` is a
  path under `public/images/`. `modifier` is `""`, `"wide"` (2 columns),
  `"tall"` (2 rows), or `"feature"` (2×2, use once per gallery, first item).
- **Menu items** are `navItems` in `app/site-shell.tsx`.
- **Discord invite** is `discordInviteUrl`. The env var
  `NEXT_PUBLIC_DISCORD_INVITE_URL` overrides it without a code change.
- **Contact email / LinkedIn / campus address** are in `contact`.
- **Judging phases and scoring** for Launch Canada are `judgingPhases` and
  `launchCanada`, sourced from the 2026 Rules & Requirements Guide.

### Adding photos

Never commit phone originals. They are 3–12 MB and carry GPS coordinates.
Resize and strip metadata first (ImageMagick):

```sh
magick "IMG_1234.jpg" -auto-orient -resize 1920x1920 -strip -quality 82 public/images/pick/my-photo.jpg
```

Then reference it as `"pick/my-photo.jpg"` in a gallery array.

### Adding video clips

```sh
ffmpeg -y -i clip.mp4 -map_metadata -1 -vf "scale=-2:720" -c:v libx264 -preset slow -crf 23 \
  -pix_fmt yuv420p -c:a aac -b:a 96k -movflags +faststart public/media/events/2026/08/clip.mp4
ffmpeg -y -ss 1 -i public/media/events/2026/08/clip.mp4 -frames:v 1 -q:v 4 public/media/events/2026/08/clip.jpg
```

Portrait clips: use `scale=720:-2` instead. Add the entry to
`app/launch-canada/videos.tsx`.

## Accounts, roles, and the master admin

- Anyone can sign up at `/accounts/signup`. New accounts are **inactive** until
  a staff member approves them at `/dashboard/staff`.
- Roles: **Member** (dashboard, resources), **Staff** (`isStaff`: manage posts,
  events, resources, approve members), **Admin** (`isSuperuser`: same as staff,
  shown as "Admin").
- **Master admin.** `ADMIN_EMAILS` (comma-separated, default
  `saipdhodi@gmail.com`) lists accounts that are always active + staff +
  superuser. A signup with one of these emails is created that way, and an
  existing account is promoted the next time it logs in. Nothing has to be done
  in the database. `prisma/sql/2026-09-09-master-admin.sql` does the same
  promotion by hand if you ever need it.
- To make another person staff, an existing staff member approves them, then
  flip `is_staff` in the `auth_user` table (Neon console → SQL editor):
  `UPDATE auth_user SET is_staff = TRUE WHERE email = 'person@example.com';`

## Publishing posts and events

Log in, open **Dashboard → Staff**, and use *New post* / *New event* /
*New resource*. Posts have a slug, body, optional featured image, and a
published flag; events have a start time and location. Public feeds:
`/posts`, `/events`, and JSON at `/api/public/posts` and `/api/public/events`.

Image fields take a URL path. Upload the file first with `POST /api/upload`
(multipart, field `file`, optional `visibility=public`) or drop it under
`public/` and reference it directly.

## Database

Hosted on Neon (free tier). Prisma reads `DATABASE_URL`.

```sh
npm run db:generate   # regenerate client after editing schema.prisma
npm run db:push       # push schema changes to the database (dev / small changes)
npm run db:migrate    # create a migration (preferred for anything shared)
```

Table names are mapped to the original Django names (`auth_user`,
`core_memberprofile`, …) so the data carried over from the old site. Don't rename
them.

## Deploying

Production deploys happen from the Vercel CLI on your machine. There is no Git
auto-deploy configured.

```sh
vercel --prod
```

That uploads the current working tree (committed or not) and promotes it to
`astralab.space`. The `astra-lab-daveta.vercel.app` alias sits behind Vercel
login; that's expected.

Production environment variables live in Vercel → Project → Settings →
Environment Variables. Required there:

| Variable | Notes |
|---|---|
| `DATABASE_URL` | Neon pooled connection string |
| `AUTH_SECRET` | Long random string; the app refuses to start sessions without it |
| `NEXT_PUBLIC_SITE_URL` | `https://astralab.space` (canonical links, OG images, sitemap) |
| `TELEMETRY_INGEST_TOKEN` | Bearer token for the telemetry API |
| `S3_BUCKET`, `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` | For private uploads |
| `ADMIN_EMAILS` | Optional override of the master-admin list |
| `NEXT_PUBLIC_DISCORD_INVITE_URL` | Optional override of the Discord invite |

Check the deploy afterwards with the smoke test (next section) pointed at the
live domain.

## Testing

```sh
npm run typecheck                                   # tsc
npm run build                                       # full production build
npm run e2e                                         # smoke test against http://localhost:3005
BASE_URL=https://astralab.space npm run e2e         # same, against production
```

`scripts/e2e-smoke.mjs` has no dependencies. It fetches every public route,
checks the redirects, menu items, sitemap, every linked image and asset, and
that auth stays closed. It never signs up, logs in, or writes to the database.
If you add a page, add it to `PUBLIC_ROUTES` in that file.

## Optional: local Docker stack

`docker-compose.yml` brings up a local Postgres and SeaweedFS (S3-compatible)
for fully offline work. It is not needed for normal development. See the
comments in `.env.example` for the matching `S3_ENDPOINT` settings.

## Handover: services, owners, and decommissioning

Everything the site depends on is listed here so ownership can be transferred
to the club and the old accounts shut down cleanly. Work top to bottom; each
step is safe to do on its own, and the site keeps running throughout.

### Service inventory

| Service | What it does | Currently under | Transfer to |
|---|---|---|---|
| **GitHub** `Davedat-110105/Abstra-Lab` | Source code | Dat's personal GitHub | A club-owned GitHub org (e.g. `astra-labs-seneca`) |
| **Vercel** team `daveta`, project `astra-lab` | Builds and hosts the site | Dat's Vercel team | A club Vercel team with Saiprasad as owner |
| **Domain** `astralab.space` | Public address | Porkbun, Dat's account (renews 2027-01-16) | Club Porkbun account, or the club's Vercel team via domain transfer |
| **Neon** Postgres, project host `ep-young-cake-atfmjd19` (us-east-1) | Users, posts, events, telemetry | Dat's Neon account | Club Neon account (free tier is enough) |
| **AWS S3** bucket `astra-labs-uploads`, `ca-central-1` | Private member uploads | Dat's AWS account | Club AWS account, or drop S3 entirely (see below) |
| **Discord** server (invite `discord.gg/zazwB3bx2N`) | Member chat | Saiprasad (club) | Already club-owned. Make sure the invite is set to never expire. |
| **Forgejo** `forgejo.homeserverlocal.com` | Dat's private git mirror | Dat's home server | Nothing. Remove the remote and decommission. |
| **Astra Labs email** `astralabsengineering@gmail.com` | Public contact | Club | Already club-owned. |

### Transfer order

**1. GitHub.** Create the club org, then on the repo: Settings → General →
Transfer ownership. Every collaborator re-clones or updates `origin`. This
is the master copy; do it first so nothing else points at a personal account.

**2. Vercel.** In the club's Vercel team: *Add New → Project → Import* the
repo from the club GitHub org. Copy every environment variable from the table
in *Deploying* (values from the old project: Settings → Environment
Variables, or `vercel env pull`). Enable Git deploys on `main` if the club
wants push-to-deploy. Verify with a preview deploy and
`BASE_URL=<preview-url> npm run e2e`. Then move the domain (step 3) and delete
the old project from the `daveta` team.

**3. Domain.** Two options. *Keep Porkbun:* transfer `astralab.space` to a
club Porkbun account (Porkbun → Domain Management → Transfer to another
account; no downtime, DNS stays). *Move to Vercel:* Vercel → Domains →
Transfer In, which needs the auth code from Porkbun and takes up to 5 days.
Either way, in the new Vercel project add `astralab.space` and
`www.astralab.space` under Settings → Domains; the existing A/CNAME records
(`64.29.17.1`, `216.198.79.1`, `*.vercel-dns-017.com`) already point at
Vercel and keep working.

**4. Database.** Neon supports moving a project between accounts: Neon
console → Project → Settings → *Transfer project* to the club's org. No data
copy, no new connection string. If that is unavailable, do a dump/restore:

```sh
pg_dump "$OLD_DATABASE_URL" --no-owner --no-privileges -Fc -f astra.dump
pg_restore --no-owner --no-privileges -d "$NEW_DATABASE_URL" astra.dump
```

then update `DATABASE_URL` in Vercel and redeploy. Do this during a quiet hour;
anything written between dump and switch is lost. Keep the old Neon project for
a week as a fallback, then delete it.

**5. Uploads (S3).** Only private member files live in S3; public images are
in the repo. Check whether anything is actually there first:

```sh
aws s3 ls s3://astra-labs-uploads --recursive --summarize
```

If it is empty or nearly so, the simplest path is to create a fresh bucket in
the club's AWS account (same name is fine in a different account only if the
old one is deleted first), set the four `S3_*`/`AWS_*` variables in Vercel, and
copy with `aws s3 sync s3://old-bucket s3://new-bucket`. If the club does not
want an AWS account, leave `S3_BUCKET` unset: public uploads still work,
private uploads are refused, and the site otherwise runs unchanged.

**6. Master admin.** Once Saiprasad has logged in once, he is active + staff +
superuser (see *Accounts*). Add any other lead to `ADMIN_EMAILS` in Vercel,
or promote them from `/dashboard/staff`. Then rotate `AUTH_SECRET` and
`TELEMETRY_INGEST_TOKEN` in Vercel so old copies of the secrets stop working
(rotating `AUTH_SECRET` logs everyone out once, which is fine).

### Decommission checklist (after the transfer is verified)

Run `BASE_URL=https://astralab.space npm run e2e` and have Saiprasad log in
and publish a test post before touching anything below.

- [ ] Delete Vercel project `astra-lab` from team `daveta`
- [ ] Delete the old Neon project (after the one-week fallback window)
- [ ] Empty and delete S3 bucket `astra-labs-uploads` in the old AWS account; delete its IAM user/keys
- [ ] Remove Dat as collaborator/owner on the GitHub repo and Vercel team
- [ ] `git remote remove forgejo` in every clone; shut down the Forgejo mirror
- [ ] Delete `.env.local` copies of the old secrets from personal machines
- [ ] Confirm the domain renewal payment method belongs to the club
- [ ] Update the *Deploying* table in this README with the new team/project names

### Local Docker stack is not part of production

`docker-compose.yml`, the `Dockerfile`, and `docker/` are for offline
development or self-hosting only. Nothing in production uses them. They can be
deleted if the club never intends to self-host.

## Ground-station telemetry

`POST /api/telemetry` (or `/api/telemetry/frames`) receives a JSON telemetry
frame and stores it in Postgres. The route refuses writes when
`TELEMETRY_INGEST_TOKEN` is absent.

```sh
curl -X POST 'https://astralab.space/api/telemetry' \
  -H 'Authorization: Bearer <TELEMETRY_INGEST_TOKEN>' \
  -H 'Content-Type: application/json' \
  --data '{
    "ground_station": "pi-range-01",
    "sequence_number": 42,
    "rocket_time_ms": 123456,
    "altitude_m": 517.2,
    "velocity_mps": 81.4,
    "battery_v": 11.9,
    "rssi_dbm": -97
  }'
```

The endpoint accepts `snake_case` or `camelCase` telemetry fields, plus the
ground-station envelope (`station_id`, `type`, and `payload.seq` / `payload.alt`
/ `payload.rssi`). It preserves the full envelope in `raw`, returns `201` with
the stored frame ID, and `GET /api/telemetry/latest` returns the newest 25 frames.

## Reference material

`references/` (git-ignored) holds the Launch Canada rules, DTEG, design report
templates, BOMs, and team docs. Ask a team lead for a copy; it is not in the
repo.
