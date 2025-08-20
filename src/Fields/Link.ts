import type { ValidatorConfig } from "../Validators/Validators";
import Field, { type FieldBody } from "./Field";

export type LinkBody = Omit<FieldBody, "label" | "validators"> & {
  validators: {
    item_item_type: ValidatorConfig["item_item_type"];
  } & Pick<ValidatorConfig, "required" | "unique">;
};

export type LinkConfig = {
  label: string;
  /**
   * The appearance of the link field.
   *
   * @default "compact"
   */
  appearance?: "compact" | "expanded";
  body: LinkBody;
};

const appearanceToEditor: Record<
  Exclude<LinkConfig["appearance"], undefined>,
  "link_select" | "link_embed"
> = {
  compact: "link_select",
  expanded: "link_embed",
};

export default class Link extends Field {
  constructor({ label, appearance = "compact", body }: LinkConfig) {
    super("link", {
      ...body,
      label,
      appearance: {
        editor: appearanceToEditor[appearance],
        parameters: {},
        addons: body?.addons || [],
      },
    });
  }
}
