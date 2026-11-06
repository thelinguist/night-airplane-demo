import { useEffect, useMemo } from "react"
import { useTexture } from "@react-three/drei"
import {
  EquirectangularReflectionMapping,
  SRGBColorSpace,
  type Object3D,
} from "three"
import { ENV_MAP_URL, type ReflectionSettings } from "../reflections/settings"
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
  // Plain sRGB JPG. Not via useEnvironment: drei treats .jpg as an UltraHDR gain map.
  const loaded = useTexture(ENV_MAP_URL)
  const envMap = useMemo(() => {
    const texture = loaded.clone()
    texture.mapping = EquirectangularReflectionMapping
    texture.colorSpace = SRGBColorSpace
    texture.needsUpdate = true
    return texture
  }, [loaded])
  useEffect(() => () => envMap.dispose(), [envMap])
  useReflectiveMaterials(target, envMap, settings)
  return null
}
