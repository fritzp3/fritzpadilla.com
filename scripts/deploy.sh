#!/usr/bin/env bash
# Deploy the static export in ./out to S3 and invalidate CloudFront.
#
# Usage:  S3_BUCKET=… CLOUDFRONT_DISTRIBUTION_ID=… npm run deploy
#         (add DRYRUN=1 to print what would change without changing anything)
#
# Uses whatever AWS credentials the CLI finds: AWS_PROFILE locally, the
# GitHub OIDC role in CI. Run `npm run build` first.
#
# Upload order matters: hashed assets first, pages last, deletions after
# everything else, so a visitor never gets a page that references a file
# that isn't there yet.

set -euo pipefail

: "${S3_BUCKET:?Set S3_BUCKET to the site bucket name}"
: "${CLOUDFRONT_DISTRIBUTION_ID:?Set CLOUDFRONT_DISTRIBUTION_ID}"

OUT="out"
DEST="s3://${S3_BUCKET}"
DRY=()
[[ "${DRYRUN:-}" == "1" ]] && DRY=(--dryrun) && echo "DRY RUN: nothing will be changed."

if [[ ! -f "$OUT/index.html" ]]; then
  echo "error: $OUT/index.html not found. Run 'npm run build' first." >&2
  exit 1
fi

# Cache policies (see CLAUDE.md > Deployment).
IMMUTABLE="public, max-age=31536000, immutable"          # content-hashed files
PAGE="public, max-age=0, s-maxage=31536000, must-revalidate" # browsers revalidate; CloudFront keeps until invalidated
ASSET="public, max-age=86400"                            # images, PDFs, icons

# Next exports these metadata images without a file extension; S3 can't infer
# their type, so they are uploaded separately as image/png.
EXTENSIONLESS=(opengraph-image twitter-image icon apple-icon)
exclude_extensionless=()
for name in "${EXTENSIONLESS[@]}"; do
  exclude_extensionless+=(--exclude "$name" --exclude "*/$name")
done

echo "1/5 Hashed build assets (_next/)…"
aws s3 sync "$OUT/_next" "$DEST/_next" ${DRY[@]+"${DRY[@]}"} --only-show-errors \
  --cache-control "$IMMUTABLE"

echo "2/5 Other static files (images, PDFs)…"
aws s3 sync "$OUT" "$DEST" ${DRY[@]+"${DRY[@]}"} --only-show-errors \
  --exclude "_next/*" --exclude "*.html" --exclude "*.txt" --exclude "*.xml" \
  "${exclude_extensionless[@]}" \
  --cache-control "$ASSET"

echo "3/5 Extensionless metadata images as image/png…"
find "$OUT" -type f \( -name opengraph-image -o -name twitter-image -o -name icon -o -name apple-icon \) |
  while read -r file; do
    aws s3 cp "$file" "$DEST/${file#"$OUT"/}" ${DRY[@]+"${DRY[@]}"} --only-show-errors \
      --content-type "image/png" --cache-control "$ASSET"
  done

echo "4/5 Pages, route data, sitemap and robots…"
aws s3 sync "$OUT" "$DEST" ${DRY[@]+"${DRY[@]}"} --only-show-errors \
  --exclude "*" --include "*.html" --include "*.txt" --include "*.xml" \
  --cache-control "$PAGE"

echo "5/5 Removing files no longer in the build…"
# --size-only: everything current was uploaded above with the right headers;
# this pass should only delete, never re-upload with default headers.
aws s3 sync "$OUT" "$DEST" ${DRY[@]+"${DRY[@]}"} --delete --size-only

if [[ "${DRYRUN:-}" != "1" ]]; then
  echo "Invalidating CloudFront cache…"
  id=$(aws cloudfront create-invalidation --distribution-id "$CLOUDFRONT_DISTRIBUTION_ID" \
    --paths "/*" --query "Invalidation.Id" --output text)
  echo "Invalidation $id started (usually completes within a minute or two)."
fi

echo "Done."
