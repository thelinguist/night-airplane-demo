import { Suspense, lazy } from "react"
import { useGLTF } from "@react-three/drei"
import airplaneModel from "../assets/cesna_airplane.glb"
import { WingletLight } from "./WingletLight"
import type { Vector3D } from "../types"
import type { ReflectionSettings } from "../reflections/settings"

// Lazy so the env-map code (drei loaders) stays out of the main bundle while the prototype is off.
const Reflections = lazy(() =>
  import("./Reflections").then((module) => ({ default: module.Reflections })),
)

const wingLength = 13.2
const wingHeight = 1.55
const wingDatum = -4
const tailPosition: Vector3D = [8.4, -1, 0]

interface Props {
  /** Environment-map reflections prototype. Undefined = off (same as main). */
  reflections?: ReflectionSettings
}

export function AirplaneModel({ reflections }: Props) {
  const { scene } = useGLTF(airplaneModel)
  return (
    <>
      <primitive object={scene} scale={1} />
      {reflections && (
        <Suspense fallback={null}>
          <Reflections target={scene} settings={reflections} />
        </Suspense>
      )}
      <WingletLight
        position={[wingDatum, wingHeight, wingLength]}
        color="#ff0000"
      />
      <WingletLight
        position={[wingDatum, wingHeight, -wingLength]}
        color="#00ff00"
      />
      <WingletLight position={tailPosition} color="#556666" />
    </>
  )
}
