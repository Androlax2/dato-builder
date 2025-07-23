import type * as SimpleSchemaTypes from "@datocms/cma-client/src/generated/SimpleSchemaTypes";
import ItemTypeBuilder, {
  type ItemTypeBuilderType,
} from "./ItemTypeBuilder.js";
import type { ResolvedDatoBuilderConfig } from "./types/DatoBuilderConfig.js";
import type { FieldIdOrResolver } from "./types/FieldResolver.js";
import { extractFieldReferences } from "./utils/FieldReferenceHandler.js";

type BlockBuilderBody = Pick<SimpleSchemaTypes.ItemTypeCreateSchema, "hint"> & {
  /**
   * API key of the block.
   *
   * If not provided, it will be generated from the name.
   */
  api_key?: string;
  /**
   * Field ID or resolver function for the presentation title field.
   * This field will be used as the title in the DatoCMS interface.
   */
  presentation_title_field?: FieldIdOrResolver | null;
  /**
   * Field ID or resolver function for the presentation image field.
   * This field will be used as the preview image in the DatoCMS interface.
   */
  presentation_image_field?: FieldIdOrResolver | null;
};

type BlockBuilderOptions = {
  name: string;
  options?: BlockBuilderBody;
  config: ResolvedDatoBuilderConfig;
};

export default class BlockBuilder extends ItemTypeBuilder {
  public override type: ItemTypeBuilderType = "block";

  // Field names that support field resolution
  private static readonly FIELD_REFERENCE_NAMES = [
    "presentation_title_field",
    "presentation_image_field",
  ] as const;

  constructor({ name, options, config }: BlockBuilderOptions) {
    // Extract field resolvers and clean body using shared handler
    const { fieldResolvers, cleanBody } = extractFieldReferences(
      options,
      BlockBuilder.FIELD_REFERENCE_NAMES,
    );

    super({
      type: "block",
      body: {
        ...cleanBody,
        name,
      },
      config,
    });

    // Store field resolvers using base class method
    this.setFieldReferences(fieldResolvers);
  }
}
