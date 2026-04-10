<script lang="ts">
  import "../app.css";
  import { invoke } from "@tauri-apps/api/core";
  import NoteSidebar from "../components/NoteSidebar.svelte";
    import { Pane, PaneGroup, PaneResizer } from "paneforge";
  import Editor from "../components/Editor.svelte";
  import ComponentSidebar from "../components/ComponentSidebar.svelte";
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
    <NoteSidebar/>
  </Pane>

  <PaneResizer>
    <div class="pr-1 h-full">
      <div class="border-r border-gray-300 h-full"></div>
    </div>
  </PaneResizer>

  <Pane>
    <Editor/>
  </Pane>

  <PaneResizer>
    <div class="pl-1 h-full">
      <div class="border-r border-gray-300 h-full"></div>
    </div>
  </PaneResizer>

  <Pane minSize={5} defaultSize={10} maxSize={40}>
    <ComponentSidebar/>
  </Pane>
</PaneGroup>
