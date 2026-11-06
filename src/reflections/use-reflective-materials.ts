import { useEffect, useRef } from "react"
import { useThree } from "@react-three/fiber"
import { Mesh, MeshStandardMaterial, type Object3D, type Texture } from "three"
import type { ReflectionSettings } from "./settings"
import {
  applyReflectionParams,
  classifySurface,
  createReflectiveMaterial,
  type Surface,
} from "./materials"

type Swap = {
  mesh: Mesh
  original: MeshStandardMaterial
  replacement: MeshStandardMaterial
  surface: Surface
}

/**
 * Swaps the airplane's materials for reflective copies while mounted and
 * restores the GLB originals on unmount (useGLTF caches the scene).
 */
export function useReflectiveMaterials(
  target: Object3D,
  envMap: Texture,
  settings: ReflectionSettings,
): void {
  const invalidate = useThree((state) => state.invalidate)
  const swaps = useRef<Swap[]>([])

  useEffect(() => {
    const created: Swap[] = []
    target.traverse((object) => {
      if (!(object instanceof Mesh)) return
      const original: unknown = object.material
      if (!(original instanceof MeshStandardMaterial)) return
      const surface = classifySurface(object.name)
      const replacement = createReflectiveMaterial(original, surface, envMap)
      object.material = replacement
      created.push({ mesh: object, original, replacement, surface })
    })
    swaps.current = created
    return () => {
      for (const { mesh, original, replacement } of created) {
        mesh.material = original
        replacement.dispose()
      }
      swaps.current = []
      invalidate()
    }
  }, [target, envMap, invalidate])

  useEffect(() => {
    for (const { replacement, original, surface } of swaps.current) {
      applyReflectionParams(replacement, original, surface, settings)
    }
    invalidate()
  }, [settings, envMap, target, invalidate])
}
