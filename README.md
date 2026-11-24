# raahilmw — Security Researcher

A responsive, static portfolio for penetration testing, bug hunting, and security automation. Open `dist/index.html` through an HTTP server, or use the Codex Sites preview.

## Editing

- Content and identity: `dist/index.html`
- Styling and responsive layouts: `dist/style.css`
- Light/dark appearance and collection sections: `dist/theme.css`
- Saved appearance, device preference, and cross-tab synchronization: `dist/theme.js`
- Navigation, dialogs, copy handle, simulated workflow, and contours: `dist/app.js`
- Three.js artifact and surface particles: `dist/artifact.js`

No build step, account, backend, analytics, or external runtime dependencies are required. The workflow is an illustrative browser-only simulation. No requests are sent to a target. Contact currently uses the supplied handle; replace it with real contact links when available.

The header includes Writeups and Projects in desktop and mobile navigation. Both currently use explicit empty states. Add real public content to those sections when available. The original forest artwork is retained in both appearances.

## Design sources and assets

Inspired by the atmosphere and interactions in [Saltmere](https://threeui.com/saltmere). Applied the hover particle dissolve, interactive topography, and gradient border flashlight skills from [MengTo/Skills](https://github.com/MengTo/Skills), licensed under MIT.

Forest photograph: [Unsplash](https://images.unsplash.com/photo-1511497584788-876760111969). Locally served Manrope and IBM Plex Mono from Google Fonts. Three.js 0.169.0, MIT license, is vendored for reliable loading.
