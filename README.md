# Portfolio Site

Astro-based starter for a premium, content-driven portfolio intended for GitHub Pages.

## Scripts

- `npm run dev`
- `npm run build`
- `npm run preview`
- `npm run check`

## Content Source

All editable content is modeled in `data.json` at the repository root so it can be driven by a CMS, admin dashboard, or Git-based editing flow without changing application source code.

## Static Integrations

This project is set up for backend-free dynamic features on GitHub Pages:

- Contact form: Formspree endpoint via `PUBLIC_FORMSPREE_ENDPOINT`
- Testimonials and ratings: Supabase client via `PUBLIC_SUPABASE_URL` and `PUBLIC_SUPABASE_ANON_KEY`
- Event tracking: Supabase event table via `PUBLIC_SUPABASE_EVENTS_TABLE`

Copy `.env.example` to `.env` and fill in the values before building.

Recommended Supabase tables:

- `portfolio_reviews` for testimonials and ratings
- `portfolio_events` for page views and custom analytics events

Security notes:

- Keep the Supabase anon key public only.
- Use RLS policies to allow inserts for reviews and events while protecting admin reads.
- Add Supabase database triggers or edge functions if you want email or Telegram notifications from the event stream.

## Admin Dashboard

The CMS lives at `/admin` and uses Decap CMS with a GitHub backend. After configuring the repository in `public/admin/config.yml` and enabling GitHub OAuth for Decap, a non-technical user can:

- Log into `/admin`
- Add, edit, reorder, hide, and delete content
- Save changes directly into `data.json`
- Trigger a Git commit, which then rebuilds and updates the GitHub Pages site

The CMS is intentionally wired to the single `data.json` content source so the live site remains fully static while still being editable through the browser.

### Local Development for Admin

To use the visual admin editor locally without GitHub OAuth, run both the Astro dev server and the Decap proxy:

```bash
npm run dev
npm run cms:proxy
```

Then open `/admin` in the browser. The Decap config is at `public/admin/config.yml` and edits are applied to `data.json`.