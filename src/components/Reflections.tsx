import { useEffect, useMemo } from "react"
import { Environment, useEnvironment, useTexture } from "@react-three/drei"
import {
  EquirectangularReflectionMapping,
  SRGBColorSpace,
  type Object3D,
  type Texture,
} from "three"
import {
  SOURCE_URLS,
  type Approach,
  type ReflectionSettings,
} from "../reflections/settings"
import { useReflectiveMaterials } from "../reflections/use-reflective-materials"

type Props = {
  /** The airplane's GLB scene. Only its materials get the env map. */
  target: Object3D
  settings: ReflectionSettings
}

/**
 * Environment-map reflections on the airplane. Never touches `scene.background`,
 * so the `<Stars>` backdrop stays as is. Suspends while the map downloads; render
 * it inside its own `<Suspense>` so the plane doesn't wait for it.
 */
export function Reflections({ target, settings }: Props) {
  return settings.source === "jpg2k" ? (
    <JpgReflections target={target} settings={settings} />
  ) : (
    <HdrReflections target={target} settings={settings} />
  )
}

function HdrReflections({ target, settings }: Props) {
  // Radiance .hdr via drei: linear, EquirectangularReflectionMapping already set.
  const envMap = useEnvironment({ files: SOURCE_URLS.hdr1k })
  return (
    <ReflectionsWithMap envMap={envMap} target={target} settings={settings} />
  )
}

function JpgReflections({ target, settings }: Props) {
  // Plain sRGB JPG. Not via useEnvironment: drei treats .jpg as an UltraHDR gain map.
  const loaded = useTexture(SOURCE_URLS.jpg2k)
  const envMap = useMemo(() => {
    const texture = loaded.clone()
    texture.mapping = EquirectangularReflectionMapping
    texture.colorSpace = SRGBColorSpace
    texture.needsUpdate = true
    return texture
  }, [loaded])
  useEffect(() => () => envMap.dispose(), [envMap])
  return (
    <ReflectionsWithMap envMap={envMap} target={target} settings={settings} />
  )
}

type MapProps = Props & { envMap: Texture }

function ReflectionsWithMap({ envMap, target, settings }: MapProps) {
  const { approach } = settings
  return approach === "global" ? (
    <Environment
      map={envMap}
      background={false}
      environmentIntensity={settings.intensity}
      environmentRotation={[0, settings.rotation, 0]}
    />
  ) : (
    <PerMaterialReflections
      envMap={envMap}
      target={target}
      settings={settings}
      approach={approach}
    />
  )
}

function PerMaterialReflections({
  envMap,
  target,
  settings,
  approach,
}: MapProps & { approach: Exclude<Approach, "global"> }) {
  useReflectiveMaterials(target, envMap, approach, settings)
  return null
}
