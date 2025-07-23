import type { FieldReferenceConfig } from "../ItemTypeBuilder.js";
import type { FieldIdOrResolver } from "../types/FieldResolver.js";

/**
 * Extract field references from body and return clean body
 * Eliminates duplication between BlockBuilder and ModelBuilder
 */
export function extractFieldReferences<
  TBody extends Record<string, any>,
  TFieldNames extends readonly string[],
>(
  body: TBody | undefined,
  fieldNames: TFieldNames,
): {
  fieldResolvers: FieldReferenceConfig<string>;
  cleanBody: Omit<TBody, TFieldNames[number]>;
} {
  const fieldResolvers: FieldReferenceConfig<string> = {};
  const cleanBody = { ...body } as Omit<TBody, TFieldNames[number]>;

  if (body) {
    for (const fieldName of fieldNames) {
      const fieldValue = body[fieldName] as
        | FieldIdOrResolver
        | null
        | undefined;
      if (fieldValue !== undefined) {
        fieldResolvers[fieldName] = fieldValue;
        delete (cleanBody as any)[fieldName];
      }
    }
  }

  return { fieldResolvers, cleanBody };
}
