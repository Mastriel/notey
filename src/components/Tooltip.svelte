<script lang="ts" module>
  export type Placement = "top" | "bottom" | "left" | "right";
</script>

<script lang="ts">
  import type { Snippet } from "svelte";

  const {
    text,
    placement = "top",
    children,
  }: {
    text: string;
    placement?: Placement;
    children: Snippet;
  } = $props();

  const positionClass = $derived(
    placement === "bottom"
      ? "top-full mt-2 left-1/2 -translate-x-1/2"
      : placement === "left"
        ? "right-full mr-2 top-1/2 -translate-y-1/2"
        : placement === "right"
          ? "left-full ml-2 top-1/2 -translate-y-1/2"
          : "bottom-full mb-2 left-1/2 -translate-x-1/2",
  );
  const arrowClass = $derived(
    placement === "bottom"
      ? "top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-45"
      : placement === "left"
        ? "right-0 top-1/2 translate-x-1/2 -translate-y-1/2 rotate-45"
        : placement === "right"
          ? "left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 rotate-45"
          : "bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45",
  );
  const arrowBorderClass = $derived(
    placement === "bottom"
      ? "border-l border-t"
      : placement === "left"
        ? "border-r border-t"
        : placement === "right"
          ? "border-l border-b"
          : "border-r border-b",
  );
</script>

<div class="group/tooltip relative inline-flex">
  {@render children?.()}

  <div
    role="tooltip"
    class={`pointer-events-none absolute z-50 whitespace-nowrap rounded-md bg-gray-100 border border-gray-300 px-2 py-1 text-xs font-medium opacity-0 shadow-lg transition-opacity duration-150 group-hover/tooltip:opacity-100 ${positionClass}`}
  >
    {text}
    <div
      class={`absolute h-2 w-2 bg-gray-100 border-gray-300 ${arrowBorderClass} ${arrowClass}`}
    ></div>
  </div>
</div>
