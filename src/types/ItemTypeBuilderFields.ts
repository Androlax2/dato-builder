import type ItemTypeBuilder from "@/ItemTypeBuilder";

type ExtractMethodConfig<T, K extends keyof T> = T[K] extends (
  config: infer C,
) => any
  ? C
  : never;

// Infer all addXXX methods from ItemTypeBuilder
export type ItemTypeBuilderAddMethods = {
  [K in keyof ItemTypeBuilder]: K extends `add${string}` ? K : never;
}[keyof ItemTypeBuilder];

// Extract config type from the inferred method names
export type MethodNameToConfig<T> = T extends ItemTypeBuilderAddMethods
  ? ExtractMethodConfig<ItemTypeBuilder, T>
  : never;
