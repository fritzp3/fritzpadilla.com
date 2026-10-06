# Implementation plan — fritzpadilla.com

Decisions: Next.js static export styled with Tailwind CSS v4, AWS set up by hand in the console (following a written runbook), DNS in Route 53, deploys through GitHub Actions with OIDC, real content supplied by Fritz. See `CLAUDE.md` for the rules each phase follows.

Each phase ends with something you can check before the next one starts. A phase is committed only after you approve it.

## Status

| Phase                  | State                                                                                                |
| ---------------------- | ---------------------------------------------------------------------------------------------------- |
| 0 — Scaffold           | Done                                                                                                 |
| 1 — Design foundation  | Done                                                                                                 |
| 2 — Layout shell       | Done                                                                                                 |
| 3 — Home page          | Done                                                                                                 |
| 4 — Case study pages   | Done                                                                                                 |
| 5 — SEO and quality    | Done                                                                                                 |
| 6 — AWS setup          | **In progress:** runbook, CloudFront Function and deploy script written, awaiting your console setup |
| 7 — CI/CD              | Not started (repo is up: `fritzp3/fritzpadilla.com`)                                                 |
| 8 — Content and launch | Not started (needs your content)                                                                     |
| 9 — Contact form       | **Parked** on branch `contact-form`; contact stays a hello@ `mailto:` link (runbook step 10)         |

## Phase 0 — Scaffold ✅

1. `create-next-app` (TypeScript, App Router, ESLint, `src/` directory), Prettier, `.nvmrc` (Node 22) and `engines`.
2. `next.config.ts`: `output: 'export'`, `trailingSlash: true`, `images.unoptimized: true`.
3. npm scripts: `preview`, `typecheck` (runs `next typegen` first), `format`, `test:e2e`, `deploy`.
4. `git init` and first commit, pushed to the public GitHub repo `fritzp3/fritzpadilla.com` (its initial README merged in).

## Phase 1 — Design foundation ✅

1. The mockup's tokens became Tailwind's `@theme` in `src/styles/tokens.css`, with the default palette cleared. The base styles and the few classes utilities can't express (`.btn`, `.tag`, `.halftone`, `.cmyk`, `.cmyk-head`) live in `globals.css`.
2. Source Serif 4 through `next/font/google`, self-hosted at build time.
3. The mockup's embedded `print-plates.js` was decoded and ported exactly: the SVG filters (`PrintPlates`) and the hover and pointer-lean press driver (`PressDriver`).
4. Changed along the way: styling switched from plain CSS to Tailwind at your request.

## Phase 2 — Layout shell ✅

1. `Nav`: **sticky** rather than fixed, so it never covers content, with the mockup's color bar. On phones it's two rows (name and CTA, then links), which fixes the mockup's broken wrap. `--nav-h` keeps anchor links landing just below it.
2. `Footer`, a skip link, and the layout with default metadata and the filter defs.

## Phase 3 — Home page ✅

1. Hero: `PlateHeadline` (with an on/off setting), intro, CTAs, and the robot illustration converted path-for-path.
2. "At a glance" strip, About with a portrait placeholder and leader-dot skills, Work (`ProjectIndex` and `ProjectGrid` behind a setting), Contact.
3. Changed along the way:
   - Text-bearing teal (buttons, ghost links, outline tags) uses the darker `accent-700` for WCAG AA contrast, which you approved.
   - On phones, skill rows stack and thumbnails fill the width.

## Phase 4 — Case study pages ✅

1. Content model: one Markdown file per project in `src/content/projects/` (frontmatter fields, `##` story sections), read and validated at build time by `lib/projects.ts`. (Changed from a TypeScript array at your request.)
2. `work/[slug]/page.tsx`: header, facts grid, optional live and source buttons, project image (changed at your request from the four-plate `PressFigure` hero to a plain, uncropped `ProjectImage`), three-part story, tools, screenshots, and a next-project link that wraps around.
3. `not-found.tsx`, exported as `404.html`.

### Changes after Phase 4 (at your request)

- **Projects as Markdown.** `src/content/projects.ts` was replaced by one `.md` file per project in `src/content/projects/`. The filename is the slug, the frontmatter holds the fields (`order` sets display order), and each `## Heading` in the body is a story section, rendered with `marked` (paragraphs, lists, emphasis and links; external links open in a new tab). `lib/projects.ts` reads and validates the files at build time and stops the build with the file and field name when something is wrong. The Work section (index and grid layouts) and the case-study pages both read from it.
- **No hero on case studies.** The four-plate `PressFigure` hero (blurred plates, dot screen, 16:10 crop) was replaced by `ProjectImage`: the whole image, unfiltered and uncropped, at its natural shape and never wider than its own pixels. The frontmatter field is `image` (a leftover `hero` fails the build with a rename hint). The four-plate treatment remains on `/specimen/`, where its e2e hover test now runs.
- The missing-image placeholder label went from `text-ink/55` to `text-ink/70`, because axe flagged its contrast once the print filter no longer hid it.

## Phase 5 — SEO and quality ✅

1. Per-page metadata and canonical URLs, social cards rendered at build time (home and each project), "FP" favicons, `sitemap.xml`, `robots.txt`, and JSON-LD `Person`.
2. Playwright suite (`npm run test:e2e`, 50 tests): every sitemap route, overflow at five widths, axe, navigation, the press driver, SEO files, and CloudFront Function unit tests.
3. Lighthouse: 95–100 in every category. The home page's accessibility score reads 95 only because of the decorative yellow headline plate, which is a false positive.

## Phase 6 — AWS setup (console, following `docs/aws-setup.md`) 🟡

Written and tested:

- the runbook, `docs/aws-setup.md`
- `docs/cloudfront-function.js`, with unit tests
- the Content-Security-Policy, verified against the build
- `scripts/deploy.sh`, dry-run tested on bash 3.2

You follow the runbook; I can check the result with read-only AWS CLI commands if you want.

1. S3 bucket (private, Block Public Access on, versioning on).
2. ACM certificate in **us-east-1** for the apex and `www`, validated through Route 53.
3. CloudFront Function, published.
4. Response headers policy (HSTS, CSP and others).
5. CloudFront distribution: OAC and bucket policy, the function attached, 403/404 → `/404.html`.
6. First deploy with `npm run deploy` and checks against the `cloudfront.net` address.
7. Route 53 alias records. **This makes the site live**, so you may want to wait for Phase 8 content.
8. IAM: GitHub OIDC provider and the deploy role, trusting `repo:fritzp3/fritzpadilla.com`.

**Check:** step 6's `curl` checks pass on the `cloudfront.net` address; after step 7, the same on https://fritzpadilla.com.

## Phase 7 — CI/CD

1. ~~Create the GitHub repo and push~~ (done: `fritzp3/fritzpadilla.com`); finish runbook step 8 with that repo name.
2. `ci.yml` on pull requests: install, lint, typecheck, build, Playwright (including the Chromium install).
3. `deploy.yml` on push to `main`: build, then `scripts/deploy.sh` under the OIDC role. Repository variables hold the bucket, distribution ID, role ARN and region.

**Check:** merging a trivial change deploys it live.

## Phase 8 — Content and launch

1. Replace the placeholder projects (`src/content/projects/*.md`) with yours. Screenshots go in as WebP at 2x under `public/images/projects/<slug>/`.
2. Add the portrait, CV (`public/cv.pdf`), and the GitHub and LinkedIn URLs (`contact.links` and `site.profiles`).
3. Confirm or replace every `TODO: confirm` string in `site.ts`: hero, "at a glance" facts, About, skills, contact, description, job title, and the email address.
4. Delete the temporary `/specimen/` page.
5. Final review against the mockup, e2e and Lighthouse runs, then point DNS (runbook step 7) if it isn't already.

## Phase 9 — Contact form (parked)

A form from the revised mockup (`design/Fritz Padilla Portfolio-with-contact.html`) was built, with a Lambda behind CloudFront that saved each message to DynamoDB and emailed it through SES. On 2026-10-06 you chose the simpler option for now: publish `hello@fritzpadilla.com` as a `mailto:` link, with mail forwarded to your inbox (runbook step 10). The full form work, including its runbook step and tests, is committed on the branch `contact-form`.

Ways to pick it up later:

- Merge `contact-form` as built (one site, AWS backend, no public email).
- Build a shared forms service (API Gateway, Lambda, DynamoDB, SES, in its own repo with AWS SAM) that fritzpadilla.com, TechAndPizza.com and MotoDestinations.com all post to, and point the form at it.
- Use a hosted form service (Formspree, Basin, Web3Forms) if a third party seeing messages is acceptable.

## What I need from you

- Content per project: title, type, year, summary, role, client, duration, team, tools, a three-part story, live and source URLs (either can be omitted), and a thumbnail, a main project image, and up to 4 screenshots with captions.
- Portrait, bio paragraphs, skills list, location, availability date, CV PDF, and GitHub and LinkedIn URLs.
- Confirmation of the contact email, hello@fritzpadilla.com, and the inbox it should forward to (runbook step 10).
