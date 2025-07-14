import type { Field } from "@datocms/cma-client/src/generated/SimpleSchemaTypes";

export class BlockReferenceAnalyzer {
  hasBlockReferences(fields: Field[]): boolean {
    return fields.some((field) => this.fieldReferencesOtherItems(field));
  }

  private fieldReferencesOtherItems(field: Field): boolean {
    return (
      (field.field_type === "rich_text" ||
        field.field_type === "single_block" ||
        field.field_type === "structured_text") &&
      this.getReferencedItemIds(field).length > 0
    );
  }

  private getReferencedItemIds(field: Field): string[] {
    const itemIds: string[] = [];
    const validators = field.validators as any;

    if (validators?.rich_text_blocks?.item_types) {
      itemIds.push(...validators.rich_text_blocks.item_types);
    }
    if (validators?.single_block?.item_types) {
      itemIds.push(...validators.single_block.item_types);
    }
    if (validators?.structured_text_blocks?.item_types) {
      itemIds.push(...validators.structured_text_blocks.item_types);
    }

    return itemIds;
  }
}
