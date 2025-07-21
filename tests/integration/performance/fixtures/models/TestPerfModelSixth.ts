import type { BuilderContext } from "../../../../../src";
import { ModelBuilder } from "../../../../../src/index.js";

export default async function buildTestPerfModelSixth({
  config,
  getModel,
  getBlock,
}: BuilderContext) {
  return new ModelBuilder({
    name: "Performance Test Model Sixth",
    config,
    body: {
      api_key: "test_perf_model_sixth",
      hint: "Performance test model Sixth",
    },
  })
    .addText({
      label: "Title",
      body: {
        api_key: "title",
        validators: { required: true },
      },
    })
    .addBoolean({
      label: "Content",
      body: {
        api_key: "content",
      },
    })
    .addInteger({
      label: "Published",
      body: {
        api_key: "published",
        validators: { number_range: { min: 0, max: 1000 } },
      },
    })
    .addFloat({
      label: "Priority",
      body: {
        api_key: "priority",
        validators: { number_range: { min: 0, max: 1000 } },
      },
    })
    .addDate({
      label: "Category",
      body: {
        api_key: "category",
      },
    })
    .addDateTime({
      label: "Created",
      body: {
        api_key: "created",
      },
    })
    .addLink({
      label: "Related Model",
      body: {
        api_key: "related_model",
        validators: {
          item_item_type: {
            item_types: [await getModel("TestPerfModelSecond")],
          },
        },
      },
    })
    .addModularContent({
      label: "Content Blocks",
      body: {
        api_key: "content_blocks",
        validators: {
          rich_text_blocks: {
            item_types: [
              await getBlock("TestPerfBlockThird"),
              await getBlock("TestPerfBlockFourth"),
            ],
          },
        },
      },
    });
}
