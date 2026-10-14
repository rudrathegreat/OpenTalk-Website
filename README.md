# OpenTalk website

A standalone, buildless product website recreated from the supplied `website-design.jpg` reference.

## Run locally

From the repository root:

```powershell
python -m http.server 4173 --directory website
```

Then open `http://127.0.0.1:4173`.

The site uses only HTML, CSS, JavaScript, and local visual assets. It has no package install or build step. Lenis 1.3.26 is loaded from its documented pinned CDN build with a SHA-384 integrity check; if it is unavailable, the page keeps native scrolling. Its `lerp: 0.1` and explicit animation-frame loop follow the effective smooth-scroll behavior of the ASTRAL Institute website. Smooth scrolling and reveal motion are disabled for visitors who prefer reduced motion.
