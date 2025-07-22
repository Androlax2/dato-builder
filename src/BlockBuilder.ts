import ItemTypeBuilder, {
  type ItemTypeBuilderType,
} from "./ItemTypeBuilder.js";
import type { ResolvedDatoBuilderConfig } from "./types/DatoBuilderConfig.js";
import type { ItemTypeCreateSchema } from "./types/ItemTypeBuilderTypes";

type BlockBuilderBody = Pick<
  ItemTypeCreateSchema,
  "presentation_title_field" | "presentation_image_field"
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
