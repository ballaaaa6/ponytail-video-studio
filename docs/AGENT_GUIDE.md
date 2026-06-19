# Agent Guide

Read this before changing the project.

## Context Map

If working on the 2D office UI, read:
- `docs/OFFICE_UI_PLAN.md`
- `src/features/office-map/README.md`
- `src/features/office-map/officeAgents.js`

If working on AI chat, read:
- `src/features/ai-chat/README.md`
- `workers/office-ai/README.md`

If changing third-party assets, read:
- `docs/THIRD_PARTY_ASSETS.md`
- `public/vendor/skyoffice/NOTICE.md`
- `public/vendor/skyoffice/LICENSE`

## Project Rules

- Keep the office layer lightweight. Do not import the full SkyOffice app.
- Do not add Phaser, Colyseus, WebRTC, or multiplayer code for the HQ prototype.
- Keep employees and statuses data-driven where practical.
- Large video, audio, generated image, and browser-session files must not be committed.
- If a new employee role changes product behavior, update `docs/OFFICE_UI_PLAN.md`.
- If a new external asset source is added, update `docs/THIRD_PARTY_ASSETS.md`.
