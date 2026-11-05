import { useEffect } from "react"
import { StatsGl } from "@react-three/drei"
import { useFrame, useThree } from "@react-three/fiber"

declare global {
  interface Window {
    __renderInfo?: { calls: number; triangles: number; textures: number }
  }
}

// Lazy-loaded (?stats only) so stats-gl stays out of the default bundle. Also exposes the
// renderer's whole-frame counters (all postprocessing passes included) for
// docs/skybox-prototype/measure.mjs.
export function PerfStats() {
  const gl = useThree((state) => state.gl)
  useEffect(() => {
    gl.info.autoReset = false
    return () => {
      gl.info.autoReset = true
    }
  }, [gl])
  useFrame(() => {
    window.__renderInfo = {
      calls: gl.info.render.calls,
      triangles: gl.info.render.triangles,
      textures: gl.info.memory.textures,
    }
    gl.info.reset()
  })
  return <StatsGl />
}
