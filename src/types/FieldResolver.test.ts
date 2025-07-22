import type * as SimpleSchemaTypes from "@datocms/cma-client/src/generated/SimpleSchemaTypes";
import { describe, expect, it } from "@jest/globals";
import type { FieldIdOrResolver, FieldResolver } from "./FieldResolver.js";
import { isFieldResolver, resolveFieldId } from "./FieldResolver.js";

describe("FieldResolver", () => {
  const mockFields: SimpleSchemaTypes.Field[] = [
    {
      id: "field_123",
      label: "Title",
      api_key: "title",
      field_type: "string",
    } as SimpleSchemaTypes.Field,
    {
      id: "field_456",
      label: "Description",
      api_key: "description",
      field_type: "text",
    } as SimpleSchemaTypes.Field,
    {
      id: "field_789",
      label: "Image",
      api_key: "image",
      field_type: "file",
    } as SimpleSchemaTypes.Field,
  ];

  describe("isFieldResolver", () => {
    it("should return true for function values", () => {
      const resolver: FieldResolver = (fields) => {
        if (fields.length === 0) throw new Error("No fields provided");
        return fields[0]!.id;
      };

      expect(isFieldResolver(resolver)).toBe(true);
    });

    it("should return false for string values", () => {
      const fieldId = "field_123";

      expect(isFieldResolver(fieldId)).toBe(false);
    });

    it("should handle arrow functions", () => {
      const resolver = (fields: SimpleSchemaTypes.Field[]) => {
        if (fields.length === 0) throw new Error("No fields provided");
        return fields[0]!.id;
      };

      expect(isFieldResolver(resolver)).toBe(true);
    });

    it("should handle regular functions", () => {
      function resolver(fields: SimpleSchemaTypes.Field[]): string {
        if (fields.length === 0) throw new Error("No fields provided");
        return fields[0]!.id;
      }

      expect(isFieldResolver(resolver)).toBe(true);
    });
  });

  describe("resolveFieldId", () => {
    it("should return string value directly", () => {
      const fieldId = "field_123";

      const result = resolveFieldId(fieldId, mockFields);

      expect(result).toBe("field_123");
    });

    it("should call resolver function with fields", () => {
      const resolver: FieldResolver = (fields) => {
        const titleField = fields.find((f) => f.label === "Title");
        if (!titleField) throw new Error("Title field not found");
        return titleField.id;
      };

      const result = resolveFieldId(resolver, mockFields);

      expect(result).toBe("field_123");
    });

    it("should handle resolver finding by api_key", () => {
      const resolver: FieldResolver = (fields) => {
        const imageField = fields.find((f) => f.api_key === "image");
        if (!imageField) throw new Error("Image field not found");
        return imageField.id;
      };

      const result = resolveFieldId(resolver, mockFields);

      expect(result).toBe("field_789");
    });

    it("should handle resolver finding by field_type", () => {
      const resolver: FieldResolver = (fields) => {
        const textField = fields.find((f) => f.field_type === "text");
        if (!textField) throw new Error("Text field not found");
        return textField.id;
      };

      const result = resolveFieldId(resolver, mockFields);

      expect(result).toBe("field_456");
    });

    it("should throw error when resolver returns empty string", () => {
      const resolver: FieldResolver = () => "";

      expect(() => {
        resolveFieldId(resolver, mockFields);
      }).toThrow("Field resolver must return a non-empty string field ID");
    });

    it("should throw error when resolver returns null", () => {
      const resolver: FieldResolver = () => null as any;

      expect(() => {
        resolveFieldId(resolver, mockFields);
      }).toThrow("Field resolver must return a non-empty string field ID");
    });

    it("should throw error when resolver returns undefined", () => {
      const resolver: FieldResolver = () => undefined as any;

      expect(() => {
        resolveFieldId(resolver, mockFields);
      }).toThrow("Field resolver must return a non-empty string field ID");
    });

    it("should throw error when resolver throws", () => {
      const resolver: FieldResolver = () => {
        throw new Error("Field not found");
      };

      expect(() => {
        resolveFieldId(resolver, mockFields);
      }).toThrow("Field resolver failed: Field not found");
    });

    it("should handle resolver that throws non-Error objects", () => {
      const resolver: FieldResolver = () => {
        throw "Custom error string";
      };

      expect(() => {
        resolveFieldId(resolver, mockFields);
      }).toThrow("Field resolver failed: Custom error string");
    });

    it("should handle empty fields array", () => {
      const resolver: FieldResolver = (fields) => {
        const field = fields.find((f) => f.label === "Title");
        if (!field) throw new Error("No fields available");
        return field.id;
      };

      expect(() => {
        resolveFieldId(resolver, []);
      }).toThrow("Field resolver failed: No fields available");
    });

    it("should work with complex resolver logic", () => {
      const resolver: FieldResolver = (fields) => {
        // Find first string or text field
        const textualField = fields.find(
          (f) => f.field_type === "string" || f.field_type === "text",
        );

        if (!textualField) {
          throw new Error("No textual field found");
        }

        return textualField.id;
      };

      const result = resolveFieldId(resolver, mockFields);

      // Should find the first string field (Title)
      expect(result).toBe("field_123");
    });

    it("should preserve resolver context", () => {
      let capturedFields: SimpleSchemaTypes.Field[] = [];

      const resolver: FieldResolver = (fields) => {
        capturedFields = fields;
        if (fields.length === 0) throw new Error("No fields provided");
        return fields[0]!.id;
      };

      resolveFieldId(resolver, mockFields);

      expect(capturedFields).toBe(mockFields);
      expect(capturedFields.length).toBe(3);
    });
  });

  describe("Type checking", () => {
    it("should accept string as FieldIdOrResolver", () => {
      const fieldRef: FieldIdOrResolver = "field_123";
      expect(typeof fieldRef).toBe("string");
    });

    it("should accept function as FieldIdOrResolver", () => {
      const fieldRef: FieldIdOrResolver = (fields) => fields[0]!.id;
      expect(typeof fieldRef).toBe("function");
    });

    it("should work with type guards in conditional logic", () => {
      const processFieldRef = (fieldRef: FieldIdOrResolver): string => {
        if (isFieldResolver(fieldRef)) {
          return resolveFieldId(fieldRef, mockFields);
        }
        return fieldRef;
      };

      expect(processFieldRef("direct_field")).toBe("direct_field");
      expect(
        processFieldRef((fields) => {
          if (fields.length === 0) throw new Error("No fields provided");
          return fields[0]!.id;
        }),
      ).toBe("field_123");
    });
  });
});
