import { Suspense, useEffect, useRef } from "react"
import { Canvas } from "@react-three/fiber"
import { CameraControls, Loader } from "@react-three/drei"
import { Bloom, EffectComposer } from "@react-three/postprocessing"
import { AirplaneModel } from "./Airplane"
import { button, useControls } from "leva"
import { moveCamera } from "./utils"
import { cameraPresets } from "./constants"

export function ThreeDModel() {
  const cameraControlsRef = useRef<CameraControls>(null)

  const { "Lights On": lightsOn, "Camera Position": camPos } = useControls({
    "Lights On": false,
    "Camera Position": {
      options: Object.keys(cameraPresets),
      value: "Oncoming",
    },
    "Randomize Camera Position": button(() => moveCamera(cameraControlsRef)),
  })

  useEffect(() => moveCamera(cameraControlsRef, cameraPresets[camPos]), [camPos])

  return (
    <div className="ThreeDModel">
      <Canvas camera={{ position: cameraPresets.Oncoming, fov: 50 }}>
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
