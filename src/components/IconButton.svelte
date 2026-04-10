<script lang="ts">
    import { Accordion, Button } from "bits-ui";

    import { FilePlusCorner } from '@lucide/svelte'
    import type {Snippet} from "svelte";

    const { children } : { children: Snippet } = $props();

</script>

<Button.Root class="hover:bg-gray-200 rounded-md p-1">
  {@render children?.()}
</Button.Root>