# Flyrank AI Capstone — AI Assistant Rules

Guidance for AI coding assistants working in this repository.

## Project Stack

**React 19 + Vite**, plain JavaScript, Vitest + React Testing Library for tests, deployed on Vercel.
Movie data: OMDb API. AI: Gemini API (free tier) called only from the serverless function in `api/` (never from the browser).
Keep API keys in `.env` / Vercel env vars; only `VITE_`-prefixed vars reach the browser, so the Gemini key must never use that prefix.

## Coding Conventions

### Commits

- Use **Conventional Commits** for all commit messages (e.g. `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`).
- Keep commits **small and atomic** — one logical change per commit.

### Code Style

- Prefer **clear, readable code** over clever or overly terse implementations.
- If using React, use **functional components** and hooks rather than class components.
- Match existing patterns in the codebase before introducing new abstractions.
- Add comments only where logic is non-obvious.

## AI Assistant Guidance

- **Ask before making large structural changes** (e.g. switching frameworks, major refactors, renaming core modules).
- **Keep changes focused** — avoid unrelated edits in the same commit or PR.
- **Do not commit secrets** (`.env`, API keys, credentials).
- **Do not create commits or push** unless explicitly asked.
- When unsure about project direction or stack choices, ask the user rather than guessing.

## Rules Learned From the Prompting Drill (FE-02)

1. **Forms use react-hook-form + zod for validation — never plain useState with manual if-checks.** The vague-prompt round used ad hoc useState validation with only 2 checks total and no schema; it looked done but was unverifiable. Any form component in this repo must use react-hook-form + zod going forward.

2. **Every input requires an associated `<label>` and, for invalid fields, `aria-describedby` pointing to the error message.** The careful round implemented both; the careless round had labels but no `aria-describedby`, so screen reader users would not know which field failed validation.

3. **No component is "done" until its tests exist and pass.** Always instruct: "write it, then write tests and run them, then fix and re-run until they pass." The precise round's own zod schema had a real bug (incompatible `required_error` syntax for the installed zod version) that only surfaced because tests were actually run — without that step, the bug would have shipped silently.