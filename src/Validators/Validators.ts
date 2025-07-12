import { ConsoleLogger, LogLevel } from "../logger";
import type { DateRangeValidatorConfig } from "./DateRangeValidator";
import DateRangeValidator from "./DateRangeValidator";
import DateTimeRangeValidator, {
  type DateTimeRangeValidatorConfig,
} from "./DateTimeRangeValidator";
import type { DescriptionLengthValidatorConfig } from "./DescriptionLengthValidator";
import DescriptionLengthValidator from "./DescriptionLengthValidator";
import EnumValidator, { type EnumValidatorConfig } from "./EnumValidator";
import ExtensionValidator, {
  type ExtensionValidatorConfig,
} from "./ExtensionValidator";
import type { FileSizeValidatorConfig } from "./FileSizeValidator";
import FileSizeValidator from "./FileSizeValidator";
import FormatValidator, { type FormatValidatorConfig } from "./FormatValidator";
import type { ImageAspectRatioValidatorConfig } from "./ImageAspectRatioValidator";
import ImageAspectRatioValidator from "./ImageAspectRatioValidator";
import type { ImageDimensionsValidatorConfig } from "./ImageDimensionsValidator";
import ImageDimensionsValidator from "./ImageDimensionsValidator";
import type { ItemItemTypeValidatorConfig } from "./ItemItemTypeValidator";
import ItemItemTypeValidator from "./ItemItemTypeValidator";
import type { ItemsItemTypeValidatorConfig } from "./ItemsItemTypeValidator";
import ItemsItemTypeValidator from "./ItemsItemTypeValidator";
import LengthValidator, { type LengthValidatorConfig } from "./LengthValidator";
import NumberRangeValidator, {
  type NumberRangeValidatorConfig,
} from "./NumberRangeValidator";
import type { RequiredAltTitleValidatorConfig } from "./RequiredAltTitleValidator";
import RequiredAltTitleValidator from "./RequiredAltTitleValidator";
import type { RequiredSeoFieldsValidatorConfig } from "./RequiredSeoFieldsValidator";
import RequiredSeoFieldsValidator from "./RequiredSeoFieldsValidator";
import RequiredValidator, {
  type RequiredValidatorConfig,
} from "./RequiredValidator";
import type { RichTextBlocksValidatorConfig } from "./RichTextBlocksValidator";
import RichTextBlocksValidator from "./RichTextBlocksValidator";
import SanitizedHtmlValidator, {
  type SanitizedHtmlValidatorConfig,
} from "./SanitizedHtmlValidator";
import type { SingleBlockBlocksValidatorConfig } from "./SingleBlockBlocksValidator";
import SingleBlockBlocksValidator from "./SingleBlockBlocksValidator";
import type { SizeValidatorConfig } from "./SizeValidator";
import SizeValidator from "./SizeValidator";
import type { SlugFormatValidatorConfig } from "./SlugFormatValidator";
import SlugFormatValidator from "./SlugFormatValidator";
import type { SlugTitleFieldValidatorConfig } from "./SlugTitleFieldValidator";
import SlugTitleFieldValidator from "./SlugTitleFieldValidator";
import type { StructuredTextBlocksValidatorConfig } from "./StructuredTextBlocksValidator";
import StructuredTextBlocksValidator from "./StructuredTextBlocksValidator";
import type { StructuredTextInlineBlocksValidatorConfig } from "./StructuredTextInlineBlocksValidator";
import StructuredTextInlineBlocksValidator from "./StructuredTextInlineBlocksValidator";
import type { StructuredTextLinksValidatorConfig } from "./StructuredTextLinksValidator";
import StructuredTextLinksValidator from "./StructuredTextLinksValidator";
import type { TitleLengthValidatorConfig } from "./TitleLengthValidator";
import TitleLengthValidator from "./TitleLengthValidator";
import type { Validator } from "./types";
import UniqueValidator, { type UniqueValidatorConfig } from "./UniqueValidator";

export type ValidatorConfig = Partial<{
  required: RequiredValidatorConfig;
  number_range: NumberRangeValidatorConfig;
  unique: UniqueValidatorConfig;
  format: FormatValidatorConfig;
  length: LengthValidatorConfig;
  enum: EnumValidatorConfig;
  sanitized_html: SanitizedHtmlValidatorConfig;
  date_range: DateRangeValidatorConfig;
  date_time_range: DateTimeRangeValidatorConfig;
  extension: ExtensionValidatorConfig;
  file_size: FileSizeValidatorConfig;
  slug_format: SlugFormatValidatorConfig;
  image_dimensions: ImageDimensionsValidatorConfig;
  image_aspect_ratio: ImageAspectRatioValidatorConfig;
  item_item_type: ItemItemTypeValidatorConfig;
  items_item_type: ItemsItemTypeValidatorConfig;
  required_alt_title: RequiredAltTitleValidatorConfig;
  required_seo_fields: RequiredSeoFieldsValidatorConfig;
  title_length: TitleLengthValidatorConfig;
  description_length: DescriptionLengthValidatorConfig;
  rich_text_blocks: RichTextBlocksValidatorConfig;
  single_block_blocks: SingleBlockBlocksValidatorConfig;
  structured_text_blocks: StructuredTextBlocksValidatorConfig;
  structured_text_inline_blocks: StructuredTextInlineBlocksValidatorConfig;
  structured_text_links: StructuredTextLinksValidatorConfig;
  size: SizeValidatorConfig;
  slug_title_field: SlugTitleFieldValidatorConfig;
}>;

export default class Validators {
  private validators: Validator[] = [];
  private logger: ConsoleLogger;

  constructor(config: ValidatorConfig = {}) {
    this.logger = new ConsoleLogger(LogLevel.ERROR);
    this.logger.trace("Initializing validators", {
      configKeys: Object.keys(config),
    });

    const validatorMap: {
      [key: string]: {
        ValidatorClass: new (
          // biome-ignore lint/suspicious/noExplicitAny: any is used here to allow for different validator classes
          config: any,
        ) => Validator;
        // biome-ignore lint/suspicious/noExplicitAny: any is used here to allow for different validator configs
        config: any;
      };
    } = {
      required: { ValidatorClass: RequiredValidator, config: config.required },
      number_range: {
        ValidatorClass: NumberRangeValidator,
        config: config.number_range,
      },
      unique: { ValidatorClass: UniqueValidator, config: config.unique },
      format: { ValidatorClass: FormatValidator, config: config.format },
      length: { ValidatorClass: LengthValidator, config: config.length },
      enum: { ValidatorClass: EnumValidator, config: config.enum },
      sanitized_html: {
        ValidatorClass: SanitizedHtmlValidator,
        config: config.sanitized_html,
      },
      date_range: {
        ValidatorClass: DateRangeValidator,
        config: config.date_range,
      },
      date_time_range: {
        ValidatorClass: DateTimeRangeValidator,
        config: config.date_time_range,
      },
      extension: {
        ValidatorClass: ExtensionValidator,
        config: config.extension,
      },
      file_size: {
        ValidatorClass: FileSizeValidator,
        config: config.file_size,
      },
      slug_format: {
        ValidatorClass: SlugFormatValidator,
        config: config.slug_format,
      },
      image_dimensions: {
        ValidatorClass: ImageDimensionsValidator,
        config: config.image_dimensions,
      },
      image_aspect_ratio: {
        ValidatorClass: ImageAspectRatioValidator,
        config: config.image_aspect_ratio,
      },
      item_item_type: {
        ValidatorClass: ItemItemTypeValidator,
        config: config.item_item_type,
      },
      items_item_type: {
        ValidatorClass: ItemsItemTypeValidator,
        config: config.items_item_type,
      },
      required_alt_title: {
        ValidatorClass: RequiredAltTitleValidator,
        config: config.required_alt_title,
      },
      required_seo_fields: {
        ValidatorClass: RequiredSeoFieldsValidator,
        config: config.required_seo_fields,
      },
      title_length: {
        ValidatorClass: TitleLengthValidator,
        config: config.title_length,
      },
      description_length: {
        ValidatorClass: DescriptionLengthValidator,
        config: config.description_length,
      },
      rich_text_blocks: {
        ValidatorClass: RichTextBlocksValidator,
        config: config.rich_text_blocks,
      },
      single_block_blocks: {
        ValidatorClass: SingleBlockBlocksValidator,
        config: config.single_block_blocks,
      },
      structured_text_blocks: {
        ValidatorClass: StructuredTextBlocksValidator,
        config: config.structured_text_blocks,
      },
      structured_text_inline_blocks: {
        ValidatorClass: StructuredTextInlineBlocksValidator,
        config: config.structured_text_inline_blocks,
      },
      structured_text_links: {
        ValidatorClass: StructuredTextLinksValidator,
        config: config.structured_text_links,
      },
      size: { ValidatorClass: SizeValidator, config: config.size },
      slug_title_field: {
        ValidatorClass: SlugTitleFieldValidator,
        config: config.slug_title_field,
      },
    };

    for (const [
      key,
      { ValidatorClass, config: validatorConfig },
    ] of Object.entries(validatorMap)) {
      if (validatorConfig !== undefined) {
        try {
          this.logger.trace("Creating validator", {
            key,
            config: validatorConfig,
          });
          const validator = new ValidatorClass(validatorConfig);
          this.validators.push(validator);
        } catch (error) {
          this.logger.error(`Error creating validator for ${key}: ${error}`);
        }
      }
    }

    this.logger.trace("Validators initialization completed", {
      validatorCount: this.validators.length,
    });
  }

  build(): Record<string, object | undefined> {
    this.logger.trace("Building validators configuration");
    const result = this.validators.reduce(
      (result, validator) => {
        result[validator.key] = validator.build();
        return result;
      },
      {} as Record<string, object | undefined>,
    );
    this.logger.trace("Validators configuration built", {
      validatorCount: Object.keys(result).length,
    });
    return result;
  }
}
