import { createHash } from "node:crypto";
import type * as SimpleSchemaTypes from "@datocms/cma-client/src/generated/SimpleSchemaTypes";
import { buildClient } from "@datocms/cma-client-node";
import DatoApi from "./Api/DatoApi";
import NotFoundError from "./Api/Error/NotFoundError";
import UniquenessError from "./Api/Error/UniquenessError";
import AssetGallery, { type AssetGalleryConfig } from "./Fields/AssetGallery";
import BooleanField, { type BooleanConfig } from "./Fields/Boolean";
import BooleanRadioGroup, {
  type BooleanRadioGroupConfig,
} from "./Fields/BooleanRadioGroup";
import ColorPicker, { type ColorPickerConfig } from "./Fields/ColorPicker";
import DateField, { type DateConfig } from "./Fields/Date";
import DateTime, { type DateTimeConfig } from "./Fields/DateTime";
import Email, { type EmailConfig } from "./Fields/Email";
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
import Url, { type UrlConfig } from "./Fields/Url";
import Wysiwyg, { type WysiwygConfig } from "./Fields/Wysiwyg";
import { ConsoleLogger } from "./logger";
import type { DatoBuilderConfig } from "./types/DatoBuilderConfig";
import { executeWithErrorHandling } from "./utils/errors";
import { generateDatoApiKey } from "./utils/utils";

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
  config: Required<DatoBuilderConfig>;
};

type HashableConfigKeys =
  | "overwriteExistingFields"
  | "modelApiKeySuffix"
  | "blockApiKeySuffix";

type HashableConfig = Pick<DatoBuilderConfig, HashableConfigKeys>;

export default abstract class ItemTypeBuilder {
  protected logger: ConsoleLogger;
  protected api: DatoApi;
  readonly body: SimpleSchemaTypes.ItemTypeCreateSchema;
  readonly name: string;
  readonly type: ItemTypeBuilderType;
  readonly fields: Field[] = [];
  readonly config: Required<DatoBuilderConfig>;

  protected constructor({ type, body, config }: ItemTypeBuilderOptions) {
    this.logger = new ConsoleLogger(config.logLevel);
    this.type = type;
    this.name = body.name;
    this.api = new DatoApi(buildClient({ apiToken: config.apiToken }));

    this.config = config;

    const apiKey =
      body.api_key ||
      generateDatoApiKey({
        name: body.name,
        suffix: this.resolveSuffix(),
        preservePlural: false,
      });

    this.body = {
      ...body,
      api_key: apiKey,
      modular_block: this.type === "block",
      collection_appearance: body.collection_appearance || "table",
    };
  }

  private getHashableConfig(): HashableConfig {
    return {
      overwriteExistingFields: this.config.overwriteExistingFields,
      modelApiKeySuffix: this.config.modelApiKeySuffix,
      blockApiKeySuffix: this.config.blockApiKeySuffix,
    };
  }

  public getHash(): string {
    return createHash("sha256")
      .update(
        JSON.stringify({
          body: this.body,
          fields: [...this.fields.map((f) => f.build())].sort((a, b) =>
            a.api_key.localeCompare(b.api_key),
          ),
          config: this.getHashableConfig(),
        }),
      )
      .digest("hex");
  }

  private resolveSuffix(): string | null | undefined {
    switch (this.type) {
      case "model":
        return this.config.modelApiKeySuffix;
      case "block":
        return this.config.blockApiKeySuffix;
      default:
        throw new Error(`Unknown type "${this.type}"`);
    }
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

    this.fields.push(field);
    return this;
  }

  public getField(apiKey: string): Field | undefined {
    return this.fields.find((f) => f.build().api_key === apiKey);
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

  public addText({ label, body, options }: SingleLineStringConfig): this {
    return this.addSingleLineString({
      label,
      body,
      options,
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

  private async syncFields(itemTypeId: string): Promise<void> {
    const contextLogger = this.logger.child({
      operation: "syncFields",
      itemType: this.body.api_key,
    });

    contextLogger.debug(`Starting field sync for itemType: ${itemTypeId}`);

    const existing = await this.api.call(() =>
      this.api.client.fields.list(itemTypeId),
    );
    const desired = this.fields.map((f) => f.build());

    contextLogger.debug(
      `Found ${existing.length} existing fields, ${desired.length} desired fields`,
    );

    const toCreate = desired.filter(
      (d) => !existing.some((e) => e.api_key === d.api_key),
    );

    contextLogger.debug(
      `Fields to create: ${toCreate.length} - [${toCreate.map((f) => f.api_key).join(", ")}]`,
    );

    await Promise.all(
      toCreate.map(async (fieldDef) => {
        const fieldLogger = contextLogger.child({
          field: fieldDef.api_key,
          operation: "create",
        });

        await executeWithErrorHandling(
          "create",
          () => {
            fieldLogger.debugJson("Creating field with definition: ", fieldDef);

            return this.api.call(() =>
              this.api.client.fields.create(itemTypeId, fieldDef),
            );
          },
          "field",
          fieldDef,
        );
      }),
    );

    if (!this.config.overwriteExistingFields) {
      contextLogger.debug(
        "Skipping field updates - overwriteExistingFields is false",
      );
      return;
    }

    contextLogger.debug(
      "overwriteExistingFields is true, proceeding with field updates",
    );

    // Update existing fields
    const updatePromises = existing.flatMap((existingField) => {
      const fieldDef = desired.find((d) => d.api_key === existingField.api_key);
      if (!fieldDef) return [];

      return [
        executeWithErrorHandling(
          "update",
          () => {
            const fieldLogger = contextLogger.child({
              field: existingField.api_key,
              operation: "update",
            });

            fieldLogger.debugJson("Updating field with definition: ", fieldDef);

            return this.api.call(() =>
              this.api.client.fields.update(existingField.id, fieldDef),
            );
          },
          "field",
          fieldDef,
          existingField,
        ),
      ];
    });

    contextLogger.debug(`Fields to update: ${updatePromises.length}`);
    await Promise.all(updatePromises);

    // Delete fields that are no longer needed
    const toDelete = existing.filter(
      (e) => !desired.some((d) => d.api_key === e.api_key),
    );

    contextLogger.debug(
      `Fields to delete: ${toDelete.length} - [${toDelete.map((f) => f.api_key).join(", ")}]`,
    );

    await Promise.all(
      toDelete.map(async (existingField) => {
        const fieldLogger = contextLogger.child({
          field: existingField.api_key,
          operation: "delete",
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

    contextLogger.debug(`Field sync completed for itemType: ${itemTypeId}`);
  }

  public async create(): Promise<string> {
    const apiKey = this.body.api_key;

    const contextLogger = this.logger.child({
      operation: "create",
      itemType: apiKey,
    });

    try {
      const item = await this.api.call(() =>
        this.api.client.itemTypes.create(this.body),
      );
      contextLogger.debug(`Created itemType with id: ${item.id}`);

      await this.syncFields(item.id);

      return item.id;
    } catch (error: unknown) {
      if (error instanceof UniquenessError) {
        contextLogger.debug(
          "UniquenessError encountered, fetching existing item",
        );

        // If the item already exists, we can just return its ID
        try {
          const existing = await this.api.call(() =>
            this.api.client.itemTypes.find(apiKey),
          );

          contextLogger.debug(
            `Found existing itemType with id: ${existing.id}`,
          );

          return existing.id;
        } catch (findError: unknown) {
          contextLogger.error(
            `Failed to find existing itemType: ${(findError as Error).message}`,
          );
          throw findError;
        }
      }

      throw error;
    }
  }

  public async update(): Promise<string> {
    const apiKey = this.body.api_key;

    const contextLogger = this.logger.child({
      operation: "update",
      itemType: apiKey,
    });

    // Attempt the update
    const item = await this.api.call(() =>
      this.api.client.itemTypes.update(apiKey, this.body),
    );
    contextLogger.debug(`Updated itemType with id: ${item.id}`);

    await this.syncFields(item.id);

    return item.id;
  }

  public async upsert(): Promise<string> {
    const apiKey = this.body.api_key;
    const contextLogger = this.logger.child({
      operation: "upsert",
      itemType: apiKey,
    });

    contextLogger.debug("Upserting itemType");

    try {
      await this.api.call(() =>
        this.api.client.itemTypes.find(this.body.api_key),
      );

      contextLogger.debug("ItemType exists, proceeding with update");
      return this.update();
    } catch (error: unknown) {
      if (error instanceof NotFoundError) {
        contextLogger.debug("ItemType not found, proceeding with creation");
        return this.create();
      }

      throw error;
    }
  }
}
