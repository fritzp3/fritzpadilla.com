// CloudFront Function (viewer request) for fritzpadilla.com.
// Runtime: cloudfront-js-2.0. Paste this whole file into the function editor.
//
// 1. Redirects www.fritzpadilla.com to the apex domain (301). Any other host
//    (e.g. the dxxxx.cloudfront.net test address) is served as-is.
// 2. Maps directory URLs to their index.html: /work/x/ -> /work/x/index.html.
// 3. Redirects extensionless page URLs to the trailing-slash form
//    (/work/x -> /work/x/), matching Next's trailingSlash: true.
// 4. Leaves Next's extensionless metadata images alone (opengraph-image,
//    icon, apple-icon): they are real files, not directories.
//
// Keep in sync with next.config.ts (trailingSlash) and src/app metadata files.

var APEX = "fritzpadilla.com";
var EXTENSIONLESS_FILES = /\/(opengraph-image|twitter-image|icon|apple-icon)$/;

function querySuffix(qs) {
  var parts = [];
  for (var key in qs) {
    var p = qs[key];
    if (p.multiValue) {
      for (var i = 0; i < p.multiValue.length; i++) {
        parts.push(key + "=" + p.multiValue[i].value);
      }
    } else {
      parts.push(key + "=" + p.value);
    }
  }
  return parts.length ? "?" + parts.join("&") : "";
}

function redirect(location) {
  return {
    statusCode: 301,
    statusDescription: "Moved Permanently",
    headers: { location: { value: location } },
  };
}

function handler(event) {
  var request = event.request;
  var host = request.headers.host ? request.headers.host.value : APEX;
  var uri = request.uri;

  // Only www is redirected; the dxxxx.cloudfront.net address keeps working
  // for testing before DNS points at the distribution.
  if (host === "www." + APEX) {
    return redirect("https://" + APEX + uri + querySuffix(request.querystring));
  }

  if (uri.endsWith("/")) {
    request.uri = uri + "index.html";
    return request;
  }

  var lastSegment = uri.substring(uri.lastIndexOf("/") + 1);
  if (lastSegment.indexOf(".") === -1 && !EXTENSIONLESS_FILES.test(uri)) {
    return redirect(uri + "/" + querySuffix(request.querystring));
  }

  return request;
}
