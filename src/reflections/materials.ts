import {
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  ShaderChunk,
  type Texture,
} from "three"
import type { Approach, ReflectionSettings } from "./settings"

export type Surface = "paint" | "glass" | "metal" | "rubber"

// Mesh names in cesna_airplane.glb after GLTFLoader's sanitizeNodeName (dots removed).
// Worked out from the mesh bounds and base colors; see docs/env-map-reflections/README.md.
const SURFACE_BY_MESH: Record<string, Surface> = {
  Plane_0: "paint", // fuselage
  Plane_3: "paint", // vertical tail
  Plane001_0: "paint", // wing
  Plane003_0: "paint", // wing strut
  Plane_4: "glass", // cabin side windows
  Plane004_0: "glass", // windshield
  Cube001_0: "metal", // propeller blades
  Cube001_1: "metal", // propeller tips
  Cone_0: "metal", // spinner
  Plane_2: "metal", // main gear hubs
  Plane002_1: "metal", // nose gear hub
  Plane_1: "rubber", // main gear tires
  Plane002_0: "rubber", // nose gear tire
}

export const classifySurface = (meshName: string): Surface =>
  SURFACE_BY_MESH[meshName] ?? "rubber"

const DIFFUSE_IBL_LINE = "iblIrradiance += getIBLIrradiance( geometryNormal );"

/**
 * Removes the diffuse image-based-lighting term from a standard/physical
 * material so the environment map only contributes specular reflections
 * (base layer and clearcoat). The airframe then gets glints and sheen, not fill light.
 */
function makeSpecularOnly(material: MeshStandardMaterial): void {
  material.onBeforeCompile = (shader) => {
    const chunk = ShaderChunk.lights_fragment_maps
    if (!chunk.includes(DIFFUSE_IBL_LINE)) {
      throw new Error(
        "three.js lights_fragment_maps changed; update the specular-only reflection patch",
      )
    }
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <lights_fragment_maps>",
      chunk.replace(DIFFUSE_IBL_LINE, ""),
    )
  }
  material.customProgramCacheKey = () => "specular-only-ibl"
}

function toClearcoatPaint(
  original: MeshStandardMaterial,
): MeshPhysicalMaterial {
  return new MeshPhysicalMaterial({
    name: `${original.name} (clearcoat)`,
    color: original.color,
    map: original.map,
    side: original.side,
    transparent: original.transparent,
    opacity: original.opacity,
    alphaTest: original.alphaTest,
    roughness: original.roughness,
    metalness: original.metalness,
    clearcoat: 1,
  })
}

/** Builds the replacement material for one airplane mesh. Never mutates `original`. */
export function createReflectiveMaterial(
  original: MeshStandardMaterial,
  surface: Surface,
  approach: Exclude<Approach, "global">,
  envMap: Texture,
): MeshStandardMaterial {
  const isTuned = approach !== "material"
  const material =
    isTuned && surface === "paint"
      ? toClearcoatPaint(original)
      : original.clone()
  material.envMap = envMap
  if (approach === "specular") makeSpecularOnly(material)
  return material
}

/** Applies the slider values. Cheap: no shader recompile. */
export function applyReflectionParams(
  material: MeshStandardMaterial,
  original: MeshStandardMaterial,
  surface: Surface,
  approach: Exclude<Approach, "global">,
  settings: ReflectionSettings,
): void {
  material.envMapIntensity = settings.intensity
  material.envMapRotation.set(0, settings.rotation, 0)
  if (approach === "material") return
  if (material instanceof MeshPhysicalMaterial) {
    material.clearcoatRoughness = settings.paintClearcoatRoughness
  }
  if (surface === "glass") {
    material.roughness = settings.glassRoughness
  } else if (surface === "metal") {
    material.roughness = settings.metalRoughness
    material.metalness = settings.metalMetalness
  } else {
    material.roughness = original.roughness
  }
}
