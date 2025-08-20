import type { BuilderContext } from "../../../../../src";
import BlockBuilder from "../../../../../src/BlockBuilder.js";

export default function buildContentBlock({ config }: BuilderContext) {
  return new BlockBuilder({
    name: "Content Block",
    config,
    options: {
      api_key: "content_block",
      hint: "Reusable content block for mixed dependency testing",
    },
  })
    .addText({
      label: "Content Title",
      body: {
        api_key: "content_title",
        validators: {
          required: true,
        },
      },
    })
    .addText({
      label: "Content Body",
      body: {
        api_key: "content_body",
        appearance: {
          editor: "wysiwyg",
          parameters: {
            toolbar: ["bold", "italic", "link"],
          },
          addons: [],
        },
      },
    })
    .addBoolean({
      label: "Featured",
      body: {
        api_key: "featured",
      },
    });
}
