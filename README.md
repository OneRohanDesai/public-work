# Public work

This repository owns the public-source portfolio at `rohandesai.in/` and the existing `/projects` browser. Its source is copied from `Side-Projects/index.html`, `raining-dog.gif`, and the complete `Side-Projects/projects` directory.

`npm ci` installs Wrangler. `npm run check` builds the static asset directory and verifies that the portfolio page, image, project browser, and project manifest remain byte for byte identical to their source files. The target Cloudflare Worker is `public-work-static` (`wrangler.jsonc`).

The apex Custom Domain now serves `public-work-static`. The Worker script serves the unchanged project browser HTML for direct navigation to `/projects/<project>` and `/projects/<project>/f/<file>`, so refresh and browser history retain the selected view. Existing project source files are still served as static assets for the browser's code fetches. The private-owned `/chill/...` and `/future/...` paths use exact Worker Routes to `private-work-static`.
