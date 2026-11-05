import { lazy, Suspense, useEffect, useRef } from "react"
import { Canvas } from "@react-three/fiber"
import { CameraControls, Loader, Stars } from "@react-three/drei"
import { Bloom, EffectComposer } from "@react-three/postprocessing"
import { AirplaneModel } from "./Airplane"
import { button, useControls } from "leva"
import { getRandomKey, moveCamera } from "../utils"
import { cameraPresets } from "../constants"
import { readDebugParams } from "../skybox/skybox-variants"

// Read once. ?sky=<variant> and ?stats are prototype toggles; without them nothing changes.
const debugParams = readDebugParams(window.location.search)

// Lazy so the prototype code stays out of the default bundle.
const Skybox = lazy(() =>
  import("./Skybox").then((m) => ({ default: m.Skybox })),
)
const PerfStats = lazy(() =>
  import("./PerfStats").then((m) => ({ default: m.PerfStats })),
)

export function ThreeDModel() {
  const cameraControlsRef = useRef<CameraControls>(null)

  const [{ "Lights On": lightsOn, "Camera Position": camPos }, set] =
    useControls(() => ({
      "Lights On": false,
      "Camera Position": {
        options: Object.keys(cameraPresets),
        value: "Oncoming",
      },
      "Randomize Camera Position": button(() =>
        set({ "Camera Position": getRandomKey(cameraPresets) }),
      ),
    }))

  useEffect(
    () => moveCamera(cameraControlsRef, cameraPresets[camPos]),
    [camPos],
  )

  const stars = (
    <Stars
      radius={100}
      depth={50}
      count={5000}
      factor={4}
      saturation={0}
      fade
      speed={1}
    />
  )

  return (
    <div className="ThreeDModel">
      <Canvas
        camera={{ position: cameraPresets.Oncoming, fov: 50 }}
        frameloop={debugParams.isStatsEnabled ? "always" : "demand"}
      >
        <ambientLight intensity={lightsOn ? 0.4 : 0.01} />
        <directionalLight
          position={[5, 10, 7]}
          intensity={lightsOn ? 0.9 : 0}
        />
        <Suspense fallback={null}>
          {debugParams.skybox ? (
            // Own boundary: the plane must not disappear while the sky downloads.
            <Suspense fallback={stars}>
              <Skybox
                variant={debugParams.skybox}
                initialIntensity={debugParams.skyIntensity}
                initialRotation={debugParams.skyRotation}
                isIblEnabled={debugParams.isIblEnabled}
                fallback={stars}
              />
            </Suspense>
          ) : (
            stars
          )}
          <AirplaneModel />
          <CameraControls ref={cameraControlsRef} />
          <EffectComposer>
            <Bloom
              luminanceThreshold={0.03}
              luminanceSmoothing={0.1}
              intensity={0.5}
              mipmapblur
            />
          </EffectComposer>
        </Suspense>
        {debugParams.isStatsEnabled && (
          <Suspense fallback={null}>
            <PerfStats />
          </Suspense>
        )}
      </Canvas>
      <Loader />
    </div>
  )
}
