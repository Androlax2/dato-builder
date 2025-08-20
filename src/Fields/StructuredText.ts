import StructuredTextBlocksValidator from "../Validators/StructuredTextBlocksValidator";
import StructuredTextLinksValidator from "../Validators/StructuredTextLinksValidator";
import type { ValidatorConfig } from "../Validators/Validators";
import Field, { type FieldBody } from "./Field";

export type StructuredTextBody = Omit<FieldBody, "label" | "validators"> & {
  validators?: Pick<
    ValidatorConfig,
    | "length"
    | "structured_text_inline_blocks"
    | "structured_text_blocks"
    | "structured_text_links"
  >;
};

export type StructuredTextConfig = {
  label: string;
  /**
   * Specify which nodes the field should allow.
   *
   * @default ["blockquote", "code", "heading", "link", "list", "thematicBreak"]
   */
  nodes?: Array<
    "blockquote" | "code" | "heading" | "link" | "list" | "thematicBreak"
  >;
  /**
   * Specify which marks the field should allow.
   *
   * @default ["strong", "emphasis", "underline", "strikethrough", "code", "highlight"]
   */
  marks?: Array<
    "strong" | "emphasis" | "underline" | "strikethrough" | "code" | "highlight"
  >;
  /**
   * If nodes includes "heading", specify which heading levels the field should allow.
   *
   * @default [1, 2, 3, 4, 5, 6]
   */
  heading_levels?: Array<1 | 2 | 3 | 4 | 5 | 6>;
  /**
   * Whether you want block nodes collapsed by default or not.
   *
   * @default false
   */
  blocks_start_collapsed?: boolean;
  /**
   * Whether you want to show the "Open this link in a new tab?" checkbox, that fills in the target: "_blank" meta attribute for links.
   *
   * @default false
   */
  show_links_target_blank?: boolean;
  /**
   * Whether you want to show the complete meta editor for links.
   *
   * @default false
   */
  show_links_meta_editor?: boolean;
  body?: StructuredTextBody;
};

export default class StructuredText extends Field {
  constructor({
    label,
    nodes = ["blockquote", "code", "heading", "link", "list", "thematicBreak"],
    marks = [
      "strong",
      "emphasis",
      "underline",
      "strikethrough",
      "code",
      "highlight",
    ],
    heading_levels = [1, 2, 3, 4, 5, 6],
    blocks_start_collapsed = false,
    show_links_target_blank = false,
    show_links_meta_editor = false,
    body,
  }: StructuredTextConfig) {
    super("structured_text", {
      ...body,
      validators: {
        structured_text_blocks:
          body?.validators?.structured_text_blocks ??
          new StructuredTextBlocksValidator({
            item_types: [],
          }).build(),
        structured_text_links:
          body?.validators?.structured_text_links ??
          new StructuredTextLinksValidator({
            item_types: [],
          }).build(),
        ...body?.validators,
      },
      label,
      appearance: {
        editor: "structured_text",
        parameters: {
          nodes,
          marks,
          heading_levels,
          blocks_start_collapsed,
          show_links_target_blank,
          show_links_meta_editor,
        },
        addons: body?.addons || [],
      },
    });
  }
}
