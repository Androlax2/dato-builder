import type * as SimpleSchemaTypes from "@datocms/cma-client/src/generated/SimpleSchemaTypes";

/**
 * A function that dynamically resolves a field ID based on existing fields.
 *
 * This allows for flexible field referencing where the target field ID
 * is determined at build time rather than being hardcoded.
 *
 * @param fields - Array of existing fields from DatoCMS
 * @returns The ID of the target field
 * @throws Error if the target field cannot be found
 *
 * @example
 * ```typescript
 * // Find field by label
 * const resolver: FieldResolver = (fields) => {
 *   const titleField = fields.find(f => f.label === "Title");
 *   if (!titleField) throw new Error("Title field not found");
 *   return titleField.id;
 * };
 * ```
 */
export type FieldResolver = (fields: SimpleSchemaTypes.Field[]) => string;

/**
 * Union type that accepts either a direct field ID string or a resolver function.
 *
 * This provides flexibility in how field references are specified:
 * - String: Direct field ID (when known at build time)
 * - FieldResolver: Dynamic resolution function (when field needs to be found at runtime)
 *
 * @example
 * ```typescript
 * // Direct field ID
 * const directRef: FieldIdOrResolver = "field_123456";
 *
 * // Dynamic resolver
 * const dynamicRef: FieldIdOrResolver = (fields) =>
 *   fields.find(f => f.label === "Title")?.id || "";
 * ```
 */
export type FieldIdOrResolver = string | FieldResolver;

/**
 * Type guard to check if a value is a FieldResolver function
 */
export function isFieldResolver(
  value: FieldIdOrResolver,
): value is FieldResolver {
  return typeof value === "function";
}

/**
 * Helper to resolve a field ID from either a string or resolver function
 */
export function resolveFieldId(
  idOrResolver: FieldIdOrResolver,
  existingFields: SimpleSchemaTypes.Field[],
): string {
  if (isFieldResolver(idOrResolver)) {
    try {
      const resolvedId = idOrResolver(existingFields);
      if (!resolvedId || typeof resolvedId !== "string") {
        throw new Error(
          "Field resolver must return a non-empty string field ID",
        );
      }
      return resolvedId;
    } catch (error) {
      throw new Error(
        `Field resolver failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
  return idOrResolver;
}

/**
 * Helper functions for common field resolution patterns
 */
export const FieldFinders = {
  /**
   * Find field by exact label match
   */
  byLabel:
    (label: string): FieldResolver =>
    (fields) => {
      const field = fields.find((f) => f.label === label);
      if (!field) {
        throw new Error(
          `Field with label "${label}" not found. Available labels: ${fields.map((f) => f.label).join(", ")}`,
        );
      }
      return field.id;
    },

  /**
   * Find field by exact API key match
   */
  byApiKey:
    (apiKey: string): FieldResolver =>
    (fields) => {
      const field = fields.find((f) => f.api_key === apiKey);
      if (!field) {
        throw new Error(
          `Field with API key "${apiKey}" not found. Available API keys: ${fields.map((f) => f.api_key).join(", ")}`,
        );
      }
      return field.id;
    },

  /**
   * Find field by label with case-insensitive matching
   */
  byLabelIgnoreCase:
    (label: string): FieldResolver =>
    (fields) => {
      const field = fields.find(
        (f) => f.label.toLowerCase() === label.toLowerCase(),
      );
      if (!field) {
        throw new Error(
          `Field with label "${label}" not found (case-insensitive). Available labels: ${fields.map((f) => f.label).join(", ")}`,
        );
      }
      return field.id;
    },

  /**
   * Find field by field type
   */
  byFieldType:
    (fieldType: string): FieldResolver =>
    (fields) => {
      const field = fields.find((f) => f.field_type === fieldType);
      if (!field) {
        throw new Error(
          `Field with type "${fieldType}" not found. Available types: ${fields.map((f) => f.field_type).join(", ")}`,
        );
      }
      return field.id;
    },

  /**
   * Find the first field matching a custom predicate
   */
  byPredicate:
    (
      predicate: (field: SimpleSchemaTypes.Field) => boolean,
      description: string,
    ): FieldResolver =>
    (fields) => {
      const field = fields.find(predicate);
      if (!field) {
        throw new Error(
          `No field found matching criteria: ${description}. Available fields: ${fields.map((f) => `${f.label}(${f.api_key})`).join(", ")}`,
        );
      }
      return field.id;
    },
};
