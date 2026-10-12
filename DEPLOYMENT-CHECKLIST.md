# Deployment checklist — MovieFinder

> Copy these answers into the official FE-11 template if it differs. Tick each box only after you have actually checked it.

**Release:** `<commit sha>` · **Date:** `<date>` · **Deployed by:** Ashwina Muazzam · **URL:** `<vercel url>`

## Before deploying
- [ ] `npm install && npm run lint && npm test && npm run build` all pass locally
- [ ] `movie-search-app` branch merged into `main` (PR reviewed, Conventional Commit messages)
- [ ] `.env` is not committed (`git ls-files | grep .env` shows only `.env.example`)
- [ ] No API keys in the repo history (`git log -p | grep -i "apikey="` is empty)
- [ ] OMDb key is activated (email link clicked)
- [ ] Gemini key created at aistudio.google.com/apikey (free tier — no billing attached)

## Vercel configuration
- [ ] Framework preset: Vite · Build: `npm run build` · Output: `dist`
- [ ] Env vars set for **Production**: `VITE_OMDB_API_KEY`, `GEMINI_API_KEY`
- [ ] Redeployed *after* adding env vars (Vite bakes `VITE_*` in at build time)

## After deploying — smoke test on the live URL
- [ ] Title search returns results (e.g. "Inception")
- [ ] AI mode returns suggestions with reasons (e.g. "a slow-burn sci-fi like Arrival")
- [ ] AI failure path: temporarily blank `GEMINI_API_KEY` (or block `/api/recommend` in DevTools) → fallback notice + title results shown
- [ ] Favourite a movie, reload, it is still there
- [ ] Works on a phone-width viewport; keyboard-only navigation works
- [ ] Browser console has no errors

## Quality gates
- [ ] Lighthouse (mobile) ≥ 90 target / ≥ 85 minimum — scores: `____`
- [ ] axe or WAVE: 0 WCAG AA violations — result: `____`
- [ ] Test coverage ≥ 50 % of components — result: `____`

## Rollback plan
1. Vercel → Deployments → pick last known-good → **Promote to Production** (≈ seconds).
2. Or `git revert <bad-sha> && git push origin main`.
3. AI-only incident (quota exhausted / bad output): delete `GEMINI_API_KEY` in Vercel and redeploy — app degrades to title search.

## Monitoring
- Vercel → Logs for `/api/recommend` (watch 502/429 rates)
- Google AI Studio usage page (watch for free-tier quota errors)

**Sign-off:** `____________` Date: `________`
