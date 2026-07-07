Source code for [aadeshsalecha.github.io](https://aadeshsalecha.github.io/) — a scroll-driven "EV Highway" experience built with vanilla JS, an AI-generated video hero, and Three.js for the rest of the scroll (no build step, deploys as-is on GitHub Pages).

- `index.html` / `stylesheet.css` — page structure and styling
- `images/hero/` — the looping hero video (boomerang-looped, compressed) and its poster frame
- `js/experience.js` — the Three.js world (terrain, sky, sun, solar panels, turbines, EV, camera path)
- `js/main.js` — scroll progress, hero video handoff, panel reveal, nav, research drawer
- `js/vendor/` — vendored Three.js and Chart.js builds (no CDN dependency)
- `resume/` — the LaTeX CV (Overleaf project), auto-updated from Google Scholar by `.github/workflows/update-cv.yml`

`zipnerf/` and `data/` are unrelated legacy project pages, kept as-is.
