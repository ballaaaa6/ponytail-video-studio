# Third-Party Assets

## SkyOffice

Path:
`public/vendor/skyoffice/`

Source:
https://github.com/kevinshen56714/SkyOffice

License:
MIT. The license file is vendored at `public/vendor/skyoffice/LICENSE`.

Current use:
- A small subset of character frame PNGs.
- A few office item PNGs.
- One tileset PNG kept for future office-floor styling.

Import boundary:
The project intentionally does not import SkyOffice's app code, server code, Phaser scenes, Colyseus rooms, WebRTC pieces, or large tilemaps. This keeps the prototype easy for future agents to read and modify.

Before production use:
Review the upstream asset provenance one more time, especially if using the visual assets commercially.
