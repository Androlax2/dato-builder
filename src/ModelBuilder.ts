import ItemTypeBuilder, {
  type ItemTypeBuilderBody,
  type ItemTypeBuilderType,
} from "./ItemTypeBuilder";
import type { DatoBuilderConfig } from "./types/DatoBuilderConfig";

type ModelBuilderOptions = {
  name: string;
  body?: Omit<ItemTypeBuilderBody, "name">;
  config: Required<DatoBuilderConfig>;
};

export default class ModelBuilder extends ItemTypeBuilder {
  public type: ItemTypeBuilderType = "model";

  constructor({ name, body, config }: ModelBuilderOptions) {
    super({
      type: "model",
      body: { ...body, name },
      config,
    });
  }
}
