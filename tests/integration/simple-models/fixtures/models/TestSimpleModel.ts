import type { BuilderContext } from "../../../../../src";
import { ModelBuilder } from "../../../../../src/index.js";

export default function buildTestSimpleModel({ config }: BuilderContext) {
  return new ModelBuilder({
    name: "Test Simple Model",
    config,
    body: {
      api_key: "test_simple_model",
      hint: "Simple model for integration testing",
    },
  })
    .addHeading({
      label: "Title",
      body: {
        api_key: "title",
        validators: {
          required: true,
        },
      },
    })
    .addText({
      label: "Description",
      body: {
        api_key: "description",
      },
    });
}
