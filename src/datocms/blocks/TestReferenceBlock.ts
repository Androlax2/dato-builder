import BlockBuilder from "../../BlockBuilder";
import type { BuilderContext } from "../../types/BuilderContext";

export default function buildTestReferenceBlock({ config }: BuilderContext) {
  return new BlockBuilder({
    name: "Test Reference Block",
    config,
    options: {
      api_key: "test_reference_block",
      hint: "Simple block for testing references",
    },
  })
    .addText({ label: "Title", body: { api_key: "title" } })
    .addMultiLineText({ label: "Content", body: { api_key: "content" } });
}
