import ItemTypeBuilder, {
  type ItemTypeBuilderBody,
  type ItemTypeBuilderType,
} from "./ItemTypeBuilder.js";
import type { ResolvedDatoBuilderConfig } from "./types/DatoBuilderConfig.js";

type ModelBuilderOptions = {
  name: string;
  body?: Omit<ItemTypeBuilderBody, "name">;
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
