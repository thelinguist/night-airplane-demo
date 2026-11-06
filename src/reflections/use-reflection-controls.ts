import { useMemo } from "react"
import { folder, useControls } from "leva"
import {
  APPROACHES,
  APPROACH_LABELS,
  SOURCES,
  SOURCE_LABELS,
  isOneOf,
  parseReflectionParams,
  type ReflectionSettings,
} from "./settings"

const toOptions = <T extends string>(
  values: readonly T[],
  labels: Record<T, string>,
): Record<string, T> =>
  Object.fromEntries(values.map((value) => [labels[value], value]))

/**
 * Leva folder "Reflections (prototype)". Returns undefined while the toggle is off,
 * which keeps the scene identical to main. `?envmap=…` sets the starting values.
 */
export function useReflectionControls(): ReflectionSettings | undefined {
  const initial = useMemo(
    () => parseReflectionParams(window.location.search),
    [],
  )
  const { settings } = initial

  const values = useControls({
    "Reflections (prototype)": folder(
      {
        Reflections: initial.isEnabled,
        Approach: {
          options: toOptions(APPROACHES, APPROACH_LABELS),
          value: settings.approach,
        },
        Source: {
          options: toOptions(SOURCES, SOURCE_LABELS),
          value: settings.source,
        },
        Intensity: { value: settings.intensity, min: 0, max: 3, step: 0.05 },
        Rotation: {
          value: settings.rotation,
          min: 0,
          max: Math.PI * 2,
          step: 0.05,
        },
        "Paint clearcoat roughness": {
          value: settings.paintClearcoatRoughness,
          min: 0,
          max: 1,
          step: 0.01,
        },
        "Glass roughness": {
          value: settings.glassRoughness,
          min: 0,
          max: 1,
          step: 0.01,
        },
        "Metal roughness": {
          value: settings.metalRoughness,
          min: 0,
          max: 1,
          step: 0.01,
        },
        "Metal metalness": {
          value: settings.metalMetalness,
          min: 0,
          max: 1,
          step: 0.01,
        },
      },
      { collapsed: !initial.isEnabled },
    ),
  })

  const {
    Reflections: isEnabled,
    Approach: approach,
    Source: source,
    Intensity: intensity,
    Rotation: rotation,
    "Paint clearcoat roughness": paintClearcoatRoughness,
    "Glass roughness": glassRoughness,
    "Metal roughness": metalRoughness,
    "Metal metalness": metalMetalness,
  } = values

  // Keep the object stable between unrelated re-renders so the material effects don't re-run.
  return useMemo(() => {
    if (!isEnabled) return undefined
    return {
      // leva types select values loosely (string), so narrow them back.
      approach: isOneOf(APPROACHES, approach) ? approach : settings.approach,
      source: isOneOf(SOURCES, source) ? source : settings.source,
      intensity,
      rotation,
      paintClearcoatRoughness,
      glassRoughness,
      metalRoughness,
      metalMetalness,
    }
  }, [
    isEnabled,
    approach,
    source,
    intensity,
    rotation,
    paintClearcoatRoughness,
    glassRoughness,
    metalRoughness,
    metalMetalness,
    settings,
  ])
}
