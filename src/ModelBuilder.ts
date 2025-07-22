import type * as SimpleSchemaTypes from "@datocms/cma-client/src/generated/SimpleSchemaTypes";
import ItemTypeBuilder, {
  type FieldReferenceConfig,
  type ItemTypeBuilderType,
} from "./ItemTypeBuilder.js";
import type { ResolvedDatoBuilderConfig } from "./types/DatoBuilderConfig.js";
import type { FieldIdOrResolver } from "./types/FieldResolver.js";

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

  // Field names that support field resolution
  private static readonly FIELD_REFERENCE_NAMES = [
    "ordering_field",
    "presentation_title_field",
    "presentation_image_field",
    "title_field",
    "image_preview_field",
    "excerpt_field",
  ] as const;

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

    // Extract field resolvers and clean body before super() call
    const fieldResolvers: FieldReferenceConfig<string> = {};
    const cleanOptions: Omit<
      ModelBuilderBody,
      (typeof ModelBuilder.FIELD_REFERENCE_NAMES)[number]
    > = {
      api_key: modelOptions?.api_key,
      hint: modelOptions?.hint,
      tree: modelOptions?.tree,
      sortable: modelOptions?.sortable,
      singleton: modelOptions?.singleton,
      draft_mode_active: modelOptions?.draft_mode_active,
      draft_saving_active: modelOptions?.draft_saving_active,
      all_locales_required: modelOptions?.all_locales_required,
      workflow: modelOptions?.workflow,
      inverse_relationships_enabled:
        modelOptions?.inverse_relationships_enabled,
      collection_appearance: modelOptions?.collection_appearance,
      ordering_meta: modelOptions?.ordering_meta,
      ordering_direction: modelOptions?.ordering_direction,
    };

    if (modelOptions) {
      // Extract field references
      for (const fieldName of ModelBuilder.FIELD_REFERENCE_NAMES) {
        const fieldValue = modelOptions[fieldName];
        if (fieldValue !== undefined) {
          fieldResolvers[fieldName] = fieldValue;
        }
      }
    }

    super({
      type: "model",
      body: { ...cleanOptions, name },
      config,
    });

    // Store field resolvers using base class method
    this.setFieldReferences(fieldResolvers);
  }
}
