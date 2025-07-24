import type { LogLevel } from "../logger.js";

export interface DatoBuilderConfig {
  /**
   * Your DatoCMS Content Management API token.
   *
   * You can find this in your DatoCMS project settings under “API tokens”.
   * This value is required.
   */
  apiToken: string;

  /**
   * Whether to overwrite existing fields in DatoCMS when syncing.
   *
   * - `false` (default): New fields will be created and removed fields
   *   deleted, but any fields that already exist (matched by API key)
   *   will be left untouched.
   *
   * - `true`: Fields with matching API keys will be updated to match
   *   your code definitions, overwriting any manual changes made via
   *   the DatoCMS dashboard.
   */
  overwriteExistingFields?: boolean;

  /**
   * Model API Key Suffix.
   *
   * @default "model"
   */
  modelApiKeySuffix?: string | null;

  /**
   * Block API Key Suffix.
   *
   * @default "block"
   */
  blockApiKeySuffix?: string | null;

  /**
   * File-system path or glob (relative to the project root) where the CLI
   * should search for model definitions.
   *
   * @default "./datocms/models"
   */
  modelsPath?: string;

  /**
   * File-system path or glob (relative to the project root) where the CLI
   * should search for block definitions.
   *
   * @default "./datocms/blocks"
   */
  blocksPath?: string;
  /**
   * Minimum level of messages to log.
   * Higher levels suppress more verbose output.
   *
   * @default LogLevel.INFO
   */
  logLevel?: LogLevel;

  /**
   * Environment name for DatoCMS operations.
   * When undefined, uses the DatoCMS client's default behavior.
   *
   * @default undefined
   */
  environment?: string;
}

/**
 * Fully resolved DatoBuilderConfig with all optional fields required except environment.
 * Environment remains optional to align with DatoCMS client default behavior.
 */
export type ResolvedDatoBuilderConfig = Required<
  Omit<DatoBuilderConfig, "environment">
> & {
  environment?: string;
};
