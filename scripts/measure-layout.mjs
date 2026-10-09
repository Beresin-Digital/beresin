/**
 * Measures the rendered layout via the Chrome DevTools Protocol.
 *
 * Why: `chrome --dump-dom` snapshots the DOM before a mutated <title> is
 * captured, so an in-page probe never shows up, and a static HTML read cannot
 * see real geometry. CDP lets us evaluate an expression after layout and read
 * the actual numbers back.
 *
 * Usage:
 *   node scripts/measure-layout.mjs <url> <viewportWidth> [height] [scopeSelector]
 *
 * `scopeSelector` defaults to `body` — pass e.g. `#articles` to narrow the
 * overflow scan to one section. Requires Chrome already running with
 * `--remote-debugging-port=9333`.
 *
 * Reports, for the scope: horizontal overflow against the viewport, every
 * element whose right edge crosses it, and the box of each `section[id]` so the
 * page's block rhythm can be eyeballed without a browser.
 */
const PORT = 9333;

const expr = (scopeSelector) => `(() => {
  const de = document.documentElement;
  const vw = de.clientWidth;
  const scope = document.querySelector(${JSON.stringify(scopeSelector)});
  if (!scope) return JSON.stringify({ error: 'scope not found: ' + ${JSON.stringify(scopeSelector)} });

  const offenders = [];
  // An element wider than the viewport is only a problem if nothing clips it —
  // the marquee track is ~3500px wide by design and lives inside an
  // overflow-hidden band. Reporting those buried the real offenders (130 vs
  // 7 on the homepage), so skip anything an ancestor already clips.
  const isClipped = (el) => {
    for (let p = el.parentElement; p && p !== document.documentElement; p = p.parentElement) {
      const cs = getComputedStyle(p);
      if (cs.overflowX !== 'visible' || cs.overflowY !== 'visible') return true;
    }
    return false;
  };
  for (const el of scope.querySelectorAll('*')) {
    const r = el.getBoundingClientRect();
    // Only the right edge matters: this is LTR, so content positioned left of
    // the origin (the skip link, the off-screen honeypot) cannot be scrolled to
    // and creates no overflow. 0.5px tolerance absorbs sub-pixel rounding on
    // transformed elements.
    if (r.right > vw + 0.5 && !isClipped(el)) {
      offenders.push({
        tag: el.tagName.toLowerCase(),
        cls: String(el.className || '').slice(0, 70),
        left: Math.round(r.left),
        right: Math.round(r.right),
        w: Math.round(r.width),
        text: (el.textContent || '').trim().slice(0, 24),
      });
    }
  }

  const sections = [...document.querySelectorAll('section[id]')].map((s) => {
    const r = s.getBoundingClientRect();
    return { id: s.id, w: Math.round(r.width), h: Math.round(r.height) };
  });

  const imgs = [...document.querySelectorAll('img')].map((img) => ({
    src: img.currentSrc.split('/').pop(),
    natural: img.naturalWidth + 'x' + img.naturalHeight,
    displayed: Math.round(img.getBoundingClientRect().width) + 'x' + Math.round(img.getBoundingClientRect().height),
    loading: img.loading,
  }));

  // Anything the document actually fetched from another origin. Used to prove
  // that deferred third-party embeds (the click-to-load Google map on /contact)
  // really do stay unfetched until the visitor opens them — if one of these
  // shows up on load, the deferral is not working.
  const thirdParty = [...performance.getEntriesByType('resource')]
    .map((e) => e.name)
    .filter((n) => !n.startsWith(location.origin));

  return JSON.stringify({
    vw,
    docScrollW: de.scrollWidth,
    overflowX: de.scrollWidth - vw,
    docHeight: de.scrollHeight,
    sectionCount: sections.length,
    sections,
    offenderCount: offenders.length,
    offenders: offenders.slice(0, 8),
    imgCount: imgs.length,
    imgs,
    thirdParty,
  });
})()`;

const targets = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json();
const page = targets.find((t) => t.type === 'page');
if (!page) throw new Error('no page target; is Chrome running with --remote-debugging-port?');

const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((res, rej) => {
  ws.addEventListener('open', res, { once: true });
  ws.addEventListener('error', rej, { once: true });
});

let id = 0;
const pending = new Map();
ws.addEventListener('message', (ev) => {
  const msg = JSON.parse(ev.data);
  if (msg.id && pending.has(msg.id)) {
    pending.get(msg.id)(msg);
    pending.delete(msg.id);
  }
});
const send = (method, params) =>
  new Promise((res) => {
    const myId = ++id;
    pending.set(myId, res);
    ws.send(JSON.stringify({ id: myId, method, params }));
  });

const width = Number(process.argv[3] || 390);

// Cache-bust the URL. `Page.navigate` to a URL the page is already on is a
// no-op, so without this the script keeps measuring the *previous* document —
// and once a rebuild has deleted the old hashed CSS, that stale document
// renders unstyled and every number is wrong.
const target = new URL(process.argv[2]);
target.searchParams.set('_m', Date.now().toString(36));

// Emulate the requested viewport, then reload so layout settles at that width.
await send('Emulation.setDeviceMetricsOverride', {
  width,
  height: Number(process.argv[4] || 900),
  deviceScaleFactor: 1,
  mobile: width < 700,
});
await send('Page.enable');

// Optional session cookie, for pages behind the admin guard. `MEASURE_COOKIE`
// takes a single `name=value` pair; the admin session cookie is scoped to
// `/admin`, so the path is set to match or the browser will not send it.
if (process.env.MEASURE_COOKIE) {
  const eq = process.env.MEASURE_COOKIE.indexOf('=');
  await send('Network.enable');
  await send('Network.setCookie', {
    name: process.env.MEASURE_COOKIE.slice(0, eq),
    value: process.env.MEASURE_COOKIE.slice(eq + 1),
    domain: target.hostname,
    path: '/admin',
  });
}

await send('Page.navigate', { url: target.href });
await new Promise((r) => setTimeout(r, 2500));

const out = await send('Runtime.evaluate', {
  expression: expr(process.argv[5] || 'body'),
  returnByValue: true,
});
const value = out.result?.result?.value;
console.log(value ? JSON.stringify(JSON.parse(value), null, 1) : JSON.stringify(out, null, 1));
ws.close();
