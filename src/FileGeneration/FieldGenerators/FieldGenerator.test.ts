import type { Field } from "@datocms/cma-client/src/generated/SimpleSchemaTypes";
import { beforeEach, describe, expect, it } from "@jest/globals";
import {
  FieldGenerator,
  type FieldGeneratorConfig,
} from "@/FileGeneration/FieldGenerators/FieldGenerator";

// Mock concrete implementation for testing
class MockDateGenerator extends FieldGenerator<"addDate"> {
  getMethodCallName() {
    return "addDate" as const;
  }

  generateBuildConfig() {
    return {
      label: this.field.label,
      body: {
        position: this.field.position,
      },
    };
  }
}

describe("FieldGenerator", () => {
  let mockField: Field;
  let config: FieldGeneratorConfig;

  beforeEach(() => {
    mockField = {
      id: "test-id",
      type: "field",
      label: "Test Field",
      field_type: "date",
      api_key: "test-date-api-key",
      hint: "test hint",
      localized: false,
      validators: {},
      position: 1,
      appearance: { addons: [], editor: "date_picker", parameters: {} },
      default_value: "2025-07-24",
      deep_filtering_enabled: false,
      item_type: { id: "SDGeMOa4Q3CRgEQTXg8jbg", type: "item_type" },
      fieldset: null,
    };

    config = {
      field: mockField,
    };
  });

  describe("generateMethodCall", () => {
    it("should generate correct method call string for date field", () => {
      const generator = new MockDateGenerator(config);
      const methodCall = generator.generateMethodCall();

      expect(methodCall).toBe(
        `addDate({"label":"Test Field","body":{"position":1}})`,
      );
    });
  });
});
