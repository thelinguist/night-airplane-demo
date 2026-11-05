import { useLayoutEffect, type ReactNode } from "react"
import { Environment, useTexture } from "@react-three/drei"
import { useControls } from "leva"
import { EquirectangularReflectionMapping, SRGBColorSpace } from "three"
import {
  SKYBOX_VARIANTS,
  type SkyboxVariantId,
} from "../skybox/skybox-variants"

type SkySettings = {
  intensity: number
  rotation: number
  /** true: background + scene.environment (IBL at environmentIntensity 1). false: background only. */
  isIblEnabled: boolean
}

const toBackgroundMode = (isIblEnabled: boolean) =>
  isIblEnabled ? true : "only"

type SkyProps = SkySettings & {
  files: string | string[]
  path?: string
}

// Marks when the sky texture is decoded and on screen, for load-time measurement.
const useReadyMark = () => {
  useLayoutEffect(() => {
    performance.mark("skybox-ready")
  }, [])
}

// background="only": the sky sets scene.background but never scene.environment, so it adds no
// image-based lighting. The airplane must stay dark apart from its position lights. ?skyIbl
// switches to background={true} only to show why (see docs/skybox-prototype/README.md).
function EnvironmentSky({
  files,
  path,
  intensity,
  rotation,
  isIblEnabled,
}: SkyProps) {
  useReadyMark()
  return (
    <Environment
      files={files}
      path={path}
      background={toBackgroundMode(isIblEnabled)}
      backgroundIntensity={intensity}
      backgroundRotation={[0, rotation, 0]}
    />
  )
}

// drei's <Environment files="*.jpg"> expects an UltraHDR gain map, so a plain LDR equirect JPG
// is loaded as a regular texture and handed over through `map`.
function LdrEquirectSky({
  files,
  intensity,
  rotation,
  isIblEnabled,
}: SkyProps) {
  const texture = useTexture(
    typeof files === "string" ? files : files[0],
    (t) => {
      t.mapping = EquirectangularReflectionMapping
      t.colorSpace = SRGBColorSpace
    },
  )
  useReadyMark()
  return (
    <Environment
      map={texture}
      background={toBackgroundMode(isIblEnabled)}
      backgroundIntensity={intensity}
      backgroundRotation={[0, rotation, 0]}
    />
  )
}

type SkyboxProps = {
  variant: SkyboxVariantId
  /** Starting values for the leva sliders (from ?skyIntensity / ?skyRotation). */
  initialIntensity?: number | null
  initialRotation?: number | null
  /** ?skyIbl: let the sky light the airplane too. Comparison only: it gives the heading away. */
  isIblEnabled?: boolean
  /** Rendered while "Show Skybox" is unchecked, so the old look can be compared without reloading. */
  fallback: ReactNode
}

// Rotation (radians about Y). 0 puts the dark tree line in front of the "Oncoming" presets. No
// rotation hides the clubhouse lamps from every preset: they span ~170 degrees of horizon and the
// two preset groups face opposite ways, so the "Outgoing" side always sees some of them.
const DEFAULT_ROTATION = 0

export function Skybox({
  variant,
  initialIntensity,
  initialRotation,
  isIblEnabled = false,
  fallback,
}: SkyboxProps) {
  const config = SKYBOX_VARIANTS[variant]
  const {
    "Show Skybox": isVisible,
    "Sky Intensity": intensity,
    "Sky Rotation": rotation,
  } = useControls("Skybox (prototype)", {
    "Show Skybox": true,
    "Sky Intensity": {
      value: initialIntensity ?? config.intensity,
      min: 0,
      max: 2,
      step: 0.01,
    },
    "Sky Rotation": {
      value: initialRotation ?? DEFAULT_ROTATION,
      min: -Math.PI,
      max: Math.PI,
      step: 0.01,
    },
  })

  if (!isVisible) return fallback

  const props: SkyProps = {
    files: config.files,
    path: "path" in config ? config.path : undefined,
    intensity,
    rotation,
    isIblEnabled,
  }
  return config.kind === "ldr" ? (
    <LdrEquirectSky {...props} />
  ) : (
    <EnvironmentSky {...props} />
  )
}
