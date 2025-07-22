import { createHash } from "node:crypto";
import type * as SimpleSchemaTypes from "@datocms/cma-client/src/generated/SimpleSchemaTypes";
import { buildClient } from "@datocms/cma-client-node";
import DatoApi from "./Api/DatoApi.js";
import AssetGallery, {
  type AssetGalleryConfig,
} from "./Fields/AssetGallery.js";
import BooleanField, { type BooleanConfig } from "./Fields/Boolean.js";
import BooleanRadioGroup, {
  type BooleanRadioGroupConfig,
} from "./Fields/BooleanRadioGroup.js";
import ColorPicker, { type ColorPickerConfig } from "./Fields/ColorPicker.js";
import DateField, { type DateConfig } from "./Fields/Date.js";
import DateTime, { type DateTimeConfig } from "./Fields/DateTime.js";
import Email, { type EmailConfig } from "./Fields/Email.js";
import ExternalVideo, {
  type ExternalVideoConfig,
} from "./Fields/ExternalVideo.js";
import type Field from "./Fields/Field.js";
import Float, { type FloatConfig } from "./Fields/Float.js";
import Integer, { type IntegerConfig } from "./Fields/Integer.js";
import Json, { type JsonConfig } from "./Fields/Json.js";
import Link, { type LinkConfig } from "./Fields/Link.js";
import Links, { type LinksConfig } from "./Fields/Links.js";
import Location, { type LocationConfig } from "./Fields/Location.js";
import Markdown, { type MarkdownConfig } from "./Fields/Markdown.js";
import ModularContent, {
  type ModularContentConfig,
} from "./Fields/ModularContent.js";
import MultiLineText, {
  type MultiLineTextConfig,
} from "./Fields/MultiLineText.js";
import Seo, { type SeoConfig } from "./Fields/Seo.js";
import SingleAsset, { type SingleAssetConfig } from "./Fields/SingleAsset.js";
import SingleBlock, { type SingleBlockConfig } from "./Fields/SingleBlock.js";
import SingleLineString, {
  type SingleLineStringConfig,
} from "./Fields/SingleLineString.js";
import Slug, { type SlugConfig } from "./Fields/Slug.js";
import StringCheckboxGroup, {
  type StringCheckboxGroupConfig,
} from "./Fields/StringCheckboxGroup.js";
import StringMultiSelect, {
  type StringMultiSelectConfig,
} from "./Fields/StringMultiSelect.js";
import StringRadioGroup, {
  type StringRadioGroupConfig,
} from "./Fields/StringRadioGroup.js";
import StringSelect, {
  type StringSelectConfig,
} from "./Fields/StringSelect.js";
import StructuredText, {
  type StructuredTextConfig,
} from "./Fields/StructuredText.js";
import Textarea, { type TextareaConfig } from "./Fields/Textarea.js";
import Url, { type UrlConfig } from "./Fields/Url.js";
import Wysiwyg, { type WysiwygConfig } from "./Fields/Wysiwyg.js";
import { ConsoleLogger } from "./logger.js";
import type {
  DatoBuilderConfig,
  ResolvedDatoBuilderConfig,
} from "./types/DatoBuilderConfig.js";
import { isFieldResolver, resolveFieldId } from "./types/FieldResolver.js";
import { executeWithErrorHandling } from "./utils/errors.js";
import { generateDatoApiKey } from "./utils/utils.js";

export type ItemTypeBuilderType = "model" | "block";

export type ItemTypeBuilderBody = Omit<
  SimpleSchemaTypes.ItemTypeCreateSchema,
  "api_key" | "modular_block" | "id"
> & {
  api_key?: string;
};

type ItemTypeBuilderOptions = {
  type: ItemTypeBuilderType;
  body: Omit<SimpleSchemaTypes.ItemTypeCreateSchema, "api_key"> & {
    api_key?: string;
  };
  config: ResolvedDatoBuilderConfig;
};

type HashableConfigKeys = "modelApiKeySuffix" | "blockApiKeySuffix";

type HashableConfig = Pick<DatoBuilderConfig, HashableConfigKeys>;

export default abstract class ItemTypeBuilder {
  protected logger: ConsoleLogger;
  protected api: DatoApi;
  readonly body: SimpleSchemaTypes.ItemTypeCreateSchema;
  readonly name: string;
  readonly type: ItemTypeBuilderType;
  readonly fields: Field[] = [];
  readonly config: ResolvedDatoBuilderConfig;
  private fieldResolverCache: Map<string, string> = new Map();

  protected constructor({ type, body, config }: ItemTypeBuilderOptions) {
    this.logger = new ConsoleLogger(config.logLevel);
    this.logger.traceJson("Initializing ItemTypeBuilder", {
      type,
      name: body.name,
      config: {
        logLevel: config.logLevel,
        apiToken: config.apiToken ? "***" : "undefined",
        overwriteExistingFields: config.overwriteExistingFields,
        modelApiKeySuffix: config.modelApiKeySuffix,
        blockApiKeySuffix: config.blockApiKeySuffix,
      },
    });

    this.type = type;
    this.name = body.name;
    this.api = new DatoApi(
      buildClient({
        apiToken: config.apiToken,
        environment: config.environment,
      }),
    );

    this.config = config;

    this.logger.traceJson("Generating API key", {
      originalKey: body.api_key,
      name: body.name,
      suffix: this.resolveSuffix(),
    });

    const apiKey =
      body.api_key ||
      generateDatoApiKey({
        name: body.name,
        suffix: this.resolveSuffix(),
        preservePlural: false,
      });

    this.logger.traceJson("API key generated", {
      originalKey: body.api_key,
      generatedKey: apiKey,
      suffix: this.resolveSuffix(),
    });

    this.body = {
      ...body,
      api_key: apiKey,
      modular_block: this.type === "block",
      collection_appearance: body.collection_appearance || "table",
    };

    this.logger.traceJson("ItemTypeBuilder initialized", {
      type: this.type,
      name: this.name,
      apiKey: this.body.api_key,
      modularBlock: this.body.modular_block,
      collectionAppearance: this.body.collection_appearance,
    });
  }

  private getHashableConfig(): HashableConfig {
    this.logger.traceJson("Getting hashable config", {});

    const config: HashableConfig = {
      modelApiKeySuffix: this.config.modelApiKeySuffix,
      blockApiKeySuffix: this.config.blockApiKeySuffix,
    };

    this.logger.traceJson("Hashable config retrieved", config);
    return config;
  }

  public getHash(): string {
    this.logger.traceJson("Generating hash for ItemTypeBuilder", {
      type: this.type,
      name: this.name,
      fieldCount: this.fields.length,
    });

    const hashData = {
      body: this.body,
      fields: [...this.fields.map((f) => f.build())].sort((a, b) =>
        a.api_key.localeCompare(b.api_key),
      ),
      config: this.getHashableConfig(),
    };

    this.logger.traceJson("Hash data prepared", {
      bodyKeys: Object.keys(hashData.body),
      fieldCount: hashData.fields.length,
      configKeys: Object.keys(hashData.config),
    });

    const hash = createHash("sha256")
      .update(JSON.stringify(hashData))
      .digest("hex");

    this.logger.traceJson("Hash generated", {
      hash: `${hash.substring(0, 8)}...`,
      fieldCount: this.fields.length,
      hashDataKeys: Object.keys(hashData),
    });

    return hash;
  }

  private resolveSuffix(): string | null | undefined {
    this.logger.traceJson("Resolving suffix for type", { type: this.type });

    switch (this.type) {
      case "model": {
        const modelSuffix = this.config.modelApiKeySuffix;
        this.logger.traceJson("Using model suffix", { suffix: modelSuffix });
        return modelSuffix;
      }
      case "block": {
        const blockSuffix = this.config.blockApiKeySuffix;
        this.logger.traceJson("Using block suffix", { suffix: blockSuffix });
        return blockSuffix;
      }
      default:
        this.logger.errorJson("Unknown type for suffix resolution", {
          type: this.type,
        });
        throw new Error(`Unknown type "${this.type}"`);
    }
  }

  public setOverrideExistingFields(value = true): this {
    this.logger.traceJson("Setting override existing fields", { value });
    this.config.overwriteExistingFields = value;
    return this;
  }

  public addField(field: Field): this {
    const key = field.build().api_key;
    this.logger.traceJson("Adding field", {
      fieldKey: key,
      fieldType: field.constructor.name,
      currentFieldCount: this.fields.length,
    });

    if (this.fields.some((f) => f.build().api_key === key)) {
      this.logger.errorJson("Field with duplicate API key", {
        fieldKey: key,
        existingFields: this.fields.map((f) => f.build().api_key),
      });
      throw new Error(`Field with api_key "${key}" already exists.`);
    }

    this.fields.push(field);
    this.logger.traceJson("Field added successfully", {
      fieldKey: key,
      totalFields: this.fields.length,
    });
    return this;
  }

  public getField(apiKey: string): Field | undefined {
    this.logger.traceJson("Getting field by API key", { apiKey });
    const field = this.fields.find((f) => f.build().api_key === apiKey);
    this.logger.traceJson("Field lookup result", {
      apiKey,
      found: Boolean(field),
      fieldType: field?.constructor.name,
    });
    return field;
  }

  getNewFieldPosition(): number {
    const position = this.fields.length + 1;
    this.logger.traceJson("Calculating new field position", {
      currentFieldCount: this.fields.length,
      newPosition: position,
    });
    return position;
  }

  public addInteger({ label, body }: IntegerConfig): this {
    this.logger.traceJson("Adding integer field", {
      label,
      position: body?.position,
    });
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
    this.logger.traceJson("Adding single line string field", {
      label,
      position: body?.position,
      hasOptions: Boolean(options),
      uniqueValidator:
        this.type === "block" ? undefined : body?.validators?.unique,
    });
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
    this.logger.traceJson("Adding markdown field", {
      label,
      position: body?.position,
      hasToolbar: Boolean(toolbar),
    });
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
    this.logger.traceJson("Adding wysiwyg field", {
      label,
      position: body?.position,
      hasToolbar: Boolean(toolbar),
    });
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
    this.logger.traceJson("Adding textarea field", {
      label,
      position: body?.position,
      hasPlaceholder: Boolean(placeholder),
    });
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
    this.logger.traceJson("Adding heading field", {
      label,
      position: body?.position,
      hasOptions: Boolean(options),
    });
    return this.addSingleLineString({
      label,
      body,
      options: {
        ...options,
        heading: true,
      },
    });
  }

  public addText({ label, body, options }: SingleLineStringConfig): this {
    this.logger.traceJson("Adding text field", {
      label,
      position: body?.position,
      hasOptions: Boolean(options),
    });
    return this.addSingleLineString({
      label,
      body,
      options,
    });
  }

  public addStringRadioGroup({ label, radios, body }: StringRadioGroupConfig) {
    this.logger.traceJson("Adding string radio group field", {
      label,
      position: body?.position,
      radioCount: radios?.length || 0,
    });
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
    this.logger.traceJson("Adding string select field", {
      label,
      position: body?.position,
      optionCount: options?.length || 0,
    });
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
    this.logger.traceJson("Adding multi line text field", {
      label,
      position: body?.position,
    });
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
    this.logger.traceJson("Adding boolean field", {
      label,
      position: body?.position,
    });
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

  public addUrl({ label, body }: UrlConfig): this {
    return this.addField(
      new Url({
        label,
        body: {
          ...body,
          position: body?.position ?? this.getNewFieldPosition(),
        },
      }),
    );
  }

  public addEmail({ label, body }: EmailConfig): this {
    return this.addField(
      new Email({
        label,
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

  /**
   * Detects circular field references by tracking resolution paths
   */
  private detectCircularReferences(
    obj: any,
    existingFields: SimpleSchemaTypes.Field[],
    resolutionStack: string[] = [],
    path: string = "root",
  ): void {
    if (isFieldResolver(obj)) {
      if (resolutionStack.includes(path)) {
        throw new Error(
          `Circular field reference detected in resolution path: ${resolutionStack.join(" -> ")} -> ${path}`,
        );
      }
      // Simulate the resolver to check what field it would resolve to
      try {
        const resolvedId = obj(existingFields);
        const resolvedField = existingFields.find((f) => f.id === resolvedId);
        if (
          resolvedField &&
          resolutionStack.some((stackPath) =>
            stackPath.includes(resolvedField.api_key),
          )
        ) {
          throw new Error(
            `Potential circular field reference: field "${resolvedField.api_key}" appears in resolution chain`,
          );
        }
      } catch {
        // Don't fail here, let the actual resolution handle the error
      }
    }

    if (Array.isArray(obj)) {
      obj.forEach((item, index) =>
        this.detectCircularReferences(
          item,
          existingFields,
          [...resolutionStack, path],
          `${path}[${index}]`,
        ),
      );
    } else if (obj && typeof obj === "object") {
      for (const [key, value] of Object.entries(obj)) {
        this.detectCircularReferences(
          value,
          existingFields,
          [...resolutionStack, path],
          `${path}.${key}`,
        );
      }
    }
  }

  /**
   * Recursively processes an object to resolve any FieldResolver callbacks to actual field IDs
   */
  private resolveFieldResolvers(
    obj: any,
    existingFields: SimpleSchemaTypes.Field[],
    path: string = "root",
  ): any {
    if (isFieldResolver(obj)) {
      // Create cache key based on resolver function and available fields
      const fieldsHash = existingFields
        .map((f) => f.id)
        .sort()
        .join(",");
      const cacheKey = `${path}:${fieldsHash}`;

      if (this.fieldResolverCache.has(cacheKey)) {
        const cachedId = this.fieldResolverCache.get(cacheKey)!;
        this.logger.traceJson("Using cached field resolver result", {
          path,
          cachedId,
        });
        return cachedId;
      }

      try {
        this.logger.traceJson("Resolving field resolver callback", {
          path,
          availableFieldCount: existingFields.length,
          availableFields: existingFields.map((f) => ({
            label: f.label,
            api_key: f.api_key,
            id: f.id,
          })),
        });

        const resolvedId = resolveFieldId(obj, existingFields);

        // Cache the result
        this.fieldResolverCache.set(cacheKey, resolvedId);

        this.logger.traceJson("Field resolver resolved successfully", {
          path,
          resolvedId,
          cached: true,
        });

        return resolvedId;
      } catch (error) {
        this.logger.errorJson("Field resolver failed", {
          path,
          error: (error as Error).message,
          availableFields: existingFields.map((f) => ({
            label: f.label,
            api_key: f.api_key,
            id: f.id,
          })),
        });
        throw new Error(
          `Field resolution failed at path '${path}': ${(error as Error).message}`,
        );
      }
    }

    if (Array.isArray(obj)) {
      return obj.map((item, index) =>
        this.resolveFieldResolvers(item, existingFields, `${path}[${index}]`),
      );
    }

    if (obj && typeof obj === "object") {
      const resolved: any = {};
      for (const [key, value] of Object.entries(obj)) {
        resolved[key] = this.resolveFieldResolvers(
          value,
          existingFields,
          `${path}.${key}`,
        );
      }
      return resolved;
    }

    return obj;
  }

  private async syncFields(itemTypeId: string): Promise<void> {
    this.logger.traceJson("Starting field synchronization", {
      itemTypeId,
      itemTypeKey: this.body.api_key,
      fieldCount: this.fields.length,
    });

    const contextLogger = this.logger.child({
      operation: "syncFields",
      itemType: this.body.api_key,
    });

    contextLogger.debug(`Starting field sync for itemType: ${itemTypeId}`);

    this.logger.trace("Fetching existing fields from API");
    const existing = await this.api.call(() =>
      this.api.client.fields.list(itemTypeId),
    );
    const desired = this.fields.map((f) => f.build());

    this.logger.traceJson("Field comparison completed", {
      existingCount: existing.length,
      desiredCount: desired.length,
      existingKeys: existing.map((f) => f.api_key),
      desiredKeys: desired.map((f) => f.api_key),
    });

    contextLogger.debug(
      `Found ${existing.length} existing fields, ${desired.length} desired fields`,
    );

    const toCreate = desired.filter(
      (d) => !existing.some((e) => e.api_key === d.api_key),
    );

    this.logger.traceJson("Fields to create identified", {
      createCount: toCreate.length,
      createKeys: toCreate.map((f) => f.api_key),
    });

    contextLogger.debug(
      `Fields to create: ${toCreate.length} - [${toCreate
        .map((f) => f.api_key)
        .join(", ")}]`,
    );

    // Create fields sequentially to ensure proper ordering when using field resolvers
    this.logger.traceJson("Creating new fields sequentially", {});
    for (const fieldDef of toCreate) {
      const fieldLogger = contextLogger.child({
        field: fieldDef.api_key,
        operation: "create",
      });

      this.logger.traceJson("Creating field", {
        fieldKey: fieldDef.api_key,
        fieldType: fieldDef.field_type,
      });

      // Check for circular references before resolving
      try {
        this.detectCircularReferences(fieldDef, existing);
      } catch (error) {
        this.logger.errorJson("Circular reference detected", {
          fieldKey: fieldDef.api_key,
          error: (error as Error).message,
        });
        throw error;
      }

      // Resolve any field resolver callbacks in the field definition
      const resolvedFieldDef = this.resolveFieldResolvers(fieldDef, existing);

      await executeWithErrorHandling(
        "create",
        async () => {
          fieldLogger.debugJson(
            "Creating field with definition: ",
            resolvedFieldDef,
          );

          const createdField = await this.api.call(() =>
            this.api.client.fields.create(itemTypeId, resolvedFieldDef),
          );

          // Add the created field to existing fields so subsequent fields can reference it
          existing.push(createdField);

          return createdField;
        },
        "field",
        resolvedFieldDef,
      );
    }

    if (!this.config.overwriteExistingFields) {
      this.logger.traceJson("Skipping field updates", {
        reason: "overwriteExistingFields is false",
      });
      contextLogger.warn(
        "Skipping field updates - overwriteExistingFields is false",
      );
      return;
    }

    this.logger.traceJson("Proceeding with field updates", {
      reason: "overwriteExistingFields is true",
    });
    contextLogger.debug(
      "overwriteExistingFields is true, proceeding with field updates",
    );

    // Update existing fields
    const updatePromises = existing.flatMap((existingField) => {
      const fieldDef = desired.find((d) => d.api_key === existingField.api_key);
      if (!fieldDef) return [];

      this.logger.traceJson("Preparing field update", {
        fieldKey: existingField.api_key,
        fieldId: existingField.id,
      });

      return [
        executeWithErrorHandling(
          "update",
          () => {
            const fieldLogger = contextLogger.child({
              field: existingField.api_key,
              operation: "update",
            });

            // Resolve any field resolver callbacks in the field definition
            const resolvedFieldDef = this.resolveFieldResolvers(
              fieldDef,
              existing,
            );

            fieldLogger.debugJson(
              "Updating field with definition: ",
              resolvedFieldDef,
            );

            return this.api.call(() =>
              this.api.client.fields.update(existingField.id, resolvedFieldDef),
            );
          },
          "field",
          fieldDef,
          existingField,
        ),
      ];
    });

    this.logger.traceJson("Updating existing fields", {
      updateCount: updatePromises.length,
    });
    contextLogger.debug(`Fields to update: ${updatePromises.length}`);
    await Promise.all(updatePromises);

    // Delete fields that are no longer needed
    const toDelete = existing.filter(
      (e) => !desired.some((d) => d.api_key === e.api_key),
    );

    this.logger.traceJson("Fields to delete identified", {
      deleteCount: toDelete.length,
      deleteKeys: toDelete.map((f) => f.api_key),
    });

    contextLogger.debug(
      `Fields to delete: ${toDelete.length} - [${toDelete
        .map((f) => f.api_key)
        .join(", ")}]`,
    );

    this.logger.traceJson("Deleting obsolete fields", {});
    await Promise.all(
      toDelete.map(async (existingField) => {
        const fieldLogger = contextLogger.child({
          field: existingField.api_key,
          operation: "delete",
        });

        this.logger.traceJson("Deleting field", {
          fieldKey: existingField.api_key,
          fieldId: existingField.id,
        });

        await executeWithErrorHandling(
          "delete",
          () => {
            fieldLogger.debug(`Deleting field with id: ${existingField.id}`);

            return this.api.call(() =>
              this.api.client.fields.destroy(existingField.id),
            );
          },
          "field",
          undefined,
          existingField,
        );
      }),
    );

    this.logger.traceJson("Field synchronization completed", {
      itemTypeId,
      totalOperations:
        toCreate.length + updatePromises.length + toDelete.length,
    });
    contextLogger.debug(`Field sync completed for itemType: ${itemTypeId}`);
  }

  public async create(): Promise<string> {
    this.logger.traceJson("Creating item type", {
      type: this.type,
      name: this.name,
      apiKey: this.body.api_key,
      fieldCount: this.fields.length,
    });

    const apiKey = this.body.api_key;

    const contextLogger = this.logger.child({
      operation: "create",
      itemType: apiKey,
    });

    try {
      this.logger.traceJson("Calling API to create item type", {});
      const item = await this.api.call(() =>
        this.api.client.itemTypes.create(this.body),
      );

      this.logger.traceJson("Item type created successfully", {
        id: item.id,
        apiKey: item.api_key,
      });
      contextLogger.debug(`Created itemType with id: ${item.id}`);

      this.logger.traceJson(
        "Starting field synchronization for new item type",
        {},
      );
      await this.syncFields(item.id);

      this.logger.traceJson("Item type creation completed", {
        id: item.id,
        apiKey: item.api_key,
      });
      return item.id;
    } catch (error) {
      this.logger.errorJson("Failed to create item type", {
        type: this.type,
        name: this.name,
        apiKey: this.body.api_key,
        error: (error as Error).message,
      });
      throw error;
    }
  }

  public async update(existingId?: string): Promise<string> {
    this.logger.traceJson("Updating item type", {
      type: this.type,
      name: this.name,
      apiKey: this.body.api_key,
      fieldCount: this.fields.length,
      existingId,
    });

    const apiKey = this.body.api_key;

    const contextLogger = this.logger.child({
      operation: "update",
      itemType: apiKey,
    });

    let existing: any;
    if (existingId) {
      this.logger.trace("Using provided existing item type ID");
      existing = await this.api.call(() =>
        this.api.client.itemTypes.find(existingId),
      );
    } else {
      this.logger.trace("Finding existing item type by name");
      const existingItems = await this.api.call(() =>
        this.api.client.itemTypes.list(),
      );
      existing = existingItems.find((item) => item.name === this.body.name);

      if (!existing) {
        throw new Error(
          `No existing item type found with name "${this.body.name}"`,
        );
      }
    }

    this.logger.traceJson("Found existing item type", {
      id: existing.id,
      apiKey: existing.api_key,
    });

    this.logger.trace("Calling API to update item type");
    const updateBody = {
      ...this.body,
      hint: this.body.hint ?? null,
    };

    this.logger.traceJson("Update body prepared", {
      updateBody,
    });

    const item = await this.api.call(() =>
      this.api.client.itemTypes.update(existing.id, updateBody),
    );

    this.logger.traceJson("Item type updated successfully", {
      id: item.id,
      apiKey: item.api_key,
    });
    contextLogger.debug(`Updated itemType with id: ${item.id}`);

    this.logger.trace("Starting field synchronization for updated item type");
    await this.syncFields(item.id);

    return item.id;
  }

  public async upsert(): Promise<string> {
    this.logger.traceJson("Upserting item type", {
      type: this.type,
      name: this.name,
      apiKey: this.body.api_key,
      fieldCount: this.fields.length,
    });

    const apiKey = this.body.api_key;

    const contextLogger = this.logger.child({
      operation: "upsert",
      itemType: apiKey,
    });

    contextLogger.debug("Upserting itemType");

    try {
      this.logger.trace("Checking if item type exists by name");
      const existingItems = await this.api.call(() =>
        this.api.client.itemTypes.list(),
      );
      const existingItem = existingItems.find(
        (item) => item.name === this.body.name,
      );

      if (existingItem) {
        contextLogger.debug("ItemType exists by name, proceeding with update");
        return this.update(existingItem.id);
      } else {
        contextLogger.debug(
          "ItemType not found by name, proceeding with creation",
        );
        return this.create();
      }
    } catch (error: unknown) {
      this.logger.errorJson("Error during upsert operation", {
        error: (error as Error).message,
      });
      throw error;
    }
  }
}
