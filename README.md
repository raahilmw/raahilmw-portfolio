# raahilmw

Raahil Muhammad Wildan’s security research portfolio. Run `python scripts/build.py` to regenerate the eight static pages in `dist/`.

- Shared content and navigation live in `scripts/build.py`. The About spread layers the existing transparent portrait over a two-ink forest print and the Home map contours. The background follows MengTo’s Bayer dither treatment. The staggered name and print register once on entry, with a static composition for reduced motion. Instrument Serif is bundled under its OFL license.
- The home scene restores the forest photograph and Three.js specimen from the first design. The particle interaction follows the MengTo hover-particle-dissolve skill.
- The About field uses locally bundled Matter.js. Drag tiles by mouse or touch, or focus one and move it with the arrow keys. Scrolling down drops them. Pick up a label at a corner to swing it. Return to the top to re-float the labels. Reduced motion skips directly to the resting positions.
- The About profile includes a section index, professional timeline and education based on the owner’s [LinkedIn](https://www.linkedin.com/in/raahilmw/). Home and About share the social links in the `SOCIAL` dictionary.
- The seven-second Bash-themed pixel intro in `dist/intro.js` plays on the first visit, supports Skip and Escape, and respects reduced motion.
- The theme switch remembers the visitor’s setting. The workflow demonstration runs on sample data in the browser.
- The Writeups section links to the author’s original [Medium article](https://medium.com/@raahil.mw/how-i-got-paid-for-turning-an-image-fetcher-into-an-arbitrary-file-read-0d15679bae00).

The Home research map mounts [Scroll Craft](https://github.com/nateherkai/scroll-craft) (MIT, commit `75d81f7`) while the map is on screen. Each waypoint is a native link. The menu motion and About typography follow the motion and layout playbooks in [Impeccable](https://github.com/pbakaus/impeccable) (commit `b49177d`).

## Credits

[Saltmere](https://threeui.com/saltmere) for the visual reference, [Daniel Neath](https://danielneath.com/) for the pixel reveal and draggable field, [Ramveil](https://ramveil.com/about/) for the profile sections and social-card reference, [Simple Icons](https://simpleicons.org/) for the platform icons, [MengTo/Skills](https://github.com/MengTo/Skills) for the particle interaction, and [Unsplash](https://images.unsplash.com/photo-1511497584788-876760111969) for the forest photograph. Manrope and IBM Plex Mono are served locally. The scene uses Three.js 0.169.0 (MIT) and the About field uses Matter.js 0.20.0 (MIT).
