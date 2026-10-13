# Capstone portfolio entry — MovieFinder

## 1. Project brief

MovieFinder is a movie search app for people who know the kind of film they want to watch but not its title. Normal search only works if you already know a title, so the app adds a second mode: you describe a mood or a movie you liked ("a slow-burn sci-fi like Arrival, but less sad"), an LLM suggests titles, and every suggestion is checked against a real movie database before it is shown, so invented films never appear. It is for casual viewers who get stuck choosing what to watch. I chose it because I had already built a title-search app in the earlier weeks, and it was a small project where AI solves a real limitation instead of being a chatbot added on top.

## 2. Live application
https://flyrank-ai-capstone-one.vercel.app/

## 3. Repository
https://github.com/AshwinaMuazzam/Flyrank-AI-Capstone  (README covers setup, architecture, AI integration, limitations)

## 4. Testing evidence
- 67 passing tests (Vitest + React Testing Library), about 94.5 % statement coverage, every component tested
- Screenshots to attach: (a) the `npm test` result, (b) the `npm run coverage` table

## 5. Performance and accessibility audit
- Lighthouse on the live URL: **100 / 100 / 100 / 100** (Performance / Accessibility / Best Practices / SEO)
- WAVE on the live URL: **0 errors, 0 contrast errors, 0 alerts**, both on the empty page and after an AI search
- Improvement made: button text contrast was 4.37:1 (below the 4.5:1 AA minimum), so I darkened the purple. I also fixed the favourite button's accessible name so it contains its visible text. Details are in the README.
- Screenshots to attach: Lighthouse scores, WAVE (empty page), WAVE (after AI search)

## 6. Deployment and operation
- Checklist: `DEPLOYMENT-CHECKLIST.md` (tick and sign it)
- Fails safely: if the AI fails, times out or returns bad data, the app shows a notice and runs a normal title search. Screenshot to attach: the yellow "…Showing title matches instead" notice
- Rollback: Vercel, Deployments, promote the previous good deployment. AI kill switch: remove `GEMINI_API_KEY` and redeploy.

## 7. Reflection (write this yourself, max 1 page)

The pass criteria say it must show honest thinking. Answer these in your own words, 3 to 4 sentences each:

**What was hardest, and why?**
Things that really happened that you could write about: the AI key and billing problem and switching to a free provider; the AI timing out until the model was changed; getting the Vercel deployment to start after GitHub's rate limit.

**What would you do differently next time?**
For example: check costs and free tiers before choosing a provider; test the live site with real keys earlier instead of at the end; add one end-to-end test.

**One thing that surprised you**
Candidates: the AI invented or mismatched a title ("Ex Machina" matched a strange database entry) even though the database check existed, so "does it exist?" was not enough; Lighthouse gave 100 but WAVE still needed a check after loading results; the bug was only visible on the live site.
