import type { BuilderContext } from "../../../../../src";
import { ModelBuilder } from "../../../../../src/index.js";

export default function buildTestPerfModelTenth({ config }: BuilderContext) {
  return new ModelBuilder({
    name: "Performance Test Model Tenth",
    config,
    body: {
      api_key: "test_perf_model_tenth",
      hint: "Performance test model Tenth",
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
    });
}
