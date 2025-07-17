import BlockBuilder from "../../BlockBuilder";
import type { BuilderContext } from "../../types/BuilderContext";

/**
 * Build a "Test Reference Block" block in DatoCMS.
 * Generated from DatoCMS API on 2025-07-16T17:30:38.244Z
 * API Key: test_reference_block
 */
export default function buildTestReferenceBlock({ config }: BuilderContext) {
  return new BlockBuilder({
    name: "Test Reference Block",
    config,
    options: {
      api_key: "test_reference_block",
      hint: "Simple block for testing references",
    },
  })
    .addSingleLineString({
      label: "Title",
      options: {
        heading: false,
      },
      body: {
        api_key: "title",
      },
    })
    .addMarkdown({
      label: "Content",
      toolbar: [
        "heading",
        "bold",
        "italic",
        "strikethrough",
        "code",
        "unordered_list",
        "ordered_list",
        "quote",
        "link",
        "image",
        "fullscreen",
      ],
      body: {
        api_key: "content",
      },
    });
}
