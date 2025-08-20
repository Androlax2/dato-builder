import Field from "./Field";
import type { JsonBody } from "./Json";

export type StringMultiSelectConfig = {
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

export default class StringMultiSelect extends Field {
  constructor({ label, options, body }: StringMultiSelectConfig) {
    super("json", {
      ...body,
      label,
      appearance: {
        editor: "string_multi_select",
        parameters: {
          options,
        },
        addons: body?.addons || [],
      },
    });
  }
}
