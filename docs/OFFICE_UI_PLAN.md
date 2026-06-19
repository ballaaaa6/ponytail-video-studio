# Office UI Plan

The first milestone is a lightweight 2D office screen for the YouTube video-production workflow.

## Goal

Give the boss one visual HQ room where AI employees appear to work, move, report status, and answer quick questions. This is a product UI metaphor, not a multiplayer game.

## Current Scope

- One HQ room rendered with Vue and HTML5 Canvas.
- Four employees:
  - Chief of Staff
  - Video Lead
  - Ops Lead
  - Analyst
- Employees move between desk and task target points.
- Clicking an employee shows the employee status and adds a short chat message.
- The chat calls `/api/office-chat` when available and falls back to local demo replies during local UI work.

## Out Of Scope

- Phaser game engine.
- Multiplayer.
- WebRTC audio/video.
- Collision systems.
- Large tilemap JSON files.
- Real video-generation pipeline.

## Expansion Rule

Add new departments as data first. Do not add a new engine unless the current canvas layer cannot express the product behavior.

Recommended order:
1. Add agent data in `src/features/office-map/officeAgents.js`.
2. Add visual behavior in `src/features/office-map/OfficeCanvas.vue`.
3. Add workflow data in a separate feature folder.
4. Connect the UI to a real API only after the interaction is clear.
