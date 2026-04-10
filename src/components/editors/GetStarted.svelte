<script>
    import IconButton from "../IconButton.svelte";
    import {FilePlusCorner} from "@lucide/svelte";
</script>

<div class="items-center justify-center h-[80%] flex flex-col">

  <h1 class="text-2xl font-bold mb-5 text-center">Get Started</h1>

  <p>
    Press
    <IconButton class="translate-y-0.75 mx-0.5 rounded-md p-1 bg-gray-100">
      <FilePlusCorner class="text-gray-500" size={16} />
    </IconButton>
    at the upper-left corner to create a new file.
  </p>

  <p class="mt-1">
    Press
    <IconButton class="translate-y-0.75 mx-0.5 rounded-md p-1 bg-gray-100">
      <FilePlusCorner class="text-gray-500" size={16} />
    </IconButton>
    at the upper-right corner to create a new component.
  </p>
</div>
