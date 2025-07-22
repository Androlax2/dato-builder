import type * as SimpleSchemaTypes from "@datocms/cma-client/src/generated/SimpleSchemaTypes";
import ItemTypeBuilder, {
  type FieldReferenceConfig,
  type ItemTypeBuilderType,
} from "./ItemTypeBuilder.js";
import type { ResolvedDatoBuilderConfig } from "./types/DatoBuilderConfig.js";
import type { FieldIdOrResolver } from "./types/FieldResolver.js";

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
    // Extract field resolvers and clean body before super() call
    const fieldResolvers: FieldReferenceConfig<string> = {};
    const cleanOptions: Omit<
      BlockBuilderBody,
      (typeof BlockBuilder.FIELD_REFERENCE_NAMES)[number]
    > = {
      api_key: options?.api_key,
      hint: options?.hint,
    };

    if (options) {
      // Extract field references
      for (const fieldName of BlockBuilder.FIELD_REFERENCE_NAMES) {
        const fieldValue = options[fieldName];
        if (fieldValue !== undefined) {
          fieldResolvers[fieldName] = fieldValue;
        }
      }
    }

    super({
      type: "block",
      body: {
        ...cleanOptions,
        name,
      },
      config,
    });

    // Store field resolvers using base class method
    this.setFieldReferences(fieldResolvers);
  }
}
