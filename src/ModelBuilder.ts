import type * as SimpleSchemaTypes from "@datocms/cma-client/src/generated/SimpleSchemaTypes";
import ItemTypeBuilder, {
  type ItemTypeBuilderType,
} from "./ItemTypeBuilder.js";
import type { ResolvedDatoBuilderConfig } from "./types/DatoBuilderConfig.js";
import type { FieldIdOrResolver } from "./types/FieldResolver.js";
import { isFieldResolver, resolveFieldId } from "./types/FieldResolver.js";

type ModelBuilderBody = Pick<
  SimpleSchemaTypes.ItemTypeCreateSchema,
  | "hint"
  | "tree"
  | "sortable"
  | "singleton"
  | "draft_mode_active"
  | "draft_saving_active"
  | "all_locales_required"
  | "workflow"
  | "inverse_relationships_enabled"
  | "collection_appearance"
  | "ordering_meta"
  | "ordering_direction"
> & {
  /**
   * API key of the model.
   *
   * If not provided, it will be generated from the name.
   */
  api_key?: string;
  /**
   * Field ID or resolver function for the ordering field.
   * Determines which field is used for default sorting of records.
   */
  ordering_field?: FieldIdOrResolver | null;
  /**
   * Field ID or resolver function for the presentation title field.
   * This field will be used as the title in the DatoCMS interface.
   */
  presentation_title_field?: FieldIdOrResolver | null;
  /**
   * Field ID or resolver function for the presentation image field.
   * This field will be used as the preview image in the DatoCMS interface.
   */
  presentation_image_field?: FieldIdOrResolver | null;
  /**
   * Field ID or resolver function for the title field.
   * Main title field for the model records.
   */
  title_field?: FieldIdOrResolver | null;
  /**
   * Field ID or resolver function for the image preview field.
   * Field used for image previews in listings.
   */
  image_preview_field?: FieldIdOrResolver | null;
  /**
   * Field ID or resolver function for the excerpt field.
   * Field used for excerpt text in listings and previews.
   */
  excerpt_field?: FieldIdOrResolver | null;
};

type ModelBuilderOptions = {
  name: string;
  options?: ModelBuilderBody;
  config: ResolvedDatoBuilderConfig;
};

/**
 * @deprecated Use ModelBuilderOptions with 'options' property instead of 'body'
 */
type LegacyModelBuilderOptions = {
  name: string;
  /** @deprecated Use 'options' instead */
  body?: ModelBuilderBody;
  config: ResolvedDatoBuilderConfig;
};

// Union type to support both current and legacy options
type AllModelBuilderOptions = ModelBuilderOptions | LegacyModelBuilderOptions;

export default class ModelBuilder extends ItemTypeBuilder {
  public override type: ItemTypeBuilderType = "model";
  private orderingFieldResolver?: FieldIdOrResolver | null;
  private presentationTitleFieldResolver?: FieldIdOrResolver | null;
  private presentationImageFieldResolver?: FieldIdOrResolver | null;
  private titleFieldResolver?: FieldIdOrResolver | null;
  private imagePreviewFieldResolver?: FieldIdOrResolver | null;
  private excerptFieldResolver?: FieldIdOrResolver | null;

  constructor(params: AllModelBuilderOptions) {
    const { name, config } = params;

    // Handle both new 'options' and legacy 'body' properties
    let modelOptions: ModelBuilderBody | undefined;

    if ("options" in params) {
      modelOptions = params.options;
    } else if ("body" in params) {
      // Legacy support
      modelOptions = params.body;
    }

    // Store the field resolvers for later processing
    const {
      ordering_field,
      presentation_title_field,
      presentation_image_field,
      title_field,
      image_preview_field,
      excerpt_field,
      ...bodyWithoutFieldRefs
    } = modelOptions || {};

    super({
      type: "model",
      body: { ...bodyWithoutFieldRefs, name },
      config,
    });

    this.orderingFieldResolver = ordering_field;
    this.presentationTitleFieldResolver = presentation_title_field;
    this.presentationImageFieldResolver = presentation_image_field;
    this.titleFieldResolver = title_field;
    this.imagePreviewFieldResolver = image_preview_field;
    this.excerptFieldResolver = excerpt_field;
  }

  /**
   * Resolves field references to FieldData format for DatoCMS API
   */
  private async resolveFieldReferences(itemTypeId: string): Promise<{
    ordering_field?: SimpleSchemaTypes.FieldData | null;
    presentation_title_field?: SimpleSchemaTypes.FieldData | null;
    presentation_image_field?: SimpleSchemaTypes.FieldData | null;
    title_field?: SimpleSchemaTypes.FieldData | null;
    image_preview_field?: SimpleSchemaTypes.FieldData | null;
    excerpt_field?: SimpleSchemaTypes.FieldData | null;
  }> {
    const resolved: {
      ordering_field?: SimpleSchemaTypes.FieldData | null;
      presentation_title_field?: SimpleSchemaTypes.FieldData | null;
      presentation_image_field?: SimpleSchemaTypes.FieldData | null;
      title_field?: SimpleSchemaTypes.FieldData | null;
      image_preview_field?: SimpleSchemaTypes.FieldData | null;
      excerpt_field?: SimpleSchemaTypes.FieldData | null;
    } = {};

    // Get existing fields once for all resolvers
    let existingFields: SimpleSchemaTypes.Field[] | null = null;

    const getFields = async () => {
      if (!existingFields) {
        existingFields = await this.api.call(() =>
          this.api.client.fields.list(itemTypeId),
        );
      }
      return existingFields;
    };

    const resolveField = async (
      resolver: FieldIdOrResolver | null | undefined,
    ) => {
      if (resolver === undefined) return undefined;
      if (resolver === null) return null;

      const fields = await getFields();
      const fieldId = isFieldResolver(resolver)
        ? resolveFieldId(resolver, fields)
        : resolver;

      return {
        type: "field" as SimpleSchemaTypes.FieldType,
        id: fieldId,
      };
    };

    // Resolve all field references
    if (this.orderingFieldResolver !== undefined) {
      resolved.ordering_field = await resolveField(this.orderingFieldResolver);
    }
    if (this.presentationTitleFieldResolver !== undefined) {
      resolved.presentation_title_field = await resolveField(
        this.presentationTitleFieldResolver,
      );
    }
    if (this.presentationImageFieldResolver !== undefined) {
      resolved.presentation_image_field = await resolveField(
        this.presentationImageFieldResolver,
      );
    }
    if (this.titleFieldResolver !== undefined) {
      resolved.title_field = await resolveField(this.titleFieldResolver);
    }
    if (this.imagePreviewFieldResolver !== undefined) {
      resolved.image_preview_field = await resolveField(
        this.imagePreviewFieldResolver,
      );
    }
    if (this.excerptFieldResolver !== undefined) {
      resolved.excerpt_field = await resolveField(this.excerptFieldResolver);
    }

    return resolved;
  }

  public override async create(): Promise<string> {
    // Create the model first
    const itemId = await super.create();

    // Then update with field references if any exist
    if (this.hasFieldReferences()) {
      const fieldReferences = await this.resolveFieldReferences(itemId);

      if (Object.keys(fieldReferences).length > 0) {
        await this.api.call(() =>
          this.api.client.itemTypes.update(itemId, fieldReferences),
        );
      }
    }

    return itemId;
  }

  public override async update(existingId?: string): Promise<string> {
    // Update the model first
    const itemId = await super.update(existingId);

    // Then update with field references if any exist
    if (this.hasFieldReferences()) {
      const fieldReferences = await this.resolveFieldReferences(itemId);

      await this.api.call(() =>
        this.api.client.itemTypes.update(itemId, fieldReferences),
      );
    }

    return itemId;
  }

  /**
   * Check if any field references are defined
   */
  private hasFieldReferences(): boolean {
    return (
      this.orderingFieldResolver !== undefined ||
      this.presentationTitleFieldResolver !== undefined ||
      this.presentationImageFieldResolver !== undefined ||
      this.titleFieldResolver !== undefined ||
      this.imagePreviewFieldResolver !== undefined ||
      this.excerptFieldResolver !== undefined
    );
  }
}
