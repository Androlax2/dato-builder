import type { BooleanBody } from "./Boolean";
import Field from "./Field";

export type BooleanRadioGroupConfig = {
  label: string;
  positive_radio: { label: string; hint?: string };
  negative_radio: { label: string; hint?: string };
  body?: BooleanBody;
};

export default class BooleanRadioGroup extends Field {
  constructor({
    label,
    positive_radio,
    negative_radio,
    body,
  }: BooleanRadioGroupConfig) {
    super("boolean", {
      ...body,
      label,
      appearance: {
        editor: "boolean_radio_group",
        parameters: {
          positive_radio,
          negative_radio,
        },
        addons: [],
      },
    });
  }
}
