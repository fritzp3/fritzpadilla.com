import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";

// Unit tests for docs/cloudfront-function.js (the viewer-request function
// pasted into the CloudFront console). Runs in Node; no browser needed.

type Qs = Record<string, { value: string; multiValue?: { value: string }[] }>;
type Result = { uri?: string; statusCode?: number; headers?: { location: { value: string } } };

const source = readFileSync("docs/cloudfront-function.js", "utf8");
const handler = new Function(`${source}; return handler;`)() as (e: unknown) => Result;

const run = (host: string, uri: string, querystring: Qs = {}) => {
  const r = handler({ request: { uri, querystring, headers: { host: { value: host } } } });
  return r.statusCode ? `${r.statusCode} ${r.headers!.location.value}` : `uri ${r.uri}`;
};

const APEX = "fritzpadilla.com";
const cases: [string, string, Qs, string][] = [
  [APEX, "/", {}, "uri /index.html"],
  [APEX, "/work/project-1/", {}, "uri /work/project-1/index.html"],
  [APEX, "/work/project-1", {}, "301 /work/project-1/"],
  [APEX, "/specimen", { a: { value: "1" } }, "301 /specimen/?a=1"],
  [APEX, "/opengraph-image", { "25bd": { value: "" } }, "uri /opengraph-image"],
  [APEX, "/work/project-1/opengraph-image", {}, "uri /work/project-1/opengraph-image"],
  [APEX, "/icon", {}, "uri /icon"],
  [APEX, "/apple-icon", {}, "uri /apple-icon"],
  [APEX, "/_next/static/chunks/x.js", {}, "uri /_next/static/chunks/x.js"],
  [APEX, "/work/project-1/__next._full.txt", {}, "uri /work/project-1/__next._full.txt"],
  [APEX, "/404.html", {}, "uri /404.html"],
  [APEX, "/sitemap.xml", {}, "uri /sitemap.xml"],
  [`www.${APEX}`, "/work/project-1/", {}, "301 https://fritzpadilla.com/work/project-1/"],
  [
    `www.${APEX}`,
    "/",
    { utm: { value: "x", multiValue: [{ value: "x" }, { value: "y" }] } },
    "301 https://fritzpadilla.com/?utm=x&utm=y",
  ],
  ["d1234abcd.cloudfront.net", "/work/project-1/", {}, "uri /work/project-1/index.html"],
  ["d1234abcd.cloudfront.net", "/work/project-1", {}, "301 /work/project-1/"],
];

for (const [host, uri, qs, want] of cases) {
  test(`cloudfront function: ${host}${uri}`, () => {
    expect(run(host, uri, qs)).toBe(want);
  });
}

test("cloudfront function: every exported extensionless file is passed through", () => {
  const files = ["out/opengraph-image", "out/icon", "out/apple-icon"];
  for (const f of files) expect(run(APEX, f.slice(3))).toBe(`uri ${f.slice(3)}`);
});
