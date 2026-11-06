// Screenshot harness for the env-map reflections prototype.
//
// Usage (needs `playwright` resolvable from the working directory and the demo served at BASE):
//   pnpm build && pnpm preview --port 4173 &
//   node docs/env-map-reflections/capture.mjs --out docs/env-map-reflections/screenshots \
//     --shots "off|Oncoming|0,specular|Oncoming|0|envIntensity=1"
// Each shot is "<name>|<camera preset>|<lights on 0/1>|<extra query>". `name` doubles as
// `?envmap=<name>` unless it is "off". Leva drives the camera preset and "Lights On".
import { chromium } from "playwright"
import { mkdir } from "node:fs/promises"

const args = process.argv.slice(2)
const flag = (name, fallback) => {
  const i = args.indexOf(`--${name}`)
  return i === -1 ? fallback : args[i + 1]
}
const BASE = flag("base", "http://localhost:4173/night-airplane-demo/")
const OUT = flag("out", "docs/env-map-reflections/screenshots")
const [width, height] = flag("viewport", "960x540").split("x").map(Number)
const settleMs = Number(flag("settle", "4000"))
const shots = flag("shots", "off|Oncoming|0").split(",")
const zoom = !args.includes("--full")

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-")

async function capture(browser, spec) {
  const [variant, camera, lights, extra = ""] = spec.split("|")
  const params = new URLSearchParams(extra.replaceAll(";", "&"))
  if (variant !== "off") params.set("envmap", variant)
  const query = params.toString() ? `?${params}` : ""
  const page = await browser.newPage({ viewport: { width, height } })
  page.on("pageerror", (e) => console.error(`[${spec}] pageerror`, e.message))
  await page.goto(BASE + query)
  await page.waitForFunction(
    (hasEnv) => {
      const done = (re) =>
        performance
          .getEntriesByType("resource")
          .some((r) => re.test(r.name) && r.responseEnd > 0)
      return done(/\.glb$/) && (!hasEnv || done(/envmap\/.*\.(hdr|jpg)$/))
    },
    variant !== "off",
    { timeout: 60000 },
  )
  // The download finishing is not the scene being mounted: GLB parse and shader compile
  // under SwiftShader take seconds, and a camera change before CameraControls mounts is lost.
  await page.waitForTimeout(settleMs)
  // Bounce through another preset so the final change always fires after CameraControls
  // has mounted (re-selecting the current value is a no-op, and an early change is lost).
  const select = page.locator('[id="Camera Position"]')
  const other = camera === "Outgoing" ? "Oncoming" : "Outgoing"
  await select.selectOption(other)
  await page.waitForTimeout(1500)
  await select.selectOption(camera)
  if (lights === "1")
    await page.evaluate(() => document.getElementById("Lights On")?.click())
  await page.waitForTimeout(settleMs)
  await page.evaluate(() => {
    // Hide the leva panel (its root is the nearest fixed-position ancestor) and the footer.
    let el = document.getElementById("Lights On")
    while (el && getComputedStyle(el).position !== "fixed")
      el = el.parentElement
    if (el) el.style.visibility = "hidden"
    for (const footer of document.querySelectorAll("footer"))
      footer.style.visibility = "hidden"
  })
  await page.waitForTimeout(500)
  const tag = extra ? `_${slug(extra)}` : ""
  const file = `${OUT}/${variant}${tag}_${slug(camera)}${lights === "1" ? "_lights" : ""}.png`
  // The plane only fills the middle of the frame; crop to it.
  const clip = zoom
    ? { x: width / 4, y: height / 4, width: width / 2, height: height / 2 }
    : undefined
  await page.screenshot({ path: file, clip })
  console.log(file)
  await page.close()
}

await mkdir(OUT, { recursive: true })
const browser = await chromium.launch({
  args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
})
for (const spec of shots) await capture(browser, spec)
await browser.close()
