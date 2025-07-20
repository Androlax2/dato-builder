import type { BuilderContext } from "../../../src";
import ModelBuilder from "../../../src/ModelBuilder";

export default function buildTestModel({ config }: BuilderContext) {
  return new ModelBuilder({
    name: "Test Model",
    config,
    body: {
      api_key: "test_model",
      singleton: false,
      collection_appearance: "table",
      sortable: true,
    },
  })
    .addSingleLineString({
      label: "Name",
      body: {
        api_key: "name",
      },
    })
    .addInteger({
      label: "Count",
      body: {
        api_key: "count",
      },
    });
}
