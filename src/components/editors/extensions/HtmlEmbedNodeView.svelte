<script lang="ts">
  const {
    html,
    onEdit,
    onDelete,
  }: {
    html: string;
    onEdit: () => void;
    onDelete: () => void;
  } = $props();
</script>

<div
  class="my-2 rounded border border-gray-300 bg-gray-50 p-2"
  contenteditable="false"
>
  <div
    class="mb-2 flex items-center justify-end gap-1 absolute right-6"
    contenteditable="false"
  >
    <button
      type="button"
      class="rounded border border-gray-300 bg-white px-2 py-1 text-xs hover:bg-gray-100"
      onclick={onEdit}
    >
      Edit
    </button>

    <button
      type="button"
      class="rounded border border-red-300 bg-white px-2 py-1 text-xs text-red-700 hover:bg-red-50"
      onclick={onDelete}
    >
      Delete
    </button>
  </div>

  <div class="html-embed-body" contenteditable="false">
    {@html html}
  </div>
</div>
