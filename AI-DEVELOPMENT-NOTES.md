# AI Development Notes — Movie Search App

This document covers how AI was used to build the Movie Search App: the prompts used, how AI assisted at each stage, and the manual fixes/corrections made after reviewing its output.

## Stack
Vite + React (JavaScript), OMDb API for movie data, browser `localStorage` for persisting favourites (no backend/auth — a deliberately lighter version of the reference project, which also used Firebase Auth + Realtime Database).

## Tools used
Started in Cursor, hit the free-tier usage limit mid-build. Attempted to switch to Antigravity, but its IDE install repeatedly failed. Finished the build working directly with Claude in chat, which wrote and tested the code in a sandbox environment before handing off the finished files for integration into the project repo.

## Prompts used, in order

1. *(Setup, in Cursor before the usage limit hit)*
   > "This is a React + Vite project. I want to build a movie search app using the OMDb API. First, clean up the current src folder... Then create this folder structure: src/services/, src/components/, src/pages/... Don't implement any movie logic yet, just set up empty/minimal files so the structure exists and the app still runs."

2. *(Continued with Claude after switching tools)* Asked Claude to build out the full app: an OMDb API service module (search + get-details), a `useFavourites` custom hook backed by `localStorage`, a reusable `MovieCard` component, a `SearchBar` component, a `Header` with simple Home/Favourites navigation (no router — a lightweight view-switch was enough for this scope), a `Home` page wiring search to results, a `Favourites` page, and a top-level `App.jsx` tying it all together.

3. Asked Claude to run a production build and manual code review pass before handing the code off, specifically to catch logic bugs that a build/compile step alone wouldn't catch.

## How AI assisted
- **Scaffolding and boilerplate**: generating the folder structure, component shells, and CSS so I didn't have to type out repetitive JSX/CSS by hand.
- **API integration logic**: writing the `fetch` calls to OMDb, including handling OMDb's unusual error format (it returns `Response: "False"` with an `Error` message in the JSON body instead of an HTTP error status for "no results" or "invalid key" cases — something I wouldn't have known to handle without reviewing the code).
- **State management**: the `useFavourites` hook (reading/writing `localStorage`, keeping state in sync) and the search status state machine (`idle` / `loading` / `success` / `error`) in the Home page.
- **Accessibility basics**: labels tied to inputs, `aria-pressed`/`aria-label` on the favourite toggle button, a visually-hidden label on the search input.
- **Verification**: running `npm run build` to confirm the code compiles cleanly, and a manual read-through of the service/page logic that caught a real bug before I ever ran it myself (see below).

## Manual improvements / corrections made after reviewing AI output

1. **Race condition in search (caught by AI during self-review, before I even ran it)**: the original `handleSearch` function in `Home.jsx` had no protection against out-of-order responses. If someone typed a search, then quickly changed it before the first request finished, the *older, slower* request could resolve after the newer one and silently overwrite the correct results with stale ones. This was fixed by adding a `useRef` request-ID guard that discards any response that isn't from the most recent search.

2. **401 Unauthorized error (caught by me, during manual testing in the browser)**: the app initially failed every search with `Network error: 401`. I checked the `.env` file directly in the terminal to confirm the key was present and correctly formatted, which ruled out a typo or missing file. The actual cause was that my OMDb API key hadn't been activated yet — OMDb requires clicking a confirmation link sent by email before a newly generated key will work. I found and clicked that link, and the exact same code worked correctly afterward with no changes needed. This distinguished an environment/account issue from an actual code bug.

3. **Broken `.gitignore` (caught earlier in the project, but relevant to this app's safety)**: when Vite's scaffolding tool was first run on this repo, it silently overwrote the original `.gitignore` and dropped the `.env` exclusion rule. This was caught before any secrets were committed, and the `.env`/`.env.*` exclusion was restored. This mattered directly for this app, since it's what kept the real OMDb API key out of git history when the app was built and pushed.

4. **Leftover unused assets**: the AI's initial output for `src/App.jsx` (during scaffolding) still imported default Vite template assets (`react.svg`, `vite.svg`, `hero.png`) that had no relevance to a movie search app. These were removed once the real `App.jsx` was in place, along with an accidental extra `.oxlintrc.json` file that ended up in the project root during file transfer and wasn't part of the intended setup.

## Summary
AI substantially sped up the boilerplate and the OMDb integration details (which have some non-obvious quirks around its error format), but two of the more interesting bugs — the unactivated API key and the accidental `.gitignore`/file-transfer issues — only surfaced through actually running the app and checking real output, not from reading the code alone. The race condition was the one case where AI caught its own mistake before I ever saw it fail, by re-reading its own logic rather than just producing code and stopping.