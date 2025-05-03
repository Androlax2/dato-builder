import ItemTypeBuilder, {type ItemTypeBuilderType} from "./ItemTypeBuilder";

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

export default class BlockBuilder extends ItemTypeBuilder {
    protected type: ItemTypeBuilderType = "block";

    constructor(name: string, options?: BlockBuilderBody) {
        super("block", {...options, name});
    }
}
