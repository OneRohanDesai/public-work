# Public work

This repository owns the public-source portfolio at `rohandesai.in/` and the existing `/projects` browser. Its source is copied from `Side-Projects/index.html`, `raining-dog.gif`, and the complete `Side-Projects/projects` directory.

`npm ci` installs Wrangler. `npm run check` builds the static asset directory and verifies that the portfolio page, image, project browser, and project manifest remain byte for byte identical to their source files. The target Cloudflare Worker is `public-work-static` (`wrangler.jsonc`).

Production deployment and the apex Custom Domain must wait until the private-owned apex path routes and existing Cloudflare Git integration are reconciled. Do not push a deployment trigger while that integration still targets the old `public-work` Worker.
