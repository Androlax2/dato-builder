import type { BuilderContext } from "../../../../../src";
import ModelBuilder from "../../../../../src/ModelBuilder.js";

export default function buildTestEnvironmentModel({ config }: BuilderContext) {
  return new ModelBuilder({
    name: "Test Environment Model",
    config,
    body: {
      api_key: "test_environment_model",
      hint: "Model for testing environment-specific builds",
    },
  })
    .addText({
      label: "Environment Title",
      body: {
        api_key: "environment_title",
        validators: {
          required: true,
          unique: true,
        },
      },
    })
    .addText({
      label: "Environment Description",
      body: {
        api_key: "environment_description",
      },
    })
    .addBoolean({
      label: "Is Active",
      body: {
        api_key: "is_active",
        default_value: true,
      },
    });
}
