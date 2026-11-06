// Environment-map reflections on the airplane: the moonless_golf JPG, applied
// per material, specular only. Values were picked in the PR #2 review.

export const ENV_MAP_URL = `${import.meta.env.BASE_URL}envmap/moonless_golf/moonless_golf_2k_ev-0.5.jpg`

export type ReflectionSettings = {
  /** `envMapIntensity` on each airplane material. */
  intensity: number
  paintClearcoatRoughness: number
  glassRoughness: number
  metalRoughness: number
  metalMetalness: number
}

const INTENSITY_LIGHTS_ON = 0.15
const INTENSITY_LIGHTS_OFF = 0

const SURFACE_SETTINGS = {
  paintClearcoatRoughness: 0.23,
  glassRoughness: 0.03,
  metalRoughness: 0.46,
  metalMetalness: 0.04,
} as const satisfies Omit<ReflectionSettings, "intensity">

export const getReflectionSettings = (
  isLightsOn: boolean,
): ReflectionSettings => ({
  ...SURFACE_SETTINGS,
  intensity: isLightsOn ? INTENSITY_LIGHTS_ON : INTENSITY_LIGHTS_OFF,
})
