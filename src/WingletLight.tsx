import type { FC } from "react"
import type { Vector3D } from "./types"

interface Props {
  position: Vector3D
  color: string
  debug?: boolean
}
export const WingletLight: FC<Props> = ({ position, color, debug }) => {
  return (
    <>
      <pointLight
        position={position}
        color={color}
        intensity={8}
        distance={8}
      />
      <mesh position={position}>
        <sphereGeometry args={[debug ? 0.3 : 0.1, 32, 32]} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={0.3}
          emissive={color}
          emissiveIntensity={2}
        />
      </mesh>
    </>
  )
}
