# AWS setup runbook: fritzpadilla.com

This guide sets up hosting for the static site with **AWS Amplify Hosting**, connected to the GitHub repo, on the `fritzpadilla.com` domain in Route 53. Every push to `main` builds the site and deploys it; there are no pull request previews. It's written to be followed top to bottom, once. Keep it accurate: whenever a setting changes in the console, update this file in the same commit (see CLAUDE.md).

**Time:** about 30 minutes, most of it waiting for the first build and the domain's certificate.

**Cost:** cents a month at portfolio traffic. Amplify bills build minutes and data served; the Route 53 hosted zone is $0.50 a month; the certificate is free.

> Console screens change over time. If a label below doesn't match exactly, look for the setting by meaning. The values are what matter.

> **This repo is public.** Never write the AWS account ID, the Amplify app ID, the `amplifyapp.com` address or any ARN into this file or any other committed file. Keep them in a password manager. The steps below use placeholders such as `<app-id>`.

## Before you start

- Sign in to the AWS console as an IAM user with admin rights, **not the root user**. Use region **US West (Oregon), `us-west-2`**.
- `fritzpadilla.com` has a **public hosted zone in Route 53** in the same account, and the domain's name servers point at it.
- The repo already contains what Amplify needs, pushed to `main`:
  - `amplify.yml`, the build settings (Node 22 from `.nvmrc`, then `npm ci` and `npm run build`, publishing `out/`)
  - social preview images and favicons that build with a `.png` extension. Amplify adds a trailing slash to extensionless paths and serves them without an image type, so extensionless images would break.

### Values to record privately as you go

| Item                    | Where to find it                                   |
| ----------------------- | -------------------------------------------------- |
| Amplify app ID          | the app's **Overview** page, or in its console URL |
| Default Amplify address | `https://main.<app-id>.amplifyapp.com`             |
| Email forwarding        | provider, and the inbox hello@ forwards to         |

---

## 1. Create the Amplify app

**Amplify → Create new app → GitHub → Next.** Authorize the **AWS Amplify** GitHub App when asked, for the `fritzp3/fritzpadilla.com` repository only.

| Setting                 | Value                                                                                |
| ----------------------- | ------------------------------------------------------------------------------------ |
| Repository              | `fritzp3/fritzpadilla.com`                                                           |
| Branch                  | `main`                                                                               |
| Monorepo                | off                                                                                  |
| App name                | `fritzpadilla-com`                                                                   |
| Build settings          | Amplify should say it found `amplify.yml` in the repo. Don't edit it in the console. |
| Service role            | **Create and use a new service role**                                                |
| Advanced: env variables | none                                                                                 |

**Save and deploy.** The first build starts right away. Let it run; step 2 checks it.

## 2. Make sure it's hosted as a static site

Amplify detects Next.js and may set the app up for its server (SSR) hosting, which this site doesn't use and which doesn't support Next.js 16. The app must use the static platform, **WEB**.

1. Open the app's **App settings → General settings**. If **Platform** (or "Framework") says **Web** or **Static**, skip to step 3. If it says **Web compute**, **SSR** or **Next.js - SSR**, continue. The first build failing with `Can't find required-server-files.json in build output directory` means the same thing.
2. In CloudShell (the terminal icon in the console's top bar) or a local terminal with admin credentials, switch both the app and the `main` branch. The branch keeps its own framework setting, and the deploy still fails if only the app is changed.

   ```bash
   aws amplify update-app --region us-west-2 --app-id <app-id> --platform WEB
   aws amplify update-branch --region us-west-2 --app-id <app-id> --branch-name main --framework "Web"
   ```

   The output should show `"platform": "WEB"` and `"framework": "Web"`.

3. **Hosting → Deployments → Redeploy this version** (or push any commit) so the build runs again on the static platform.

**Check:** the build log's **Deploy** step lists files from `out/` (such as `index.html` and `404.html`), not a `.next` compute bundle.

## 3. Rewrites and redirects

**Hosting → Rewrites and redirects → Manage redirects → Edit JSON** (or the table view). Replace the contents with these two rules, in this order:

```json
[
  {
    "source": "https://www.fritzpadilla.com",
    "status": "301",
    "target": "https://fritzpadilla.com",
    "condition": null
  },
  {
    "source": "/<*>",
    "status": "404-200",
    "target": "/404.html",
    "condition": null
  }
]
```

- The first sends `www` to the apex domain; Amplify appends the path and query string. It does nothing until step 5 connects the domain.
- The second replaces Amplify's default `/<*>` → `/index.html` rule. Its status must be `404-200`, shown in the table view as **404 (Rewrite)**: it serves `404.html` at the requested URL with status 404. A plain `404` is a **404 (Redirect)**, which answers with a 302 to `/404.html` instead. A 404 rule only applies when no file matches, so real pages and images are unaffected; unknown paths get the site's 404 page with status 404.

**Save.** Clean URLs need no rules: Amplify serves `/work/x/` from `/work/x/index.html` and adds the trailing slash to `/work/x` itself, which matches the site's `trailingSlash: true`.

## 4. First deploy and check (before DNS)

Open the default address, `https://main.<app-id>.amplifyapp.com`, and check:

- [ ] `/` loads the home page, styled, with the web font.
- [ ] A project page, `/work/<slug>/`, loads.
- [ ] `/work/<slug>` (no trailing slash) redirects to `/work/<slug>/`.
- [ ] `/no-such-page/` shows the site's 404 page. In the browser's network panel, its status is **404**.
- [ ] The favicon shows in the tab, and the social preview image opens as an image (its URL is the `og:image` value in the page source).

Or from a terminal (use `/usr/bin/curl` on this Mac):

```bash
SITE=https://main.<app-id>.amplifyapp.com
/usr/bin/curl -sI $SITE/ | head -1                       # HTTP/2 200
/usr/bin/curl -sI $SITE/work/<slug> | grep -i location   # …/work/<slug>/
/usr/bin/curl -sI $SITE/no-such-page/ | head -1          # HTTP/2 404
```

Fix anything that fails before step 5: until then, the live domain still serves the old redirect.

## 5. Custom domain (the cutover)

Today `fritzpadilla.com` redirects to FritzPadilla.me through an S3 website bucket. These two Route 53 records do that, and Amplify replaces them in this step:

- `fritzpadilla.com`: **A**, alias to `s3-website-us-west-2.amazonaws.com`
- `www.fritzpadilla.com`: **CNAME** to `fritzpadilla.com`

Leave the **NS**, **SOA**, and any **MX** and **TXT** (email) records alone.

**Hosting → Custom domains → Add domain.**

1. Domain: `fritzpadilla.com`. Amplify finds the Route 53 hosted zone. **Configure domain.**
2. Subdomains: the root (`fritzpadilla.com`, blank prefix) → branch `main`, and `www` → branch `main`.
3. **Untick "Setup redirect from https://fritzpadilla.com to https://www.fritzpadilla.com".** That redirect goes the wrong way; the rule in step 3 sends `www` to the apex instead.
4. Certificate: **Amplify managed certificate**.
5. **Add domain.**

Amplify creates the certificate's validation record and the domain records in Route 53. The status goes from _SSL creation_ to _SSL configuration_ to _Domain activation_ to **Available**, usually within 30 minutes (DNS can take longer).

If Amplify reports that the records already exist or conflict, delete the two old records listed above in **Route 53 → Hosted zones → fritzpadilla.com**, then **Retry** in Amplify. The domain is unreachable for those few minutes.

**Check:**

```bash
/usr/bin/curl -sI https://fritzpadilla.com/ | head -1                      # HTTP/2 200
/usr/bin/curl -sI https://www.fritzpadilla.com/work/ | grep -i location    # https://fritzpadilla.com/work/
/usr/bin/curl -sI http://fritzpadilla.com/ | grep -i location              # https://fritzpadilla.com/
```

Then repeat the checklist in step 4 on `https://fritzpadilla.com`.

## 6. Clean up the old redirect

Once step 5 is **Available** and checked, the old `fritzpadilla.com` S3 bucket (us-west-2, website hosting set to redirect to FritzPadilla.me) serves nothing. **S3 → Buckets → fritzpadilla.com → Delete.** It holds no files.

## 7. Optional: budget alert

**Billing → Budgets → Create budget → Use a template → Monthly cost budget.** Set it to $5 with your email, or, since a budget covers the whole AWS account, a little above the account's usual monthly bill if other projects share it. It's a cheap safety net against surprises, such as a traffic spike or a runaway build.

## 8. Email: hello@fritzpadilla.com

The site publishes `hello@fritzpadilla.com` (nav button, Contact section, structured data). Route 53 only does DNS and can't receive mail, so a forwarding service receives it and passes it to your own inbox, such as Gmail. These steps use **ImprovMX** (free plan) as the example; any forwarding service works the same way, with its own record values. Amplify doesn't touch these records.

1. Sign up at improvmx.com, add the domain `fritzpadilla.com`, and create the alias `hello` → your inbox. (A catch-all `*` alias also works.)
2. **Route 53 → Hosted zones → fritzpadilla.com → Create record**, using the exact values the provider's dashboard shows. For ImprovMX they are:

   | Record name | Type | Value                                                                   |
   | ----------- | ---- | ----------------------------------------------------------------------- |
   | _(blank)_   | MX   | `10 mx1.improvmx.com` and `20 mx2.improvmx.com` (one record, two lines) |
   | _(blank)_   | TXT  | `"v=spf1 include:spf.improvmx.com ~all"`                                |
   | `_dmarc`    | TXT  | `"v=DMARC1; p=none"`                                                    |

   A domain can only have **one** SPF (`v=spf1`) record. If a TXT record at the apex already has one, add the `include:` to it instead of creating a second.

3. Wait for the provider's dashboard to show the records as valid (usually minutes).

**Check:** send a message to `hello@fritzpadilla.com` from a different account than the forwarding target, and confirm it arrives. Replies go out from your own address; to reply _as_ hello@, set up the provider's SMTP sending (a paid feature on ImprovMX) and Gmail's **Send mail as**.

---

## Troubleshooting

| Symptom                                               | Likely cause                                                                                                                                                        |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Deploy fails: `Can't find required-server-files.json` | The app or branch is on the SSR platform. Do step 2, then redeploy.                                                                                                 |
| Build fails on `npm ci` or with an engine error       | The build isn't using Node 22. Check that `amplify.yml` runs `nvm install` and `nvm use` before `npm ci`, and that the console has no build settings overriding it. |
| Unknown URLs redirect (302) to `/404.html`            | The 404 rule's status is `404` (redirect). Change it to `404-200` (**404 (Rewrite)**) as in step 3.                                                                 |
| Every unknown URL shows the home page with status 200 | Amplify's default `/<*>` → `/index.html` rule is still in place. Replace it as in step 3.                                                                           |
| A page URL redirects in a loop                        | A rewrite rule is matching real pages. Only the two rules in step 3 should exist.                                                                                   |
| Social preview images or favicons don't load          | An image path has no `.png` extension, so Amplify adds a trailing slash. Check the image URLs in the page source.                                                   |
| `www` shows the site instead of redirecting           | The `www` rule is missing or below the 404 rule in step 3.                                                                                                          |
| Apex redirects to `www`                               | The "Setup redirect" box in step 5 was left ticked. Edit the domain and untick it.                                                                                  |
| Domain stuck on _SSL creation_ or _Domain activation_ | A conflicting record (step 5), or DNS still propagating. Check that `dig +short NS fritzpadilla.com` shows the hosted zone's four `awsdns` name servers.            |
| Site still shows old content after a push             | The build is still running or failed: check **Hosting → Deployments**. Otherwise it's your browser cache: hard-refresh.                                             |
