<script lang="ts">
  import { Button } from "bits-ui";
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import Tooltip, { type Placement } from "./Tooltip.svelte";

  const {
    children,
    tooltip,
    tooltipPlacement = "bottom",
    ...rest
  }: {
    tooltip?: string;
    tooltipPlacement?: Placement;
    children: Snippet;
  } & HTMLAttributes<HTMLButtonElement> = $props();
</script>

{#if tooltip}
  <Tooltip text={tooltip} placement={tooltipPlacement}>
    {#snippet children()}
      <Button.Root class="rounded-md p-1 hover:bg-gray-200" {...rest}>
        {@render children?.()}
      </Button.Root>
    {/snippet}
  </Tooltip>
{:else}
  <Button.Root class="rounded-md p-1 hover:bg-gray-200" {...rest}>
    {@render children?.()}
  </Button.Root>
{/if}
