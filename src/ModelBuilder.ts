import ItemTypeBuilder, {
  type ItemTypeBuilderBody,
  type ItemTypeBuilderConfig,
  type ItemTypeBuilderType,
} from "./ItemTypeBuilder";

type ModelBuilderOptions = {
  name: string;
  body?: Omit<ItemTypeBuilderBody, "name">;
  config: ItemTypeBuilderConfig;
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
