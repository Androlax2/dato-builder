import ItemTypeBuilder, {type ItemTypeBuilderBody, type ItemTypeBuilderType,} from "./ItemTypeBuilder";

export default class ModelBuilder extends ItemTypeBuilder {
    protected type: ItemTypeBuilderType = "model";

    constructor(name: string, body?: Omit<ItemTypeBuilderBody, "name">) {
        super("model", {...body, name});
    }
}
