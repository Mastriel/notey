import type { ImageData } from "./componentData.svelte";

export class ImageStore {
  public images: ImageData[] = $state([])

  public addImage(image: ImageData) {
    const statefulImage = $state(image)
    this.images.push(statefulImage)
  }

  public removeImageById(id: string) {
    const image = this.images.find(it => it.id === id)
    if (!image) return
    this.images.splice(this.images.indexOf(image), 1)
  }
}

export const imageStore = new ImageStore()
