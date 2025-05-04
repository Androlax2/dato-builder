import type { ValidatorConfig } from "../Validators/Validators";
import Field, { type FieldBody } from "./Field";

export type ColorPickerBody = Omit<FieldBody, "label"> & {
  validators?: Pick<ValidatorConfig, "required">;
};

export type ColorPickerConfig = {
  label: string;
  /**
   * Should the color picker allow to specify the alpha value?
   * @default false
   */
  enable_alpha?: boolean;
  /**
   * List of preset colors to offer to the user
   * @default []
   * @example ["#FF0000", "#00FF00", "#0000FF"]
   */
  preset_colors?: string[];
  body?: ColorPickerBody;
};

export default class ColorPicker extends Field {
  constructor({
    label,
    enable_alpha = false,
    preset_colors = [],
    body,
  }: ColorPickerConfig) {
    super("color", {
      ...body,
      label,
      appearance: {
        editor: "color_picker",
        parameters: {
          enable_alpha,
          preset_colors,
        },
        addons: [],
      },
    });
  }
}
