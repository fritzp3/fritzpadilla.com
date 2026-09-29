@AGENTS.md

# fritzpadilla.com — Next.js portfolio

Personal portfolio site for Fritz Padilla. It is built with Next.js as a **fully static export** and hosted on **AWS S3 + CloudFront**. The design reference is the mockup `design/Fritz-Padilla-Portfolio.html` (the "Broadsheet" design system). Treat it as read-only.

## Stack

- **Next.js 16** (App Router; 16.3.7 at setup), **React 19**, **TypeScript** (strict), **Tailwind CSS 4**
- **Static export only**: `output: 'export'` in `next.config.ts`. There is no Node server at runtime, so:
  - No API routes, Server Actions, middleware, ISR, `cookies()`/`headers()`, or `next/image` optimization (`images.unoptimized: true`).
  - Every dynamic route must implement `generateStaticParams` with `dynamicParams = false`.
  - In Next 16, `params` is a Promise: type pages with the generated `PageProps<"/work/[slug]">` helper and `await props.params`.
- **Styling: Tailwind CSS v4** (via `@tailwindcss/postcss`; no `tailwind.config` file).
  - `src/styles/tokens.css` holds the mockup's tokens inside `@theme`. They generate the utilities (`bg-accent`, `text-accent-2-700`, `border-divider`, `rounded-md`, `shadow-lg`, `font-heading`, `text-ink/70`) and remain CSS variables. Tailwind's default colors, radii and shadows are cleared, so only brand values exist.
  - Spacing tokens `--space-1…8` (multiples of 5px) are plain variables. Use them as `p-(--space-3)`, or use arbitrary px values that match the mockup.
  - Layout and one-off styling are utilities in the JSX. Arbitrary values (`text-[clamp(42px,6.4vw,84px)]`) are fine where the mockup uses exact numbers.
  - `src/styles/globals.css` holds element defaults in `@layer base`, and a **short** list of named classes in `@layer components`: `.btn*`, `.tag*`, `.halftone`, `.cmyk`/`.print`, `.cmyk-head`/`.plate*`. Add a class there only when utilities can't express it (pseudo-elements, blend modes, SVG filter references). Never write unlayered CSS, because it would beat every utility.
  - Class order is sorted by `prettier-plugin-tailwindcss`. No CSS Modules and no CSS-in-JS.
- **Fonts:** Source Serif 4 (400, 400 italic, 600) through `next/font/google`, which self-hosts the files at build time. No runtime calls to Google Fonts.
- **Package manager:** npm. **Node:** 22 LTS (pinned in `.nvmrc` and `engines`). The machine default is Node 25, so run `nvm use` first.
- **Next.js 16:** the APIs differ from older versions (for example, middleware is now "Proxy"). Check `node_modules/next/dist/docs/` before using an unfamiliar API.
- **Local tool gotchas (this Mac):**
  - The first `git` on the PATH is 2.6.4 (from 2015). Use `/usr/bin/git` (2.39).
  - The first `curl` on the PATH is outdated and fails TLS certificate checks. Use `/usr/bin/curl`, never `-k`.
  - `/bin/bash` is 3.2. Shell scripts must work on it (for example, an empty array under `set -u` needs `${arr[@]+"${arr[@]}"}`), as well as on bash 5 in CI.
  - `shellcheck` isn't installed.
- **Lint and format:** ESLint (`next/core-web-vitals`, `next/typescript`) and Prettier.
- **Testing:** Playwright (`e2e/`) against the built `out/` folder, served on port 4173. It covers every sitemap route (status, single h1, title, canonical, og:image), horizontal overflow at 320–1600px, axe WCAG A/AA at 375px and 1280px, nav anchors vs `--nav-h`, next-project cycling, the skip link, the press driver (including reduced motion), JSON-LD, robots, sitemap, and preview images. Routes are read from `out/sitemap.xml`, so new projects are tested automatically.
- **Lighthouse** (run manually against `npm run preview`): 95–100 in every category. The home page's accessibility score is capped at 95 because Lighthouse flags the decorative yellow headline plate (aria-hidden, 1.6:1). It can't be excluded, and it isn't a real failure.

## Commands

```bash
npm run dev          # local dev server
npm run build        # static export to ./out
npm run preview      # serve ./out at http://localhost:3000 to test the real artifact
npm run lint
npm run typecheck    # next typegen && tsc --noEmit (typegen creates PageProps<"/route"> types)
npm run test:e2e     # Playwright against ./out (build first); serves on port 4173
npm run format       # prettier --write (format:check verifies)
npm run deploy       # S3_BUCKET=… CLOUDFRONT_DISTRIBUTION_ID=… (DRYRUN=1 to preview); see Deployment
```

## Project structure

```
src/
  app/
    layout.tsx              # <html>, font, skip link, Nav, Footer, PrintPlates + PressDriver, metadata defaults
    page.tsx                # Home: hero, at-a-glance, About, Work, Contact; Person JSON-LD
    work/[slug]/page.tsx    # Case study (generateStaticParams, dynamicParams = false)
    work/[slug]/opengraph-image.tsx  # per-project social card
    opengraph-image.tsx     # home social card
    icon.tsx, apple-icon.tsx  # "FP" monogram favicons
    sitemap.ts, robots.ts   # static metadata routes (force-static)
    not-found.tsx           # exported as 404.html
    specimen/page.tsx       # TEMPORARY design specimen (noindex); delete before launch
  components/               # Nav, ColorBar, Footer, PlateHeadline, Illustration, SectionLabel,
                            # LeaderRow, HalftoneImage, PressFigure, ProjectIndex, ProjectGrid,
                            # PrintPlates (SVG filter defs), PressDriver (client)
  content/
    site.ts                 # site identity, settings flags, nav links, hero/glance/about/contact copy
    projects.ts             # typed project list (display order = array order)
  lib/
    projects.ts             # getProjects/getProject/getNextProject/getYearRange (derived fields)
    metadata.ts             # openGraphBase shared by every page's openGraph
    og.tsx                  # build-time ImageResponse cards and monograms
    printPlates.ts          # plate matrices and offsets from the mockup's print-plates.js
  styles/
    tokens.css              # Tailwind @theme: colors, ramps, radii, shadows, fonts; --gutter, --nav-h
    globals.css             # @import "tailwindcss"; base layer; the few component classes
e2e/                        # Playwright specs (+ CloudFront Function unit tests)
scripts/deploy.sh           # the only way to deploy (see Deployment)
assets/fonts/               # Source Serif 4 TTFs for OG images (SIL OFL, license included)
public/                     # (to come) images/projects/<slug>/, images/portrait.webp, cv.pdf
design/
  Fritz-Padilla-Portfolio.html  # original mockup, read-only reference
docs/
  aws-setup.md              # step-by-step console runbook for S3, ACM, CloudFront, Route 53, IAM
  cloudfront-function.js    # viewer-request function source (pasted into the console)
```

## Routing (mockup → Next.js)

The mockup uses hash routing (`#/`, `#/about`, `#/work/<slug>`). The real site uses real URLs so every page can be indexed and linked:

| Mockup                           | Site                                                                                                                             |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `#/`                             | `/`                                                                                                                              |
| `#/about`, `#/work`, `#/contact` | `/#about`, `/#work`, `/#contact` (sections on the home page; `scroll-padding-top: var(--nav-h)` on `html` clears the sticky nav) |
| `#/work/<slug>`                  | `/work/<slug>/`                                                                                                                  |

- `trailingSlash: true`, so the export writes `work/<slug>/index.html`. This keeps S3 object keys predictable.
- The "Next project" link wraps around to the first project.

## Design system rules (from the mockup)

- **Tokens are the source of truth.** Use the theme utilities, or `var(--color-*)` where a utility doesn't fit. Never hard-code a hex value in a component, including in arbitrary values like `bg-[#…]`. `--color-process-yellow` exists only for the print treatments; never use it for interface elements. The illustration draws with `currentColor`, and the OG images read hex values from `tokens.css` at build time.
- **Type:** Source Serif 4 throughout. The heading weight is 600. Small caps labels are 13px, `letter-spacing: 0.08em`, uppercase, and 70% ink. Use the fluid `clamp()` sizes from the mockup.
- **Layout:** content max width 1200px, side gutter `clamp(20px, 5vw, 72px)`. The nav is `sticky` (not fixed, so it can never cover content) with the multi-color bar along its bottom edge. Below 640px it becomes two rows: name and CTA, then the links. `--nav-h` in `tokens.css` must match its measured height (108px on phones, 74px from 640px), because `scroll-padding-top` uses it to land anchors below the nav. The page must not scroll horizontally at 320px.
- **Signature treatments.** Each one gets its own component:
  - `PlateHeadline`: the `.cmyk-head` misregistered C/M/Y text plates on the hero H1. It can be switched off with a flag, which renders plain text.
  - `PressFigure`: the `.cmyk .print` four-plate separation on the case-study hero image, via the compound `#sep-all` filter rendered once in the layout (`PrintPlates`, which also defines the single-plate `#sep-c/m/y/k`).
  - `.halftone`: the dot-screen overlay on thumbnails, portrait, and screenshots.
  - `Illustration`: the hand-drawn robot and robot dog, converted path-for-path from the mockup SVG, roughened by the `paisley-paint` turbulence filter.
  - Leader-dot rows (the skills and case-study metadata) and the double-rule "at a glance" strip.
- **Pointer "press lean":** ported from the mockup's `print-plates.js`. `components/PrintPlates.tsx` renders the SVG filter defs once in the layout, `components/PressDriver.tsx` (client) animates them and sets `--press-nx/--press-ny`, and the plate values live in `lib/printPlates.ts`. It must do nothing when `prefers-reduced-motion: reduce`, `hover: none`, or `pointer: coarse` applies (the CSS already falls back).
- **Accessibility:** decorative plate spans and the illustration are `aria-hidden`; the `.paper` span carries the real text. A "Skip to content" link is the first tab stop. Visible focus rings (`:focus-visible`). Every real image has meaningful `alt` text; image placeholders are labelled `role="img"` panels. External links open in a new tab with a screen-reader "(opens in a new tab)" note.
- **Contrast:** the mockup's bright `--color-accent` (#0088b0) is only 3.65:1 on paper, so it is for decoration only (print plates, nav color bar, focus rings). Anything carrying text (buttons, ghost links, outline tags, links) uses `accent-700` or darker (5.7:1). Muted ink text must be at least `text-ink/70`. The owner approved this deviation from the mockup.
- **Automated a11y checks** run axe against the built pages, excluding the decorative `.plate` spans (aria-hidden repeats of the real text).
- **Settings flags** live in `settings` in `site.ts`: `headlinePlates` (plate headline on/off), `showAvailability`, and `workLayout` (`"index"`, the default numbered rows, or `"grid"`).
- Use Server Components by default. Add `'use client'` only for the press-lean effect and similar interactive pieces.

## Content

- Projects live in `src/content/projects.ts` as a typed array, in display order. Fields: `slug, title, type, year, summary, role, client, duration, team, tools[], story[{heading, body}]`, plus optional `live`, `repo`, `thumb{src,alt}`, `hero{src,alt}`, and `shots[{src?, alt, caption}]`. The live-site and source buttons only render when `live` or `repo` is set. Derived fields (`num`, `href`, `topTools`, the year range) are computed in `lib/projects.ts`, not stored. Adding a project automatically adds its page, sitemap entry, social card and test coverage.
- The owner supplies the real content: projects, screenshots, portrait, bio, and CV. Until it arrives, use clearly marked placeholders (`TODO:` strings, empty image slots with a neutral fill). Do not reuse the mockup's invented projects (Northline, Fieldnotes, and the others) and do not invent new copy or client names.
- The hero, "at a glance", About and Contact copy in `src/content/site.ts` came from the mockup and is marked `TODO: confirm` until the owner approves or replaces it. Missing images render as a labelled placeholder panel (`HalftoneImage` with no `src`).
- Contact is a `mailto:` link only. There is no form, because nothing server-side runs on a static site.
- `site.email` (hello@fritzpadilla.com, from the mockup) is used by the nav CTA, the Contact section and the JSON-LD, and is awaiting confirmation. `site.profiles` stays empty until the real GitHub and LinkedIn URLs are known.

## SEO and metadata

- `metadataBase` is `https://fritzpadilla.com`. Every page sets a canonical URL. A page's `openGraph` **replaces** the layout's, so always spread `openGraphBase` from `lib/metadata.ts` into it.
- `sitemap.ts` and `robots.ts` need `dynamic = "force-static"` for the export. The specimen page is `noindex` and left out of the sitemap.
- Social previews (`opengraph-image.tsx` for the home page and each project) and the favicons (`icon.tsx`, `apple-icon.tsx`) render at build time via `lib/og.tsx`. It reads colors from `tokens.css`, because Satori can't use CSS variables, and uses the TTFs in `assets/fonts/` (SIL OFL; the license is alongside).
- **These image routes export without a file extension** (`out/opengraph-image`, `out/icon`, `out/apple-icon`, `out/work/<slug>/opengraph-image`). The deploy must upload them with `Content-Type: image/png`, or S3 serves them as binary.
- The home page has JSON-LD `Person` data. `site.profiles` feeds `sameAs`; keep it empty until the real URLs are known.

## Deployment (AWS)

- **The runbook is `docs/aws-setup.md`.** Infrastructure is set up by hand in the console, with no IaC. Keep the runbook accurate: when a console setting changes, update it in the same commit.
- **S3:** private bucket in `us-east-1`, Block Public Access on, ACLs disabled, versioning on, no website hosting. CloudFront reads it through **Origin Access Control**.
- **CloudFront:**
  - The viewer-request **CloudFront Function** (`docs/cloudfront-function.js`, runtime cloudfront-js-2.0) redirects `www` to the apex, maps `…/` to `…/index.html`, 301s extensionless page paths to the trailing-slash form, and passes Next's extensionless metadata images (`opengraph-image`, `icon`, `apple-icon`) through untouched. `e2e/cloudfront-function.spec.ts` unit-tests it. Any change to routes or metadata files must keep those tests passing, and the function must be re-pasted and re-published in the console.
  - Cache policy CachingOptimized. The response headers policy sets HSTS, nosniff, `X-Frame-Options: DENY`, Referrer-Policy, and a CSP. The CSP needs `'unsafe-inline'` for scripts because Next's static export writes inline bootstrap scripts. It was verified against the build, so re-verify if third-party scripts are ever added.
  - 403 and 404 map to `/404.html` with status 404. S3 returns 403 for missing keys under OAC.
- **TLS and DNS:** the ACM certificate is in **us-east-1** and covers the apex and `www`. Route 53 has A and AAAA alias records for both.
- **Deploy: `scripts/deploy.sh`** (`npm run deploy`, with `S3_BUCKET` and `CLOUDFRONT_DISTRIBUTION_ID` set; `DRYRUN=1` previews). Always use it rather than a plain `aws s3 sync`. It uploads in order: `_next/` as `public, max-age=31536000, immutable`, then other static files as `max-age=86400`, then the extensionless images explicitly as `image/png`, then pages, RSC `.txt` data, sitemap and robots as `public, max-age=0, s-maxage=31536000, must-revalidate`. It deletes stale files last and then invalidates `/*`. It must stay compatible with macOS bash 3.2 (for example, empty arrays under `set -u`).
- **CI/CD:** GitHub Actions (`.github/workflows/`). Pull requests run lint, typecheck, build and e2e. A push to `main` runs the same deploy script, assuming the IAM role `fritzpadilla-com-deploy` through **GitHub OIDC** (runbook step 8). That role can only list, write and delete in the site bucket and invalidate the distribution. No long-lived AWS keys are stored anywhere. The bucket name, distribution ID, role ARN and region are GitHub repository variables.
- Never commit AWS credentials or `.env*` files.

## Working conventions

- Before calling a feature done, run `npm run build` and check it in `npm run preview`. Dev mode hides static-export errors.
- Compare new UI against `design/Fritz-Padilla-Portfolio.html` at 375px, 768px, 1280px, and 1600px widths.
- Keep components small and presentational. Content stays out of JSX and lives in `src/content/`.
- Do not add runtime dependencies without a reason. The site should stay close to zero client JavaScript apart from the press-lean effect.
- Commit messages: imperative mood, focused on one concern.
- **Workflow with the owner:** work phase by phase (see `PLAN.md`, and keep its status current). At the end of each phase, verify it yourself (build, screenshots against the mockup, e2e, axe), then stop and ask the owner to check it. Commit only after the owner approves. Ask before changing anything that departs from the mockup's look.
- Keep `CLAUDE.md` and `PLAN.md` current in the same change as the work. `AGENTS.md` is generated and maintained by Next.js (`next dev` rewrites it); don't edit it.
