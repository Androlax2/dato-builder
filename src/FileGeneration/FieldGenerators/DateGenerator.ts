import { FieldGenerator } from "@/FileGeneration/FieldGenerators/FieldGenerator";
import type { MethodNameToConfig } from "@/types/ItemTypeBuilderFields";

export class DateGenerator extends FieldGenerator<"addDate"> {
  getMethodCallName() {
    return "addDate" as const;
  }

  generateBuildConfig() {
    //console.dir(this.field, { depth: null });

    const config: MethodNameToConfig<"addDate"> = {
      label: this.field.label,
    };
    const body: NonNullable<MethodNameToConfig<"addDate">["body"]> = {
      api_key: this.field.api_key,
    };

    if (this.field.hint) {
      body.hint = this.field.hint;
    }

    // Handle validators
    if (
      this.field.validators &&
      Object.keys(this.field.validators).length > 0
    ) {
      const validators: NonNullable<
        MethodNameToConfig<"addDate">["body"]
      >["validators"] = {};

      // Required validator
      if (this.field.validators.required) {
        validators.required = true;
      }

      // Range validator (min and max)
      if (this.field.validators.date_range) {
        const dateRange = this.field.validators.date_range as {
          min?: string;
          max?: string;
        };

        if (dateRange.min) {
          validators.date_range = {
            min: new Date(dateRange.min),
          };
        }

        if (dateRange.max) {
          validators.date_range = {
            ...validators.date_range,
            max: new Date(dateRange.max),
          };
        }
      }

      body.validators = validators;
    }

    // Handle default value
    if (this.field.default_value) {
      body.default_value = this.field.default_value;
    }

    if (Object.keys(body).length > 0) {
      config.body = body;
    }

    return config;
  }
}
