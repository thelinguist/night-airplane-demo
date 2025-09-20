/// <reference types="vite/client" />

declare module "*.svg" {
  const content: string
  export default content
}

declare module "*.glb" {
  const src: string
  export default src
}
