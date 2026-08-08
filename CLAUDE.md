# Flyrank AI Capstone — AI Assistant Rules

Guidance for AI coding assistants working in this repository.

## Project Stack

The tech stack is **to be decided**. It will likely include a modern frontend framework such as **React**, **Next.js**, or a similar option. Do not assume a specific framework until it is chosen and documented in `README.md`.

When the stack is finalized, update this file with the confirmed frameworks, libraries, and tooling.

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
