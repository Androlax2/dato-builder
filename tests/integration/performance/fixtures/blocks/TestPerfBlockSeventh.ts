import type { BuilderContext } from "../../../../../src";
import BlockBuilder from "../../../../../src/BlockBuilder.js";

export default function buildTestPerfBlockSeventh({ config }: BuilderContext) {
  return new BlockBuilder({
    name: "Performance Test Block Seventh",
    config,
    options: {
      api_key: "test_perf_block_seventh",
      hint: "Performance test block Seventh",
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
      label: "Description",
      body: {
        api_key: "description",
      },
    })
    .addInteger({
      label: "Active",
      body: {
        api_key: "active",
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
    });
}
