<script lang="ts">
	import type { HTMLImgAttributes } from "svelte/elements";
let {
	src,
	alt = "Image",
	class: className = "",
	...rest
	}: HTMLImgAttributes = $props();

	let error = $state(false);

	function handleError() {
		error = true;
	}
</script>

{#if error}
	<div class="flex items-center justify-center rounded-md bg-gray-100 text-gray-400 {className}">
		<span> Image not found </span>
	</div>
{:else}
	<img
		{src}
		{alt}
		class={className}	
		onerror={handleError}
		{...rest}
	/>
{/if}
