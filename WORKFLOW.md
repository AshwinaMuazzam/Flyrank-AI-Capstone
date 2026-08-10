# WORKFLOW.md — Prompting Drill: Vague vs. Precise

## The task
Build a settings form component twice in the same React + Vite project: once from a single vague prompt ("Build a settings form.") on `round-1-vague`, and once from a detailed prompt with file references, constraints, and a required test-and-verify step on `round-2-precise`. Both used Cursor's Agent mode, each in a fresh chat session with no carried-over context.

## Correctness
Round 1 produced a plausible-looking form (Profile, AI preferences, Notifications, Privacy sections) with manual `useState` validation. But its validation is shallow: only two checks exist (`Display name is required.`, `Enter a valid email address.`), found by grepping the file for "validat|error". There's no schema, no per-field error state tied to individual inputs beyond a single global status message, and nothing verifies the component actually behaves correctly — it was accepted on first output with zero test runs.

Round 2 used `react-hook-form` + `zod` for schema-based validation (required name with min length, email format, required radio selection), and — critically — the prompt required Cursor to write and run tests before stopping. It did: 4 Vitest + React Testing Library tests (render, empty-submit validation, invalid email, successful submit), all passing. Mid-process, the agent's own zod schema had a bug — using an outdated `required_error` option syntax incompatible with the installed zod version, which caused the notification-preference test to fail. It caught this itself only because the verification step forced it to actually run the tests; it diagnosed the version mismatch (`npm ls zod`), fixed the schema, and re-ran until all 4 passed. **This is the AI mistake I directly observed**: without the "write tests and run them" instruction, that bug would have shipped silently, since the form would visually look fine but silently accept invalid state in that one field.

## Accessibility
Round 1 does use `<label htmlFor="...">` correctly associated with each input — better than I expected from a one-line prompt. But it has no `aria-describedby` linking error text to inputs, and error state is a single top-of-form banner rather than inline per-field feedback, so a screen reader user gets no indication of *which* field failed.

Round 2 was explicitly told to add `aria-describedby` on invalid fields and keep full keyboard operability; both are present in the component and implicitly exercised by the RTL tests, which query by accessible role/label rather than test IDs.

## Edge cases
Round 1 has no test coverage, so edge cases (empty submit, malformed email, whitespace-only name) are unverified — they may or may not work correctly; I don't know without manually testing. Round 2's test suite explicitly covers empty-submit and invalid-email cases and confirms they render the correct inline errors.

## Review effort
Round 1 took less prompting time (10 seconds to write the prompt) but I have zero confidence in it — every behavior needs to be manually clicked through and verified before I'd trust it in the capstone. Round 2 took longer to prompt (a few minutes to write the constraints) and longer to run (package installs + two test cycles, plus one self-correction loop), but it finished in a state I can trust without opening the browser, because the test output *is* the verification. Counting my own review time, Round 1 is not actually faster end-to-end — I'd still need to manually test 4+ behaviors myself, which is roughly the same time the automated tests took, minus the confidence the tests provide.

## Bottom line
The vague prompt produced something that looked done. The precise prompt produced something that was verifiably done, and caught a real bug in the process that the vague round would have shipped without anyone noticing.