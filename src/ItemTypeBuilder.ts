import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import type * as SimpleSchemaTypes from "@datocms/cma-client/src/generated/SimpleSchemaTypes";
import DatoApi from "./Api/DatoApi";
import GenericDatoError from "./Api/Error/GenericDatoError";
import NotFoundError from "./Api/Error/NotFoundError";
import AssetGallery, { type AssetGalleryConfig } from "./Fields/AssetGallery";
import BooleanField, { type BooleanConfig } from "./Fields/Boolean";
import BooleanRadioGroup, {
  type BooleanRadioGroupConfig,
} from "./Fields/BooleanRadioGroup";
import ColorPicker, { type ColorPickerConfig } from "./Fields/ColorPicker";
import DateField, { type DateConfig } from "./Fields/Date";
import DateTime, { type DateTimeConfig } from "./Fields/DateTime";
import ExternalVideo, {
  type ExternalVideoConfig,
} from "./Fields/ExternalVideo";
import type Field from "./Fields/Field";
import Float, { type FloatConfig } from "./Fields/Float";
import Integer, { type IntegerConfig } from "./Fields/Integer";
import Json, { type JsonConfig } from "./Fields/Json";
import Link, { type LinkConfig } from "./Fields/Link";
import Links, { type LinksConfig } from "./Fields/Links";
import Location, { type LocationConfig } from "./Fields/Location";
import Markdown, { type MarkdownConfig } from "./Fields/Markdown";
import ModularContent, {
  type ModularContentConfig,
} from "./Fields/ModularContent";
import MultiLineText, {
  type MultiLineTextConfig,
} from "./Fields/MultiLineText";
import Seo, { type SeoConfig } from "./Fields/Seo";
import SingleAsset, { type SingleAssetConfig } from "./Fields/SingleAsset";
import SingleBlock, { type SingleBlockConfig } from "./Fields/SingleBlock";
import SingleLineString, {
  type SingleLineStringConfig,
} from "./Fields/SingleLineString";
import Slug, { type SlugConfig } from "./Fields/Slug";
import StringCheckboxGroup, {
  type StringCheckboxGroupConfig,
} from "./Fields/StringCheckboxGroup";
import StringMultiSelect, {
  type StringMultiSelectConfig,
} from "./Fields/StringMultiSelect";
import StringRadioGroup, {
  type StringRadioGroupConfig,
} from "./Fields/StringRadioGroup";
import StringSelect, { type StringSelectConfig } from "./Fields/StringSelect";
import StructuredText, {
  type StructuredTextConfig,
} from "./Fields/StructuredText";
import Textarea, { type TextareaConfig } from "./Fields/Textarea";
import Wysiwyg, { type WysiwygConfig } from "./Fields/Wysiwyg";
import { getDatoClient } from "./config";
import { loadDatoBuilderConfig } from "./config/loader";
import { executeWithErrorHandling } from "./utils/errors";
import { generateDatoApiKey } from "./utils/utils";

export type ItemTypeBuilderType = "model" | "block";

export type ItemTypeBuilderBody = Omit<
  SimpleSchemaTypes.ItemTypeCreateSchema,
  "api_key" | "modular_block" | "id"
> & {
  api_key?: string;
};

export type ItemTypeBuilderConfig = {
  /**
   * Whether to overwrite existing fields in DatoCMS when syncing.
   *
   * - `false` (default): New fields will be created. All other fields
   *  will be left untouched.
   *
   * - `true`: Fields with matching API keys will be updated to match
   *   your code definitions, overwriting any manual changes made via
   *   the DatoCMS dashboard.
   */
  overwriteExistingFields?: boolean;
  debug?: boolean;
};

// For tracking in-progress operations
interface PendingOperation {
  promise: Promise<string>;
  timestamp: number;
}

export default abstract class ItemTypeBuilder {
  protected api = new DatoApi(getDatoClient());
  protected readonly client = this.api.client;
  readonly body: SimpleSchemaTypes.ItemTypeCreateSchema;
  readonly name: string;
  readonly type: ItemTypeBuilderType;
  readonly fields: Field[] = [];
  readonly config: Required<ItemTypeBuilderConfig>;

  // Persistent cache file for item definitions
  private static cacheFile = path.resolve(
    __dirname,
    ".itemTypeBuilderCache.json",
  );
  private static cacheLoaded = false;
  private static itemCache: Map<string, { hash: string; id: string }> =
    new Map();

  private static pendingOperations: Map<string, PendingOperation> = new Map();
  private static lockFile = path.resolve(
    __dirname,
    ".itemTypeBuilderCache.lock",
  );
  private static readonly PENDING_OPERATION_TIMEOUT = 60000; // 60 seconds

  protected constructor(
    type: ItemTypeBuilderType,
    body: Omit<SimpleSchemaTypes.ItemTypeCreateSchema, "api_key"> & {
      api_key?: string;
    },
    config: ItemTypeBuilderConfig = {},
  ) {
    this.type = type;
    this.name = body.name;

    // Merge builder-specific and global config
    this.config = this.mergeConfig(config);

    const apiKey =
      body.api_key ||
      generateDatoApiKey(
        body.name,
        this.type === "block" ? "block" : undefined,
      );

    this.body = {
      ...body,
      api_key: apiKey,
      modular_block: this.type === "block",
      collection_appearance: body.collection_appearance || "table",
    };

    if (this.config.debug) {
      console.info(
        `ItemTypeBuilder initialized with type "${this.type}" and API key "${apiKey}"`,
      );

      console.info(
        `ItemTypeBuilder body: ${JSON.stringify(this.body, null, 2)}`,
      );

      console.info(
        `ItemTypeBuilder config: ${JSON.stringify(this.config, null, 2)}`,
      );
    }
  }

  /**
   * Attempt to acquire a lock for cache operations
   * Uses a simple file-based lock with exponential backoff
   */
  private static async acquireLock(maxAttempts = 10): Promise<boolean> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        if (!fs.existsSync(ItemTypeBuilder.lockFile)) {
          // Create the lock file
          fs.writeFileSync(
            ItemTypeBuilder.lockFile,
            String(Date.now()),
            "utf8",
          );
          return true;
        }

        // Check if the lock is stale (more than 30 seconds old)
        const lockTime = Number.parseInt(
          fs.readFileSync(ItemTypeBuilder.lockFile, "utf8"),
        );
        if (Date.now() - lockTime > 30000) {
          // Lock is stale, override it
          fs.writeFileSync(
            ItemTypeBuilder.lockFile,
            String(Date.now()),
            "utf8",
          );
          return true;
        }

        // Wait with exponential backoff
        const waitTime = Math.min(100 * 2 ** attempt, 2000);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      } catch (err) {
        console.warn(`Failed to acquire lock on attempt ${attempt + 1}:`, err);
      }
    }

    return false;
  }

  /**
   * Release the lock for cache operations
   */
  private static releaseLock(): void {
    try {
      if (fs.existsSync(ItemTypeBuilder.lockFile)) {
        fs.unlinkSync(ItemTypeBuilder.lockFile);
      }
    } catch (err) {
      console.warn("Failed to release lock:", err);
    }
  }

  /**
   * Clean up stale pending operations
   */
  private static cleanPendingOperations(): void {
    const now = Date.now();
    ItemTypeBuilder.pendingOperations.forEach((operation, key) => {
      if (
        now - operation.timestamp >
        ItemTypeBuilder.PENDING_OPERATION_TIMEOUT
      ) {
        ItemTypeBuilder.pendingOperations.delete(key);
      }
    });
  }

  private static async loadCache(): Promise<void> {
    if (ItemTypeBuilder.cacheLoaded) return;

    try {
      await ItemTypeBuilder.acquireLock();

      if (fs.existsSync(ItemTypeBuilder.cacheFile)) {
        try {
          const data = fs.readFileSync(ItemTypeBuilder.cacheFile, "utf8");
          const obj = JSON.parse(data) as Record<
            string,
            { hash: string; id: string }
          >;
          ItemTypeBuilder.itemCache = new Map(Object.entries(obj));
        } catch (e) {
          console.warn("Failed to load itemTypeBuilder cache:", e);
        }
      }
      ItemTypeBuilder.cacheLoaded = true;
    } finally {
      ItemTypeBuilder.releaseLock();
    }
  }

  public static clearCache(): void {
    // Clear in-memory cache
    ItemTypeBuilder.itemCache.clear();
    ItemTypeBuilder.cacheLoaded = false;

    if (fs.existsSync(ItemTypeBuilder.cacheFile)) {
      try {
        fs.unlinkSync(ItemTypeBuilder.cacheFile);
        console.log("✅ ItemTypeBuilder cache file removed.");
      } catch (e) {
        console.warn("⚠️  Failed to delete cache file:", e);
      }
    } else {
      console.log("⚠️  No cache file found, nothing to clear.");
    }
  }

  private static async saveCache(): Promise<void> {
    try {
      const locked = await ItemTypeBuilder.acquireLock();
      if (!locked) {
        console.warn(
          "Failed to acquire lock for saving cache, will try again later",
        );
        return;
      }

      const obj: Record<string, { hash: string; id: string }> = {};
      ItemTypeBuilder.itemCache.forEach((val, key) => {
        obj[key] = val;
      });

      try {
        fs.writeFileSync(
          ItemTypeBuilder.cacheFile,
          JSON.stringify(obj, null, 2),
          "utf8",
        );
      } catch (e) {
        console.warn("Failed to save itemTypeBuilder cache:", e);
      }
    } finally {
      ItemTypeBuilder.releaseLock();
    }
  }

  private static computeHash(
    body: SimpleSchemaTypes.ItemTypeCreateSchema,
    fields: SimpleSchemaTypes.FieldCreateSchema[],
    config: ItemTypeBuilderConfig = {},
  ): string {
    const sorted = [...fields].sort((a, b) =>
      a.api_key.localeCompare(b.api_key),
    );
    const serialized = JSON.stringify({ body, fields: sorted, config });
    return createHash("sha256").update(serialized).digest("hex");
  }

  private static async getCache(
    apiKey: string,
  ): Promise<{ hash: string; id: string } | undefined> {
    await ItemTypeBuilder.loadCache();
    return ItemTypeBuilder.itemCache.get(apiKey);
  }

  private static async setCache(
    apiKey: string,
    hash: string,
    id: string,
  ): Promise<void> {
    await ItemTypeBuilder.loadCache();
    ItemTypeBuilder.itemCache.set(apiKey, { hash, id });
    await ItemTypeBuilder.saveCache();
  }

  private getDefinitionHash(): string {
    const defs = this.fields.map((f) => f.build());
    return ItemTypeBuilder.computeHash(this.body, defs, this.config);
  }

  private mergeConfig(
    builderConfig: ItemTypeBuilderConfig,
  ): Required<ItemTypeBuilderConfig> {
    const globalConfig = loadDatoBuilderConfig();
    return {
      overwriteExistingFields:
        builderConfig.overwriteExistingFields ??
        globalConfig.overwriteExistingFields ??
        false,
      debug: builderConfig.debug ?? globalConfig.debug ?? false,
    };
  }

  public setOverrideExistingFields(value = true): this {
    this.config.overwriteExistingFields = value;
    return this;
  }

  public addField(field: Field): this {
    const key = field.build().api_key;
    if (this.fields.some((f) => f.build().api_key === key)) {
      throw new Error(`Field with api_key "${key}" already exists.`);
    }

    if (this.config.debug) {
      console.info(`Adding field "${field.body.label}" with api_key "${key}"`);

      console.info(
        `Field definition: ${JSON.stringify(field.build(), null, 2)}`,
      );
    }

    this.fields.push(field);
    return this;
  }

  getNewFieldPosition(): number {
    return this.fields.length + 1;
  }

  public addInteger({ label, body }: IntegerConfig): this {
    return this.addField(
      new Integer({
        label,
        body: {
          ...body,
          position: body?.position ?? this.getNewFieldPosition(),
        },
      }),
    );
  }

  public addSingleLineString({ label, body, options }: SingleLineStringConfig) {
    return this.addField(
      new SingleLineString({
        label,
        body: {
          ...body,
          position: body?.position ?? this.getNewFieldPosition(),
          validators: {
            ...body?.validators,
            unique:
              this.type === "block" ? undefined : body?.validators?.unique,
          },
        },
        options,
      }),
    );
  }

  public addMarkdown({ label, toolbar, body }: MarkdownConfig) {
    return this.addField(
      new Markdown({
        label,
        toolbar,
        body: {
          ...body,
          position: body?.position ?? this.getNewFieldPosition(),
        },
      }),
    );
  }

  public addWysiwyg({ label, toolbar, body }: WysiwygConfig) {
    return this.addField(
      new Wysiwyg({
        label,
        toolbar,
        body: {
          ...body,
          position: body?.position ?? this.getNewFieldPosition(),
        },
      }),
    );
  }

  public addTextarea({ label, placeholder, body }: TextareaConfig) {
    return this.addField(
      new Textarea({
        label,
        placeholder,
        body: {
          ...body,
          position: body?.position ?? this.getNewFieldPosition(),
        },
      }),
    );
  }

  public addHeading({ label, body, options }: SingleLineStringConfig) {
    return this.addSingleLineString({
      label,
      body,
      options: {
        ...options,
        heading: true,
      },
    });
  }

  public addStringRadioGroup({ label, radios, body }: StringRadioGroupConfig) {
    return this.addField(
      new StringRadioGroup({
        label,
        radios,
        body: {
          ...body,
          position: body?.position ?? this.getNewFieldPosition(),
        },
      }),
    );
  }

  public addStringSelect({ label, options, body }: StringSelectConfig) {
    return this.addField(
      new StringSelect({
        label,
        options,
        body: {
          ...body,
          position: body?.position ?? this.getNewFieldPosition(),
        },
      }),
    );
  }

  public addMultiLineText({ label, body }: MultiLineTextConfig): this {
    return this.addField(
      new MultiLineText({
        label,
        body: {
          ...body,
          position: body?.position ?? this.getNewFieldPosition(),
        },
      }),
    );
  }

  public addBoolean({ label, body }: BooleanConfig): this {
    return this.addField(
      new BooleanField({
        label,
        body: {
          ...body,
          position: body?.position ?? this.getNewFieldPosition(),
        },
      }),
    );
  }

  public addBooleanRadioGroup({
    label,
    positive_radio,
    negative_radio,
    body,
  }: BooleanRadioGroupConfig): this {
    return this.addField(
      new BooleanRadioGroup({
        label,
        positive_radio,
        negative_radio,
        body: {
          ...body,
          position: body?.position ?? this.getNewFieldPosition(),
        },
      }),
    );
  }

  public addFloat({ label, body }: FloatConfig): this {
    return this.addField(
      new Float({
        label,
        body: {
          ...body,
          position: body?.position ?? this.getNewFieldPosition(),
        },
      }),
    );
  }

  public addDate({ label, body }: DateConfig): this {
    return this.addField(
      new DateField({
        label,
        body: {
          ...body,
          position: body?.position ?? this.getNewFieldPosition(),
        },
      }),
    );
  }

  public addDateTime({ label, body }: DateTimeConfig): this {
    return this.addField(
      new DateTime({
        label,
        body: {
          ...body,
          position: body?.position ?? this.getNewFieldPosition(),
        },
      }),
    );
  }

  public addColorPicker({
    label,
    enable_alpha,
    preset_colors,
    body,
  }: ColorPickerConfig) {
    return this.addField(
      new ColorPicker({
        label,
        enable_alpha,
        preset_colors,
        body: {
          ...body,
          position: body?.position ?? this.getNewFieldPosition(),
        },
      }),
    );
  }

  public addJson({ label, body }: JsonConfig): this {
    return this.addField(
      new Json({
        label,
        body: {
          ...body,
          position: body?.position ?? this.getNewFieldPosition(),
        },
      }),
    );
  }

  public addStringMultiSelect({
    label,
    options,
    body,
  }: StringMultiSelectConfig): this {
    return this.addField(
      new StringMultiSelect({
        label,
        options,
        body: {
          ...body,
          position: body?.position ?? this.getNewFieldPosition(),
        },
      }),
    );
  }

  public addStringCheckboxGroup({
    label,
    options,
    body,
  }: StringCheckboxGroupConfig): this {
    return this.addField(
      new StringCheckboxGroup({
        label,
        options,
        body: {
          ...body,
          position: body?.position ?? this.getNewFieldPosition(),
        },
      }),
    );
  }

  public addLocation({ label, body }: LocationConfig): this {
    return this.addField(
      new Location({
        label,
        body: {
          ...body,
          position: body?.position ?? this.getNewFieldPosition(),
        },
      }),
    );
  }

  public addSeo({ label, fields, previews, body }: SeoConfig): this {
    return this.addField(
      new Seo({
        label,
        fields,
        previews,
        body: {
          ...body,
          position: body?.position ?? this.getNewFieldPosition(),
        },
      }),
    );
  }

  public addSlug({ label, url_prefix, placeholder, body }: SlugConfig): this {
    return this.addField(
      new Slug({
        label,
        url_prefix,
        placeholder,
        body: {
          ...body,
          position: body?.position ?? this.getNewFieldPosition(),
        },
      }),
    );
  }

  public addExternalVideo({ label, body }: ExternalVideoConfig): this {
    return this.addField(
      new ExternalVideo({
        label,
        body: {
          ...body,
          position: body?.position ?? this.getNewFieldPosition(),
        },
      }),
    );
  }

  public addSingleAsset({ label, body }: SingleAssetConfig): this {
    return this.addField(
      new SingleAsset({
        label,
        body: {
          ...body,
          position: body?.position ?? this.getNewFieldPosition(),
        },
      }),
    );
  }

  public addImage({ label, body }: SingleAssetConfig): this {
    return this.addField(
      new SingleAsset({
        label,
        body: {
          ...body,
          position: body?.position ?? this.getNewFieldPosition(),
        },
      }),
    );
  }

  public addAssetGallery({ label, body }: AssetGalleryConfig): this {
    return this.addField(
      new AssetGallery({
        label,
        body: {
          ...body,
          position: body?.position ?? this.getNewFieldPosition(),
        },
      }),
    );
  }

  public addLink({ label, appearance, body }: LinkConfig): this {
    return this.addField(
      new Link({
        label,
        appearance,
        body: {
          ...body,
          position: body?.position ?? this.getNewFieldPosition(),
        },
      }),
    );
  }

  public addLinks({ label, appearance, body }: LinksConfig): this {
    return this.addField(
      new Links({
        label,
        appearance,
        body: {
          ...body,
          position: body?.position ?? this.getNewFieldPosition(),
        },
      }),
    );
  }

  public addModularContent({
    label,
    start_collapsed,
    body,
  }: ModularContentConfig) {
    return this.addField(
      new ModularContent({
        label,
        start_collapsed,
        body: {
          ...body,
          position: body?.position ?? this.getNewFieldPosition(),
        },
      }),
    );
  }

  public addSingleBlock({
    label,
    type,
    start_collapsed,
    body,
  }: SingleBlockConfig): this {
    return this.addField(
      new SingleBlock({
        label,
        type,
        start_collapsed,
        body: {
          ...body,
          position: body?.position ?? this.getNewFieldPosition(),
        },
      }),
    );
  }

  public addStructuredText({
    label,
    nodes,
    marks,
    heading_levels,
    blocks_start_collapsed,
    show_links_target_blank,
    show_links_meta_editor,
    body,
  }: StructuredTextConfig): this {
    return this.addField(
      new StructuredText({
        label,
        nodes,
        marks,
        heading_levels,
        blocks_start_collapsed,
        show_links_target_blank,
        show_links_meta_editor,
        body: {
          ...body,
          position: body?.position ?? this.getNewFieldPosition(),
        },
      }),
    );
  }

  private static async handlePendingOperation(
    apiKey: string,
    operationPromise: Promise<string>,
  ): Promise<string> {
    const operation: PendingOperation = {
      promise: operationPromise,
      timestamp: Date.now(),
    };

    // Register this operation
    ItemTypeBuilder.pendingOperations.set(apiKey, operation);

    try {
      return await operationPromise;
    } finally {
      // Clean up only if this operation is still the current one
      const currentOp = ItemTypeBuilder.pendingOperations.get(apiKey);
      if (currentOp && currentOp.promise === operation.promise) {
        ItemTypeBuilder.pendingOperations.delete(apiKey);
      }

      // Clean up any stale operations
      ItemTypeBuilder.cleanPendingOperations();
    }
  }

  private async waitForPendingOperation(
    apiKey: string,
  ): Promise<string | undefined> {
    const pendingOp = ItemTypeBuilder.pendingOperations.get(apiKey);
    if (pendingOp) {
      try {
        if (this.config.debug) {
          console.info(`Waiting for pending operation on "${this.name}"...`);
        }
        return await pendingOp.promise;
      } catch (error) {
        // If the pending operation failed, we'll try our own operation
        console.warn(`Pending operation for "${this.name}" failed:`, error);
        return undefined;
      }
    }
    return undefined;
  }

  private async syncFields(itemTypeId: string): Promise<void> {
    const existing = await this.api.call(() =>
      this.client.fields.list(itemTypeId),
    );
    const desired = this.fields.map((f) => f.build());

    const toCreate = desired.filter(
      (d) => !existing.some((e) => e.api_key === d.api_key),
    );
    await Promise.all(
      toCreate.map(async (fieldDef) => {
        await executeWithErrorHandling(
          "create",
          () =>
            this.api.call(() =>
              this.client.fields.create(itemTypeId, fieldDef),
            ),
          "field",
          fieldDef,
        );
      }),
    );

    if (!this.config.overwriteExistingFields) {
      // If not overwriting, we can skip the rest
      return;
    }

    // Update existing fields
    const updatePromises = existing.flatMap((existingField) => {
      const fieldDef = desired.find((d) => d.api_key === existingField.api_key);
      if (!fieldDef) return [];

      return [
        executeWithErrorHandling(
          "update",
          () =>
            this.api.call(() =>
              this.client.fields.update(existingField.id, fieldDef),
            ),
          "field",
          fieldDef,
          existingField,
        ),
      ];
    });

    await Promise.all(updatePromises);

    // Delete fields that are no longer needed
    const toDelete = existing.filter(
      (e) => !desired.some((d) => d.api_key === e.api_key),
    );

    await Promise.all(
      toDelete.map(async (existingField) => {
        await executeWithErrorHandling(
          "delete",
          () =>
            this.api.call(() => this.client.fields.destroy(existingField.id)),
          "field",
          undefined,
          existingField,
        );
      }),
    );
  }

  public async create(): Promise<string> {
    const apiKey = this.body.api_key;
    const hash = this.getDefinitionHash();

    // First check for any pending operations
    const pendingResult = await this.waitForPendingOperation(apiKey);
    if (pendingResult) {
      if (this.config.debug) {
        console.info(
          `Using result from pending operation for "${this.name}": ${pendingResult}`,
        );
      }
      return pendingResult;
    }

    // Check if already in cache with matching hash
    const cached = await ItemTypeBuilder.getCache(apiKey);
    if (cached && cached.hash === hash) {
      console.info(
        `Create skipped: "${this.name}" unchanged (id=${cached.id})`,
      );
      return cached.id;
    }

    if (this.config.debug) {
      console.info(`Creating item type "${this.name}"...`);
    }

    // Create a new operation and register it
    const operation = async (): Promise<string> => {
      try {
        // Create the item
        const item = await this.api.call(() =>
          this.client.itemTypes.create(this.body),
        );
        await this.syncFields(item.id);
        await ItemTypeBuilder.setCache(apiKey, hash, item.id);
        console.info(`Created item type "${this.name}" (id=${item.id})`);

        if (this.config.debug) {
          console.info(
            `Item type "${this.name}" cached (id=${item.id}, hash=${hash})`,
          );
        }
        return item.id;
      } catch (error: unknown) {
        if (error instanceof GenericDatoError) {
          console.error(
            `Failed to create item type "${this.name}": ${error.message}`,
          );
        }
        throw error;
      }
    };

    return ItemTypeBuilder.handlePendingOperation(apiKey, operation());
  }

  public async update(): Promise<string> {
    const apiKey = this.body.api_key;
    const hash = this.getDefinitionHash();

    // First check for any pending operations
    const pending = await this.waitForPendingOperation(apiKey);
    if (pending) {
      if (this.config.debug) {
        console.info(
          `Using result from pending operation for "${this.name}": ${pending}`,
        );
      }
      return pending;
    }

    // Check cache: skip if nothing changed
    const cached = await ItemTypeBuilder.getCache(apiKey);
    if (cached && cached.hash === hash) {
      console.info(
        `Update skipped: "${this.name}" unchanged (id=${cached.id})`,
      );
      return cached.id;
    }

    if (this.config.debug) {
      console.info(`Updating item type "${this.name}"...`);
    }

    // Wrap the actual API call in an operation promise
    const operation = async (): Promise<string> => {
      try {
        // Attempt the update
        const item = await this.api.call(() =>
          this.client.itemTypes.update(apiKey, this.body),
        );
        await this.syncFields(item.id);

        // Persist to cache
        await ItemTypeBuilder.setCache(apiKey, hash, item.id);

        console.info(`Updated item type "${this.name}" (id=${item.id})`);
        if (this.config.debug) {
          console.info(
            `Item type "${this.name}" cached (id=${item.id}, hash=${hash})`,
          );
        }
        return item.id;
      } catch (err: unknown) {
        if (err instanceof GenericDatoError) {
          console.error(
            `Failed to update item type "${this.name}": ${err.message}`,
          );
        }
        throw err;
      }
    };

    // Register & return a single in‐flight promise
    return ItemTypeBuilder.handlePendingOperation(apiKey, operation());
  }

  public async upsert(): Promise<string> {
    if (this.config.debug) {
      console.info(`Upserting item type \"${this.name}\"...`);
    }

    try {
      await this.api.call(() => this.client.itemTypes.find(this.body.api_key));

      return this.update();
    } catch (error: unknown) {
      if (error instanceof NotFoundError) {
        return this.create();
      }

      throw error;
    }
  }
}
