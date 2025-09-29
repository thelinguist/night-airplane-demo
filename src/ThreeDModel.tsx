import { Suspense, useRef, useState } from "react"
import { Canvas } from "@react-three/fiber"
import { CameraControls, Loader } from "@react-three/drei"
import { Bloom, EffectComposer } from "@react-three/postprocessing"
import { AirplaneModel } from "./Airplane"
import type { Vector3D } from "./types"

const cameraPresets: Record<string, Vector3D> = {
  oncomingLR: [-70, 10, -50],
  oncoming: [-70, 10, 0],
  oncomingRL: [-70, 10, 50],
  outgoingRL: [70, 10, 50],
  outgoingLR: [70, 10, 50],
  outgoing: [70, 10, 50],
}
const getRandomCameraPreset = () => {
  const keys = Object.keys(cameraPresets)
  const randomIndex = Math.floor(Math.random() * keys.length)
  return cameraPresets[keys[randomIndex]]
}

export function ThreeDModel() {
  const [lightsOn, setLightsOn] = useState(false)
  const cameraControlsRef = useRef<CameraControls>(null)

  const moveCamera = () => {
    const newPos = getRandomCameraPreset()
    const [x, y, z] = newPos.map((coord) => coord * -1)
    cameraControlsRef.current?.lookInDirectionOf(x, y, z, false)
  }

  return (
    <div className="ThreeDModel">
      <button onClick={() => setLightsOn(!lightsOn)}>
        Night Mode {lightsOn ? "on" : "off"}
      </button>
      <button onClick={moveCamera}>Randomize Orientation</button>
      <Canvas camera={{ position: cameraPresets.oncoming, fov: 50 }}>
        <ambientLight intensity={lightsOn ? 0.2 : 0.01} />
        <directionalLight
          position={[5, 10, 7]}
          intensity={lightsOn ? 0.8 : 0}
        />
        <Suspense fallback={null}>
          <AirplaneModel />
        </Suspense>
        <CameraControls ref={cameraControlsRef} />
        <EffectComposer>
          <Bloom
            luminanceThreshold={0.03}
            luminanceSmoothing={0.1}
            intensity={0.5}
            mipmapblur
          />
        </EffectComposer>
      </Canvas>
      <Loader />
    </div>
  )
}
