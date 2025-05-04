import type { ValidatorConfig } from "../Validators/Validators";
import Field, { type FieldBody } from "./Field";

export type LinksBody = Omit<FieldBody, "label" | "validators"> & {
  validators: {
    items_item_type: ValidatorConfig["items_item_type"];
  } & Pick<ValidatorConfig, "size">;
};

export type LinksConfig = {
  label: string;
  /**
   * The appearance of the link field.
   *
   * @default "compact"
   */
  appearance?: "compact" | "expanded";
  body: LinksBody;
};

const appearanceToEditor: Record<
  Exclude<LinksConfig["appearance"], undefined>,
  "links_select" | "links_embed"
> = {
  compact: "links_select",
  expanded: "links_embed",
};

export default class Links extends Field {
  constructor({ label, appearance = "compact", body }: LinksConfig) {
    super("links", {
      ...body,
      label,
      appearance: {
        editor: appearanceToEditor[appearance],
        parameters: {},
        addons: [],
      },
    });
  }
}
