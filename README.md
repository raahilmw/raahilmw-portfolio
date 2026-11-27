# raahilmw

Raahil Muhammad Wildan’s security research portfolio. Run `python scripts/build.py` to regenerate the eight static pages in `dist/`.

Coding agents working in this checkout use Ponytail’s project rules from the root [AGENTS.md](AGENTS.md). [Ponytail v5.3.3](https://github.com/DietrichGebert/ponytail/tree/v5.3.3) · [MIT license](licenses/ponytail-MIT.txt).

## Hosting

Upload the contents of `dist/` to the root of a static website. The host should serve each directory's `index.html`, so routes such as `/about/` and `/writeups/` work. No server runtime or package installation is required.

Before moving to a new domain, rebuild with its full public origin. This updates canonical URLs and the article's copy-link action.

```bash
SITE_ORIGIN=https://your-domain.example python scripts/build.py
```

For the connected GitHub Pages site, `docs/` contains the same built pages with canonical URLs set to `https://raahilmw.com`. GitHub Pages serves `docs/` from `main`, and `docs/CNAME` preserves the custom domain. Regenerate `docs/` after changing the source or assets.

The default origin is the current Sites address. Run `python -m http.server 8000 --directory dist` for a local preview at `http://localhost:8000/`. All fonts, scripts, photos, and library assets used by the website are inside `dist/`.

- Shared content and navigation live in `scripts/build.py`. The About spread layers the existing transparent portrait over a two-ink forest print and the Home map contours. The background follows MengTo’s Bayer dither treatment. The staggered name and print register once on entry, with a static composition for reduced motion. Instrument Serif is bundled under its OFL license.
- The inspection lens on Home magnifies three sample requests at 1.8×. Move a pointer over the glass, tap a row or use the three keyboard-accessible focus positions. On the first arrival a reflection travels from the fingerprint to the metal rim. The bezel ships as a transparent WebP. To render it again, run `python scripts/render-lens.py` with NumPy and Pillow installed. The ordinary site build uses the included image.
- The About field uses locally bundled Matter.js. Drag tiles by mouse or touch, or focus one and move it with the arrow keys. Scrolling down drops them. Pick up a label at a corner to swing it. Return to the top to re-float the labels. Reduced motion skips directly to the resting positions.
- The About profile includes a section index, professional timeline and education based on the owner’s [LinkedIn](https://www.linkedin.com/in/raahilmw/). Home and Contact share the social links in the `SOCIAL` dictionary; About ends with Education.
- The 4.6-second opening pairs a fingerprint scan with a small Bash transcript. It runs once per browser session and can be replayed from the footer. Skip or Escape dismisses it. Direct links to article pages and section anchors bypass it. Reduced motion shows the portfolio immediately and uses the still image of the device.
- The theme switch remembers the visitor’s setting. The workflow demonstration runs on sample data in the browser.
- The Writeups section links to the author’s original [Medium article](https://medium.com/@raahil.mw/how-i-got-paid-for-turning-an-image-fetcher-into-an-arbitrary-file-read-0d15679bae00).

The Home research map draws its trail from native scroll position while visible. Each waypoint is a native link. The menu motion and About typography follow the motion and layout playbooks in [Impeccable](https://github.com/pbakaus/impeccable) (commit `b49177d`).

## Credits

[Saltmere](https://threeui.com/saltmere) for the visual reference, [Daniel Neath](https://danielneath.com/) for the pixel reveal and draggable field, [Ramveil](https://ramveil.com/about/) for the profile sections and social-card reference, [Simple Icons](https://simpleicons.org/) for the platform icons, [MengTo/Skills](https://github.com/MengTo/Skills) for the particle interaction, and [Unsplash](https://images.unsplash.com/photo-1511497584788-876760111969) for the forest photograph. Manrope and IBM Plex Mono are served locally. The About field uses Matter.js 0.20.0 (MIT).

## Motion and visual direction

`dist/motion.css` and `dist/motion.js` provide the shared observatory finish: fine grain, orbital lines, an elastic navigation marker, layered writeup artwork, reactive social discs, and About chapter tracking. The original photo, research, social destinations, and tile physics remain intact. The Home specimen responds to pointer events on demand and the map stops listening once it leaves the screen. Decorative CSS loops pause offscreen. No scroll hijacking or sound is used.

The new interactions are original implementations informed by [HorizonX](https://horizonx.so), [Grainient](https://grainient.supply), [Arc UI](https://uiarc.dev), [uberdesigner](https://uberdesigner.ai), and [Bencho](https://bencho.dev). No paid assets or component source from those services is bundled.

The Contact page follows the supplied intro → social links → conversation band order. `dist/contact.css` and `dist/contact.js` style and operate the Gmail/Outlook/Yahoo/default-mail picker. Its action retains a mailto fallback, and the existing copy action can copy the email address.

The Certifications page contains the original CyberOps Associate course-completion record (Cisco Networking Academy, Faculty of Engineering, University of Indonesia, completed 30 October 2026). `dist/assets/certificates/` includes the original PDF, a 180 DPI PNG conversion, and a smaller WebP preview. The page distinguishes course completion from the Cisco professional certification exam. `dist/certifications.css` and `dist/certifications.js` provide the responsive presentation, optional document viewer, reduced-motion alternative, and progressive reveal.

The SSRF / local-file-read writeup lives in `content/writeups/image-fetcher.html`, rendered by `scripts/build.py`. Humanizer guidance shaped the plain-English rewrite. The layout is one reading column with the original reward-response email first, followed by the four original Burp captures supplied in `wu.docx`, with the author’s existing blur preserved. `dist/case-study.css` and `dist/case-study.js` provide the reading layout, a native image dialog, and one bounded attack-chain illustration after the testing context. The request trace changes from an HTTP fetch to a local file, illustrates alternate path forms, and returns Base64 along a separate route. It plays once when visible, supports pause/replay and direct step selection, pauses offscreen or behind the image viewer, and uses static steps for reduced motion. The narrow layout moves the nodes into a diagonal flow; it never changes native page scrolling. No sidebar or facts grid is used. Each image remains a direct link without JavaScript. The raw text report is not included. Body paragraphs use justified text; screenshot captions are centered, smaller and italic. Burp figures are capped at 680px and the email at 620px, inside the reading column; their source images remain unchanged. The animation controls share one compact rail above a two-column input/explanation area. The article ends with a compact navigation row using equally sized archive, Medium and copy-link controls. The image viewer uses native discrete open/close transitions where supported, with a short entrance fallback and a reduced-motion alternative.

### Screenshot provenance

All five PNGs in `dist/assets/writeups/image-fetcher/` are extracted unchanged from the supplied `wu.docx`. The author explicitly requested the original, already-blurred Burp captures without additional masks. Their byte hashes match the embedded files. No image generation or additional redaction is applied to these published files. Findings and payloads follow the original text report. Captions keep the `/proc/./version` status capture separate from the unpictured configuration-file check.

## About toolkit artwork

The About page serves small local WebP versions of the project marks.

- [Bash](https://bashlogo.com/apple-touch-icon.png)
- [Burp Suite](https://portswigger.net/_home/rc3/logos/ps-pro-icon.svg)
- [Dalfox](https://raw.githubusercontent.com/hahwul/dalfox/HEAD/docs/static/images/logo_solo.png)
- [ffuf](https://raw.githubusercontent.com/ffuf/ffuf/HEAD/_img/ffuf_run_logo_600.png)
- [Hermes Agent](https://raw.githubusercontent.com/NousResearch/hermes-agent/main/apps/desktop/assets/appx/Square44x44Logo.targetsize-256_altform-unplated.png)
- [httpx](https://raw.githubusercontent.com/projectdiscovery/httpx/HEAD/static/httpx-logo.png)
- [Nmap](https://nmap.org/images/sitelogo-2x.png)
- [Nuclei](https://raw.githubusercontent.com/projectdiscovery/nuclei/HEAD/static/nuclei-logo.png)
- [OpenBot](https://openbot.run/apple-touch-icon.png)
- [Python](https://raw.githubusercontent.com/python/cpython/main/Lib/profiling/sampling/_assets/python-logo-only.png)
- [SQLmap](https://sqlmap.org/sqlmap-tarsier.png)
- [Subfinder](https://raw.githubusercontent.com/projectdiscovery/subfinder/HEAD/static/subfinder-logo.png)
