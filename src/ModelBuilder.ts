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
   * API key of the block.
   *
   * If not provided, it will be generated from the name.
   */
  api_key?: string;
};

type ModelBuilderOptions = {
  name: string;
  body?: ModelBuilderBody;
  config: ResolvedDatoBuilderConfig;
};

export default class ModelBuilder extends ItemTypeBuilder {
  public override type: ItemTypeBuilderType = "model";

  constructor({ name, body, config }: ModelBuilderOptions) {
    super({
      type: "model",
      body: { ...body, name },
      config,
    });
  }
}
