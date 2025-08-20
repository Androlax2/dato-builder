import type { ValidatorConfig } from "../Validators/Validators";
import Field, { type FieldBody } from "./Field";

export type ModularContentBody = Omit<FieldBody, "label" | "validators"> & {
  validators: {
    rich_text_blocks: ValidatorConfig["rich_text_blocks"];
  } & Pick<ValidatorConfig, "size">;
};

export type ModularContentConfig = {
  label: string;
  /**
   * Whether you want block records collapsed by default or not.
   * @default false
   */
  start_collapsed?: boolean;
  body: ModularContentBody;
};

export default class ModularContent extends Field {
  constructor({ label, start_collapsed = false, body }: ModularContentConfig) {
    super("rich_text", {
      ...body,
      label,
      appearance: {
        editor: "rich_text",
        parameters: {
          start_collapsed,
        },
        addons: body?.addons || [],
      },
    });
  }
}
