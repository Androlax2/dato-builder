import type * as SimpleSchemaTypes from "@datocms/cma-client/src/generated/SimpleSchemaTypes";
import ItemTypeBuilder, {
  type ItemTypeBuilderType,
} from "./ItemTypeBuilder.js";
import type { ResolvedDatoBuilderConfig } from "./types/DatoBuilderConfig.js";

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
  | "ordering_field"
  | "presentation_title_field"
  | "presentation_image_field"
  | "title_field"
  | "image_preview_field"
  | "excerpt_field"
> & {
  /**
   * API key of the model.
   *
   * If not provided, it will be generated from the name.
   */
  api_key?: string;
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

    super({
      type: "model",
      body: { ...modelOptions, name },
      config,
    });
  }
}
