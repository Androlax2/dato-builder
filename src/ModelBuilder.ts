import ItemTypeBuilder, {type ItemTypeBuilderBody, type ItemTypeBuilderConfig, type ItemTypeBuilderType,} from "./ItemTypeBuilder";

export default class ModelBuilder extends ItemTypeBuilder {
    public type: ItemTypeBuilderType = "model";

    constructor(
        name: string,
        body?: Omit<ItemTypeBuilderBody, "name">,
        config?: ItemTypeBuilderConfig,
    ) {
        super("model", {...body, name}, config);
    }
}
