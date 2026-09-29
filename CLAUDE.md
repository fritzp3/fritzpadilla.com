@AGENTS.md

# fritzpadilla.com — Next.js portfolio

Personal portfolio site for Fritz Padilla. It is built with Next.js as a **fully static export** and hosted on **AWS S3 + CloudFront**. The design reference is the mockup `design/Fritz-Padilla-Portfolio.html` (the "Broadsheet" design system). Treat it as read-only.

## Stack

- **Next.js** (latest stable, App Router), **TypeScript** (strict), **React**
- **Static export only**: `output: 'export'` in `next.config.ts`. There is no Node server at runtime, so:
  - No API routes, Server Actions, middleware, ISR, `cookies()`/`headers()`, or `next/image` optimization (`images.unoptimized: true`).
  - Every dynamic route must implement `generateStaticParams` with `dynamicParams = false`.
- **Styling: Tailwind CSS v4** (via `@tailwindcss/postcss`; no `tailwind.config` file).
  - `src/styles/tokens.css` holds the mockup's tokens inside `@theme`. They generate the utilities (`bg-accent`, `text-accent-2-700`, `border-divider`, `rounded-md`, `shadow-lg`, `font-heading`, `text-ink/70`) and remain CSS variables. Tailwind's default colors, radii and shadows are cleared, so only brand values exist.
  - Spacing tokens `--space-1…8` (multiples of 5px) are plain variables. Use them as `p-(--space-3)`, or use arbitrary px values that match the mockup.
  - Layout and one-off styling are utilities in the JSX. Arbitrary values (`text-[clamp(42px,6.4vw,84px)]`) are fine where the mockup uses exact numbers.
  - `src/styles/globals.css` holds element defaults in `@layer base`, and a **short** list of named classes in `@layer components`: `.btn*`, `.tag*`, `.halftone`, `.cmyk`/`.print`, `.cmyk-head`/`.plate*`. Add a class there only when utilities can't express it (pseudo-elements, blend modes, SVG filter references). Never write unlayered CSS, because it would beat every utility.
  - Class order is sorted by `prettier-plugin-tailwindcss`. No CSS Modules and no CSS-in-JS.
- **Fonts:** Source Serif 4 (400, 400 italic, 600) through `next/font/google`, which self-hosts the files at build time. No runtime calls to Google Fonts.
- **Package manager:** npm. **Node:** 22 LTS (pinned in `.nvmrc` and `engines`). The machine default is Node 25, so run `nvm use` first.
- **Next.js 16:** the APIs differ from older versions (for example, middleware is now "Proxy"). Check `node_modules/next/dist/docs/` before using an unfamiliar API.
- **Git:** the first `git` on the local PATH is 2.6.4 (from 2015). Use `/usr/bin/git` (2.39).
- **Lint and format:** ESLint (`next/core-web-vitals`, `next/typescript`) and Prettier.
- **Testing:** Playwright for smoke and visual tests of the built `out/` folder, plus `@axe-core/playwright` for accessibility.

## Commands

```bash
npm run dev          # local dev server
npm run build        # static export to ./out
npm run preview      # serve ./out locally (npx serve out) to test the real artifact
npm run lint
npm run typecheck    # tsc --noEmit
npm run test:e2e     # Playwright against ./out
npm run format       # prettier
npm run deploy       # used by CI: sync ./out to S3 and invalidate CloudFront (see Deployment)
```

## Project structure

```
src/
  app/
    layout.tsx              # <html>, fonts, Nav, Footer, metadata defaults
    page.tsx                # Home: hero, at-a-glance, About, Work, Contact sections
    work/[slug]/page.tsx    # Case study (static params generated from content)
    not-found.tsx           # exported as 404.html
    sitemap.ts, robots.ts   # static metadata routes
  components/               # Nav, Footer, ColorBar, PlateHeadline, PressFigure,
                            # HalftoneImage, ProjectIndex, ProjectGrid, LeaderRow, Illustration…
  content/
    projects.ts             # typed project data (the single source of truth)
    site.ts                 # name, email, location, availability, skills, social links
  lib/                      # helpers (e.g. getProject, getNextProject)
  styles/
    tokens.css              # Tailwind @theme: colors, ramps, radii, shadows, fonts (from mockup)
    globals.css             # @import "tailwindcss"; base layer; the few component classes
public/
  images/projects/<slug>/   # thumb, hero, shot-1..4 (pre-sized WebP + fallback)
  cv.pdf
design/
  Fritz-Padilla-Portfolio.html  # original mockup, read-only reference
docs/
  aws-setup.md              # step-by-step console setup for S3, CloudFront, ACM, Route 53, IAM
  cloudfront-function.js    # viewer-request function source (pasted into the console)
```

## Routing (mockup → Next.js)

The mockup uses hash routing (`#/`, `#/about`, `#/work/<slug>`). The real site uses real URLs so every page can be indexed and linked:

| Mockup                           | Site                                                                                                   |
| -------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `#/`                             | `/`                                                                                                    |
| `#/about`, `#/work`, `#/contact` | `/#about`, `/#work`, `/#contact` (sections on the home page, `scroll-margin-top` clears the fixed nav) |
| `#/work/<slug>`                  | `/work/<slug>/`                                                                                        |

- `trailingSlash: true`, so the export writes `work/<slug>/index.html`. This keeps S3 object keys predictable.
- The "Next project" link wraps around to the first project.

## Design system rules (from the mockup)

- **Tokens are the source of truth.** Use the theme utilities, or `var(--color-*)` where a utility doesn't fit. Never hard-code a hex value in a component, including in arbitrary values like `bg-[#…]`. The one exception is `--color-process-yellow`, which is used only for print treatments.
- **Type:** Source Serif 4 throughout. The heading weight is 600. Small caps labels are 13px, `letter-spacing: 0.08em`, uppercase, and 70% ink. Use the fluid `clamp()` sizes from the mockup.
- **Layout:** content max width 1200px, side gutter `clamp(20px, 5vw, 72px)`. The nav is fixed with the multi-color bar along its bottom edge. The page must not scroll horizontally at 320px.
- **Signature treatments.** Each one gets its own component:
  - `PlateHeadline`: the `.cmyk-head` misregistered C/M/Y text plates on the hero H1. It can be switched off with a flag, which renders plain text.
  - `PressFigure`: the `.cmyk` four-plate separation on the case-study hero image, using the SVG `feColorMatrix` filters (`#sep-c/m/y/k`, `#sep-all`) rendered once in the layout.
  - `.halftone`: the dot-screen overlay on thumbnails, portrait, and screenshots.
  - The hand-drawn robot/elephant illustration: an inline SVG with the `paisley-paint` turbulence filter.
  - Leader-dot rows (the skills and case-study metadata) and the double-rule "at a glance" strip.
- **Pointer "press lean":** ported from the mockup's `print-plates.js`. `components/PrintPlates.tsx` renders the SVG filter defs once in the layout, `components/PressDriver.tsx` (client) animates them and sets `--press-nx/--press-ny`, and the plate values live in `lib/printPlates.ts`. It must do nothing when `prefers-reduced-motion: reduce`, `hover: none`, or `pointer: coarse` applies (the CSS already falls back).
- **Accessibility:** decorative plate spans and the illustration are `aria-hidden`. The `.paper` span carries the real text. Visible focus rings (`:focus-visible`). Placeholder contrast meets 4.5:1. Every image has meaningful `alt` text.
- **Work list layout:** the mockup has two layouts, `index` (default) and `grid`. Build both behind a single config value in `site.ts`.
- Use Server Components by default. Add `'use client'` only for the press-lean effect and similar interactive pieces.

## Content

- Projects live in `src/content/projects.ts` as a typed array. Each project has `slug, title, type, year, summary, role, client, duration, team, tools[], story[{h,p}], live, repo, shots[{src,alt,caption}]`. Derived fields such as `num`, `href`, and `topTools` are computed in `lib/`, not stored.
- The owner supplies the real content: projects, screenshots, portrait, bio, and CV. Until it arrives, use clearly marked placeholders (`TODO:` strings, empty image slots with a neutral fill). Do not reuse the mockup's invented projects (Northline, Fieldnotes, and the others) and do not invent new copy or client names.
- Contact is a `mailto:` link only. There is no form, because nothing server-side runs on a static site.
- The availability line is controlled by a `showAvailability` flag in `site.ts`.

## SEO and metadata

- Per-page `generateMetadata`: title, description, canonical URL, Open Graph, and Twitter card. `metadataBase` is `https://fritzpadilla.com`.
- `sitemap.xml` and `robots.txt` are generated at build time. There is a JSON-LD `Person` block on the home page.

## Deployment (AWS)

- **S3 bucket:** private, Block Public Access on, no website hosting endpoint. CloudFront reads it through **Origin Access Control (OAC)**.
- **CloudFront:**
  - A **CloudFront Function** (viewer request) appends `index.html` to paths ending in `/` and redirects extensionless paths to the trailing-slash form. It also redirects `www` to the apex domain.
  - A custom error response maps 403/404 to `/404.html` with status 404.
  - HTTP to HTTPS redirect, HTTP/2 and HTTP/3, compression on.
  - A response headers policy with HSTS, CSP, `X-Content-Type-Options`, and `Referrer-Policy`.
- **TLS:** the ACM certificate **must be in us-east-1**, validated by DNS in Route 53. **DNS:** the domain is hosted in Route 53. Create A and AAAA alias records for the apex and `www` pointing to the distribution.
- **Infrastructure is set up by hand in the AWS console, with no IaC.** `docs/aws-setup.md` is the runbook and must stay accurate: whenever a setting changes, update the doc in the same commit. The CloudFront Function source lives in `docs/cloudfront-function.js`.
- **Cache strategy (set on upload):**
  - `_next/static/*` and hashed assets: `Cache-Control: public, max-age=31536000, immutable`
  - HTML, `sitemap.xml`, `robots.txt`: `Cache-Control: public, max-age=0, must-revalidate`
  - Images in `/images`: `max-age=86400`
- **Deploy steps:** `next build`, then `aws s3 sync out/ s3://<bucket> --delete` in two passes (immutable assets first, then HTML with no-cache), then `aws cloudfront create-invalidation --paths "/*"` (or only the HTML paths).
- **CI/CD:** GitHub Actions (`.github/workflows/`). Pull requests run lint, typecheck, build, and e2e. A push to `main` deploys by assuming an IAM role through **GitHub OIDC**. The role may only `s3:ListBucket`/`PutObject`/`DeleteObject` on the site bucket and `cloudfront:CreateInvalidation` on the distribution. No long-lived AWS keys are stored anywhere. The bucket name, distribution ID, role ARN, and region are GitHub repository variables.
- Never commit AWS credentials, account IDs you don't want public, or `.env*` files. Bucket name and distribution ID come from CI variables or CDK outputs.

## Working conventions

- Before calling a feature done, run `npm run build` and check it in `npm run preview`. Dev mode hides static-export errors.
- Compare new UI against `design/Fritz-Padilla-Portfolio.html` at 375px, 768px, 1280px, and 1600px widths.
- Keep components small and presentational. Content stays out of JSX and lives in `src/content/`.
- Do not add runtime dependencies without a reason. The site should stay close to zero client JavaScript apart from the press-lean effect.
- Commit messages: imperative mood, focused on one concern.
