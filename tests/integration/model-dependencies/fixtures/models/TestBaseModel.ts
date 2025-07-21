import type { BuilderContext } from "../../../../../src";
import ModelBuilder from "../../../../../src/ModelBuilder.js";

export default function buildTestBaseModel({ config }: BuilderContext) {
  return new ModelBuilder({
    name: "Test Base Model",
    config,
    body: {
      api_key: "test_base_model",
      hint: "Base model for dependency testing",
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
