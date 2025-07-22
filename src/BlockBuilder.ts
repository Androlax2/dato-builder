import ItemTypeBuilder, {
  type ItemTypeBuilderType,
} from "./ItemTypeBuilder.js";
import type { DatoBuilderConfig } from "./types/DatoBuilderConfig.js";

type BlockBuilderBody = {
  /**
   * API key of the block.
   *
   * If not provided, it will be generated from the name.
   */
  api_key?: string;
  /**
   * A hint shown to editors to help them understand the purpose of this block.
   */
  hint?: string | null;
};

type BlockBuilderOptions = {
  name: string;
  options?: BlockBuilderBody;
  config: Required<DatoBuilderConfig>;
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
