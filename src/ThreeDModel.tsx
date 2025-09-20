import { Suspense, useState } from "react"
import { Canvas } from "@react-three/fiber"
import { Loader, OrbitControls } from "@react-three/drei"
import { EffectComposer, Bloom } from "@react-three/postprocessing"
import { AirplaneModel } from "./Airplane"
import type { Vector3D } from "./types"

const cameraPresets: Record<string, Vector3D> = {
  oncomingLR: [-70, 10, -50],
  oncoming: [-70, 10, 0],
  oncomingRL: [-70, 10, 50],
}
// const getRandomCameraPreset = () => {
//   const keys = Object.keys(cameraPresets)
//   const randomIndex = Math.floor(Math.random() * keys.length)
//   return cameraPresets[keys[randomIndex]]
// }

export function ThreeDModel() {
  const [lightsOn, setLightsOn] = useState(false)
  const [cameraPosition] = useState<Vector3D>(cameraPresets.oncoming)

  return (
    <div className="ThreeDModel">
      <button onClick={() => setLightsOn(!lightsOn)}>
        Night Mode {lightsOn ? "on" : "off"}
      </button>
      <button disabled title="work in progress">
        Randomize Orientation
      </button>
      <Canvas camera={{ position: cameraPosition, fov: 50 }}>
        <ambientLight intensity={lightsOn ? 0.2 : 0.01} />
        <directionalLight
          position={[5, 10, 7]}
          intensity={lightsOn ? 0.8 : 0}
        />
        <Suspense fallback={null}>
          <AirplaneModel />
        </Suspense>
        <OrbitControls enablePan={false} enableZoom />
        <EffectComposer>
          <Bloom
            luminanceThreshold={1}
            luminanceSmoothing={0.9}
            intensity={2}
          />
        </EffectComposer>
      </Canvas>
      <Loader />
    </div>
  )
}
