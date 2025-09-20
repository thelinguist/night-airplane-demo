import { useGLTF } from "@react-three/drei"
import airplaneModel from "./assets/cesna_airplane.glb"
import { WingletLight } from "./WingletLight"
import type { Vector3D } from "./types"

const wingLength = 13.2
const wingHeight = 1.55
const wingDatum = -4
const tailPosition: Vector3D = [8.4, -1, 0]

export function AirplaneModel() {
  const { scene } = useGLTF(airplaneModel)
  return (
    <>
      <primitive object={scene} scale={1} />
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
