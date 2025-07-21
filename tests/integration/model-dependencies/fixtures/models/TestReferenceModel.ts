import type { BuilderContext } from "../../../../../src";
import ModelBuilder from "../../../../../src/ModelBuilder.js";

export default async function buildTestReferenceModel({
  config,
  getModel,
}: BuilderContext) {
  return new ModelBuilder({
    name: "Test Reference Model",
    config,
    body: {
      api_key: "test_reference_model",
      hint: "Model that references another model via async getModel",
    },
  })
    .addText({
      label: "Reference Title",
      body: {
        api_key: "reference_title",
        validators: {
          required: true,
        },
      },
    })
    .addLink({
      label: "Base Model Reference",
      body: {
        api_key: "base_model_reference",
        validators: {
          item_item_type: {
            item_types: [await getModel("TestBaseModel")],
          },
        },
      },
    });
}
