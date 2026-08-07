#!/usr/bin/env node
// Permanent Browser QA Harness (Task 2.5).
//
// Dependency-free responsive smoke QA: launches a headless Chrome instance via
// the Chrome DevTools Protocol (CDP) over Node's built-in `fetch`/`WebSocket`,
// visits a fixed set of routes at a fixed set of viewports, and reports
// horizontal overflow, uncaught runtime exceptions, and console errors.
//
// This tool does not evaluate visual quality and does not replace manual
// visual QA.

import { spawn, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync, writeSync } from "node:fs";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

// ---------------------------------------------------------------------------
// Output helpers
// ---------------------------------------------------------------------------
//
// On Windows, when stdout is redirected to a pipe/file (not a TTY), Node's
// console.log buffers writes asynchronously — output can be silently lost if
// the process exits before the buffer flushes. fs.writeSync bypasses that by
// making a synchronous, unbuffered write, so every line is guaranteed to land.

function log(msg) {
  writeSync(1, msg + "\n");
}

function logErr(msg) {
  writeSync(2, msg + "\n");
}

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const BASE_URL = (process.env.QA_BASE_URL || "http://127.0.0.1:3000").replace(/\/+$/, "");

const DEFAULT_ROUTES = ["/", "/portfolio", "/worldbuilding", "/about", "/admin/login"];
const ROUTES = process.env.QA_ROUTES
  ? process.env.QA_ROUTES.split(",").map((r) => r.trim()).filter(Boolean)
  : DEFAULT_ROUTES;

const VIEWPORTS = [
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1440, height: 900 },
  { width: 1920, height: 1080 },
];

const SCROLL_SELECTOR = process.env.QA_SCROLL_SELECTOR || "";
const SCROLL_BLOCK = process.env.QA_SCROLL_BLOCK === "start" ? "start" : "center";
const CHECK_COVERFLOW = process.env.QA_COVERFLOW === "1";
const SCREENSHOT_DIR = process.env.QA_SCREENSHOT_DIR || "";

const CDP_PORT = Number(process.env.QA_CDP_PORT || 9339);
const RENDER_WAIT_MS = 500;
const NAV_TIMEOUT_MS = 20000;
const CHROME_READY_TIMEOUT_MS = 10000;

// ---------------------------------------------------------------------------
// Chrome discovery
// ---------------------------------------------------------------------------

function findChromePath() {
  if (process.env.CHROME_PATH) {
    if (existsSync(process.env.CHROME_PATH)) return process.env.CHROME_PATH;
    throw new Error(`CHROME_PATH is set but does not exist: ${process.env.CHROME_PATH}`);
  }

  const candidates = [
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    path.join(
      process.env.LOCALAPPDATA || "",
      "Google\\Chrome\\Application\\chrome.exe"
    ),
  ];

  for (const candidate of candidates) {
    if (candidate && existsSync(candidate)) return candidate;
  }

  return null;
}

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForChromeReady(port, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  let lastErr;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/version`);
      if (res.ok) return;
    } catch (err) {
      lastErr = err;
    }
    await sleep(150);
  }
  throw new Error(
    `Chrome DevTools endpoint did not become ready on port ${port}: ${lastErr?.message || "timeout"}`
  );
}

async function isSiteReachable(url) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    // Any HTTP response (including 404) means the server is up.
    return res.status < 600;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Minimal CDP client over a single page-target WebSocket
// ---------------------------------------------------------------------------

class CdpClient {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.nextId = 1;
    this.pending = new Map();
    this.eventHandlers = new Map(); // method -> Set<fn>
    this.closed = false;

    this.ws.addEventListener("message", (ev) => {
      let msg;
      try {
        msg = JSON.parse(ev.data);
      } catch (err) {
        logErr(`CDP message parse error: ${err.message}`);
        return;
      }
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        if (msg.error) reject(new Error(msg.error.message || "CDP error"));
        else resolve(msg.result);
      } else if (msg.method) {
        const handlers = this.eventHandlers.get(msg.method);
        if (handlers) for (const fn of handlers) fn(msg.params);
      }
    });

    // Without this, a Chrome crash/disconnect mid-run leaves every pending
    // send() promise permanently unresolved — the awaiting async function
    // just stalls forever with nothing left to report it, and since nothing
    // else keeps the event loop alive, Node exits quietly instead of hanging.
    const rejectAllPending = (reason) => {
      this.closed = true;
      for (const { reject } of this.pending.values()) reject(new Error(reason));
      this.pending.clear();
    };
    this.ws.addEventListener("close", () => rejectAllPending("CDP WebSocket closed unexpectedly"));
    this.ws.addEventListener("error", (e) =>
      rejectAllPending("CDP WebSocket error: " + (e.message || "unknown"))
    );
  }

  waitOpen() {
    if (this.ws.readyState === WebSocket.OPEN) return Promise.resolve();
    return new Promise((resolve, reject) => {
      this.ws.addEventListener("open", () => resolve(), { once: true });
      this.ws.addEventListener("error", (e) => reject(new Error("WebSocket error: " + e.message)), {
        once: true,
      });
    });
  }

  send(method, params = {}) {
    if (this.closed) return Promise.reject(new Error("CDP client is closed"));
    const id = this.nextId++;
    const payload = JSON.stringify({ id, method, params });
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(payload);
    });
  }

  on(method, fn) {
    if (!this.eventHandlers.has(method)) this.eventHandlers.set(method, new Set());
    this.eventHandlers.get(method).add(fn);
  }

  close() {
    try {
      this.ws.close();
    } catch {
      // ignore
    }
  }
}

// ---------------------------------------------------------------------------
// Page evaluation scripts (run inside the browser via Runtime.evaluate)
// ---------------------------------------------------------------------------

const OVERFLOW_CHECK_EXPRESSION = `
(function () {
  var html = document.documentElement;
  var scrollWidth = html.scrollWidth;
  var clientWidth = html.clientWidth;
  var innerWidth = window.innerWidth;
  var overflow = Math.max(0, scrollWidth - clientWidth);

  var offenders = [];
  if (overflow > 0) {
    var all = document.querySelectorAll("body *");
    var found = [];
    for (var i = 0; i < all.length; i++) {
      var el = all[i];
      var tag = el.tagName ? el.tagName.toLowerCase() : "";
      if (tag === "script" || tag === "style" || tag === "link" || tag === "meta") continue;
      var rect = el.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) continue;
      var excess = rect.right - clientWidth;
      if (excess > 1) {
        var id = el.id ? "#" + el.id : "";
        var cls = "";
        if (el.classList && el.classList.length) {
          cls = "." + Array.prototype.slice.call(el.classList, 0, 2).join(".");
        }
        found.push({ selector: tag + id + cls, right: Math.round(rect.right), excess: Math.round(excess) });
      }
    }
    found.sort(function (a, b) { return b.excess - a.excess; });
    offenders = found.slice(0, 5);
  }

  return {
    scrollWidth: scrollWidth,
    clientWidth: clientWidth,
    innerWidth: innerWidth,
    overflow: overflow,
    offenders: offenders,
  };
})()
`;

// Poll document.readyState instead of relying on a single Page.loadEventFired
// listener: with one tab reused across every route/viewport, a stray or
// delayed load event from a previous navigation racing a newly-registered
// waiter is a real hazard. Polling is stateless per call and immune to that.
async function waitForPageLoad(client, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const res = await client.send("Runtime.evaluate", {
      expression: "document.readyState",
      returnByValue: true,
    });
    if (res.result?.value === "complete") return;
    await sleep(100);
  }
  throw new Error("navigation timed out waiting for page load");
}

async function runOneCheck(client, url, vp) {
  await client.send("Emulation.setDeviceMetricsOverride", {
    width: vp.width,
    height: vp.height,
    deviceScaleFactor: 1,
    mobile: vp.width <= 480,
  });

  // net::ERR_ABORTED can happen transiently (e.g. Chrome still settling the
  // previous navigation/tab creation) and clears up on retry, so give it one
  // extra attempt before treating it as a real failure.
  let navResult = await client.send("Page.navigate", { url });
  if (navResult.errorText === "net::ERR_ABORTED") {
    await sleep(300);
    navResult = await client.send("Page.navigate", { url });
  }
  if (navResult.errorText) {
    throw new Error(`navigation failed: ${navResult.errorText}`);
  }
  await waitForPageLoad(client, NAV_TIMEOUT_MS);
  await sleep(RENDER_WAIT_MS);

  if (SCROLL_SELECTOR) {
    const selector = JSON.stringify(SCROLL_SELECTOR);
    await client.send("Runtime.evaluate", {
      expression: `(() => { const target = document.querySelector(${selector}); target?.scrollIntoView({ block: ${JSON.stringify(SCROLL_BLOCK)} }); if (target && ${JSON.stringify(SCROLL_BLOCK)} === "start") window.scrollBy(0, -(document.querySelector(".site-header")?.getBoundingClientRect().height || 0)); })()`,
    });
    await sleep(RENDER_WAIT_MS);
  }

  const evalResult = await client.send("Runtime.evaluate", {
    expression: OVERFLOW_CHECK_EXPRESSION,
    returnByValue: true,
  });

  if (evalResult.exceptionDetails) {
    throw new Error(
      "evaluation error: " + (evalResult.exceptionDetails.exception?.description || "unknown")
    );
  }

  if (SCREENSHOT_DIR) {
    mkdirSync(SCREENSHOT_DIR, { recursive: true });
    const capture = await client.send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
    const selectorName = (SCROLL_SELECTOR || "top").replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "");
    writeFileSync(path.join(SCREENSHOT_DIR, `${selectorName}-${vp.width}x${vp.height}.png`), capture.data, "base64");
  }

  return evalResult.result.value; // { scrollWidth, clientWidth, innerWidth, overflow, offenders }
}

async function runCoverflowInteractionCheck(client, url) {
  const evaluate = async (expression) => {
    const result = await client.send("Runtime.evaluate", { expression, returnByValue: true });
    if (result.exceptionDetails) throw new Error("Coverflow evaluation failed");
    return result.result.value;
  };
  const active = () => evaluate(`document.querySelector(".sw-card.is-active")?.getAttribute("aria-label") || ""`);
  const clickSide = (side) => evaluate(`(() => {
    const active = document.querySelector(".sw-card.is-active")?.getBoundingClientRect();
    const cards = [...document.querySelectorAll('.sw-card[aria-hidden="false"]:not(.is-active)')];
    const card = cards.find((item) => ${JSON.stringify(side)} === "right"
      ? item.getBoundingClientRect().left > active.left
      : item.getBoundingClientRect().left < active.left);
    card?.click(); return Boolean(card);
  })()`);

  await client.send("Emulation.setEmulatedMedia", { features: [] });
  await client.send("Page.navigate", { url });
  await waitForPageLoad(client, NAV_TIMEOUT_MS);
  await sleep(RENDER_WAIT_MS);
  await evaluate(`document.querySelector(".selected-work")?.scrollIntoView({ block: "center" })`);
  await sleep(250);

  const visibleCount = await evaluate(`document.querySelectorAll('.sw-card[aria-hidden="false"]').length`);
  const initial = await active();
  if (!(await clickSide("right"))) throw new Error("Right side work was not selectable");
  await sleep(450);
  const afterRight = await active();
  if (!(await clickSide("left"))) throw new Error("Left side work was not selectable");
  await sleep(450);
  const afterLeft = await active();
  await evaluate(`document.querySelector('button[aria-label="Previous work"]')?.click()`);
  await sleep(450);
  const afterPrevious = await active();
  await evaluate(`document.querySelector('button[aria-label="Next work"]')?.click()`);
  await sleep(450);
  const afterNext = await active();

  const beforeAuto = await active();
  await sleep(5300);
  const afterAuto = await active();

  await evaluate(`document.querySelector(".selected-work")?.dispatchEvent(new MouseEvent("mouseover", { bubbles: true }))`);
  const beforeHover = await active();
  await sleep(5300);
  const afterHover = await active();
  await evaluate(`document.querySelector(".selected-work")?.dispatchEvent(new MouseEvent("mouseout", { bubbles: true, relatedTarget: document.body }))`);

  await evaluate(`(() => { const button = document.querySelector('button[aria-label="Next work"]'); button?.focus(); button?.dispatchEvent(new FocusEvent("focusin", { bubbles: true })); return document.activeElement === button; })()`);
  await sleep(200);
  const focusPaused = await evaluate(`document.querySelector(".selected-work")?.dataset.autoplayPaused === "true"`);
  const beforeFocus = await active();
  await sleep(5300);
  const afterFocus = await active();
  await evaluate(`document.activeElement?.blur()`);

  await client.send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  await client.send("Page.navigate", { url });
  await waitForPageLoad(client, NAV_TIMEOUT_MS);
  await sleep(RENDER_WAIT_MS);
  const beforeReduced = await active();
  await sleep(5300);
  const afterReduced = await active();
  await client.send("Emulation.setEmulatedMedia", { features: [] });

  const ok = visibleCount === 3 && initial && afterRight !== initial && afterLeft === initial &&
    afterPrevious !== afterLeft && afterNext === afterLeft && afterAuto !== beforeAuto &&
    afterHover === beforeHover && focusPaused && afterFocus === beforeFocus && afterReduced === beforeReduced;
  if (!ok) throw new Error(`Coverflow interaction assertion failed: ${JSON.stringify({ visibleCount, initial, afterRight, afterLeft, afterPrevious, afterNext, beforeAuto, afterAuto, beforeHover, afterHover, focusPaused, beforeFocus, afterFocus, beforeReduced, afterReduced })}`);
  log("PASS Coverflow interactions side-select/prev/next/autoplay/hover/focus/reduced-motion");
}

// ---------------------------------------------------------------------------
// Browser session lifecycle
// ---------------------------------------------------------------------------

async function launchBrowserSession(chromePath) {
  const userDataDir = await mkdtemp(path.join(os.tmpdir(), "responsive-qa-profile-"));

  const chromeArgs = [
    "--headless=new",
    `--remote-debugging-port=${CDP_PORT}`,
    "--remote-allow-origins=*",
    `--user-data-dir=${userDataDir}`,
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-extensions",
    "--disable-popup-blocking",
    "--no-sandbox",
    "--use-gl=swiftshader",
    "--enable-unsafe-swiftshader",
    "--disable-dev-shm-usage",
    "--hide-scrollbars",
    "--mute-audio",
    "about:blank",
  ];

  const chromeProc = spawn(chromePath, chromeArgs, { stdio: "ignore" });
  const session = { chromeProc, userDataDir, exitedEarly: false, client: null };
  chromeProc.once("exit", () => {
    session.exitedEarly = true;
  });

  try {
    await waitForChromeReady(CDP_PORT, CHROME_READY_TIMEOUT_MS);
    if (session.exitedEarly) throw new Error("Chrome exited before it became ready.");

    // Open a single dedicated tab for the whole run.
    const newTabRes = await fetch(`http://127.0.0.1:${CDP_PORT}/json/new?about:blank`, {
      method: "PUT",
    });
    const tabInfo = await newTabRes.json();
    const wsUrl = tabInfo.webSocketDebuggerUrl;
    if (!wsUrl) throw new Error("Could not obtain a page WebSocket debugger URL.");

    const client = new CdpClient(wsUrl);
    await client.waitOpen();
    await client.send("Page.enable");
    await client.send("Runtime.enable");

    session.client = client;
    return session;
  } catch (err) {
    await teardownSession(session);
    throw err;
  }
}

async function teardownSession(session) {
  if (session.client) session.client.close();
  // Close only the Chrome process this script launched.
  if (!session.exitedEarly) await closeChromeProcess(session.chromeProc.pid);
  await Promise.race([
    rm(session.userDataDir, { recursive: true, force: true }).catch(() => {}),
    sleep(3000),
  ]);
}

async function closeChromeProcess(pid) {
  if (!pid) return;
  if (process.platform === "win32") {
    // Windows can leave taskkill waiting indefinitely while a crashed GPU
    // subprocess is being reaped. Bound cleanup so completed QA results do
    // not hang the caller; the profile removal below remains best-effort.
    spawnSync("taskkill", ["/PID", String(pid), "/T", "/F"], { stdio: "ignore", timeout: 5000 });
  } else {
    try {
      process.kill(pid, "SIGTERM");
    } catch {
      // already gone
    }
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  log(`Responsive QA: base=${BASE_URL} routes=${ROUTES.length} viewports=${VIEWPORTS.length}`);

  const reachable = await isSiteReachable(BASE_URL);
  if (!reachable) {
    logErr(`ERROR: site is not reachable at ${BASE_URL}. Is the dev server running?`);
    process.exitCode = 1;
    return;
  }

  let chromePath;
  try {
    chromePath = findChromePath();
  } catch (err) {
    logErr(`ERROR: ${err.message}`);
    process.exitCode = 1;
    return;
  }
  if (!chromePath) {
    logErr(
      "ERROR: could not find a Chrome executable. Set CHROME_PATH to your chrome.exe location."
    );
    process.exitCode = 1;
    return;
  }

  let session;
  try {
    session = await launchBrowserSession(chromePath);
  } catch (err) {
    logErr(`ERROR: ${err.message}`);
    process.exitCode = 1;
    return;
  }

  let consoleErrorCount = 0;
  let consoleErrorMessages = [];
  let exceptionCount = 0;
  function attachCounters(client) {
    client.on("Runtime.consoleAPICalled", (params) => {
      if (params.type === "error") {
        consoleErrorCount++;
        consoleErrorMessages.push(params.args.map((arg) => arg.value ?? arg.description ?? "").join(" "));
      }
    });
    client.on("Runtime.exceptionThrown", () => {
      exceptionCount++;
    });
  }
  attachCounters(session.client);

  let passed = 0;
  let failed = 0;
  let skipped = 0;
  let relaunches = 0;
  const MAX_RELAUNCHES = 2;
  const totalTests = ROUTES.length * VIEWPORTS.length;

  outer: for (const route of ROUTES) {
    const url = BASE_URL + route;
    for (const vp of VIEWPORTS) {
      const label = `${route} ${vp.width}x${vp.height}`;

      // A test attempt is retried in place (same route/viewport) whenever
      // Chrome itself died mid-run — that's environment instability, not a
      // page defect, so it shouldn't be reported as a FAIL on that route.
      for (;;) {
        consoleErrorCount = 0;
        consoleErrorMessages = [];
        exceptionCount = 0;
        try {
          const { overflow, offenders } = await runOneCheck(session.client, url, vp);
          const ok = overflow === 0 && consoleErrorCount === 0 && exceptionCount === 0;

          log(
            `${ok ? "PASS" : "FAIL"} ${label} overflow=${overflow}px consoleErrors=${consoleErrorCount}` +
              (exceptionCount > 0 ? ` exceptions=${exceptionCount}` : "")
          );

          if (ok) {
            passed++;
          } else {
            failed++;
            for (const message of consoleErrorMessages.slice(0, 3)) log(`  console error: ${message}`);
            if (overflow > 0 && offenders.length) {
              for (const o of offenders) {
                log(`  overflow source: ${o.selector} right=${o.right}px excess=${o.excess}px`);
              }
            }
          }
          break;
        } catch (err) {
          // session.client.closed (set synchronously by our own WS close/error
          // handler) is the reliable signal here — session.exitedEarly depends
          // on the OS reporting the child process's exit, which can lag behind
          // the WebSocket actually dropping and race this check.
          if (!session.client.closed) {
            failed++;
            log(`FAIL ${label} error=${err.message}`);
            break;
          }

          if (relaunches >= MAX_RELAUNCHES) {
            logErr(
              `ERROR: Chrome exited unexpectedly again after ${MAX_RELAUNCHES} relaunches. Stopping remaining tests.`
            );
            skipped = totalTests - (passed + failed);
            break outer;
          }

          relaunches++;
          logErr(
            `WARN: Chrome exited unexpectedly mid-run. Relaunching (${relaunches}/${MAX_RELAUNCHES}) and retrying ${label}.`
          );
          await teardownSession(session).catch(() => {});
          try {
            session = await launchBrowserSession(chromePath);
            attachCounters(session.client);
          } catch (relaunchErr) {
            logErr(`ERROR: relaunch failed: ${relaunchErr.message}`);
            failed++;
            skipped = totalTests - (passed + failed);
            break outer;
          }
          // loop back around and retry this same route/viewport
        }
      }
    }
  }

  if (CHECK_COVERFLOW && failed === 0 && skipped === 0) {
    try {
      await session.client.send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
      await runCoverflowInteractionCheck(session.client, BASE_URL + "/");
    } catch (err) {
      failed++;
      log(`FAIL Coverflow interactions error=${err.message}`);
    }
  }

  log(
    `Responsive QA: ${passed} passed, ${failed} failed` +
      (skipped > 0 ? `, ${skipped} skipped` : "")
  );

  await teardownSession(session);

  process.exitCode = failed > 0 || skipped > 0 ? 1 : 0;
}

main().then(
  () => process.exit(process.exitCode || 0),
  (err) => {
    logErr(`ERROR: ${err?.message || err}`);
    process.exit(1);
  }
);
