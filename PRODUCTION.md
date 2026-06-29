# JUCSO Production Checklist

Use this before opening the portal to real students and staff.

## Launch readiness

| Item | Status | Action |
|------|--------|--------|
| Pilot / UAT | Ready | Core flows work on Railway |
| Full campus production | Not yet | Complete blockers below |

---

## 1. Railway — API (`jucso-api`)

### Required variables

| Variable | Production value |
|----------|------------------|
| `DEBUG` | `false` |
| `DJANGO_SECRET_KEY` | Long random string (`openssl rand -base64 48`) |
| `ALLOWED_HOSTS` | `jucso-api-production.up.railway.app,.railway.app` |
| `DATABASE_URL` | Reference from PostgreSQL service |
| `CORS_ALLOWED_ORIGINS` | `https://jucso-web-production.up.railway.app` |
| `CSRF_TRUSTED_ORIGINS` | `https://jucso-web-production.up.railway.app,https://jucso-api-production.up.railway.app` |
| `SECURE_SSL_REDIRECT` | `false` (Railway terminates SSL at the proxy) |
| `SEED_DATA` | `false` after initial setup |

### Seed data (one-time only)

1. Set `SEED_DATA=true` on Railway API service
2. Redeploy once to load ministries, demo users, and sample content
3. Set `SEED_DATA=false` immediately and redeploy again

Or run manually in Railway shell:

```bash
python manage.py seed_jucso
```

**Never** leave `SEED_DATA=true` in production after go-live. Deploys no longer auto-seed by default.

### First-time admin password

After seeding, change the default admin password:

```bash
python manage.py changepassword ADMIN/001
```

Or create a new admin via Django admin and deactivate `ADMIN/001`.

### Health checks

- `GET /` → `{"status":"ok",...}`
- `GET /api/health/` → `{"status":"ok","service":"jucso-api"}`

Monitor with [UptimeRobot](https://uptimerobot.com) or similar on `/api/health/`.

### Scheduled jobs (nightly)

Configure a Railway cron service or external scheduler:

```bash
# JSON export (store output in object storage or attach to ticket)
python manage.py export_portal_backup --output /tmp/jucso-backup.json

# Email ministers/leadership about complaints past SLA
python manage.py notify_overdue_complaints
```

Also set `COMPLAINT_SLA_DAYS=7`, `SUGGESTION_SLA_DAYS=7`, `EVENT_REMINDER_DAYS=1`, `ADMIN_NOTIFICATION_EMAIL=admin@jucso.ac.tz`, and optional `SENTRY_DSN` for error monitoring.

### Railway cron service

1. Duplicate the API service or add a new service from the same repo (`jucso-api`).
2. Point it at `railway.cron.toml` (config-as-code) or set:
   - **Cron schedule:** `0 2 * * *` (2 AM daily)
   - **Start command:** `sh scripts/run_daily_jobs.sh`
3. Share the same env vars as the main API (`DATABASE_URL`, SMTP, etc.).
4. Set `BACKUP_OUTPUT_PATH=/tmp/jucso-backup.json` (or mount volume if you persist backups).

The daily job runs export, overdue complaint alerts, overdue suggestion alerts, and event reminders. Results appear in **Admin → System → View Job Logs**.

---

## 2. Railway — Web (`jucso-web`)

| Variable | Value |
|----------|--------|
| `VITE_API_URL` | `https://jucso-api-production.up.railway.app` |

Redeploy after changing `VITE_API_URL` (it is baked in at build time).

---

## 3. Security before go-live

- [ ] `DEBUG=false` on API
- [ ] Strong `DJANGO_SECRET_KEY` (not the example value)
- [ ] `SEED_DATA=false` on API
- [ ] Change or remove demo accounts (`ADMIN/001`, `JUC/2024/001`, ministers)
- [ ] Confirm demo login hints are hidden in production build
- [ ] Enable Railway PostgreSQL automated backups
- [ ] Restrict `CORS_ALLOWED_ORIGINS` to your real web URL only

---

## 4. Feature status

| Feature | Status |
|---------|--------|
| Forgot / reset password | ✅ Built — configure SMTP on API |
| Email / SMS notifications | ✅ Built — configure SMTP + Africa's Talking on API |
| Public complaint tracking + activity timeline | ✅ Built |
| Complaint SLA (7-day) + overdue alerts | ✅ Built — cron: `notify_overdue_complaints` |
| Suggestion SLA (7-day) + overdue alerts | ✅ Built — cron: `notify_overdue_suggestions` |
| Event registration reminders | ✅ Built — cron: `send_event_reminders` (default: 1 day before) |
| Complaint escalation to executive | ✅ Built — minister dashboard + activity log |
| Student email verification | ✅ Built |
| College registry verification | ✅ Built — set `STUDENT_REGISTRY_CSV` or `STUDENT_REGISTRY_API_URL` |
| Transparency reports + suggestion stats | ✅ Built |
| Public clubs & events pages | ✅ Built |
| Admin staff edit (role/ministry) | ✅ Built |
| Admin system panel (backup, security, cron logs, metrics) | ✅ Built |
| Swahili / English (public + dashboards) | ✅ Built — auth, contact, track, footer, status labels |
| PWA / Add to Home Screen | ✅ Built |
| Scheduled backup export | ✅ Built — cron: `export_portal_backup` via `run_daily_jobs.sh` |
| Playwright E2E smoke tests | ✅ Built — `npm run test:e2e` |
| Rate limiting + optional Sentry | ✅ Built |
| Site-wide announcement banner | ✅ Built — Admin → System |
| In-app notification center | ✅ Built — bell icon when signed in |
| News article detail pages | ✅ Built — `/news/N01` |
| Events calendar export (.ics) | ✅ Built — Events page download link |
| Complaint satisfaction ratings | ✅ Built — students rate resolved complaints; shown on transparency page |
| Club/event attendee lists | ✅ Built — Admin → Content → Members / Attendees + CSV export |
| Executive escalated complaints filter | ✅ Built — filter + overview panel on executive dashboard |
| Contact inbox reply | ✅ Built — Admin → Overview → reply by email |
| Contact inbox delete + CSV export | ✅ Built — Admin → Overview → Contact Inbox |
| Backup restore (content merge) | ✅ Built — Admin → System → upload JSON backup |
| Automated tests (API) | ✅ 84 tests in CI |

### Production configuration still required

| Item | Action |
|------|--------|
| SMTP | Password reset, verification, notifications |
| Supabase | File uploads |
| SMS | Optional Africa's Talking |
| Railway cron | Nightly `run_daily_jobs.sh` |
| Registry CSV/API | Optional — verify real student reg numbers |
| UptimeRobot | Monitor `/api/health/` |
| Remove demo accounts | Before campus go-live |

---

## 5. Smoke test (after deploy)

Run locally before release:

```bash
cd jucso-api
python manage.py test core.tests -v 2
```

CI runs the same suite on push via `.github/workflows/api-tests.yml`.

### Manual production checks

1. Open `https://jucso-web-production.up.railway.app`
2. Register a new student (new reg number + email)
3. Land on `/dashboard` with portal navbar (no marketing links)
4. Submit a complaint → appears in "My Complaints"
5. Sign out → public site returns
6. Staff login with minister PF number → minister dashboard
7. Admin login → users table, add staff form works

---

## 6. Rollback

Railway: redeploy a previous successful deployment from the service **Deployments** tab.

Database: restore from PostgreSQL backup if a bad migration ran.

---

## 7. Local production-like test

```bash
# API
cd jucso-api
cp .env.example .env
# Edit .env with local Postgres or SQLite (omit DATABASE_URL for SQLite)
python manage.py migrate
SEED_DATA=true python manage.py seed_jucso  # or: SEED_DATA=true in .env + entrypoint
python manage.py runserver 8000

# Web
cd jucso-web
echo "VITE_API_URL=http://localhost:8000" > .env
npm run dev
```

---

## 8. Email (password reset)

Configure on **`jucso-api`** so reset links reach users:

| Variable | Example |
|----------|---------|
| `FRONTEND_URL` | `https://jucso-web-production.up.railway.app` |
| `EMAIL_BACKEND` | `django.core.mail.backends.smtp.EmailBackend` |
| `EMAIL_HOST` | Your SMTP host |
| `EMAIL_PORT` | `587` |
| `EMAIL_HOST_USER` | SMTP username |
| `EMAIL_HOST_PASSWORD` | SMTP password |
| `EMAIL_USE_TLS` | `true` |
| `DEFAULT_FROM_EMAIL` | `noreply@jucso.ac.tz` |

Without SMTP, reset requests still return success but emails only appear in server logs during development.

Test: Sign in → **Forgot password?** → enter email → open link in email → set new password at `/reset-password`.

---

## 9. Supabase Storage (file uploads)

### 1. Create a Supabase project
1. Go to [supabase.com](https://supabase.com) → New project
2. Open **Storage** → **New bucket** → name it `jucso-uploads`
3. For **public documents**, enable **Public bucket** (or use signed URLs only)

### 2. API keys (Railway `jucso-api` variables)

| Variable | Where to find it |
|----------|------------------|
| `SUPABASE_URL` | Project Settings → API → Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Project Settings → API → `service_role` (secret) |
| `SUPABASE_STORAGE_BUCKET` | `jucso-uploads` |
| `SUPABASE_SIGNED_URL_TTL` | `3600` (complaint attachment link lifetime in seconds) |

### 3. Folder layout in bucket

| Path | Purpose | Access |
|------|---------|--------|
| `complaints/{reg-number}/…` | Student complaint attachments | Signed URLs (private) |
| `documents/…` | Published PDFs / files | Public URLs |

### 4. Test
1. Student → **New Complaint** → attach a PDF → submit
2. Admin → **Content** → **Upload Document**
3. Public **Documents** page → download link works

Without Supabase env vars, complaints without attachments still work; file uploads return a clear error.
