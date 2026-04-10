

export type ComponentData = {
  type: "component"
  name: string,
  script: string,
  id: string
}

export type ImageData = {
  type: "image"
  name: string
  src: string
  id: string
}