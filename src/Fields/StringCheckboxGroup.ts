import Field from "./Field";
import type { JsonBody } from "./Json";

export type StringCheckboxGroupConfig = {
  label: string;
  /**
   * The different select options.
   */
  options: Array<{
    label: string;
    value: string;
    hint?: string;
  }>;
  body?: JsonBody;
};

export default class StringCheckboxGroup extends Field {
  constructor({ label, options, body }: StringCheckboxGroupConfig) {
    super("json", {
      ...body,
      label,
      appearance: {
        editor: "string_checkbox_group",
        parameters: {
          options,
        },
        addons: body?.addons || [],
      },
    });
  }
}
