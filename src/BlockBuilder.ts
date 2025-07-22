import type * as SimpleSchemaTypes from "@datocms/cma-client/src/generated/SimpleSchemaTypes";
import ItemTypeBuilder, {
  type ItemTypeBuilderType,
} from "./ItemTypeBuilder.js";
import type { ResolvedDatoBuilderConfig } from "./types/DatoBuilderConfig.js";

type BlockBuilderBody = Pick<
  SimpleSchemaTypes.ItemTypeCreateSchema,
  "hint" | "presentation_title_field" | "presentation_image_field"
> & {
  /**
   * API key of the block.
   *
   * If not provided, it will be generated from the name.
   */
  api_key?: string;
};

type BlockBuilderOptions = {
  name: string;
  options?: BlockBuilderBody;
  config: ResolvedDatoBuilderConfig;
};

export default class BlockBuilder extends ItemTypeBuilder {
  public override type: ItemTypeBuilderType = "block";

  constructor({ name, options, config }: BlockBuilderOptions) {
    super({
      type: "block",
      body: {
        ...options,
        name,
      },
      config,
    });
  }
}
