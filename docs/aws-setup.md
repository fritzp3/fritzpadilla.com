# AWS setup runbook: fritzpadilla.com

This guide sets up hosting for the static site by hand in the AWS console: a private S3 bucket, served through CloudFront over HTTPS, on the `fritzpadilla.com` domain in Route 53. It's written to be followed top to bottom, once. Keep it accurate: whenever a setting changes in the console, update this file in the same commit (see CLAUDE.md).

**Time:** about an hour, most of it waiting for the certificate and the distribution to deploy.

**Cost:** a few dollars a month at most. The Route 53 hosted zone is $0.50 a month, and S3 and CloudFront cost cents at portfolio traffic. The certificate is free.

> Console screens change over time. If a label below doesn't match exactly, look for the setting by meaning. The values are what matter.

## Before you start

- Sign in to the AWS console as an IAM user or IAM Identity Center user with admin rights, **not the root user**.
- Install and configure the AWS CLI with that user (`aws configure sso` or `aws configure`). Check it works with `aws sts get-caller-identity`.
- `fritzpadilla.com` must have a **public hosted zone in Route 53**, and the domain's name servers must point at it.
- Build the site once: `nvm use && npm run build`.

### Values to record as you go

Fill this in; you'll need these in later steps and for GitHub Actions in Phase 7.

| Item                    | Value                                                 |
| ----------------------- | ----------------------------------------------------- |
| AWS account ID          |                                                       |
| S3 bucket name          |                                                       |
| Certificate ARN         | `arn:aws:acm:us-east-1:…`                             |
| CloudFront function     | `fritzpadilla-com-viewer-request`                     |
| Response headers policy | `fritzpadilla-com-security-headers`                   |
| Distribution ID         | `E…`                                                  |
| Distribution domain     | `d….cloudfront.net`                                   |
| Deploy role ARN         | `arn:aws:iam::<account>:role/fritzpadilla-com-deploy` |

**Region:** use **US East (N. Virginia), `us-east-1`** for everything. CloudFront only accepts certificates from `us-east-1`, and keeping the bucket there too keeps things in one place.

---

## 1. S3 bucket

**S3 → Create bucket**

| Setting             | Value                                                             |
| ------------------- | ----------------------------------------------------------------- |
| Bucket type         | General purpose                                                   |
| Region              | `us-east-1`                                                       |
| Bucket name         | e.g. `fritzpadilla-com-site` (must be globally unique; record it) |
| Object Ownership    | **ACLs disabled (recommended)**                                   |
| Block Public Access | **Block _all_ public access: on** (all four boxes)                |
| Bucket Versioning   | **Enable** (lets you recover from a bad deploy)                   |
| Default encryption  | SSE-S3 (the default)                                              |

Do **not** turn on "Static website hosting". CloudFront reads the bucket privately, through Origin Access Control, over the bucket's normal REST endpoint.

**Optional, recommended: keep versioning from growing forever.** Open the bucket, go to **Management → Create lifecycle rule**. Name it `expire-old-versions`, apply it to all objects, choose **Permanently delete noncurrent versions of objects**, and set it to **30** days after they become noncurrent.

## 2. TLS certificate (ACM, us-east-1)

Switch the console region to **US East (N. Virginia)** first.

**Certificate Manager → Request → Request a public certificate**

| Setting               | Value                                             |
| --------------------- | ------------------------------------------------- |
| Fully qualified names | `fritzpadilla.com` **and** `www.fritzpadilla.com` |
| Validation method     | DNS validation                                    |
| Key algorithm         | RSA 2048 (default)                                |

After requesting, open the certificate and click **Create records in Route 53**, then **Create records**. The status changes from _Pending validation_ to **Issued**, usually within a few minutes. Record the certificate ARN.

## 3. CloudFront Function

This function redirects `www` to the apex domain and maps clean URLs like `/work/x/` to `index.html` files in the bucket. The source is [`cloudfront-function.js`](cloudfront-function.js); its behavior is covered by `e2e/cloudfront-function.spec.ts`.

**CloudFront → Functions → Create function**

1. Name: `fritzpadilla-com-viewer-request`. Runtime: **cloudfront-js-2.0**.
2. In the **Build** tab, replace the example code with the full contents of `docs/cloudfront-function.js`, then **Save changes**.
3. **Test** tab (optional sanity check): event type _Viewer Request_, stage _Development_. With URL path `/work/project-1/` the result should show the request URI `/work/project-1/index.html`. With `/work/project-1` it should show a 301 to `/work/project-1/`.
4. **Publish** tab: **Publish function**. An unpublished function can't be attached to the distribution.

## 4. Response headers policy (security headers)

**CloudFront → Policies → Response headers → Create response headers policy**

Name: `fritzpadilla-com-security-headers`

Under **Security headers**, turn on:

| Header                    | Setting                                                                                           |
| ------------------------- | ------------------------------------------------------------------------------------------------- |
| Strict-Transport-Security | max-age **63072000** (2 years), **includeSubDomains** on, preload **off**, Origin override **on** |
| X-Content-Type-Options    | on (`nosniff`), Origin override on                                                                |
| X-Frame-Options           | **DENY**, Origin override on                                                                      |
| Referrer-Policy           | **strict-origin-when-cross-origin**, Origin override on                                           |
| Content-Security-Policy   | the policy below, Origin override on                                                              |

Content-Security-Policy value (one line):

```
default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests
```

This policy was tested against the built site: every page, client-side navigation, the hover effect and the web font all work, with zero violations. Next's static export writes inline bootstrap scripts, which is why `script-src` needs `'unsafe-inline'`; a stricter policy breaks the site. If you later add third-party scripts, analytics or embedded media, the policy must be extended, and re-tested.

Leave CORS and custom headers off. Under **Remove headers**, you may add `server` to hide `Server: AmazonS3`; this is optional. **Create**.

## 5. CloudFront distribution

**CloudFront → Distributions → Create distribution.** If the console offers a choice of pricing plan, a free or flat-rate plan is plenty for a portfolio. Otherwise pay-as-you-go is fine.

**Origin**

| Setting       | Value                                                                                             |
| ------------- | ------------------------------------------------------------------------------------------------- |
| Origin domain | pick the bucket from the list: `<bucket>.s3.us-east-1.amazonaws.com` (**not** a website endpoint) |
| Origin access | **Origin access control settings (recommended)** → **Create new OAC** (defaults: sign requests)   |
| Origin path   | empty                                                                                             |

**Default cache behavior**

| Setting                        | Value                                                                         |
| ------------------------------ | ----------------------------------------------------------------------------- |
| Viewer protocol policy         | **Redirect HTTP to HTTPS**                                                    |
| Allowed HTTP methods           | GET, HEAD                                                                     |
| Cache policy                   | **CachingOptimized** (managed)                                                |
| Origin request policy          | none                                                                          |
| Response headers policy        | `fritzpadilla-com-security-headers`                                           |
| Compress objects automatically | Yes                                                                           |
| Function associations          | **Viewer request** → CloudFront Functions → `fritzpadilla-com-viewer-request` |

CachingOptimized honors the `Cache-Control` headers that the deploy script sets. Pages are kept at the edge until each deploy invalidates them, and hashed assets are cached for a year.

**Web Application Firewall:** choose **Do not enable security protections**, unless your pricing plan includes WAF at no extra cost. A static site has nothing for WAF to protect, and it adds a monthly charge.

**Settings**

| Setting                         | Value                                                                  |
| ------------------------------- | ---------------------------------------------------------------------- |
| Price class                     | **Use only North America and Europe** (cheapest; fine for a portfolio) |
| Alternate domain names (CNAMEs) | `fritzpadilla.com` and `www.fritzpadilla.com`                          |
| Custom SSL certificate          | the certificate from step 2                                            |
| Security policy                 | **TLSv1.2_2021** (recommended)                                         |
| Supported HTTP versions         | HTTP/2 **and** HTTP/3                                                  |
| Default root object             | `index.html`                                                           |
| IPv6                            | On                                                                     |
| Standard logging                | Off                                                                    |

**Create distribution.**

### 5a. Bucket policy

After creation, the console shows a yellow banner, **"The S3 bucket policy needs to be updated"**, with a **Copy policy** button. Copy it, open the bucket, go to **Permissions → Bucket policy → Edit**, paste it, and **Save**. It will look like this, with your values:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowCloudFrontServicePrincipal",
      "Effect": "Allow",
      "Principal": { "Service": "cloudfront.amazonaws.com" },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::<bucket>/*",
      "Condition": {
        "StringEquals": {
          "AWS:SourceArn": "arn:aws:cloudfront::<account-id>:distribution/<distribution-id>"
        }
      }
    }
  ]
}
```

Only this distribution can read the bucket; nobody can reach it directly.

### 5b. Error pages

Open the distribution and go to **Error pages → Create custom error response**. Create **two** responses:

| HTTP error code | Error caching min TTL | Customize response | Response page path | HTTP response code |
| --------------- | --------------------- | ------------------ | ------------------ | ------------------ |
| 403             | 60                    | Yes                | `/404.html`        | **404**            |
| 404             | 60                    | Yes                | `/404.html`        | **404**            |

S3 returns **403**, not 404, for a missing key when CloudFront can't list the bucket. The first rule turns that into the site's 404 page with the correct status.

Record the **Distribution ID** and **Distribution domain name**. Wait until **Last modified** changes from _Deploying_ to a date, which takes about 5 minutes.

## 6. First deploy and check (before DNS)

From the project folder, with your AWS CLI profile active:

```bash
nvm use && npm run build
export S3_BUCKET=<bucket> CLOUDFRONT_DISTRIBUTION_ID=<distribution-id>

DRYRUN=1 npm run deploy   # preview: lists every upload and delete, changes nothing
npm run deploy            # upload and invalidate
```

Then check the distribution's own address. Use `/usr/bin/curl`: the `curl` first on this Mac's PATH is outdated and fails TLS checks.

```bash
D=https://<distribution-domain>.cloudfront.net
/usr/bin/curl -sI $D/ | grep -iE '^(HTTP|content-type|cache-control|strict-transport|content-security)'
/usr/bin/curl -sI $D/work/project-1                  # 301 → /work/project-1/
/usr/bin/curl -sI $D/work/project-1/ | head -1       # HTTP/2 200
/usr/bin/curl -sI $D/opengraph-image | grep -i content-type   # image/png
/usr/bin/curl -sI $D/no-such-page/ | head -1         # HTTP/2 404
```

Also open `$D/` in a browser. The page should look exactly like `npm run preview`, and a made-up path should show the "This page isn't in print." 404 page.

## 7. DNS (Route 53)

**Route 53 → Hosted zones → fritzpadilla.com → Create record.** Create four alias records:

| Record name                  | Type | Alias | Route traffic to                                         |
| ---------------------------- | ---- | ----- | -------------------------------------------------------- |
| _(blank)_ `fritzpadilla.com` | A    | Yes   | Alias to CloudFront distribution → pick the distribution |
| _(blank)_ `fritzpadilla.com` | AAAA | Yes   | same                                                     |
| `www`                        | A    | Yes   | same                                                     |
| `www`                        | AAAA | Yes   | same                                                     |

If records for these names already exist, for example from an old host, edit them rather than adding duplicates. Changes usually resolve within a few minutes.

Check:

```bash
/usr/bin/curl -sI https://fritzpadilla.com/ | head -1                  # HTTP/2 200
/usr/bin/curl -sI https://www.fritzpadilla.com/work/project-1/ | grep -i location # https://fritzpadilla.com/work/project-1/
/usr/bin/curl -sI http://fritzpadilla.com/ | head -1                   # 301 (to HTTPS)
```

## 8. GitHub deploy access (do this once the GitHub repo exists)

This lets the Phase 7 GitHub Actions workflow deploy with short-lived credentials. No AWS keys are stored in GitHub.

### 8a. Identity provider

**IAM → Identity providers → Add provider**

- Provider type: **OpenID Connect**
- Provider URL: `https://token.actions.githubusercontent.com`
- Audience: `sts.amazonaws.com`

If the account already has this provider, skip this step; there can only be one.

### 8b. Deploy permissions policy

**IAM → Policies → Create policy → JSON.** Replace `<bucket>`, `<account-id>` and `<distribution-id>`:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ListSiteBucket",
      "Effect": "Allow",
      "Action": "s3:ListBucket",
      "Resource": "arn:aws:s3:::<bucket>"
    },
    {
      "Sid": "WriteSiteObjects",
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:DeleteObject"],
      "Resource": "arn:aws:s3:::<bucket>/*"
    },
    {
      "Sid": "InvalidateSiteCache",
      "Effect": "Allow",
      "Action": ["cloudfront:CreateInvalidation", "cloudfront:GetInvalidation"],
      "Resource": "arn:aws:cloudfront::<account-id>:distribution/<distribution-id>"
    }
  ]
}
```

Name it `fritzpadilla-com-deploy`.

### 8c. Deploy role

**IAM → Roles → Create role → Web identity**

- Identity provider: `token.actions.githubusercontent.com`. Audience: `sts.amazonaws.com`.
- GitHub organization: your GitHub user name. Repository: the repo name. Branch: `main`.
- Permissions: attach `fritzpadilla-com-deploy`.
- Role name: `fritzpadilla-com-deploy`.

Then open the role's **Trust relationships** and confirm the policy restricts it to your repository's `main` branch. It should read like this:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::<account-id>:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
          "token.actions.githubusercontent.com:sub": "repo:<github-user>/<repo>:ref:refs/heads/main"
        }
      }
    }
  ]
}
```

Record the role ARN. In Phase 7 it goes into the repository variables along with the bucket name, distribution ID and region.

## 9. Optional: budget alert

**Billing → Budgets → Create budget → Use a template → Monthly cost budget.** Set it to $5 with your email. It's a cheap safety net against surprises, such as a traffic spike or a misconfiguration.

---

## Troubleshooting

| Symptom                                              | Likely cause                                                                                                                                                                               |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `AccessDenied` XML page from CloudFront              | The bucket policy (5a) is missing or has the wrong distribution ARN, or the origin is the S3 _website_ endpoint instead of the REST endpoint.                                              |
| Every page shows the 404 page                        | The CloudFront Function isn't **published** or isn't attached to the default behavior as **Viewer request**. `/` works through the default root object, but `/work/x/` needs the function. |
| Certificate not offered in the distribution          | The certificate was requested outside `us-east-1`, isn't **Issued** yet, or doesn't cover both names.                                                                                      |
| Social preview images download instead of displaying | They were uploaded without `image/png`. Deploy with `npm run deploy` (it sets the type), not a plain `aws s3 sync`.                                                                        |
| Site still shows old content after a deploy          | The invalidation is still running (check **Invalidations** on the distribution). Otherwise it's your browser cache: hard-refresh.                                                          |
| `www` doesn't redirect                               | The `www` alias records (step 7) are missing, or `www.fritzpadilla.com` isn't in the distribution's alternate domain names or the certificate.                                             |
| Browser console shows "Refused to …" CSP errors      | Something new, such as analytics or an embed, needs the Content-Security-Policy (step 4) extended.                                                                                         |
