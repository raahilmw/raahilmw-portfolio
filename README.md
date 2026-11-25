# raahilmw

Raahil Muhammad Wildan’s security research portfolio. Run `python scripts/build.py` to regenerate the eight static pages in `dist/`.

## Hosting

Upload the contents of `dist/` to the root of a static website. The host should serve each directory's `index.html`, so routes such as `/about/` and `/writeups/` work. No server runtime or package installation is required.

Before moving to a new domain, rebuild with its full public origin. This updates canonical URLs and the article's copy-link action.

```bash
SITE_ORIGIN=https://your-domain.example python scripts/build.py
```

The default origin is the current Sites address. Run `python -m http.server 8000 --directory dist` for a local preview at `http://localhost:8000/`. All fonts, scripts, photos, and library assets used by the website are inside `dist/`.

- Shared content and navigation live in `scripts/build.py`. The About spread layers the existing transparent portrait over a two-ink forest print and the Home map contours. The background follows MengTo’s Bayer dither treatment. The staggered name and print register once on entry, with a static composition for reduced motion. Instrument Serif is bundled under its OFL license.
- The home scene restores the forest photograph and Three.js specimen from the first design. The particle interaction follows the MengTo hover-particle-dissolve skill.
- The About field uses locally bundled Matter.js. Drag tiles by mouse or touch, or focus one and move it with the arrow keys. Scrolling down drops them. Pick up a label at a corner to swing it. Return to the top to re-float the labels. Reduced motion skips directly to the resting positions.
- The About profile includes a section index, professional timeline and education based on the owner’s [LinkedIn](https://www.linkedin.com/in/raahilmw/). Home and Contact share the social links in the `SOCIAL` dictionary; About ends with Education.
- The eight-second arrival in `dist/intro.js` turns a Bash prompt into a particle knot and the header star. It plays once per browser session; the footer’s Replay arrival control replays it. Skip and Escape exit immediately, and reduced motion skips the sequence.
- The theme switch remembers the visitor’s setting. The workflow demonstration runs on sample data in the browser.
- The Writeups section links to the author’s original [Medium article](https://medium.com/@raahil.mw/how-i-got-paid-for-turning-an-image-fetcher-into-an-arbitrary-file-read-0d15679bae00).

The Home research map mounts [Scroll Craft](https://github.com/nateherkai/scroll-craft) (MIT, commit `75d81f7`) while the map is on screen. Each waypoint is a native link. The menu motion and About typography follow the motion and layout playbooks in [Impeccable](https://github.com/pbakaus/impeccable) (commit `b49177d`).

## Credits

[Saltmere](https://threeui.com/saltmere) for the visual reference, [Daniel Neath](https://danielneath.com/) for the pixel reveal and draggable field, [Ramveil](https://ramveil.com/about/) for the profile sections and social-card reference, [Simple Icons](https://simpleicons.org/) for the platform icons, [MengTo/Skills](https://github.com/MengTo/Skills) for the particle interaction, and [Unsplash](https://images.unsplash.com/photo-1511497584788-876760111969) for the forest photograph. Manrope and IBM Plex Mono are served locally. The scene uses Three.js 0.169.0 (MIT) and the About field uses Matter.js 0.20.0 (MIT).

## Motion and visual direction

`dist/motion.css` and `dist/motion.js` provide the shared observatory finish: fine grain, orbital lines, an elastic navigation marker, layered writeup artwork, reactive social discs, and About chapter tracking. The original photo, research, social destinations, and tile physics remain intact. Three.js pauses behind the introduction, outside the viewport, and while the document is hidden. Decorative CSS loops pause offscreen. No scroll hijacking or sound is used.

The new interactions are original implementations informed by [HorizonX](https://horizonx.so), [Grainient](https://grainient.supply), [Arc UI](https://uiarc.dev), [uberdesigner](https://uberdesigner.ai), and [Bencho](https://bencho.dev). No paid assets or component source from those services is bundled.

The Contact page follows the supplied intro → social links → conversation band order. `dist/contact.css` and `dist/contact.js` style and operate the Gmail/Outlook/Yahoo/default-mail picker. Its action retains a mailto fallback, and the existing copy action can copy the email address.

The Certifications page contains the original CyberOps Associate course-completion record (Cisco Networking Academy, Faculty of Engineering, University of Indonesia, completed 30 October 2026). `dist/assets/certificates/` includes the original PDF, a 180 DPI PNG conversion, and a smaller WebP preview. The page distinguishes course completion from the Cisco professional certification exam. `dist/certifications.css` and `dist/certifications.js` provide the responsive presentation, optional document viewer, reduced-motion alternative, and progressive reveal.

The SSRF / local-file-read writeup lives in `content/writeups/image-fetcher.html`, rendered by `scripts/build.py`. Humanizer guidance shaped the plain-English rewrite. The layout is one reading column with the original reward-response email first, followed by four privacy-edited Burp screenshot renditions. `dist/case-study.css` and `dist/case-study.js` provide the reading layout, a native image dialog, and one bounded attack-chain illustration after the testing context. The request trace changes from an HTTP fetch to a local file, illustrates alternate path forms, and returns Base64 along a separate route. It plays once when visible, supports pause/replay and direct step selection, pauses offscreen or behind the image viewer, and uses static steps for reduced motion. The narrow layout moves the nodes into a diagonal flow; it never changes native page scrolling. No sidebar or facts grid is used. Each image remains a direct link without JavaScript. The raw report is not included. Target identifiers, Basic Auth values, cookies, origin addresses and the decoded hostname are omitted.

### Screenshot provenance

`reward-email.png` is the original PNG extracted unchanged from the supplied `wu.docx`. The four Burp files in `dist/assets/writeups/image-fetcher/` are flattened, privacy-edited renditions made with the image editor from the captures embedded in that document. They are not forensic pixel-identical originals. Sensitive regions are covered with opaque masks; incidental UI metadata on the path-variant images is removed. Payload examples and findings in the article follow the original text report, not inferred UI metadata. Captions identify the visible proof and keep the `/proc/./version` capture separate from the unpictured configuration-file check. For a byte-faithful archival record, replace these renditions with deterministically redacted original PNG files when supplied.
