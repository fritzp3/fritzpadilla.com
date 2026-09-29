# Implementation plan — fritzpadilla.com

Decisions: Next.js static export, AWS set up by hand in the console (with a written runbook), DNS in Route 53, deploys through GitHub Actions with OIDC, real content supplied by Fritz. See `CLAUDE.md` for the rules each phase follows.

Each phase ends with something you can check before the next one starts.

## Phase 0 — Scaffold
1. `create-next-app` (TypeScript, App Router, ESLint, `src/` directory, no Tailwind). Add Prettier, `.nvmrc` (Node 22), and `engines`.
2. `next.config.ts`: `output: 'export'`, `trailingSlash: true`, `images.unoptimized: true`.
3. The mockup is at `design/Fritz-Padilla-Portfolio.html`. Add npm scripts (`preview`, `typecheck`, `test:e2e`, `deploy`).
4. `git init`, first commit, push to a new GitHub repository.

**Check:** `npm run build` produces `out/index.html`.

## Phase 1 — Design foundation
1. Port the mockup's `:root` tokens to `src/styles/tokens.css`. Port the base element styles and shared classes (`.btn`, `.tag`, `.halftone`, `.cmyk`, `.cmyk-head`, `.hr`) to `globals.css`.
2. Load Source Serif 4 with `next/font/google` and map it to `--font-heading` and `--font-body`.
3. Decode the mockup's embedded `print-plates.js` so the SVG separation filters (`#sep-c/m/y/k`, `#sep-all`) and the press-driver behavior are ported exactly rather than guessed.

**Check:** a scratch page shows the type scale, buttons, and tags matching the mockup.

## Phase 2 — Layout shell
1. `Nav`: fixed position, brand, About/Work/Contact links (`/#about`, and so on), "Get in touch" button, the multi-color bar along the bottom edge. Wraps cleanly on narrow screens.
2. `Footer`.
3. `layout.tsx` with default metadata and the SVG filter defs rendered once.

## Phase 3 — Home page
1. Hero: `PlateHeadline` (C/M/Y plates, with the on/off flag), intro paragraph, CTAs, the inline robot/elephant SVG illustration.
2. "At a glance" strip with the double rules and the availability flag.
3. About: halftone portrait, bio, skills as leader-dot rows (`LeaderRow`).
4. Work: `ProjectIndex` (numbered rows with thumbnails) and `ProjectGrid`, switched by config.
5. Contact: email, GitHub, LinkedIn, CV link.
6. `PressLean` client component: pointer-driven `--press-nx/--press-ny` and plate registration on hover, off for reduced motion and touch.

**Check:** side-by-side with the mockup at 375, 768, 1280, and 1600px.

## Phase 4 — Case study pages
1. Typed content model in `src/content/projects.ts`, with helpers in `lib/`.
2. `work/[slug]/page.tsx` with `generateStaticParams`: header, metadata strip, live-site and source buttons, `PressFigure` hero, three-part story, tools, screenshot grid, next-project link.
3. `not-found.tsx` exported as `404.html`.

## Phase 5 — SEO and quality
1. `generateMetadata` per page, Open Graph image, `sitemap.ts`, `robots.ts`, JSON-LD `Person`.
2. Playwright tests: every route renders, nav anchors scroll to the right section, the 404 page works, axe finds no serious issues, and there is no horizontal scroll at 320px.
3. Lighthouse check on the built site (target 95+ in every category).

## Phase 6 — AWS setup (console, following `docs/aws-setup.md`)
I write the runbook. You click through it; I can check the result with read-only AWS CLI commands if you want.
1. S3 bucket (private, Block Public Access on, versioning optional).
2. ACM certificate in **us-east-1** for `fritzpadilla.com` and `www.fritzpadilla.com`, validated through Route 53.
3. CloudFront Function (the source in `docs/cloudfront-function.js`): `index.html` rewrite, trailing-slash redirect, www → apex redirect.
4. CloudFront distribution: S3 origin with OAC, the bucket policy CloudFront generates, the function attached, 403/404 → `/404.html`, a security headers policy, alternate domain names plus the certificate.
5. Route 53 A and AAAA alias records for the apex and `www`.
6. IAM: a GitHub OIDC identity provider, plus a deploy role trusted only for this repository's `main` branch, with least-privilege S3 and invalidation permissions.

**Check:** a manual upload of `out/` is served at https://fritzpadilla.com, including `/work/<slug>/` and the 404 page.

## Phase 7 — CI/CD
1. `ci.yml` on pull requests: install, lint, typecheck, build, Playwright.
2. `deploy.yml` on push to `main`: build, then two-pass `s3 sync` with cache headers, then CloudFront invalidation, assuming the OIDC role. Repository variables hold the bucket, distribution ID, role ARN, and region.

**Check:** merging a trivial change deploys it live.

## Phase 8 — Content and launch
1. Swap in your projects, screenshots (exported as WebP at 2x), portrait, bio, CV, and social links.
2. Final review against the mockup, Lighthouse run, then launch.

## What I need from you
- Content per project: title, type, year, summary, role, client, duration, team, tools, a three-part story, live and source URLs, and a thumbnail, hero image, and up to 4 screenshots.
- Portrait, bio paragraphs, skills list, location, availability date, CV PDF, and GitHub and LinkedIn URLs.
- The GitHub repository name or owner (for the OIDC trust policy).
- Whether any project needs to hide its source link (for private repositories).
