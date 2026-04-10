import { compile } from "svelte/compiler";
import { mount, unmount } from "svelte";
import * as svelteApi from "svelte";
import * as svInternals from "./svelteInternals";
import type { ComponentData } from "./componentData.svelte";

type CompiledComponent = (
  anchor: Node,
  props?: Record<string, unknown>,
) => void;
type MountedComponent = ReturnType<typeof mount>;

const componentDefinitions = new Map<string, ComponentData>();
const compiledComponents = new Map<string, CompiledComponent>();
const compileRunIds = new Map<string, number>();
const mountedByElement = new WeakMap<HTMLElement, MountedComponent>();
const compileErrors = new Map<string, string>();

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const getExportedComponentName = (compiledCode: string) => {
  const functionMatch = compiledCode.match(
    /export\s+default\s+function\s+([A-Za-z_$][\w$]*)/,
  );
  if (functionMatch?.[1]) return functionMatch[1];

  const classMatch = compiledCode.match(
    /export\s+default\s+class\s+([A-Za-z_$][\w$]*)/,
  );
  if (classMatch?.[1]) return classMatch[1];

  return null;
};

const normalizeNamedImports = (imports: string) =>
  imports
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const aliasMatch = part.match(
        /^([A-Za-z_$][\w$]*)\s+as\s+([A-Za-z_$][\w$]*)$/,
      );
      if (!aliasMatch) return part;
      return `${aliasMatch[1]}: ${aliasMatch[2]}`;
    })
    .join(", ");

const isJsDelivrUrl = (specifier: string) => {
  try {
    const url = new URL(specifier);
    return url.hostname === "cdn.jsdelivr.net";
  } catch {
    return false;
  }
};

const rewriteJsDelivrImports = (code: string) => {
  let rewritten = code;
  let importIndex = 0;

  // import "https://cdn.jsdelivr.net/...";
  rewritten = rewritten.replace(
    /^import\s+['"](https?:\/\/[^'"]+)['"];\s*$/gm,
    (_match, specifier: string) =>
      isJsDelivrUrl(specifier)
        ? `await import(${JSON.stringify(specifier)});`
        : _match,
  );

  // import * as ns from "https://cdn.jsdelivr.net/...";
  rewritten = rewritten.replace(
    /^import\s+\*\s+as\s+([A-Za-z_$][\w$]*)\s+from\s+['"](https?:\/\/[^'"]+)['"];\s*$/gm,
    (_match, namespace: string, specifier: string) =>
      isJsDelivrUrl(specifier)
        ? `const ${namespace} = await import(${JSON.stringify(specifier)});`
        : _match,
  );

  // import { a, b as c } from "https://cdn.jsdelivr.net/...";
  rewritten = rewritten.replace(
    /^import\s+\{\s*([^}]+)\s*\}\s+from\s+['"](https?:\/\/[^'"]+)['"];\s*$/gm,
    (_match, namedImports: string, specifier: string) =>
      isJsDelivrUrl(specifier)
        ? `const { ${normalizeNamedImports(namedImports)} } = await import(${JSON.stringify(specifier)});`
        : _match,
  );

  // import defaultExport, { a, b as c } from "https://cdn.jsdelivr.net/...";
  rewritten = rewritten.replace(
    /^import\s+([A-Za-z_$][\w$]*)\s*,\s*\{\s*([^}]+)\s*\}\s+from\s+['"](https?:\/\/[^'"]+)['"];\s*$/gm,
    (
      _match,
      defaultImport: string,
      namedImports: string,
      specifier: string,
    ) => {
      if (!isJsDelivrUrl(specifier)) return _match;
      importIndex += 1;
      const moduleVar = `__jsdelivrMod${importIndex}`;
      return `const ${moduleVar} = await import(${JSON.stringify(specifier)});\nconst { default: ${defaultImport}, ${normalizeNamedImports(namedImports)} } = ${moduleVar};`;
    },
  );

  // import defaultExport from "https://cdn.jsdelivr.net/...";
  rewritten = rewritten.replace(
    /^import\s+([A-Za-z_$][\w$]*)\s+from\s+['"](https?:\/\/[^'"]+)['"];\s*$/gm,
    (_match, defaultImport: string, specifier: string) =>
      isJsDelivrUrl(specifier)
        ? `const { default: ${defaultImport} } = await import(${JSON.stringify(specifier)});`
        : _match,
  );

  return rewritten;
};

const toRunnableCode = (compiledCode: string, componentName: string) => {
  const withoutSideEffectImports = compiledCode
    .replace(/^import\s+['"].*['"];\s*$/gm, "")
    .replace(
      /^import\s+\*\s+as\s+\$\s+from\s+['"]svelte\/internal\/client['"];\s*$/gm,
      "",
    );

  const withSvelteBindings = withoutSideEffectImports
    .replace(
      /^import\s+\{\s*([^}]+)\s*\}\s+from\s+['"]svelte['"];\s*$/gm,
      (_match, imports: string) =>
        `const { ${normalizeNamedImports(imports)} } = __svelte;`,
    )
    .replace(
      /^import\s+\*\s+as\s+([A-Za-z_$][\w$]*)\s+from\s+['"]svelte['"];\s*$/gm,
      (_match, namespace: string) => `const ${namespace} = __svelte;`,
    );

  const withExternalBindings = rewriteJsDelivrImports(withSvelteBindings);

  if (/^import\s+/m.test(withExternalBindings)) {
    throw new Error(
      "Only imports from 'svelte' or 'https://cdn.jsdelivr.net' are supported in user components.",
    );
  }

  const withoutExports = withExternalBindings.replace(
    /export\s+default\s+/,
    "",
  );

  return `${withoutExports}\nreturn ${componentName};`;
};

const compileSvelteSource = async (source: string) => {
  const compiled = compile(source, {
    generate: "client",
    css: "injected",
  });

  const componentName = getExportedComponentName(compiled.js.code);
  if (!componentName) {
    throw new Error("Unable to determine compiled component export.");
  }

  const runnableCode = toRunnableCode(compiled.js.code, componentName);
  const factory = new Function(
    "$",
    "__svelte",
    `return (async () => {\n${runnableCode}\n})();`,
  ) as (
    $runtime: typeof svInternals,
    svelte: typeof svelteApi,
  ) => Promise<CompiledComponent>;

  return factory(svInternals, svelteApi);
};

const getPropsFromAttributes = (element: HTMLElement) => {
  const props: Record<string, string> = {};
  for (const attr of element.attributes) {
    props[attr.name] = attr.value;
  }
  return props;
};

const defineCustomElement = (tagName: string) => {
  if (customElements.get(tagName)) return;

  customElements.define(
    tagName,
    class RuntimeSvelteComponentElement extends HTMLElement {
      static observedAttributes: string[] = [];

      connectedCallback() {
        this.render();
      }

      disconnectedCallback() {
        const mounted = mountedByElement.get(this);
        if (mounted) {
          unmount(mounted);
          mountedByElement.delete(this);
        }
      }

      attributeChangedCallback() {
        this.render();
      }

      render() {
        const previous = mountedByElement.get(this);
        if (previous) {
          unmount(previous);
          mountedByElement.delete(this);
        }

        const Component = compiledComponents.get(tagName);

        if (!Component) {
          this.innerHTML = `<div style="font: 12px sans-serif; color: #666; border: 1px dashed #ccc; padding: 8px; border-radius: 6px;">Failed to compile: ${escapeHtml(tagName)}</div>`;
          return;
        }

        this.innerHTML = "";
        const mounted = mount(Component as any, {
          target: this,
          props: getPropsFromAttributes(this),
        });

        mountedByElement.set(this, mounted);
      }
    },
  );
};

const refreshTaggedInstances = (tagName: string) => {
  if (typeof document === "undefined") return;

  document.querySelectorAll(tagName).forEach((element) => {
    const maybeRenderable = element as HTMLElement & { render?: () => void };
    maybeRenderable.render?.();
  });
};

export const registerComponentDefinition = (definition: ComponentData) => {
  componentDefinitions.set(definition.tagName, definition);
  const runId = (compileRunIds.get(definition.tagName) ?? 0) + 1;
  compileRunIds.set(definition.tagName, runId);

  defineCustomElement(definition.tagName);

  void compileSvelteSource(definition.source)
    .then((Component) => {
      if (compileRunIds.get(definition.tagName) !== runId) return;
      compiledComponents.set(definition.tagName, Component);
      compileErrors.delete(definition.tagName);
      refreshTaggedInstances(definition.tagName);
    })
    .catch((error) => {
      if (compileRunIds.get(definition.tagName) !== runId) return;
      const message =
        error instanceof Error ? error.message : "Unknown compilation error";
      compileErrors.set(definition.tagName, message);
      refreshTaggedInstances(definition.tagName);
    });
};

export const unregisterComponentDefinition = (tagName: string) => {
  componentDefinitions.delete(tagName);
  compiledComponents.delete(tagName);
  compileErrors.delete(tagName);
  refreshTaggedInstances(tagName);
};

export const getComponentCompileError = (tagName: string) =>
  compileErrors.get(tagName);

export const getRegisteredComponentDefinition = (tagName: string) =>
  componentDefinitions.get(tagName);

export const getRegisteredComponentDefinitions = () =>
  Array.from(componentDefinitions.values());
