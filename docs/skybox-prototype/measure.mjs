// Skybox prototype measurement: frame time and load time per ?sky variant.
//
// Usage (needs `playwright` resolvable from the working directory and the demo served at BASE):
//   pnpm build && pnpm preview --port 4173 &
//   node docs/skybox-prototype/measure.mjs [--headed] [--viewport 1280x720] [--mbps 20] [--reps 2]
// Use --headed on a machine with a real GPU: headless Chromium in a container falls back to
// SwiftShader (CPU rendering), whose absolute numbers mean nothing.
import { chromium } from "playwright"

const args = process.argv.slice(2)
const flag = (name, fallback) => {
  const i = args.indexOf(`--${name}`)
  return i === -1 ? fallback : args[i + 1]
}
const BASE = flag("base", "http://localhost:4173/night-airplane-demo/")
const [width, height] = flag("viewport", "640x360").split("x").map(Number)
const mbps = Number(flag("mbps", "20"))
const reps = Number(flag("reps", "2"))
const sampleMs = Number(flag("sample", "20000"))
const variants = flag(
  "variants",
  "off,hdr1k,hdr2k,hdr4k,jpg2k,jpg4k,cube1k",
).split(",")
const isHeaded = args.includes("--headed")

const RECORDER = `
  window.__ts = []
  ;(function f(t) { if (t) window.__ts.push(t); requestAnimationFrame(f) })()
`

const stats = (xs) => {
  const s = [...xs].sort((a, b) => a - b)
  const q = (p) => s[Math.min(s.length - 1, Math.floor(p * s.length))]
  return { n: s.length, median: q(0.5), p90: q(0.9) }
}

async function measure(browser, variant) {
  const context = await browser.newContext({ viewport: { width, height } })
  const page = await context.newPage()
  await page.addInitScript(RECORDER)
  const cdp = await context.newCDPSession(page)
  await cdp.send("Network.enable")
  await cdp.send("Network.setCacheDisabled", { cacheDisabled: true })
  if (mbps > 0) {
    await cdp.send("Network.emulateNetworkConditions", {
      offline: false,
      latency: 40,
      downloadThroughput: (mbps * 1e6) / 8,
      uploadThroughput: (10 * 1e6) / 8,
    })
  }
  const query = variant === "off" ? "?stats" : `?stats&sky=${variant}`
  await page.goto(BASE + query)
  // Ready = plane GLB loaded and (if any) the sky texture on screen.
  await page.waitForFunction(
    (hasSky) => {
      const glb = performance
        .getEntriesByType("resource")
        .some((r) => r.name.endsWith(".glb") && r.responseEnd > 0)
      const sky =
        !hasSky || performance.getEntriesByName("skybox-ready").length > 0
      return glb && sky
    },
    variant !== "off",
    { timeout: 300000, polling: 500 },
  )
  const load = await page.evaluate(() => {
    const res = performance.getEntriesByType("resource")
    const glb = res.find((r) => r.name.endsWith(".glb"))
    const sky = res.filter((r) => r.name.includes("/skybox/"))
    const mark = performance.getEntriesByName("skybox-ready")[0]
    return {
      glbDoneMs: glb ? Math.round(glb.responseEnd) : null,
      skyBytes: sky.reduce((sum, r) => sum + (r.encodedBodySize || 0), 0),
      skyDownloadDoneMs: sky.length
        ? Math.round(Math.max(...sky.map((r) => r.responseEnd)))
        : null,
      skyReadyMs: mark ? Math.round(mark.startTime) : null,
    }
  })
  await page.waitForTimeout(3000)
  await page.evaluate(() => (window.__ts = []))
  await page.waitForTimeout(sampleMs)
  const ts = await page.evaluate(() => window.__ts)
  const render = await page.evaluate(() => window.__renderInfo ?? null)
  const deltas = ts.slice(1).map((t, i) => t - ts[i])
  await context.close()
  return { variant, ...load, render, frame: stats(deltas) }
}

const browser = await chromium.launch({
  headless: !isHeaded,
  args: ["--enable-unsafe-swiftshader"],
})
const gl = await (async () => {
  const p = await browser.newPage()
  const r = await p.evaluate(() => {
    const g = document.createElement("canvas").getContext("webgl2")
    const e = g && g.getExtension("WEBGL_debug_renderer_info")
    return e ? g.getParameter(e.UNMASKED_RENDERER_WEBGL) : "unknown"
  })
  await p.close()
  return r
})()
console.log(
  JSON.stringify({ renderer: gl, viewport: `${width}x${height}`, mbps }),
)
for (let rep = 0; rep < reps; rep++) {
  for (const v of variants) {
    console.log(JSON.stringify({ rep, ...(await measure(browser, v)) }))
  }
}
await browser.close()
