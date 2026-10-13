# Capstone portfolio entry — MovieFinder

**Ashwina Muazzam** · FlyRank Frontend AI Engineering capstone · 2026-10-13

## 1. Project brief

MovieFinder is a movie search app for people who know the kind of film they want to watch but not its title. Normal search only works if you already know a title, so the app adds a second mode: you describe a mood or a movie you liked ("a slow-burn sci-fi like Arrival, but less sad"), an LLM suggests titles, and every suggestion is checked against a real movie database before it is shown, so invented films never appear. It is for casual viewers who get stuck choosing what to watch. I chose it because I had already built a title-search app in the earlier weeks, and it was small enough to finish well while giving the AI a real job instead of being a chatbot added on top.

## 2. Live application
https://flyrank-ai-capstone-one.vercel.app/

## 3. Repository
https://github.com/AshwinaMuazzam/Flyrank-AI-Capstone

The README covers one-command setup (`npm install` then `npm run dev`), the architecture, how the AI is used (including the prompt and why), how the app fails safely, and known limitations.

## 4. Testing evidence
- 67 passing tests (Vitest + React Testing Library) covering components, the favourites hook, pages, the OMDb and AI services, and the API handler
- About 94.5 % statement coverage; every component is tested
- Screenshots: `npm test` output, `npm run coverage` table

## 5. Performance and accessibility audit
| Check | Result |
|---|---|
| Lighthouse on the live URL (mobile: emulated Moto G Power, slow 4G) | **100 / 100 / 100 / 100** (Performance / Accessibility / Best Practices / SEO) |
| WAVE, empty home page | **0 errors, 0 contrast errors, 0 alerts**, AIM score 10/10 |
| WAVE, after an AI search (movie cards on screen) | **0 errors, 0 contrast errors, 0 alerts**, AIM score 10/10 |
| Browser console | No errors |

**Improvements made:**
1. Button text contrast was 4.37:1, below the WCAG AA minimum of 4.5:1, so I darkened the purple (about 5.4:1). WAVE then reported 0 contrast errors.
2. The favourite button's accessible name did not contain its visible text. It now does, with the movie title added for screen readers only.
3. A card on the live site showed a wrong database entry for "Ex Machina". The app now accepts a result only if its title matches the suggested one, and this is covered by tests.

Screenshots: Lighthouse scores (with the "Emulated Moto G Power" footer), WAVE twice, console.

## 6. Deployment and operation
- Checklist: `DEPLOYMENT-CHECKLIST.md`, signed off against release `ba0f05a`
- **Fails safely:** if the AI is missing, slow, errors, or returns unusable data, the app shows a yellow notice ("…Showing title matches instead.") and runs a normal title search. I saw this happen for real with a missing key and with a timeout. Screenshot: the yellow notice.
- **Rollback:** Vercel, Deployments, promote the previous good deployment (seconds), or `git revert`. AI kill switch: delete `GEMINI_API_KEY` and redeploy.
- **Monitoring:** Vercel function logs and the Google AI Studio usage page.

## 7. Reflection

*This is a draft built from what actually happened while I built the project. Change any part that does not match your own experience.*

**What was hardest, and why?**
Getting the AI feature working for free and in production, not writing the code. I first built it for the Claude API, but it needs paid credit and I did not want to spend money on a capstone, so I switched to Google's free Gemini tier. That was a small change because I had kept the AI call in one function. Then the feature timed out after 15 seconds, and I only found the cause by listing the models my key could actually use and timing one directly (1.2 seconds with a lighter model). Deployment was also harder than expected: GitHub rate-limited Vercel's first build, and I had to push a new commit before the site went live.

**What would I do differently next time?**
I would check pricing and free-tier limits before choosing an AI provider, and test the live site with real API keys much earlier, instead of near the end. I would also add one end-to-end test for the full flow of searching and saving a favourite. My tests mock the network, so they cannot catch problems like a slow or wrong model name.

**One thing that surprised me**
Checking that an AI-suggested movie exists was not enough. One result showed a strange database entry that happened to contain "Ex Machina" in its name, so my check passed it even though it was the wrong thing. The app now requires the returned title to match the suggestion. It also surprised me that Lighthouse and WAVE both gave perfect scores while this bug was visible on screen, which taught me that automated audits do not replace looking at the real output.
