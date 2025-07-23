import { describe, expect, it } from "@jest/globals";
import type { FieldIdOrResolver } from "../types/FieldResolver.js";
import { extractFieldReferences } from "./FieldReferenceHandler.js";

describe("FieldReferenceHandler", () => {
  describe("extractFieldReferences", () => {
    it("should extract field references and return clean body", () => {
      const body = {
        name: "Test Block",
        hint: "Test hint",
        presentation_title_field: "field123",
        presentation_image_field: (fields: any[]) => fields[0].id,
        other_property: "value",
      };

      const fieldNames = [
        "presentation_title_field",
        "presentation_image_field",
      ] as const;

      const result = extractFieldReferences(body, fieldNames);

      expect(result.fieldResolvers).toEqual({
        presentation_title_field: "field123",
        presentation_image_field: expect.any(Function),
      });

      expect(result.cleanBody).toEqual({
        name: "Test Block",
        hint: "Test hint",
        other_property: "value",
      });
    });

    it("should handle undefined body", () => {
      const fieldNames = ["presentation_title_field"] as const;

      const result = extractFieldReferences(undefined, fieldNames);

      expect(result.fieldResolvers).toEqual({});
      expect(result.cleanBody).toEqual({});
    });

    it("should handle body with no field references", () => {
      const body = {
        name: "Test Block",
        hint: "Test hint",
      };

      const fieldNames = [
        "presentation_title_field",
        "presentation_image_field",
      ] as const;

      const result = extractFieldReferences(body, fieldNames);

      expect(result.fieldResolvers).toEqual({});
      expect(result.cleanBody).toEqual({
        name: "Test Block",
        hint: "Test hint",
      });
    });

    it("should handle null field references", () => {
      const body = {
        name: "Test Block",
        presentation_title_field: null,
        presentation_image_field: "field123",
      };

      const fieldNames = [
        "presentation_title_field",
        "presentation_image_field",
      ] as const;

      const result = extractFieldReferences(body, fieldNames);

      expect(result.fieldResolvers).toEqual({
        presentation_title_field: null,
        presentation_image_field: "field123",
      });

      expect(result.cleanBody).toEqual({
        name: "Test Block",
      });
    });

    it("should handle partial field references", () => {
      const body = {
        name: "Test Block",
        hint: "Test hint",
        presentation_title_field: "field123",
        // presentation_image_field intentionally omitted
        other_property: "value",
      };

      const fieldNames = [
        "presentation_title_field",
        "presentation_image_field",
      ] as const;

      const result = extractFieldReferences(body, fieldNames);

      expect(result.fieldResolvers).toEqual({
        presentation_title_field: "field123",
      });

      expect(result.cleanBody).toEqual({
        name: "Test Block",
        hint: "Test hint",
        other_property: "value",
      });
    });

    it("should preserve original body structure", () => {
      const originalBody = {
        name: "Test Block",
        nested: {
          property: "value",
        },
        array: [1, 2, 3],
        presentation_title_field: "field123",
      };

      const fieldNames = ["presentation_title_field"] as const;

      const result = extractFieldReferences(originalBody, fieldNames);

      expect(result.cleanBody.nested).toEqual({ property: "value" });
      expect(result.cleanBody.array).toEqual([1, 2, 3]);
      expect(result.cleanBody).not.toHaveProperty("presentation_title_field");
    });

    it("should handle function field resolvers", () => {
      const mockResolver: FieldIdOrResolver = (fields) => {
        return fields.find((f) => f.label === "Title")?.id || "";
      };

      const body = {
        name: "Test Block",
        presentation_title_field: mockResolver,
      };

      const fieldNames = ["presentation_title_field"] as const;

      const result = extractFieldReferences(body, fieldNames);

      expect(result.fieldResolvers.presentation_title_field).toBe(mockResolver);
      expect(result.cleanBody).not.toHaveProperty("presentation_title_field");
    });

    it("should handle empty field names array", () => {
      const body = {
        name: "Test Block",
        presentation_title_field: "field123",
      };

      const fieldNames: readonly string[] = [];

      const result = extractFieldReferences(body, fieldNames);

      expect(result.fieldResolvers).toEqual({});
      expect(result.cleanBody).toEqual(body);
    });

    it("should create a clean copy without mutating original", () => {
      const originalBody = {
        name: "Test Block",
        presentation_title_field: "field123",
      };

      const fieldNames = ["presentation_title_field"] as const;

      const result = extractFieldReferences(originalBody, fieldNames);

      // Original should be unchanged
      expect(originalBody).toHaveProperty("presentation_title_field");
      expect(originalBody.presentation_title_field).toBe("field123");

      // Clean body should not have the field reference
      expect(result.cleanBody).not.toHaveProperty("presentation_title_field");
    });
  });
});
