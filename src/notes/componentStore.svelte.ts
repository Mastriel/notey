import type { ComponentData } from "./componentData.svelte";
import {
  registerComponentDefinition,
  unregisterComponentDefinition,
} from "./customComponentRegistry.svelte";

const COMPONENT_STORAGE_KEY = "components";

type SavedComponentsStructure = {
  [id: string]: ComponentData;
};

const toSource = (component: ComponentData) => {
  if (component.source) return component.source;

  const template = component.template ?? `<div>${component.name}</div>`;
  const styles = component.styles?.trim();
  const styleBlock = styles ? `\n\n<style>\n${styles}\n</style>` : "";

  return `${template}${styleBlock}`;
};

export class ComponentStore {
  public components: ComponentData[] = $state([]);

  constructor() {
    if (typeof localStorage === "undefined") return;

    const componentsData = localStorage.getItem(COMPONENT_STORAGE_KEY);
    const components = (componentsData ? JSON.parse(componentsData) : {}) as SavedComponentsStructure;

    for (const id in components) {
      const raw = components[id];
      const component = $state({
        ...raw,
        source: toSource(raw),
      });
      this.components.push(component);
      registerComponentDefinition(component);
    }

    this.saveAll();
  }

  public saveAll() {
    if (typeof localStorage === "undefined") return;

    const components = {} as SavedComponentsStructure;

    for (const component of this.components) {
      components[component.id] = component;
    }

    localStorage.setItem(COMPONENT_STORAGE_KEY, JSON.stringify(components));
  }

  public addComponent(component: ComponentData) {
    const statefulComponent = $state(component);
    this.components.push(statefulComponent);
    registerComponentDefinition(statefulComponent);
    this.saveAll();
  }

  public removeComponentById(id: string) {
    const component = this.components.find((it) => it.id === id);
    if (!component) return;

    unregisterComponentDefinition(component.tagName);
    this.components.splice(this.components.indexOf(component), 1);
    this.saveAll();
  }

  public updateComponent(component: ComponentData, previousTagName?: string) {
    if (previousTagName && previousTagName !== component.tagName) {
      unregisterComponentDefinition(previousTagName);
    }

    registerComponentDefinition(component);
    this.saveAll();
  }
}

export const componentStore = new ComponentStore();
