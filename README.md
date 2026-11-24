# raahilmw / Palimpsest

An editorial security research portfolio for Raahil Muhammad Wildan. The Palimpsest direction combines warm paper, graphite typography, vermilion accents, layered research notes, and a dark graphite appearance.

## Build and edit

Run `python scripts/build.py` to assemble the eight static HTML pages from shared templates. No external Python packages or frontend build dependencies are needed. The deployable output is `dist/`.

- Page content and shared layout: `scripts/build.py`
- Design, responsive layouts, and both appearances: `dist/style.css`
- Saved/system appearance: `dist/theme.js`
- Mobile navigation, paper interactions, clipboard, and workflow demo: `dist/app.js`
- Original profile photograph: `dist/assets/profile.jpg` when supplied. The builder uses a monogram if the original file is unavailable.

Routes: Home, About, Writeups, one case-study page, Projects, one browser-only workflow demonstration, Certifications, and Contact. Certifications use an explicit empty state; no qualifications, experience, clients, or awards are invented. Contact uses the supplied handle and verified Medium profile.

The local case study is a concise companion to the author's original Medium report. Its impact statements preserve the report's evidence limits. The workflow demonstration uses only sample data and makes no network requests.

## References

- Original Palimpsest concept developed in this conversation.
- About page composition inspired by https://danielneath.com/about, using original content.
- Applied `light-mode-paper-technical` and `editorial-portfolio-chapters` from MengTo/Skills (MIT).
- Case-study source: https://medium.com/@raahil.mw/how-i-got-paid-for-turning-an-image-fetcher-into-an-arbitrary-file-read-0d15679bae00
- Locally served Manrope and IBM Plex Mono from Google Fonts.
