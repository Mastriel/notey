<script lang="ts">
  import "../app.css";
  import { invoke } from "@tauri-apps/api/core";
  import Sidebar from "../components/Sidebar.svelte";
    import { Pane, PaneGroup, PaneResizer } from "paneforge";
  import Editor from "../components/Editor.svelte";
  let name = $state("");

  let greetMsg = $state("");

  async function greet(event: Event) {
    event.preventDefault();
    // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
    greetMsg = await invoke("greet", { name });
  }
</script>

<PaneGroup direction="horizontal">
  <Pane minSize={5} defaultSize={10} maxSize={40}>
    <Sidebar/>
  </Pane>

  <PaneResizer>
    <div class="px-0.5 h-full">
      <div class="border-r border-gray-300 h-full"></div>
    </div>
  </PaneResizer>
  <Pane>
    <Editor/>
  </Pane>
</PaneGroup>
