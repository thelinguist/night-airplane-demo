import type { Vector3D } from "./types"

const camHeight = 10

export const cameraPresets: Record<string, Vector3D> = {
  "Oncoming Left to Right": [-70, camHeight, -50],
  Oncoming: [-70, camHeight, 0],
  "Oncoming Right to Left": [-70, camHeight, 50],
  "Outgoing Right to Left": [70, camHeight, 50],
  "Outgoing Left to Right": [70, camHeight, -50],
  Outgoing: [70, camHeight, 0],
}