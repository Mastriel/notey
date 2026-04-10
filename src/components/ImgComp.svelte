<script lang="ts">
  import type { HTMLImgAttributes } from "svelte/elements";

  let {
    src,
    alt = "Notey Image",
    class: className = "",
    ...rest
  }: HTMLImgAttributes = $props();

  let status = $state<"loading" | "error" | "success">("loading");

  function handleError() {
    status = "error";
  }
  function handleLoad() {
    status = "success";
  }
</script>

<div
  class="relative overflow-hidden rounded-md bg-gray-100 text-gray-400 {className}"
>
  {#if status === "error"}
    <div
      class="flex h-full min-h-[100px] w-full items-center justify-center rounded-lg border-dashed border border-zinc-800 bg-zinc-900 text-sm text-zinc-200"
    >
      <div
        class="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800"
      >
        <span>Image not found</span>
      </div>
    </div>
  {:else}
    <img
      {src}
      {alt}
      class={className}
      onerror={handleError}
      onload={handleLoad}
      {...rest}
    />
  {/if}
</div>
