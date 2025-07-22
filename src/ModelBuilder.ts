import type * as SimpleSchemaTypes from "@datocms/cma-client/src/generated/SimpleSchemaTypes";
import ItemTypeBuilder, {
  type ItemTypeBuilderType,
} from "./ItemTypeBuilder.js";
import type { ResolvedDatoBuilderConfig } from "./types/DatoBuilderConfig.js";
import type { FieldIdOrResolver } from "./types/FieldResolver.js";
import { extractFieldReferences } from "./utils/FieldReferenceHandler.js";

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
    const modelOptions: ModelBuilderBody | undefined =
      "options" in params
        ? params.options
        : "body" in params
          ? params.body
          : undefined;

    // Extract field resolvers and clean body using shared handler
    const { fieldResolvers, cleanBody } = extractFieldReferences(
      modelOptions,
      ModelBuilder.FIELD_REFERENCE_NAMES,
    );

    super({
      type: "model",
      body: { ...cleanBody, name },
      config,
    });

    // Store field resolvers using base class method
    this.setFieldReferences(fieldResolvers);
  }
}
