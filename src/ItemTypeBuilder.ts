import type * as SimpleSchemaTypes from "@datocms/cma-client/src/generated/SimpleSchemaTypes";
import DatoApi from "./Api/DatoApi";
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
import Textarea, { type TextareaConfig } from "./Fields/Textarea";
import Wysiwyg, { type WysiwygConfig } from "./Fields/Wysiwyg";
import { getDatoClient } from "./config";
import { loadDatoBuilderConfig } from "./config/loader";
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
};

export default abstract class ItemTypeBuilder {
  protected api = new DatoApi(getDatoClient());
  protected readonly client = this.api.client;
  readonly body: SimpleSchemaTypes.ItemTypeCreateSchema;
  readonly name: string;
  readonly type: ItemTypeBuilderType;
  readonly fields: Field[] = [];
  readonly config: Required<ItemTypeBuilderConfig>;

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
    };
  }

  /**
   * Merge global config and builder-specific overrides into final config.
   */
  private mergeConfig(
    builderConfig: ItemTypeBuilderConfig,
  ): Required<ItemTypeBuilderConfig> {
    const globalConfig = loadDatoBuilderConfig();
    return {
      overwriteExistingFields:
        builderConfig.overwriteExistingFields ??
        globalConfig.overwriteExistingFields ??
        false,
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

  /**
   * Synchronize fields: create, update (if override), and delete
   *
   * @param itemTypeId ID to sync against
   */
  private async syncFields(itemTypeId: string): Promise<void> {
    const existing = await this.api.call(() =>
      this.client.fields.list(itemTypeId),
    );
    const desired = this.fields.map((f) => f.build());

    // Create new
    const toCreate = desired.filter(
      (d) => !existing.some((e) => e.api_key === d.api_key),
    );
    await Promise.all(
      toCreate.map((d) =>
        this.api.call(() => this.client.fields.create(itemTypeId, d)),
      ),
    );

    if (this.config.overwriteExistingFields) {
      // Update existing fields
      const updates = existing.flatMap((e) => {
        const def = desired.find((d) => d.api_key === e.api_key);
        return def
          ? [this.api.call(() => this.client.fields.update(e.id, def))]
          : [];
      });
      await Promise.all(updates);

      // Delete removed
      const toDelete = existing.filter(
        (e) => !desired.some((d) => d.api_key === e.api_key),
      );
      await Promise.all(
        toDelete.map((e) =>
          this.api.call(() => this.client.fields.destroy(e.id)),
        ),
      );
    }
  }

  public async create(): Promise<string> {
    const item = await this.api.call(() =>
      this.client.itemTypes.create(this.body),
    );
    await this.syncFields(item.id);

    console.info(`Created item type "${this.name}" (id=${item.id})`);

    return item.id;
  }

  public async update(): Promise<string> {
    const item = await this.api.call(() =>
      this.client.itemTypes.update(this.body.api_key, this.body),
    );
    await this.syncFields(item.id);

    console.info(`Updated item type "${this.name}" (id=${item.id})`);

    return item.id;
  }

  public async upsert(): Promise<string> {
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
