// Prototype only: moonless_golf skybox variants, selected with ?sky=<id>.
// Without ?sky the demo renders exactly as before (drei <Stars> on a transparent canvas).

const ROOT = `${import.meta.env.BASE_URL}skybox/moonless_golf/`

export type SkyboxKind = "hdr" | "ldr" | "cube"

export type SkyboxVariant = {
  kind: SkyboxKind
  /** Equirect file URL, or the cube-face file names (px, nx, py, ny, pz, nz) under `path`. */
  files: string | string[]
  path?: string
  /** Starting backgroundIntensity. The scene is not tone-mapped, so this scales output directly. */
  intensity: number
}

// Tuned so the airplane's silhouette stays (nearly) invisible against the sky and ground, which
// keeps the teaching exercise fair. Brighter than this and the airframe gives away its heading.
const HDR_INTENSITY = 0.1
const LDR_INTENSITY = 0.3

export const SKYBOX_VARIANTS = {
  hdr1k: {
    kind: "hdr",
    files: `${ROOT}moonless_golf_1k.hdr`,
    intensity: HDR_INTENSITY,
  },
  hdr2k: {
    kind: "hdr",
    files: `${ROOT}moonless_golf_2k.hdr`,
    intensity: HDR_INTENSITY,
  },
  // Not committed (26.7 MB). See docs/skybox-prototype/README.md to fetch it.
  hdr4k: {
    kind: "hdr",
    files: `${ROOT}moonless_golf_4k.hdr`,
    intensity: HDR_INTENSITY,
  },
  // Tone-mapped (EV -0.5, ACES) sRGB JPGs.
  jpg2k: {
    kind: "ldr",
    files: `${ROOT}moonless_golf_2k_ev-0.5.jpg`,
    intensity: LDR_INTENSITY,
  },
  // Same as jpg2k with the horizon lamps inpainted (docs/skybox-prototype/remove_lamps.py).
  jpg2kNoLamps: {
    kind: "ldr",
    files: `${ROOT}moonless_golf_2k_ev-0.5_nolamps.jpg`,
    intensity: LDR_INTENSITY,
  },
  jpg4k: {
    kind: "ldr",
    files: `${ROOT}moonless_golf_4k_ev-0.5.jpg`,
    intensity: LDR_INTENSITY,
  },
  cube1k: {
    kind: "cube",
    files: ["px.jpg", "nx.jpg", "py.jpg", "ny.jpg", "pz.jpg", "nz.jpg"],
    path: `${ROOT}cube/`,
    intensity: LDR_INTENSITY,
  },
} satisfies Record<string, SkyboxVariant>

export type SkyboxVariantId = keyof typeof SKYBOX_VARIANTS

const isVariantId = (value: string): value is SkyboxVariantId =>
  Object.hasOwn(SKYBOX_VARIANTS, value)

export type DebugParams = {
  skybox: SkyboxVariantId | null
  /** ?skyIntensity=<n> overrides the variant's starting backgroundIntensity. */
  skyIntensity: number | null
  /** ?skyRotation=<radians> overrides the starting Y rotation. */
  skyRotation: number | null
  /** ?stats: show StatsGl and render continuously so FPS/frame time are meaningful. */
  isStatsEnabled: boolean
  /** ?skyIbl: also use the sky as scene.environment (image-based lighting). Comparison only. */
  isIblEnabled: boolean
}

const readNumber = (params: URLSearchParams, key: string): number | null => {
  const raw = params.get(key)
  if (raw === null || raw.trim() === "") return null
  const value = Number(raw)
  return Number.isFinite(value) ? value : null
}

export const readDebugParams = (search: string): DebugParams => {
  const params = new URLSearchParams(search)
  const sky = params.get("sky")
  return {
    skybox: sky !== null && isVariantId(sky) ? sky : null,
    skyIntensity: readNumber(params, "skyIntensity"),
    skyRotation: readNumber(params, "skyRotation"),
    isStatsEnabled: params.has("stats"),
    isIblEnabled: params.has("skyIbl"),
  }
}
