// Dependency-free end-to-end smoke test for the public site.
// Usage: BASE_URL=http://localhost:3005 node scripts/e2e-smoke.mjs
// Read-only: it never signs up, logs in with real credentials, or writes to the database.

const BASE = (process.env.BASE_URL ?? "http://localhost:3005").replace(/\/$/, "");
const failures = [];
let checks = 0;

function ok(cond, msg) {
  checks += 1;
  if (!cond) failures.push(msg);
  console.log(`${cond ? "PASS" : "FAIL"}  ${msg}`);
}

async function get(path, init = {}) {
  const res = await fetch(`${BASE}${path}`, { redirect: "manual", ...init });
  const text = await res.text().catch(() => "");
  return { status: res.status, headers: res.headers, text };
}

const PUBLIC_ROUTES = [
  "/", "/pioneer", "/launch-canada", "/events", "/posts", "/about",
  "/sponsorship", "/join", "/contact", "/members", "/discord",
  "/accounts/login", "/accounts/signup", "/accounts/pending",
  "/sitemap.xml", "/robots.txt",
];

const REQUIRED_NAV = [
  ["Pioneer", "/pioneer"], ["Launch Canada", "/launch-canada"], ["Sponsorship", "/sponsorship"],
  ["Contact us", "/contact"], ["Login", "/accounts/login"], ["Discord", null],
];

const pages = new Map();

// 1. Every public route renders.
for (const route of PUBLIC_ROUTES) {
  const r = await get(route);
  ok(r.status === 200, `GET ${route} -> ${r.status}`);
  pages.set(route, r.text);
}

// 2. Redirects.
for (const [from, to] of [["/sponsor", "/sponsorship"], ["/projects", "/pioneer"], ["/work", "/pioneer"]]) {
  const r = await get(from);
  const loc = r.headers.get("location") ?? "";
  ok([301, 308].includes(r.status) && loc.endsWith(to), `redirect ${from} -> ${r.status} ${loc || "(none)"}`);
}

// 3. Content requirements from the owner's change list.
const html = (p) => pages.get(p) ?? "";
const noHelix = [...pages.entries()].filter(([, t]) => /helix/i.test(t)).map(([p]) => p);
ok(noHelix.length === 0, `no "Seneca HELIX" text on any public page ${noHelix.length ? `(found on ${noHelix.join(", ")})` : ""}`);
ok(!html("/pioneer").includes("team-range-alt.jpg"), "pioneer gallery no longer uses the old crew photo (team-range-alt.jpg)");
ok(html("/pioneer").includes("lc-team-portrait.jpg"), "pioneer gallery uses the new crew photo (lc-team-portrait.jpg)");
ok(!html("/pioneer").includes("rocket-airframe-tent.jpg"), "pioneer no longer uses the old tent photo (rocket-airframe-tent.jpg)");
ok(html("/pioneer").includes("lc-judging-pioneer.jpg"), "pioneer judging section uses the new judging Pioneer photo (lc-judging-pioneer.jpg)");
ok(html("/pioneer").includes("tech-avionics-bay.jpg"), "pioneer technical gallery present");
ok(html("/pioneer").includes('id="projects"'), "pioneer page has a Projects section (#projects)");
ok(/Judging phases/.test(html("/pioneer")), "pioneer Projects lists 'Judging phases' instead of 'Ground station'");
ok(!/>Ground station</.test(html("/pioneer")), "pioneer page has no 'Ground station' project row");
ok(/Launch Canada judging/.test(html("/pioneer")), "pioneer judging split section present");
ok(/Build-quality interview/.test(html("/launch-canada")), "launch-canada page lists judging phases");
ok(/lc-launch-site-prep\.jpg/.test(html("/launch-canada")), "launch-canada gallery includes new Launch Canada photos");
ok(html("/launch-canada").includes("lc-judging-pioneer.jpg"), "launch-canada page uses the judging Pioneer photo (lc-judging-pioneer.jpg)");
ok(/mailto:astralabsengineering@gmail\.com/.test(html("/contact")), "contact page has mailto link");
ok(/Open Discord|Request Discord invite/.test(html("/contact")), "contact page has a Discord action");
ok(/href="https:\/\/discord\.gg\/[A-Za-z0-9]+"[^>]*target="_blank"/.test(html("/")), "home nav Discord link opens the invite directly in a new tab");
ok(/href="https:\/\/discord\.gg\//.test(html("/contact")) && /href="https:\/\/discord\.gg\//.test(html("/discord")), "contact and discord pages link to the invite");

// 4. Burger menu items.
const nav = html("/").match(/<nav[^>]*id="site-nav"[\s\S]*?<\/nav>/)?.[0] ?? "";
for (const [label, href] of REQUIRED_NAV) {
  const re = href ? new RegExp(`href="${href}"[^>]*>\\s*${label}`) : new RegExp(`>\\s*${label}\\s*<`);
  ok(re.test(nav), `menu has "${label}"${href ? ` -> ${href}` : ""}`);
}
ok(!/href="\/sponsor"/.test(html("/")) && !/href="\/sponsor"/.test(nav), "no stale /sponsor links on home or menu");

// 5. Sitemap.
const sitemap = html("/sitemap.xml");
for (const path of ["/launch-canada", "/contact", "/sponsorship"]) ok(sitemap.includes(`${path}<`), `sitemap includes ${path}`);
ok(!sitemap.includes("/sponsor<"), "sitemap excludes old /sponsor");

// 6. Every internal link and image on the public pages resolves.
const seen = new Set();
const assetChecks = [];
for (const [route, text] of pages) {
  if (!/<html/i.test(text)) continue;
  const links = [...text.matchAll(/href="(\/[^"#?]*)/g)].map((m) => m[1]);
  const imgs = [...text.matchAll(/(?:src="|url\(&#x27;|url\('|url\(")(\/[^"'&)]+)/g)].map((m) => m[1]);
  for (const target of [...links, ...imgs]) {
    if (seen.has(target) || target.startsWith("/_next") || target.startsWith("/dashboard") || target.startsWith("/api")) continue;
    seen.add(target);
    assetChecks.push(get(target, { method: "HEAD" }).then((r) => ok([200, 301, 308].includes(r.status), `asset/link ${target} (from ${route}) -> ${r.status}`)));
  }
}
await Promise.all(assetChecks);

// 7. Auth surface stays closed (no writes).
const bad = await get("/api/auth/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ login: "nobody@example.invalid", password: "wrong-password" }) });
ok([400, 401, 403, 404, 422, 503].includes(bad.status), `POST /api/auth/login with bad credentials rejected -> ${bad.status}`);
const dash = await get("/dashboard");
ok([302, 303, 307, 308].includes(dash.status) || dash.status === 401, `GET /dashboard unauthenticated -> ${dash.status} (redirect/denied)`);

console.log(`\n${checks - failures.length}/${checks} checks passed`);
if (failures.length) {
  console.log("\nFailures:");
  for (const f of failures) console.log(` - ${f}`);
  process.exit(1);
}
