-- ============================================================
-- English Blog Articles Seed（2 篇，由 i18n/文章子任务生成）
-- ============================================================
-- 执行方式：主会话通过后台 API 发布（本文件仅作存档/备份，未自动执行）
--
-- 说明：
-- * 字段与 sql/seed-articles.sql 的 INSERT 结构一致：
--   title / content / summary / cover / status / views / reading_time / created_at / updated_at
--   （不带 id / category_id，由数据库/后台分配，避免与现有 seed UUID 冲突）
-- * content 用 $art$ dollar-quoting，HTML 内单引号无需转义
-- * status='published'，created_at 2026-11-05 附近
-- ============================================================

-- ============================================
-- Article 1: Why I Built My Own Blog Instead of Using Medium
-- ============================================
INSERT INTO articles (title, content, summary, cover, status, views, reading_time, created_at, updated_at) VALUES
(
  $ttl$Why I Built My Own Blog Instead of Using Medium$ttl$,
  $art$<p>You can measure a developer's ego in the tools they refuse to use.</p>
<p>Mine is apparently large enough to power a whole blogging platform. When I decided to get serious about writing last year, the sensible move was obvious: create a Medium account, paste in some markdown, hit publish, done by lunch. Instead I spent six weekends building this site — Vite, React 19, Supabase's free tier, Vercel Edge Functions, a PWA layer, and a long series of performance crimes and their subsequent pardons.</p>
<p>This post is the honest version of why. Not the LinkedIn version.</p>
<h2>The economics of "free"</h2>
<p>Let's kill the first objection immediately: "you're just reinventing Medium, badly, for free?" Yes. But "free" here is a real architecture, not a marketing word. The entire stack runs on free tiers:</p>
<ul>
<li><strong>Vercel Hobby</strong> — static hosting plus Edge Functions. My whole API is a folder of edge functions that proxy a database client.</li>
<li><strong>Supabase Free</strong> — Postgres, auth-ish plumbing via row level security, 500MB storage, 5GB bandwidth. I've written before about how close I sail to the bandwidth ceiling; the short version is that selecting <code>*</code> on a table with HTML content columns will humble you quickly.</li>
<li><strong>Zero dollars for the domain-level stuff I don't need</strong> — no search infrastructure, no comment-as-a-service, no analytics vendor. The analytics are a handful of Postgres tables written by an edge function.</li>
</ul>
<p>The total bill is the price of a domain. The real cost is time, which is exactly the point: I <em>wanted</em> to spend time on this. Which brings me to the actual reasons.</p>
<h2>Reason 1: my content is data, not tenants</h2>
<p>Medium owns your posts the way a landlord owns an apartment. You live there, you decorate a little, but when the lease ends, the built-in bookshelves stay.</p>
<p>On my blog, every post is a row in my own Postgres database. The schema is boring on purpose — <code>title</code>, <code>content</code> (HTML produced by the editor), <code>summary</code>, <code>cover</code>, <code>reading_time</code>, <code>views</code>. Boring means portable. When I want to leave, it's a <code>pg_dump</code> and a new host. Nobody can put a paywall between my writing and the people who subscribed to read it, and nobody can decide that my post about Electron code signing violates some newly-minted content policy because an algorithm misread "Gatekeeper will silently quarantine your binary" as a threat.</p>
<p>There's a subtler ownership issue too: Medium's importers and exporters round-trip your formatting through their sanitizer, and code blocks come out the other side mangled more often than anyone admits. My content never passes through someone else's lossy pipeline.</p>
<h2>Reason 2: the performance work is the fun part</h2>
<p>Here's a confession wrapped in a case study. My blog's article page once rendered a decorative particle background. Not a subtle one. Roughly <strong>4,800 DOM nodes</strong> of animated divs, each a tiny <code>motion.div</code> with its own keyframes, floating behind the article you were trying to read. The page weighed more than the article. On a mid-range Android phone, scrolling a long post felt like dragging a sofa through sand.</p>
<p>The fix was embarrassing in the way all good performance stories are: I deleted it. The particle background, the floating orbs, the animated gradient mesh — all gone, replaced by a static CSS gradient. The DOM node count for the article page dropped from ~4,800 to <strong>2</strong> — that's not a typo in the direction you think. I mean the decorative layer went from 4,800 nodes to 2 elements (one wrapper, one gradient div). Long-post scroll jank disappeared entirely; the main thread stopped renting itself out to framer-motion on every frame.</p>
<p>That one deletion taught me more about rendering performance than any article I'd read, including the obvious lesson: <strong>in React, the cheapest component is the one that doesn't mount.</strong> Every node is layout, paint, and compositor work. Every <code>motion.div</code> is a JS-driven animation competing with your reader's scroll gesture for the same 16ms budget.</p>
<p>That debugging session is exactly the kind of story this blog exists to tell, and it's a story Medium would never have paid me to investigate. Owning the platform turned performance from an abstract concern into a weekly, hands-on practice. My Lighthouse numbers got better because my curiosity had a place to live.</p>
<h2>Reason 3: an API that bends to my will</h2>
<p>Medium gives you an editor. I wanted a <em>system</em>. Concretely:</p>
<ul>
<li><strong>Edge Functions everywhere.</strong> Every read and write goes through a Vercel Edge Function that holds the service-role database client. The frontend never talks to Postgres directly with elevated permissions, which means the security model is "the API is the wall," not "please don't look at the anon key."</li>
<li><strong>Reads are cached at the edge.</strong> Article list responses ship with <code>Cache-Control: s-maxage=60, stale-while-revalidate=300</code>, so the CDN absorbs most traffic before it ever reaches my function or database. This one header was the difference between 11% and ~2% of my function invocation quota.</li>
<li><strong>Write paths are explicit.</strong> A view counter increments on every article detail read. Comments, likes, drafts — each is a deliberate endpoint I can log, rate-limit, or reshape. When I want a feature Medium can't imagine — say, reading a draft on my phone via an installed PWA with offline cache — I just... build it.</li>
</ul>
<h2>Reason 4: PWA, or "my blog is an app because I said so"</h2>
<p>Installing your own blog as a PWA is a small, stupid joy I refuse to apologize for. The workbox configuration took two attempts: the first precached <em>everything</em>, all 5MB of build output, which meant first-time visitors on weak networks watched a service worker install like a Windows update. The fix was precaching only the shell — HTML, critical CSS, the index route chunk — and letting everything else fall into runtime caches.</p>
<p>Now the site installs to a home screen, works offline for cached articles, and syncs my drafts when connectivity returns. Medium cannot do this. Not "does not," <em>cannot</em> — it's not your app, so the browser treats it accordingly.</p>
<h2>Reason 5: the reading experience is a design problem I get to own</h2>
<p>Medium's reader is genuinely good, and I still steal from it constantly. But it's good in a way that's calibrated for millions of users and zero authors: fixed font sizes, one code theme, and typography tuned for prose rather than for, say, a table comparing Edge Function cold-start times across four runtimes.</p>
<p>My reader is worse in general and better for my content, which is the trade I want. Dark mode follows the same toggle as the code highlighting, so switching to the dark theme re-skins GitHub-style syntax colors in the same click. Tables get zebra stripes because I skim comparison tables and so do you. Long posts get a sticky table of contents; the font-size control persists per reader; the reading progress bar is a four-pixel gradient that took embarrassing pleasure to build. None of this is revolutionary. All of it is <em>mine to change on a Tuesday night</em> because a post I wrote made me realize the tables were hard to scan. When your platform is yours, the feedback loop between noticing a flaw and fixing it is one weekend long instead of one support-ticket-to-product-manager long.</p>
<h2>What I genuinely miss</h2>
<p>Honesty requires the other ledger. By leaving Medium I gave up:</p>
<ul>
<li><strong>Built-in distribution.</strong> Medium's recommendation engine finds readers for mediocre posts; my blog's discovery strategy is "post links and pray."</li>
<li><strong>Zero maintenance.</strong> I am my own SRE. When Supabase rotates something or Vercel changes an edge runtime default, the bug report arrives via my own contact form, from a reader kinder than I deserve.</li>
<li><strong>Comment culture.</strong> My comment section is quiet. It's mine, it works, and it is quiet.</li>
</ul>
<h2>So should you build your own?</h2>
<p>Probably not, and I say that as someone glad I did. If your goal is <em>readers</em>, go where readers are. If your goal is <em>becoming a better engineer while occasionally being read</em> — if the act of building is the point, and the writing is the excuse — then building your own blog is one of the best side projects left in frontend. Small scope, real users (me, you, occasionally my mother), and every layer from DNS to typography is yours to break and fix.</p>
<p>The blog you're reading is the artifact of that choice. The 4,800 DOM nodes it <em>doesn't</em> have are its monument.</p>$art$,
  $sum$Free tiers, 4,800 DOM nodes cut to 2, edge-cached APIs, and a PWA: the honest case for owning your publishing stack instead of renting one.$sum$,
  'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1200&q=80&auto=format&fit=crop',
  'published',
  318,
  8,
  '2026-11-04 21:30:00+08',
  '2026-11-05 09:20:00+08'
);

-- ============================================
-- Article 2: Electron Auto-Update Done Right: Lessons from Shipping to Real Users
-- ============================================
INSERT INTO articles (title, content, summary, cover, status, views, reading_time, created_at, updated_at) VALUES
(
  $ttl$Electron Auto-Update Done Right: Lessons from Shipping to Real Users$ttl$,
  $art$<p>The first auto-update I ever shipped worked perfectly on my machine and silently destroyed the app for a quarter of my users. This is the post I needed before that Tuesday.</p>
<p>Auto-updating a desktop app looks like a solved problem: install <code>electron-updater</code>, point it at a server, ship. And the happy path <em>is</em> three lines of config. The misery lives adjacent to the happy path, in code signing, Gatekeeper's opinions about your native modules, and theUpdate Server Geometry Problem (more on that later). Here's everything I learned shipping auto-updates to real users on macOS and Windows, in the order I learned it, i.e., the order it hurt.</p>
<h2>The architecture nobody tells you to decide first</h2>
<p><code>electron-updater</code> supports four feed approaches: generic static server, GitHub Releases, S3-compatible buckets, and — the one everyone forgets — <em>any HTTP server you already have</em>. Choosing wrong here is expensive because your update feed becomes load-bearing infrastructure you can't casually migrate.</p>
<p>My rule after three years: <strong>GitHub Releases for open-source and small-user apps; a generic static feed behind your own domain for everything else.</strong> Generic means "files on a CDN with a <code>latest.yml</code> manifest," which means no lock-in — you can move from Vercel to Cloudflare R2 to a bare nginx box without touching app code. GitHub Releases is genuinely excellent but couples your update availability to GitHub's status page, and some corporate networks block github.com outright, which you will discover via a user in a enterprise environment asking why the app "just shows Checking for updates… forever."</p>
<p>The feed is just files: <code>latest.yml</code> (or <code>latest-mac.yml</code>, <code>latest.pulate</code> for Windows if you use nsis-web), the installer artifacts, and blockmap files for delta diffs. Protect the feed with the most boring infra possible. The day your update server returns a corrupted <code>latest.yml</code>, every user who polls in that window has a bricked updater, and <em>they</em> won't know why.</p>
<h2>Code signing on macOS: Gatekeeper remembers everything</h2>
<p>macOS signing is where enthusiasm goes to be notarized. The modern flow is:</p>
<p>Sign the app bundle with a Developer ID Application certificate (<code>codesign --deep</code> is deprecated as a strategy; sign each embedded framework and helper individually).</p>
<p>Notarize via <code>notarytool</code> — <code>xcrun notarytool submit app.zip --keychain-profile "AC_NOTARY" --wait</code>.</p>
<p>Staple the ticket: <code>xcrun stapler staple MyApp.app</code>.</p>
<p>Miss step 3 and users on flaky networks get a Gatekeeper scan that can't reach Apple's servers and refuses to launch your app with an error message that blames "the developer" (me; I'm the developer; I'm sorry).</p>
<p>But the truly evil part — the part that ate two days of my life — involves native modules. My app loads a <code>.node</code> binary (a Rust addon, built with <code>napi-rs</code>). During one release, I rebuilt a dependency, which silently rebuilt the addon against an unsigned intermediate artifact. The final <code>.app</code> was signed and notarized. The <code>.node</code> file inside it was <em>not</em>. On my machine: fine, because Gatekeeper trusts already-executed binaries I'd launched before quarantine. On fresh user machines: <strong>Gatekeeper silently deleted the unsigned <code>.node</code> file during first-launch quarantine scanning.</strong> No dialog. No log the user would ever see. The app launched, the main process started, and then the module loading the Rust addon threw <code>Cannot find module</code>.</p>
<p>Silently. Deleted. I want to repeat this because when I describe it to people they assume I'm exaggerating: Gatekeeper will <em>remove</em> unsigned native binaries from a quarantined app rather than merely blocking them, so your app "launches fine" and then a file has ceased to exist.</p>
<p>The detection story is almost funny: I could not reproduce it on my machine because my copy wasn't quarantined. The fix workflow that finally caught it:</p>
<pre><code class="language-bash"># After packaging, BEFORE shipping — quarantine-scan your own artifact
xattr -w com.apple.quarantine "0081;$(date +%s);me;test" dist/MyApp.app
open dist/MyApp.app   # if this works on a clean profile, signing is complete</code></pre>
<p>And the enforcement that keeps it fixed — put this in CI and fail the build if it regresses:</p>
<pre><code class="language-bash"># Every Mach-O under the bundle must be signed, no exceptions
find MyApp.app -type f -exec file {} \; | grep -i mach-o | cut -d: -f1 | while read -r bin; do
  codesign --verify --strict "$bin" || { echo "UNSIGNED: $bin"; exit 1; }
done</code></pre>
<p>That CI check has caught three regressions since. Three! The lesson generalizes: <strong>verify the artifact, not the intent.</strong> "The build config says sign everything" is a feeling. <code>codesign --verify</code> is a fact.</p>
<h2>Windows: the certificate tax and the smart-apparatus tax</h2>
<p>Windows signing is simpler mechanically — SignTool with an EV or OV certificate — and more annoying economically. EV certificates (the kind that avoid SmartScreen warnings out of the gate) live on hardware tokens or cloud HSMs, which makes CI integration a special chore. OV certificates are cheaper and CI-friendly but your early builds will wear SmartScreen's "Unknown publisher" scarlet letter until reputation accrues, which takes downloads-and-time, which you don't have at launch.</p>
<p>The practical playbook: accept the reputation ramp, sign <em>every</em> build consistently (reputation attaches to the cert, and gaps reset momentum), and let <code>electron-updater</code> handle the NSIS differential updates via blockmaps. One non-obvious gotcha: if you switch signing certificates mid-stream, users on the old cert will see a scarier UAC prompt for the <em>transition</em> update. Schedule certificate migrations for a minor release, never a security release.</p>
<h2>electron-updater: the parts of the README that matter</h2>
<p>The library is good. The defaults are optimistic. Four settings I now always set explicitly:</p>
<pre><code class="language-typescript">import { autoUpdater } from "electron-updater";

autoUpdater.autoDownload = true;        // download silently
autoUpdater.autoInstallOnAppQuit = true; // apply on quit, no modal
autoUpdater.allowPrerelease = false;    // unless the channel says otherwise
autoUpdater.logger = console;           // you WILL need these logs someday</code></pre>
<p>One design decision worth its own paragraph: I never block users on the update UI. No "Update Required" full-screen gate, no countdown dialogs. The update downloads in the background, applies on quit, and the only surface is a tiny, dismissible badge in the corner — "v1.4.1 ready, applies next restart." Users hate being held hostage by update modals (ask every enterprise admin who has ever had a meeting about Adobe), and a silent-on-quit update flow means the freshest build propagates at the natural rhythm of people closing their laptop for the day.</p>
<p>The failure modes I've collected, as folklore:</p>
<ul>
<li><strong>The update checks forever and finds nothing.</strong> 90% of the time it's the feed's <code>path</code> vs. <code>url</code> geometry — <code>setFeedURL</code> with a trailing slash mismatch, or <code>latest.yml</code> deployed one directory above the artifacts it references.</li>
<li><strong>Download succeeds, install silently does nothing on quit.</strong> Usually Squirrel/NSIS permissions: the app lives in a directory the updater can't write. Log <code>error</code> events <em>visibly</em> during your beta; users will not report "it didn't update," they'll just quietly use v1.2 forever.</li>
<li><strong>Delta updates corrupt on flaky networks.</strong> The blockmap diff assumes the previous file is byte-identical to what the server remembers. If you rebuild reproducibly-but-not, hashes drift and diffs miss. <code>disableDifferentialDownload</code> exists; use it if your build isn't byte-stable.</li>
<li><strong>Multi-window apps quit mid-update.</strong> <code>autoInstallOnAppQuit</code> fires when the <em>last</em> window closes; a stray hidden window or a background worker keeping the event loop alive means "quit" never happens. Count your windows; close your orphans.</li>
</ul>
<h2>The rollout strategy: canary like you mean it</h2>
<p>Once the plumbing works, the remaining risk is <em>you</em> — a release with a bug that self-delivers to 100% of users within hours. So I stage rollouts:</p>
<p><strong>Internal channel</strong> (my own machines + forgiving friends) gets <code>allowPrerelease: true</code> builds.</p>
<p><strong>The public feed points at the stable channel</strong>, and I promote a release to it only after the internal channel has run that exact build for 48 hours.</p>
<p><strong>Version-gated telemetry</strong>: each update event reports old → new version. If the v1.4.1 population stops launching after day one (crash-on-launch spikes), I can yank the feed (replace <code>latest.yml</code> to point back at v1.4.0) — users who haven't updated yet stop receiving the bad build, and affected users recover via reinstall, which is bad but bounded.</p>
<p>This "yank the feed" trick is the least-known and most valuable property of owning your update infrastructure: <strong>an auto-update system is also an auto-rollback system</strong> if you keep old artifacts live.</p>
<h2>The checklist I now ship with</h2>
<p>Condensed, for future me, and for you:</p>
<ul>
<li>Sign every Mach-O / PE in the bundle; CI-verify with <code>codesign --verify --strict</code> per binary.</li>
<li>Notarize <em>and staple</em> macOS builds; quarantine-test the final artifact on a clean profile.</li>
<li><code>autoInstallOnAppQuit</code>, explicit logger, error events surfaced to telemetry.</li>
<li><code>latest.yml</code> and artifacts co-located; feed URL geometry double-checked; old artifacts never deleted.</li>
<li>Differential downloads enabled only if builds are byte-reproducible.</li>
<li>Two channels (internal/stable); 48-hour soak before promotion; feed-yank rollback rehearsed once for real.</li>
</ul>
<p>Auto-update is one of those features that's three lines of code and three years of edge cases. Ship it early, verify artifacts mechanically, stage your rollouts, and your users will never think about it at all — which is, of course, the entire point.</p>$art$,
  $sum$Code signing, notarization, Gatekeeper silently deleting unsigned .node binaries, differential updates, and canary rollouts: everything electron-updater docs don't teach you.$sum$,
  'https://images.unsplash.com/photo-1526406915894-7bcd65f60845?w=1200&q=80&auto=format&fit=crop',
  'published',
  264,
  9,
  '2026-11-05 20:15:00+08',
  '2026-11-05 20:15:00+08'
);
