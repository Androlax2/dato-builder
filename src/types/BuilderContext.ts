import type { DatoBuilderConfig } from "./DatoBuilderConfig.js";

export interface BuilderContext {
  /**
   * The configuration object for the DatoBuilder
   */
  config: Required<DatoBuilderConfig>;

  /**
   * Get or create a block by name. Returns the item type ID.
   * Handles caching and prevents duplicate builds automatically.
   *
   * @param name - The name of the block file (without extension)
   * @returns Promise that resolves to the item type ID
   */
  getBlock: (name: string) => Promise<string>;

  /**
   * Get or create a model by name. Returns the item type ID.
   * Handles caching and prevents duplicate builds automatically.
   *
   * @param name - The name of the model file (without extension)
   * @returns Promise that resolves to the item type ID
   */
  getModel: (name: string) => Promise<string>;
}
