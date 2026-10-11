# Implementation plan — fritzpadilla.com

Decisions: Next.js static export styled with Tailwind CSS v4, hosted on AWS Amplify Hosting set up by hand in the console (following a written runbook), built from GitHub on every push to `main`, DNS in Route 53, real content supplied by Fritz. See `CLAUDE.md` for the rules each phase follows.

Each phase ends with something you can check before the next one starts. A phase is committed only after you approve it.

## Status

| Phase                  | State                                                                                       |
| ---------------------- | ------------------------------------------------------------------------------------------- |
| 0 — Scaffold           | Done                                                                                        |
| 1 — Design foundation  | Done                                                                                        |
| 2 — Layout shell       | Done                                                                                        |
| 3 — Home page          | Done                                                                                        |
| 4 — Case study pages   | Done                                                                                        |
| 5 — SEO and quality    | Done                                                                                        |
| 6 — AWS setup          | Done: live on Amplify, every runbook step complete                                          |
| 7 — CI/CD              | **Dropped:** Amplify deploys on push; checks run locally                                    |
| 8 — Content and launch | Done: real content in, fritzpadilla.com live                                                |
| 9 — Contact form       | **Parked** on branch `contact-form`; contact stays a hello@ `mailto:` link (runbook step 8) |

## Phase 0 — Scaffold ✅

1. `create-next-app` (TypeScript, App Router, ESLint, `src/` directory), Prettier, `.nvmrc` (Node 22) and `engines`.
2. `next.config.ts`: `output: 'export'`, `trailingSlash: true`, `images.unoptimized: true`.
3. npm scripts: `preview`, `typecheck` (runs `next typegen` first), `format`, `test:e2e` (and `deploy`, removed in Phase 6).
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
2. `work/[slug]/page.tsx`: header, facts grid, optional live and source buttons, project image (changed at your request from the four-plate `PressFigure` hero to a plain, uncropped `ProjectImage`), three-part story, tools, screenshots (hidden for now by `settings.showScreenshots`), and a next-project link that wraps around.
3. `not-found.tsx`, exported as `404.html`.

### Changes after Phase 4 (at your request)

- **Projects as Markdown.** `src/content/projects.ts` was replaced by one `.md` file per project in `src/content/projects/`. The filename is the slug, the frontmatter holds the fields (`order` sets display order), and each `## Heading` in the body is a story section, rendered with `marked` (paragraphs, lists, emphasis and links; external links open in a new tab). `lib/projects.ts` reads and validates the files at build time and stops the build with the file and field name when something is wrong. The Work section (index and grid layouts) and the case-study pages both read from it.
- **No hero on case studies.** The four-plate `PressFigure` hero (blurred plates, dot screen, 16:10 crop) was replaced by `ProjectImage`: the whole image, unfiltered and uncropped, at its natural shape and never wider than its own pixels. The frontmatter field is `image` (a leftover `hero` fails the build with a rename hint). The four-plate treatment stayed on `/specimen/` until that page (and its hover test) was removed before launch.
- The missing-image placeholder label went from `text-ink/55` to `text-ink/70`, because axe flagged its contrast once the print filter no longer hid it.

## Phase 5 — SEO and quality ✅

1. Per-page metadata and canonical URLs, social cards rendered at build time (home and each project), "FP" favicons, `sitemap.xml`, `robots.txt`, and JSON-LD `Person`.
2. Playwright suite (`npm run test:e2e`, 50 tests): every sitemap route, overflow at five widths, axe, navigation, the press driver, SEO files, and CloudFront Function unit tests (removed with the switch to Amplify).
3. Lighthouse: 95–100 in every category. The home page's accessibility score reads 95 only because of the decorative yellow headline plate, which is a false positive.

## Phase 6 — AWS setup (console, following `docs/aws-setup.md`) ✅

**Changed on 2026-10-09: S3 + CloudFront → Amplify Hosting.** The first plan (private S3 bucket, CloudFront with a viewer-request function and a security headers policy, `scripts/deploy.sh`, GitHub Actions with OIDC) was half set up, then undone at your request in favor of Amplify, which needs far less AWS plumbing. The bucket, certificate, function and headers policy were deleted; the distribution was never created.

Written and tested:

- the runbook, `docs/aws-setup.md`, rewritten for Amplify
- `amplify.yml`: Node 22 from `.nvmrc`, `npm ci`, `npm run build`, publish `out/`
- social cards and icons exported as `.png` files (`og.png`, `work/<slug>/og.png`, `icons/fp-64.png`, `icons/fp-180.png`), because Amplify treats extensionless paths as pages
- removed: `scripts/deploy.sh`, the `deploy` npm script, `docs/cloudfront-function.js` and its tests
- decided: no custom (security) headers, no pull request previews

You follow the runbook:

1. ~~Create the Amplify app from GitHub (`main` only).~~ Done.
2. ~~Make sure the app is on the static platform (**WEB**), not SSR.~~ Done. The first deploy failed (`required-server-files.json`) until both the app (`update-app --platform WEB`) and the branch (`update-branch --framework "Web"`) were switched.
3. ~~Rewrites: `www` → apex (301), unknown paths → `/404.html`.~~ Done. The 404 rule needs status `404-200` (404 rewrite); plain `404` answered with a 302 to `/404.html`.
4. ~~First deploy and checks on the `amplifyapp.com` address.~~ Done.
5. ~~Custom domain: `fritzpadilla.com` and `www`.~~ Done: **the site is live**, replacing the redirect to FritzPadilla.me. Amplify-managed certificate.
6. ~~Delete the old `fritzpadilla.com` redirect bucket.~~ Done.
7. ~~Optional budget alert.~~ Done. It covers the whole AWS account, so its amount sits above the account's usual bill, not the runbook's $5.
8. ~~Email forwarding for hello@ (ImprovMX).~~ Done and tested.

**Check:** step 4's checks pass on the `amplifyapp.com` address; after step 5, the same on https://fritzpadilla.com.

## Phase 7 — CI/CD (dropped)

Amplify builds and deploys every push to `main`, so there's no deploy workflow. You chose not to add GitHub Actions checks on pull requests: run `npm run lint`, `npm run typecheck`, `npm run build` and `npm run test:e2e` locally before pushing. Amplify's build is the only automated gate.

## Phase 8 — Content and launch ✅

1. Replace the placeholder projects (`src/content/projects/*.md`) with yours. Screenshots go in as WebP at 2x under `public/images/projects/<slug>/`.
2. Add the portrait, CV (`public/cv.pdf`), and the GitHub and LinkedIn URLs (`contact.links` and `site.profiles`). The Contact section's links are hidden by `settings.showContactLinks` until the CV is ready; turn it on then.
3. Confirm or replace every `TODO: confirm` string in `site.ts`: hero, "at a glance" facts, About, skills, contact, description, job title, and the email address.
4. ~~Delete the temporary `/specimen/` page.~~ Done.
5. Final review against the mockup, e2e and Lighthouse runs, then connect the domain (runbook step 5). Done: fritzpadilla.com is live.

### After launch

- 2026-10-11: Google Analytics 4 (`G-44XPSN74LN`) added through `components/Analytics.tsx`. It loads only on fritzpadilla.com. No consent banner, since the owner is US-based.
- 2026-10-11: Click events added: `nav_click` (About, Work, Contact, the logo, the hero buttons, "All work") and `contact_email_click` (both email links). In GA, mark `contact_email_click` as a key event and register `link_text` and `link_location` as event-scoped custom dimensions.
- 2026-10-11: "At a glance" location corrected from the mockup's "Based in Lisbon" to "Based in Denver, Colorado". The strip's other facts are still `TODO: confirm`.

## Phase 9 — Contact form (parked)

A form from the revised mockup (`design/Fritz Padilla Portfolio-with-contact.html`) was built, with a Lambda behind CloudFront that saved each message to DynamoDB and emailed it through SES. On 2026-10-06 you chose the simpler option for now: publish `hello@fritzpadilla.com` as a `mailto:` link, with mail forwarded to your inbox (runbook step 8). The full form work, including its runbook step and tests, is committed on the branch `contact-form`.

Ways to pick it up later:

- Merge `contact-form` as built (one site, AWS backend, no public email).
- Build a shared forms service (API Gateway, Lambda, DynamoDB, SES, in its own repo with AWS SAM) that fritzpadilla.com, TechAndPizza.com and MotoDestinations.com all post to, and point the form at it.
- Use a hosted form service (Formspree, Basin, Web3Forms). Third-party tools are fine on this site.

## What I need from you

- Content per project: title, type, year, summary, role, client, duration, team, tools, a three-part story, live and source URLs (either can be omitted), and a thumbnail, a main project image, and up to 4 screenshots with captions.
- Portrait, bio paragraphs, skills list, location (done: Denver, Colorado), availability date, CV PDF, and GitHub and LinkedIn URLs.
- Confirmation of the contact email, hello@fritzpadilla.com, and the inbox it should forward to (runbook step 8).
