@AGENTS.md

# fritzpadilla.com — Next.js portfolio

Personal portfolio site for Fritz Padilla. It is built with Next.js as a **fully static export** and hosted on **AWS Amplify Hosting** (static, built from GitHub on every push to `main`). The design reference is the mockup `design/Fritz-Padilla-Portfolio.html` (the "Broadsheet" design system). Treat it as read-only.

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
- **Project content:** Markdown files parsed at build time with `yaml` (frontmatter) and `marked` (story body). They run only during the build, never in the browser, so they add no client JavaScript.
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
```

## Project structure

```
src/
  app/
    layout.tsx              # <html>, font, skip link, Nav, Footer, PrintPlates + PressDriver, metadata defaults
    page.tsx                # Home: hero, at-a-glance, About, Work, Contact; Person JSON-LD
    work/[slug]/page.tsx    # Case study (generateStaticParams, dynamicParams = false)
    work/[slug]/og.png/route.tsx  # per-project social card (route handler → out/work/<slug>/og.png)
    og.png/route.tsx        # home social card (→ out/og.png)
    icons/fp-64.png/, icons/fp-180.png/  # "FP" monogram favicon and Apple touch icon (route handlers)
    sitemap.ts, robots.ts   # static metadata routes (force-static)
    not-found.tsx           # exported as 404.html
  components/               # Nav, ColorBar, Footer, PlateHeadline, Illustration, SectionLabel,
                            # LeaderRow, HalftoneImage, ProjectImage, ProjectIndex, ProjectGrid,
                            # PrintPlates (SVG filter defs), PressDriver (client),
                            # PortraitSwap (client; About portrait → code portrait, once per load)
  content/
    site.ts                 # site identity, settings flags, nav links, hero/glance/about/contact copy
    projects/<slug>.md      # one Markdown file per project (frontmatter + ## story sections)
  lib/
    projects.ts             # reads + validates the .md files; getProjects/getProject/getNextProject/getYearRange
    metadata.ts             # openGraphBase shared by every page's openGraph
    og.tsx                  # build-time ImageResponse cards and monograms
    printPlates.ts          # plate matrices and offsets from the mockup's print-plates.js
  styles/
    tokens.css              # Tailwind @theme: colors, ramps, radii, shadows, fonts; --gutter, --nav-h
    globals.css             # @import "tailwindcss"; base layer; the few component classes
e2e/                        # Playwright specs
amplify.yml                 # Amplify build settings: Node 22, npm ci, npm run build, publish out/
assets/fonts/               # Source Serif 4 TTFs for OG images (SIL OFL, license included)
public/                     # (to come) images/projects/<slug>/, images/portrait.webp, cv.pdf
design/
  Fritz-Padilla-Portfolio.html  # original mockup, read-only reference
docs/
  aws-setup.md              # step-by-step console runbook for Amplify Hosting, the domain and email
```

## Routing (mockup → Next.js)

The mockup uses hash routing (`#/`, `#/about`, `#/work/<slug>`). The real site uses real URLs so every page can be indexed and linked:

| Mockup                           | Site                                                                                                                             |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `#/`                             | `/`                                                                                                                              |
| `#/about`, `#/work`, `#/contact` | `/#about`, `/#work`, `/#contact` (sections on the home page; `scroll-padding-top: var(--nav-h)` on `html` clears the sticky nav) |
| `#/work/<slug>`                  | `/work/<slug>/`                                                                                                                  |

- `trailingSlash: true`, so the export writes `work/<slug>/index.html`. Amplify serves `/work/x/` from `work/x/index.html` and adds the trailing slash to `/work/x` itself.
- The "Next project" link wraps around to the first project.

## Design system rules (from the mockup)

- **Tokens are the source of truth.** Use the theme utilities, or `var(--color-*)` where a utility doesn't fit. Never hard-code a hex value in a component, including in arbitrary values like `bg-[#…]`. `--color-process-yellow` exists only for the print treatments; never use it for interface elements. The illustration draws with `currentColor`, and the OG images read hex values from `tokens.css` at build time.
- **Type:** Source Serif 4 throughout. The heading weight is 600. Small caps labels are 13px, `letter-spacing: 0.08em`, uppercase, and 70% ink. Use the fluid `clamp()` sizes from the mockup.
- **Layout:** content max width 1200px, side gutter `clamp(20px, 5vw, 72px)`. The nav is `sticky` (not fixed, so it can never cover content) with the multi-color bar along its bottom edge. Below 640px it becomes two rows: name and CTA, then the links. `--nav-h` in `tokens.css` must match its measured height (108px on phones, 74px from 640px), because `scroll-padding-top` uses it to land anchors below the nav. The page must not scroll horizontally at 320px.
- **Signature treatments.** Each one gets its own component:
  - `PlateHeadline`: the `.cmyk-head` misregistered C/M/Y text plates on the hero H1. It can be switched off with a flag, which renders plain text.
  - `.cmyk .print`: the four-plate separation via the compound `#sep-all` filter rendered once in the layout (`PrintPlates`, which also defines the single-plate `#sep-c/m/y/k`). The mockup put it on a case-study hero image, but at the owner's request case studies have no hero: the project image (`ProjectImage`, frontmatter `image`) shows the whole image, unfiltered and uncropped, at its natural aspect and never wider than its own pixels. No page uses the treatment right now; the `/specimen/` page that showed it was removed before launch.
  - `.halftone`: the dot-screen overlay on thumbnails, portrait, and screenshots.
  - `Illustration`: the hand-drawn robot and robot dog, converted path-for-path from the mockup SVG, roughened by the `paisley-paint` turbulence filter.
  - Leader-dot rows (the skills and case-study metadata) and the double-rule "at a glance" strip.
- **Pointer "press lean":** ported from the mockup's `print-plates.js`. `components/PrintPlates.tsx` renders the SVG filter defs once in the layout, `components/PressDriver.tsx` (client) animates them and sets `--press-nx/--press-ny`, and the plate values live in `lib/printPlates.ts`. It must do nothing when `prefers-reduced-motion: reduce`, `hover: none`, or `pointer: coarse` applies (the CSS already falls back).
- **Accessibility:** decorative plate spans and the illustration are `aria-hidden`; the `.paper` span carries the real text. A "Skip to content" link is the first tab stop. Visible focus rings (`:focus-visible`). Every real image has meaningful `alt` text; image placeholders are labelled `role="img"` panels. External links open in a new tab with a screen-reader "(opens in a new tab)" note.
- **Contrast:** the mockup's bright `--color-accent` (#0088b0) is only 3.65:1 on paper, so it is for decoration only (print plates, nav color bar, focus rings). Anything carrying text (buttons, ghost links, outline tags, links) uses `accent-700` or darker (5.7:1). Muted ink text must be at least `text-ink/70`. The owner approved this deviation from the mockup.
- **Automated a11y checks** run axe against the built pages, excluding the decorative `.plate` spans (aria-hidden repeats of the real text).
- **Settings flags** live in `settings` in `site.ts`: `headlinePlates` (plate headline on/off), `showAvailability`, `showScreenshots` (the case-study Screenshots section; off for now), `showContactLinks` (the GitHub, LinkedIn and CV links under Contact; off for now), and `workLayout` (`"index"`, the default numbered rows, or `"grid"`).
- Use Server Components by default. Add `'use client'` only for the press-lean effect and similar interactive pieces (`PortraitSwap`: clicking the About portrait swaps it to `about.codePortrait` once, with no way back until reload; tested in `e2e/portrait.spec.ts`).

## Content

- Projects live in `src/content/projects/<slug>.md`, one file per project; the filename is the slug. YAML frontmatter holds `order` (display order), `title, type, year, summary, role, client, duration, team, tools[]`, plus optional `live`, `repo`, `thumb{src,alt}`, `image{src,alt}` (the main project image; formerly `hero`), and `shots[{src?, alt, caption}]`. The body is the story: each `## Heading` starts a section, and its Markdown (paragraphs, lists, emphasis, links) is rendered to HTML at build time with `marked`. External links get the new-tab treatment automatically. `lib/projects.ts` validates every file and fails the build with the file and field name when something is missing. It is build-time only (`node:fs`), so never import it from a client component. In `next dev`, edits to a .md file show on a browser refresh. The live-site and source buttons only render when `live` or `repo` is set. Derived fields (`num`, `href`, `topTools`, the year range) are computed in `lib/projects.ts`, not stored. Adding a project automatically adds its page, sitemap entry, social card and test coverage.
- The owner supplies the real content: projects, screenshots, portrait, bio, and CV. Until it arrives, use clearly marked placeholders (`TODO:` strings, empty image slots with a neutral fill). Do not reuse the mockup's invented projects (Northline, Fieldnotes, and the others) and do not invent new copy or client names.
- The hero, "at a glance", About and Contact copy in `src/content/site.ts` came from the mockup and is marked `TODO: confirm` until the owner approves or replaces it. Missing images render as a labelled placeholder panel (`HalftoneImage` with no `src`).
- Contact is a `mailto:` link only. A contact form (from the revised mockup, `design/Fritz Padilla Portfolio-with-contact.html`) with a Lambda, DynamoDB and SES backend was built and then parked on the branch `contact-form`; see `PLAN.md` Phase 9.
- `site.email` (hello@fritzpadilla.com, from the mockup) is used by the nav CTA, the Contact section and the JSON-LD, and is awaiting confirmation. Mail to it is forwarded to the owner's inbox by a forwarding service (runbook step 8). `site.profiles` stays empty until the real GitHub and LinkedIn URLs are known.

## SEO and metadata

- `metadataBase` is `https://fritzpadilla.com`. Every page sets a canonical URL. A page's `openGraph` **replaces** the layout's, so always spread `openGraphBase` from `lib/metadata.ts` into it.
- `sitemap.ts` and `robots.ts` need `dynamic = "force-static"` for the export.
- Social cards (`og.png/route.tsx` for the home page, `work/[slug]/og.png/route.tsx` for each project) and the icons (`icons/fp-64.png`, `icons/fp-180.png`) are static route handlers that render at build time via `lib/og.tsx`. It reads colors from `tokens.css`, because Satori can't use CSS variables, and uses the TTFs in `assets/fonts/` (SIL OFL; the license is alongside).
- **Every exported image must end in `.png`.** Don't use Next's `opengraph-image`/`icon`/`apple-icon` file conventions: they export without a file extension, and Amplify then adds a trailing slash and serves no image type. Pages link the images through metadata: `openGraphBase` in `lib/metadata.ts` carries the home card (case studies override `images` with `ogImage()`), and the layout's `icons` links the favicons.
- The home page has JSON-LD `Person` data. `site.profiles` feeds `sameAs`; keep it empty until the real URLs are known.

## Deployment (AWS Amplify)

- **The runbook is `docs/aws-setup.md`.** Hosting is set up by hand in the console, with no IaC. Keep the runbook accurate: when a console setting changes, update it in the same commit.
- **The repo is public: no AWS identifiers in it.** Never commit the account ID, the Amplify app ID, the `amplifyapp.com` address, a bucket name or any ARN. Use placeholders like `<app-id>`.
- **Amplify Hosting** (us-west-2) is connected to `fritzp3/fritzpadilla.com`, branch `main` only, with no pull request previews. Every push to `main` builds with `amplify.yml` and publishes `out/`. There is no deploy script and no CI workflow: run lint, typecheck, build and e2e locally before pushing.
  - The app must be on the static platform (**WEB**), not SSR compute: Amplify's SSR support stops at Next.js 15, and the site is a static export.
  - Clean URLs need no rules: Amplify serves `…/` from `…/index.html` and adds the trailing slash to extensionless paths. That is also why every exported image must end in `.png` (see SEO and metadata).
  - Rewrites and redirects (console, runbook step 3): `https://www.fritzpadilla.com` → `https://fritzpadilla.com` (301), then `/<*>` → `/404.html` with status `404-200` ("404 (Rewrite)", which serves the page with a 404 status; plain `404` is a 302 redirect) in place of Amplify's default SPA rule.
  - No custom headers: the owner chose to skip security headers (HSTS, CSP and the rest) on this site.
- **Domain:** `fritzpadilla.com` and `www` are connected in Amplify with an Amplify-managed certificate; Amplify writes the records into the Route 53 hosted zone. The old S3 bucket that redirected the domain to FritzPadilla.me was deleted after the cutover.
- Never commit AWS credentials or `.env*` files.

## Working conventions

- Before calling a feature done, run `npm run build` and check it in `npm run preview`. Dev mode hides static-export errors.
- Compare new UI against `design/Fritz-Padilla-Portfolio.html` at 375px, 768px, 1280px, and 1600px widths.
- Keep components small and presentational. Content stays out of JSX and lives in `src/content/`.
- Do not add runtime dependencies without a reason. The site should stay close to zero client JavaScript apart from the press-lean effect.
- Commit messages: imperative mood, focused on one concern.
- **Workflow with the owner:** work phase by phase (see `PLAN.md`, and keep its status current). At the end of each phase, verify it yourself (build, screenshots against the mockup, e2e, axe), then stop and ask the owner to check it. Commit only after the owner approves. Ask before changing anything that departs from the mockup's look.
- Keep `CLAUDE.md` and `PLAN.md` current in the same change as the work. `AGENTS.md` is generated and maintained by Next.js (`next dev` rewrites it); don't edit it.
