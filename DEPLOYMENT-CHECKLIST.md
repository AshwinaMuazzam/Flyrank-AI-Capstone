# Deployment checklist — MovieFinder

> Copy these answers into the official FE-11 template if it differs. Boxes are ticked only for checks that were actually done; the notes say how.

**Release:** `ba0f05a` (production, `main`) · **Date:** 2026-10-13 · **Deployed by:** Ashwina Muazzam · **URL:** https://flyrank-ai-capstone-one.vercel.app/

## Before deploying
- [x] `npm install && npm run lint && npm test && npm run build` all pass locally (lint clean, 67 tests passing, build succeeded: JS 62.8 kB gzipped)
- [x] `movie-search-app` branch merged into `main` (PR #1, Conventional Commit messages)
- [x] `.env` is not committed (`git check-ignore -v .env` confirms it is ignored by `.gitignore` line 27; `git status` never listed it)
- [x] No API keys in the repo history (searched with `git log -p | Select-String`; the only matches were code that reads the key from a variable, `apikey=${API_KEY}`, and no real key)
- [x] OMDb key is activated (email link clicked; title search works)
- [x] Gemini key created at aistudio.google.com/apikey (free tier — no billing attached)

## Vercel configuration
- [x] Framework preset: Vite · Build: `npm run build` · Output: `dist`
- [x] Env vars set for **Production**: `VITE_OMDB_API_KEY`, `GEMINI_API_KEY`
- [x] Redeployed *after* adding env vars (Vite bakes `VITE_*` in at build time; live site search works)

## After deploying — smoke test on the live URL
- [x] Title search returns results (e.g. "Inception")
- [x] AI mode returns suggestions with reasons (e.g. "a slow-burn sci-fi like Arrival")
- [x] AI failure path → fallback notice + title results shown. Verified in local dev for two real failures: missing key ("AI suggestions are not configured on this server. Showing title matches instead.") and timeout ("The AI service took too long to respond. Showing title matches instead."). Same code runs in production.
- [x] Favourite a movie, reload, it is still there (favourites counter persisted on the live site)
- [x] Works on a phone-width viewport (Lighthouse mobile emulation, Moto G Power, slow 4G)
- [x] Keyboard-only navigation works (Tab reaches the nav, mode toggle, search box, Search button and every Add to favourites button, each with a visible focus outline)
- [x] Browser console has no errors (DevTools Console: "No errors", "No issues")

## Quality gates
- [x] Lighthouse (mobile) ≥ 90 target / ≥ 85 minimum — scores: **100 / 100 / 100 / 100** (Performance / Accessibility / Best Practices / SEO)
- [x] axe or WAVE: 0 WCAG AA violations — result: **WAVE: 0 errors, 0 contrast errors, 0 alerts** (home page and after an AI search)
- [x] Test coverage ≥ 50 % of components — result: **94.9 % statements, every component tested**

## Rollback plan
1. Vercel → Deployments → pick last known-good → **Promote to Production** (≈ seconds).
2. Or `git revert <bad-sha> && git push origin main`.
3. AI-only incident (quota exhausted / bad output): delete `GEMINI_API_KEY` in Vercel and redeploy — app degrades to title search.

## Monitoring
- Vercel → Logs for `/api/recommend` (watch 502/429 rates)
- Google AI Studio usage page (watch for free-tier quota errors)

**Sign-off:** Ashwina Muazzam · Date: 2026-10-13
