

export type ComponentData = {
  type: "component"
  name: string,
  tagName: string,
  source: string,
  template?: string,
  styles?: string,
  script?: string,
  id: string
}

export type ImageData = {
  type: "image"
  name: string
  src: string
  id: string
}