import type { BuilderContext } from "../../../../../src";
import BlockBuilder from "../../../../../src/BlockBuilder.js";

export default function buildTestFieldValidationBlock({
  config,
}: BuilderContext) {
  return new BlockBuilder({
    name: "Test Field Validation Block",
    config,
    options: {
      api_key: "test_field_validation_block",
      hint: "Block for testing various field types and validations",
    },
  })
    .addText({
      label: "Required Text",
      body: {
        api_key: "required_text",
        validators: {
          required: true,
        },
      },
    })
    .addBoolean({
      label: "Optional Boolean",
      body: {
        api_key: "optional_boolean",
      },
    })
    .addInteger({
      label: "Limited Integer",
      body: {
        api_key: "limited_integer",
        validators: {
          number_range: {
            min: 1,
            max: 100,
          },
        },
      },
    })
    .addDate({
      label: "Date Field",
      body: {
        api_key: "date_field",
      },
    })
    .addDateTime({
      label: "DateTime Field",
      body: {
        api_key: "datetime_field",
      },
    });
}
