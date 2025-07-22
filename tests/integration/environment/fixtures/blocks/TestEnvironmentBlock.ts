import type { BuilderContext } from "../../../../../src";
import BlockBuilder from "../../../../../src/BlockBuilder.js";

export default function buildTestEnvironmentBlock({ config }: BuilderContext) {
  return new BlockBuilder({
    name: "Test Environment Block",
    config,
    options: {
      api_key: "test_environment_block",
      hint: "Block for testing environment-specific builds",
    },
  })
    .addText({
      label: "Environment Title",
      body: {
        api_key: "environment_title",
        validators: {
          required: true,
        },
      },
    })
    .addText({
      label: "Environment Name",
      body: {
        api_key: "environment_name",
      },
    });
}
