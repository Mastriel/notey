<script lang="ts">
  import { ImagePlus, Trash2 } from '@lucide/svelte'
  import IconButton from "./IconButton.svelte";
  import ImgComp from "./ImgComp.svelte";
  import { imageStore } from "../notes/componentStore.svelte";
  import type { ImageData } from "../notes/componentData.svelte";
  import { editorManager } from "../notes/editorManager.svelte";
  import { v4 } from "uuid";

  const onImageClick = (image: ImageData) => {
    editorManager.activePage = image
  }

  const addImage = () => {
    const src = prompt("Enter image URL:")
    if (!src) return
    imageStore.addImage({
      name: src.split('/').pop()?.split('?')[0] ?? 'image',
      src,
      type: "image",
      id: v4()
    })
  }
</script>

<div class="p-1 flex gap-1 border-b bg-gray-50 border-gray-300">
  <IconButton tooltip="Add Image" tooltipPlacement="right" onclick={addImage}>
    <ImagePlus class="text-gray-500" size={16} />
  </IconButton>
</div>

<div class="flex flex-col gap-1 p-1">
  {#each imageStore.images as image (image.id)}
    <div class="group flex items-center gap-1 rounded-md">
      <button
        type="button"
        class={`border border-transparent min-w-0 flex-1 rounded-md px-2 py-1 text-left text-sm transition-colors text-gray-700 ${editorManager.activePage?.id === image.id ? "bg-gray-50 !border-gray-300" : "hover:bg-gray-50 hover:border-gray-300"}`}
        onclick={() => onImageClick(image)}
        aria-label={image.name}
      >
        <ImgComp src={image.src} alt={image.name} class="w-full h-16 object-cover rounded mb-1" />
        <span class="block truncate whitespace-nowrap overflow-hidden">{image.name}</span>
      </button>

      <span class="opacity-0 transition-opacity group-hover:opacity-100">
        <IconButton
          tooltip="Delete image"
          tooltipPlacement="left"
          onclick={(event) => {
            event.stopPropagation();
            imageStore.removeImageById(image.id);
          }}
          class="hover:cursor-pointer"
        >
          <Trash2 class="text-red-400" size={14} />
        </IconButton>
      </span>
    </div>
  {/each}
</div>
