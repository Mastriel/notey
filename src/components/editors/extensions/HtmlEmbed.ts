import { mergeAttributes, Node } from "@tiptap/core";

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

export const HtmlEmbed = Node.create({
  name: "htmlEmbed",
  group: "block",
  atom: true,
  selectable: true,

  addAttributes() {
    return {
      html: {
        default: "",
        parseHTML: (element) => decodeHtmlPayload(element.getAttribute("data-html")),
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
      dom.className = "my-2 rounded border border-gray-300 bg-gray-50 p-2";
      dom.contentEditable = "false";

      const toolbar = document.createElement("div");
      toolbar.className = "mb-2 flex items-center justify-end gap-1";

      const editButton = document.createElement("button");
      editButton.type = "button";
      editButton.className = "rounded border border-gray-300 bg-white px-2 py-1 text-xs hover:bg-gray-100";
      editButton.textContent = "Edit";

      const deleteButton = document.createElement("button");
      deleteButton.type = "button";
      deleteButton.className = "rounded border border-red-300 bg-white px-2 py-1 text-xs text-red-700 hover:bg-red-50";
      deleteButton.textContent = "Delete";

      toolbar.append(editButton, deleteButton);
      dom.appendChild(toolbar);

      const body = document.createElement("div");
      body.className = "html-embed-body";
      body.innerHTML = String(currentNode.attrs.html ?? "");
      dom.appendChild(body);

      const deleteNode = () => {
        const position = getPos();
        const tr = editor.state.tr.delete(position, position + currentNode.nodeSize);
        editor.view.dispatch(tr);
      };

      const onEditClick = () => {
        window.dispatchEvent(new CustomEvent("html-embed:edit", {
          detail: {
            position: getPos(),
            html: String(currentNode.attrs.html ?? ""),
          },
        }));
      };

      const onDeleteClick = () => {
        deleteNode();
      };

      editButton.addEventListener("click", onEditClick);
      deleteButton.addEventListener("click", onDeleteClick);

      return {
        dom,
        update: (updatedNode) => {
          if (updatedNode.type.name !== "htmlEmbed") return false;
          currentNode = updatedNode;
          body.innerHTML = String(currentNode.attrs.html ?? "");
          return true;
        },
        destroy: () => {
          editButton.removeEventListener("click", onEditClick);
          deleteButton.removeEventListener("click", onDeleteClick);
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
        serialize(state: { write: (chunk: string) => void; closeBlock: (node: unknown) => void }, node: { attrs: { html?: string } }) {
          const encodedHtml = encodeHtmlPayload(String(node.attrs.html ?? ""));
          state.write(`<html-embed data-html="${encodedHtml}"></html-embed>`);
          state.closeBlock(node);
        },
      },
    };
  },
});



