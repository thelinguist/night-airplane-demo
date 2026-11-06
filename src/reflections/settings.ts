// Environment-map reflection prototype: settings, defaults and URL parsing.
// Everything here is off by default; without `?envmap=` or the leva toggle the
// scene renders exactly as it does without this module.

/**
 * How the environment map reaches the airplane.
 * - global:   drei `<Environment background={false}>` (sets `scene.environment`). Baseline.
 * - material: `envMap` on each airplane material, GLB material params untouched.
 * - tuned:    `material` + clearcoat paint, glossy glass, metallic prop/hubs.
 * - specular: `tuned` with the diffuse IBL term removed, so the map only adds reflections.
 */
export const APPROACHES = ["specular", "tuned", "material", "global"] as const
export type Approach = (typeof APPROACHES)[number]

export const APPROACH_LABELS: Record<Approach, string> = {
  specular: "Per-material, specular only",
  tuned: "Per-material, tuned materials",
  material: "Per-material, GLB materials",
  global: "Global <Environment>",
}

export const SOURCES = ["hdr1k", "jpg2k"] as const
export type Source = (typeof SOURCES)[number]

const ASSET_DIR = `${import.meta.env.BASE_URL}envmap/moonless_golf/`

export const SOURCE_URLS: Record<Source, string> = {
  hdr1k: `${ASSET_DIR}moonless_golf_1k.hdr`,
  jpg2k: `${ASSET_DIR}moonless_golf_2k_ev-0.5.jpg`,
}

export const SOURCE_LABELS: Record<Source, string> = {
  hdr1k: "HDR 1k (1.7 MB)",
  jpg2k: "JPG 2k, tone-mapped (0.25 MB)",
}

export type ReflectionSettings = {
  approach: Approach
  source: Source
  /** `envMapIntensity` per material, or `environmentIntensity` for `global`. */
  intensity: number
  /** Y rotation of the environment, radians. */
  rotation: number
  paintClearcoatRoughness: number
  glassRoughness: number
  metalRoughness: number
  metalMetalness: number
}

export type InitialReflectionState = {
  isEnabled: boolean
  settings: ReflectionSettings
}

export const DEFAULT_SETTINGS: ReflectionSettings = {
  approach: "specular",
  source: "hdr1k",
  intensity: 1,
  rotation: 0,
  paintClearcoatRoughness: 0.08,
  glassRoughness: 0.05,
  metalRoughness: 0.25,
  metalMetalness: 0.7,
}

export const isOneOf = <T extends string>(
  options: readonly T[],
  value: string | null,
): value is T =>
  value !== null && (options as readonly string[]).includes(value)

const readNumber = (
  params: URLSearchParams,
  key: string,
  fallback: number,
): number => {
  const raw = params.get(key)
  if (raw === null || raw.trim() === "") return fallback
  const value = Number(raw)
  return Number.isFinite(value) ? value : fallback
}

/**
 * Reads `?envmap=<approach>&envSource=<source>&envIntensity=<n>&envRotation=<rad>`.
 * `?envmap` alone (or `?envmap=1`) enables the default approach.
 */
export function parseReflectionParams(search: string): InitialReflectionState {
  const params = new URLSearchParams(search)
  const envmap = params.get("envmap")
  const source = params.get("envSource")
  return {
    isEnabled: envmap !== null && envmap !== "off" && envmap !== "0",
    settings: {
      ...DEFAULT_SETTINGS,
      approach: isOneOf(APPROACHES, envmap)
        ? envmap
        : DEFAULT_SETTINGS.approach,
      source: isOneOf(SOURCES, source) ? source : DEFAULT_SETTINGS.source,
      intensity: readNumber(params, "envIntensity", DEFAULT_SETTINGS.intensity),
      rotation: readNumber(params, "envRotation", DEFAULT_SETTINGS.rotation),
    },
  }
}
