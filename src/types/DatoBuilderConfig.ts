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
   * Activate the "debug" mode. This will log more information to the console.
   * TODO: Handle by the log level now
   */
  debug?: boolean;
  /**
   * Model API Key Suffix
   */
  modelApiKeySuffix?: string | null;
  /**
   * Block API Key Suffix
   */
  blockApiKeySuffix?: string | null;
  /**
   * The log level for the builder.
   *
   * Can be 'info', 'warn', 'error', or 'debug'.
   *
   * @default 'info'
   * TODO: REmove, should be inside the CLI options
   */
  logLevel?: "info" | "warn" | "error" | "debug" | null;
}
