import { mergeAttributes, Node as TiptapNode } from "@tiptap/core";
import { mount, unmount } from "svelte";
import HtmlEmbedNodeView from "./HtmlEmbedNodeView.svelte";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    htmlEmbed: {
      insertHtmlEmbed: (html: string) => ReturnType;
    };
  }
}

const encodeHtmlPayload = (value: string) => {
  const bytes = new TextEncoder().encode(value);
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary);
};

const decodeHtmlPayload = (value: string | null) => {
  if (!value) return "";

  try {
    const binary = atob(value);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  } catch {
    return value;
  }
};

export const HtmlEmbed = TiptapNode.create({
  name: "htmlEmbed",
  group: "block",
  atom: true,
  selectable: true,

  addAttributes() {
    return {
      html: {
        default: "",
        parseHTML: (element) =>
          decodeHtmlPayload(element.getAttribute("data-html")),
        renderHTML: (attributes) => ({
          "data-html": encodeHtmlPayload(String(attributes.html ?? "")),
        }),
      },
    };
  },

  parseHTML() {
    return [{ tag: "html-embed" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["html-embed", mergeAttributes(HTMLAttributes)];
  },

  addNodeView() {
    return ({ node, editor, getPos }) => {
      let currentNode = node;

      const dom = document.createElement("div");
      dom.contentEditable = "false";

      const deleteNode = () => {
        const position = getPos();
        if (position === undefined) return;

        const tr = editor.state.tr.delete(
          position,
          position + currentNode.nodeSize,
        );
        editor.view.dispatch(tr);
      };

      const onEditClick = () => {
        const position = getPos();
        if (position === undefined) return;

        window.dispatchEvent(
          new CustomEvent("html-embed:edit", {
            detail: {
              position,
              html: String(currentNode.attrs.html ?? ""),
            },
          }),
        );
      };

      const onDeleteClick = () => {
        deleteNode();
      };

      let mounted = mount(HtmlEmbedNodeView, {
        target: dom,
        props: {
          html: String(currentNode.attrs.html ?? ""),
          onEdit: onEditClick,
          onDelete: onDeleteClick,
        },
      });

      return {
        dom,
        stopEvent: (event) => {
          const target = event.target;
          if (!(target instanceof Node)) return false;

          // Let embed controls and embedded HTML handle their own events.
          return dom.contains(target);
        },
        ignoreMutation: () => true,
        update: (updatedNode) => {
          if (updatedNode.type.name !== "htmlEmbed") return false;
          currentNode = updatedNode;

          unmount(mounted);
          mounted = mount(HtmlEmbedNodeView, {
            target: dom,
            props: {
              html: String(currentNode.attrs.html ?? ""),
              onEdit: onEditClick,
              onDelete: onDeleteClick,
            },
          });

          return true;
        },
        destroy: () => {
          unmount(mounted);
        },
      };
    };
  },

  addCommands() {
    return {
      insertHtmlEmbed:
        (html: string) =>
        ({ commands }) =>
          commands.insertContent({
            type: this.name,
            attrs: { html },
          }),
    };
  },

  addStorage() {
    return {
      markdown: {
        serialize(
          state: {
            write: (chunk: string) => void;
            closeBlock: (node: unknown) => void;
          },
          node: { attrs: { html?: string } },
        ) {
          const encodedHtml = encodeHtmlPayload(String(node.attrs.html ?? ""));
          state.write(`<html-embed data-html="${encodedHtml}"></html-embed>`);
          state.closeBlock(node);
        },
      },
    };
  },
});
