import type { Vector3D } from "../types"
import { cameraPresets } from "../constants"
import { CameraControls } from "@react-three/drei"
import type { RefObject } from "react"

export const getRandomKey = <T = object>(object: T) => {
  const keys = Object.keys(object as object)
  const randomIndex = Math.floor(Math.random() * keys.length)
  return object[keys[randomIndex] as keyof T]
}

export const moveCamera = (cameraControlsRef: RefObject<CameraControls | null>, newPos?: Vector3D) => {
  const position = !newPos ? getRandomKey(cameraPresets) : newPos
  const [x, y, z] = position.map((coord) => coord * -1)
  cameraControlsRef.current?.lookInDirectionOf(x, y, z, false)
}
