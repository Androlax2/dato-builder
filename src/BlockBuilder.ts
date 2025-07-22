import type * as SimpleSchemaTypes from "@datocms/cma-client/src/generated/SimpleSchemaTypes";
import ItemTypeBuilder, {
  type ItemTypeBuilderType,
} from "./ItemTypeBuilder.js";
import type { ResolvedDatoBuilderConfig } from "./types/DatoBuilderConfig.js";
import type { FieldIdOrResolver } from "./types/FieldResolver.js";
import { isFieldResolver, resolveFieldId } from "./types/FieldResolver.js";

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
  private presentationTitleFieldResolver?: FieldIdOrResolver | null;
  private presentationImageFieldResolver?: FieldIdOrResolver | null;

  constructor({ name, options, config }: BlockBuilderOptions) {
    // Store the field resolvers for later processing
    const {
      presentation_title_field,
      presentation_image_field,
      ...bodyWithoutFieldRefs
    } = options || {};

    super({
      type: "block",
      body: {
        ...bodyWithoutFieldRefs,
        name,
      },
      config,
    });

    this.presentationTitleFieldResolver = presentation_title_field;
    this.presentationImageFieldResolver = presentation_image_field;
  }

  /**
   * Resolves field references to FieldData format for DatoCMS API
   */
  private async resolveFieldReferences(itemTypeId: string): Promise<{
    presentation_title_field?: SimpleSchemaTypes.FieldData | null;
    presentation_image_field?: SimpleSchemaTypes.FieldData | null;
  }> {
    const resolved: {
      presentation_title_field?: SimpleSchemaTypes.FieldData | null;
      presentation_image_field?: SimpleSchemaTypes.FieldData | null;
    } = {};

    // Get existing fields once for all resolvers
    let existingFields: SimpleSchemaTypes.Field[] | null = null;

    const getFields = async () => {
      if (!existingFields) {
        existingFields = await this.api.call(() =>
          this.api.client.fields.list(itemTypeId),
        );
      }
      return existingFields;
    };

    // Resolve presentation_title_field
    if (this.presentationTitleFieldResolver !== undefined) {
      if (this.presentationTitleFieldResolver === null) {
        resolved.presentation_title_field = null;
      } else {
        const fields = await getFields();
        const fieldId = isFieldResolver(this.presentationTitleFieldResolver)
          ? resolveFieldId(this.presentationTitleFieldResolver, fields)
          : this.presentationTitleFieldResolver;

        resolved.presentation_title_field = {
          type: "field" as SimpleSchemaTypes.FieldType,
          id: fieldId,
        };
      }
    }

    // Resolve presentation_image_field
    if (this.presentationImageFieldResolver !== undefined) {
      if (this.presentationImageFieldResolver === null) {
        resolved.presentation_image_field = null;
      } else {
        const fields = await getFields();
        const fieldId = isFieldResolver(this.presentationImageFieldResolver)
          ? resolveFieldId(this.presentationImageFieldResolver, fields)
          : this.presentationImageFieldResolver;

        resolved.presentation_image_field = {
          type: "field" as SimpleSchemaTypes.FieldType,
          id: fieldId,
        };
      }
    }

    return resolved;
  }

  public override async create(): Promise<string> {
    // Create the block first
    const itemId = await super.create();

    // Then update with field references if any exist
    if (this.hasFieldReferences()) {
      const fieldReferences = await this.resolveFieldReferences(itemId);

      if (Object.keys(fieldReferences).length > 0) {
        await this.api.call(() =>
          this.api.client.itemTypes.update(itemId, fieldReferences),
        );
      }
    }

    return itemId;
  }

  public override async update(existingId?: string): Promise<string> {
    // Update the block first
    const itemId = await super.update(existingId);

    // Then update with field references if any exist
    if (this.hasFieldReferences()) {
      const fieldReferences = await this.resolveFieldReferences(itemId);

      await this.api.call(() =>
        this.api.client.itemTypes.update(itemId, fieldReferences),
      );
    }

    return itemId;
  }

  /**
   * Check if any field references are defined
   */
  private hasFieldReferences(): boolean {
    return (
      this.presentationTitleFieldResolver !== undefined ||
      this.presentationImageFieldResolver !== undefined
    );
  }
}
