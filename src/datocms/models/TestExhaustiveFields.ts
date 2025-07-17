import ModelBuilder from "../../ModelBuilder";
import type { BuilderContext } from "../../types/BuilderContext";

export default async function buildTestExhaustiveFields({
  config,
  getBlock,
  getModel,
}: BuilderContext) {
  return (
    new ModelBuilder({
      name: "Exhaustive Field Configuration Testing (Models)",
      config,
      body: {
        api_key: "test_exhaustive_fields_model",
        hint: "Tests every possible field configuration combination for models",
        collection_appearance: "table",
        ordering_field: null,
        ordering_direction: null,
        tree: false,
        draft_mode_active: false,
        all_locales_required: false,
      },
    })
      // === TEXT FIELD EXHAUSTIVE TESTING (with unique validator) ===

      // Basic configurations
      .addText({ label: "Text Basic", body: { api_key: "text_basic" } })
      .addText({
        label: "Text With Hint",
        body: { api_key: "text_hint", hint: "This is a hint" },
      })
      .addText({
        label: "Text With Default",
        body: { api_key: "text_default", default_value: "Default text" },
      })

      // Required validator
      .addText({
        label: "Text Required",
        body: { api_key: "text_required", validators: { required: true } },
      })

      // Unique validator (only available for models)
      .addText({
        label: "Text Unique",
        body: { api_key: "text_unique", validators: { unique: true } },
      })
      .addText({
        label: "Text Required + Unique",
        body: {
          api_key: "text_required_unique",
          validators: { required: true, unique: true },
        },
      })

      // Length validators - all combinations
      .addText({
        label: "Text Min Length",
        body: {
          api_key: "text_min_length",
          validators: { length: { min: 5 } },
        },
      })
      .addText({
        label: "Text Max Length",
        body: {
          api_key: "text_max_length",
          validators: { length: { max: 100 } },
        },
      })
      .addText({
        label: "Text Exact Length",
        body: {
          api_key: "text_exact_length",
          validators: { length: { eq: 10 } },
        },
      })
      .addText({
        label: "Text Min Max Length",
        body: {
          api_key: "text_min_max_length",
          validators: { length: { min: 10, max: 50 } },
        },
      })

      // Format validators
      .addText({
        label: "Text Custom Pattern",
        body: {
          api_key: "text_custom_pattern",
          validators: {
            format: { custom_pattern: /^[A-Z][a-z]+$/ },
          },
        },
      })
      .addText({
        label: "Text Phone Pattern",
        body: {
          api_key: "text_phone_pattern",
          validators: {
            format: {
              custom_pattern: /d{3}-d{3}-d{4}/,
              description: "Format: 123-456-7890",
            },
          },
        },
      })

      // Enum validators
      .addText({
        label: "Text Enum",
        body: {
          api_key: "text_enum",
          validators: {
            enum: { values: ["Option A", "Option B", "Option C"] },
          },
        },
      })

      // Complex combinations with unique
      .addText({
        label: "Text Required + Length + Unique",
        body: {
          api_key: "text_required_length_unique",
          validators: {
            required: true,
            length: { min: 5, max: 25 },
            unique: true,
          },
        },
      })
      .addText({
        label: "Text Required + Format + Unique",
        body: {
          api_key: "text_required_format_unique",
          validators: {
            required: true,
            format: { custom_pattern: /^[A-Z]{3}\d{3}$/ },
            unique: true,
          },
        },
      })
      .addText({
        label: "Text All Validators",
        body: {
          api_key: "text_all_validators",
          hint: "Complex validation example",
          default_value: "ABC123",
          validators: {
            required: true,
            length: { min: 6, max: 20 },
            format: { custom_pattern: /^[A-Z]{3}\d{3}$/ },
            enum: { values: ["ABC123", "DEF456", "GHI789"] },
            unique: true,
          },
        },
      })

      // === INTEGER FIELD EXHAUSTIVE TESTING ===

      .addInteger({
        label: "Integer Basic",
        body: { api_key: "integer_basic" },
      })
      .addInteger({
        label: "Integer With Default",
        body: { api_key: "integer_default", default_value: 42 },
      })
      .addInteger({
        label: "Integer Required",
        body: { api_key: "integer_required", validators: { required: true } },
      })
      .addInteger({
        label: "Integer Min Range",
        body: {
          api_key: "integer_min",
          validators: { number_range: { min: 1 } },
        },
      })
      .addInteger({
        label: "Integer Max Range",
        body: {
          api_key: "integer_max",
          validators: { number_range: { max: 100 } },
        },
      })
      .addInteger({
        label: "Integer Min Max Range",
        body: {
          api_key: "integer_min_max",
          validators: { number_range: { min: 10, max: 50 } },
        },
      })
      .addInteger({
        label: "Integer Required + Range",
        body: {
          api_key: "integer_required_range",
          hint: "Number between 1 and 1000",
          default_value: 100,
          validators: { required: true, number_range: { min: 1, max: 1000 } },
        },
      })

      // === FLOAT FIELD EXHAUSTIVE TESTING ===

      .addFloat({ label: "Float Basic", body: { api_key: "float_basic" } })
      .addFloat({
        label: "Float With Default",
        body: { api_key: "float_default", default_value: 3.14 },
      })
      .addFloat({
        label: "Float Required",
        body: { api_key: "float_required", validators: { required: true } },
      })
      .addFloat({
        label: "Float Min Range",
        body: {
          api_key: "float_min",
          validators: { number_range: { min: 0.1 } },
        },
      })
      .addFloat({
        label: "Float Max Range",
        body: {
          api_key: "float_max",
          validators: { number_range: { max: 99.9 } },
        },
      })
      .addFloat({
        label: "Float Min Max Range",
        body: {
          api_key: "float_min_max",
          validators: { number_range: { min: 1.5, max: 10.5 } },
        },
      })
      .addFloat({
        label: "Float Required + Range",
        body: {
          api_key: "float_required_range",
          hint: "Decimal between 0.1 and 100.0",
          default_value: 50.0,
          validators: {
            required: true,
            number_range: { min: 0.1, max: 100.0 },
          },
        },
      })

      // === DATE FIELD EXHAUSTIVE TESTING ===

      .addDate({ label: "Date Basic", body: { api_key: "date_basic" } })
      .addDate({
        label: "Date With Default",
        body: { api_key: "date_default", default_value: "2024-01-01" },
      })
      .addDate({
        label: "Date Required",
        body: { api_key: "date_required", validators: { required: true } },
      })
      .addDate({
        label: "Date Min Range",
        body: {
          api_key: "date_min",
          validators: { date_range: { min: new Date("2024-01-01") } },
        },
      })
      .addDate({
        label: "Date Max Range",
        body: {
          api_key: "date_max",
          validators: { date_range: { max: new Date("2024-12-31") } },
        },
      })
      .addDate({
        label: "Date Min Max Range",
        body: {
          api_key: "date_min_max",
          validators: {
            date_range: {
              min: new Date("2024-06-01"),
              max: new Date("2024-08-31"),
            },
          },
        },
      })
      .addDate({
        label: "Date Required + Range",
        body: {
          api_key: "date_required_range",
          hint: "Date in 2024 only",
          default_value: "2024-07-01",
          validators: {
            required: true,
            date_range: {
              min: new Date("2024-01-01"),
              max: new Date("2024-12-31"),
            },
          },
        },
      })

      // === DATETIME FIELD EXHAUSTIVE TESTING ===

      .addDateTime({
        label: "DateTime Basic",
        body: { api_key: "datetime_basic" },
      })
      .addDateTime({
        label: "DateTime With Default",
        body: {
          api_key: "datetime_default",
          default_value: "2024-01-01T12:00:00Z",
        },
      })
      .addDateTime({
        label: "DateTime Required",
        body: { api_key: "datetime_required", validators: { required: true } },
      })
      .addDateTime({
        label: "DateTime Min Range",
        body: {
          api_key: "datetime_min",
          validators: {
            date_time_range: { min: new Date("2024-01-01T00:00:00Z") },
          },
        },
      })
      .addDateTime({
        label: "DateTime Max Range",
        body: {
          api_key: "datetime_max",
          validators: {
            date_time_range: { max: new Date("2024-12-31T23:59:59Z") },
          },
        },
      })
      .addDateTime({
        label: "DateTime Required + Range",
        body: {
          api_key: "datetime_required_range",
          hint: "DateTime in first quarter 2024",
          default_value: "2024-02-15T12:00:00Z",
          validators: {
            required: true,
            date_time_range: {
              min: new Date("2024-01-01T00:00:00Z"),
              max: new Date("2024-03-31T23:59:59Z"),
            },
          },
        },
      })

      // === BOOLEAN FIELD EXHAUSTIVE TESTING ===

      .addBoolean({
        label: "Boolean Basic",
        body: { api_key: "boolean_basic" },
      })
      .addBoolean({
        label: "Boolean Default True",
        body: { api_key: "boolean_default_true", default_value: true },
      })
      .addBoolean({
        label: "Boolean Default False",
        body: { api_key: "boolean_default_false", default_value: false },
      })
      .addBoolean({
        label: "Boolean With Hint",
        body: {
          api_key: "boolean_hint",
          hint: "Check this box to enable feature",
        },
      })

      // === CHOICE FIELD EXHAUSTIVE TESTING ===

      .addStringSelect({
        label: "String Select Basic",
        options: [
          { label: "Option 1", value: "option1" },
          { label: "Option 2", value: "option2" },
          { label: "Option 3", value: "option3" },
        ],
        body: { api_key: "string_select_basic" },
      })
      .addStringSelect({
        label: "String Select Required",
        options: [
          { label: "Red", value: "red", hint: "The color red" },
          { label: "Green", value: "green", hint: "The color green" },
          { label: "Blue", value: "blue", hint: "The color blue" },
        ],
        body: {
          api_key: "string_select_required",
          hint: "Choose your favorite color",
          validators: { required: true },
        },
      })
      .addStringSelect({
        label: "String Select Unique",
        options: [
          { label: "Alpha", value: "alpha" },
          { label: "Beta", value: "beta" },
          { label: "Gamma", value: "gamma" },
        ],
        body: {
          api_key: "string_select_unique",
          hint: "Must be unique across all records",
          validators: { unique: true },
        },
      })
      .addStringSelect({
        label: "String Select Required + Unique",
        options: [
          { label: "Primary", value: "primary" },
          { label: "Secondary", value: "secondary" },
          { label: "Tertiary", value: "tertiary" },
        ],
        body: {
          api_key: "string_select_required_unique",
          hint: "Required and unique selection",
          validators: { required: true, unique: true },
        },
      })

      .addStringRadioGroup({
        label: "String Radio Basic",
        radios: [
          { label: "Small", value: "s" },
          { label: "Medium", value: "m" },
          { label: "Large", value: "l" },
        ],
        body: { api_key: "string_radio_basic" },
      })
      .addStringRadioGroup({
        label: "String Radio Required + Unique",
        radios: [
          { label: "High Priority", value: "high", hint: "Urgent items" },
          { label: "Medium Priority", value: "medium", hint: "Standard items" },
          { label: "Low Priority", value: "low", hint: "Future items" },
        ],
        body: {
          api_key: "string_radio_required_unique",
          hint: "Select unique priority level",
          validators: { required: true, unique: true },
        },
      })

      // === EMAIL/URL FIELD EXHAUSTIVE TESTING (with unique) ===

      .addEmail({ label: "Email Basic", body: { api_key: "email_basic" } })
      .addEmail({
        label: "Email Required",
        body: { api_key: "email_required", validators: { required: true } },
      })
      .addEmail({
        label: "Email Unique",
        body: { api_key: "email_unique", validators: { unique: true } },
      })
      .addEmail({
        label: "Email With Length",
        body: {
          api_key: "email_length",
          validators: { length: { min: 5, max: 100 } },
        },
      })
      .addEmail({
        label: "Email All Validators",
        body: {
          api_key: "email_all_validators",
          hint: "Valid unique email address required",
          default_value: "user@example.com",
          validators: {
            required: true,
            length: { min: 10, max: 50 },
            unique: true,
          },
        },
      })

      .addUrl({ label: "URL Basic", body: { api_key: "url_basic" } })
      .addUrl({
        label: "URL Required",
        body: { api_key: "url_required", validators: { required: true } },
      })
      .addUrl({
        label: "URL Unique",
        body: { api_key: "url_unique", validators: { unique: true } },
      })
      .addUrl({
        label: "URL With Length",
        body: {
          api_key: "url_length",
          validators: { length: { min: 10, max: 200 } },
        },
      })
      .addUrl({
        label: "URL All Validators",
        body: {
          api_key: "url_all_validators",
          hint: "Valid unique URL required",
          default_value: "https://example.com",
          validators: {
            required: true,
            length: { min: 10, max: 100 },
            unique: true,
          },
        },
      })

      // === MULTILINE TEXT EXHAUSTIVE TESTING ===

      .addMultiLineText({
        label: "MultiLine Basic",
        body: { api_key: "multiline_basic" },
      })
      .addMultiLineText({
        label: "MultiLine Required",
        body: { api_key: "multiline_required", validators: { required: true } },
      })
      .addMultiLineText({
        label: "MultiLine Length",
        body: {
          api_key: "multiline_length",
          validators: { length: { min: 10, max: 500 } },
        },
      })
      .addMultiLineText({
        label: "MultiLine All Validators",
        body: {
          api_key: "multiline_all_validators",
          hint: "Multi-line text with validation",
          default_value: "This is a multi-line text\nwith line breaks",
          validators: {
            required: true,
            length: { min: 20, max: 1000 },
            format: {
              custom_pattern: /.*\n.*/,
              description: "Must contain line breaks",
            },
          },
        },
      })

      // === ADDITIONAL FIELD TYPES FOR COMPREHENSIVE TESTING ===

      .addSlug({ label: "Slug Basic", body: { api_key: "slug_basic" } })
      .addSlug({
        label: "Slug Required",
        body: { api_key: "slug_required", validators: { required: true } },
      })
      .addSlug({ label: "Slug Unique", body: { api_key: "slug_unique" } })

      .addLocation({
        label: "Location Basic",
        body: { api_key: "location_basic" },
      })
      .addLocation({
        label: "Location Required",
        body: { api_key: "location_required", validators: { required: true } },
      })

      .addColorPicker({
        label: "Color Basic",
        body: { api_key: "color_basic" },
      })
      .addColorPicker({
        label: "Color Required",
        body: { api_key: "color_required", validators: { required: true } },
      })
      .addColorPicker({
        label: "Color With Alpha",
        enable_alpha: true,
        body: { api_key: "color_alpha" },
      })
      .addColorPicker({
        label: "Color Full Config",
        enable_alpha: true,
        preset_colors: ["#FF0000", "#00FF00", "#0000FF"],
        body: {
          api_key: "color_full_config",
          hint: "Color picker with presets and alpha",
          validators: { required: true },
        },
      })

      .addSingleAsset({
        label: "Single Asset Basic",
        body: { api_key: "single_asset_basic" },
      })
      .addSingleAsset({
        label: "Single Asset Required",
        body: {
          api_key: "single_asset_required",
          validators: { required: true },
        },
      })

      .addImage({ label: "Image Basic", body: { api_key: "image_basic" } })
      .addImage({
        label: "Image Required",
        body: { api_key: "image_required", validators: { required: true } },
      })

      .addAssetGallery({
        label: "Asset Gallery Basic",
        body: { api_key: "asset_gallery_basic" },
      })
      .addAssetGallery({
        label: "Asset Gallery Required",
        body: { api_key: "asset_gallery_required" },
      })

      .addExternalVideo({
        label: "External Video Basic",
        body: { api_key: "external_video_basic" },
      })
      .addExternalVideo({
        label: "External Video Required",
        body: {
          api_key: "external_video_required",
          validators: { required: true },
        },
      })

      .addJson({ label: "JSON Basic", body: { api_key: "json_basic" } })
      .addJson({
        label: "JSON Required",
        body: { api_key: "json_required", validators: { required: true } },
      })

      .addSeo({ label: "SEO Basic", body: { api_key: "seo_basic" } })
      .addSeo({ label: "SEO Required", body: { api_key: "seo_required" } })

      // === MISSING FIELD TYPES - COMPREHENSIVE COVERAGE (with unique validators) ===

      // Heading fields
      .addHeading({
        label: "Heading Basic",
        body: { api_key: "heading_basic" },
      })
      .addHeading({
        label: "Heading Required",
        body: { api_key: "heading_required", validators: { required: true } },
      })
      .addHeading({
        label: "Heading Length + Unique",
        body: {
          api_key: "heading_length_unique",
          validators: { length: { max: 60 }, unique: true },
        },
      })

      // Textarea fields
      .addTextarea({
        label: "Textarea Basic",
        body: { api_key: "textarea_basic" },
      })
      .addTextarea({
        label: "Textarea Required",
        body: { api_key: "textarea_required", validators: { required: true } },
      })
      .addTextarea({
        label: "Textarea Length",
        body: {
          api_key: "textarea_length",
          validators: { length: { min: 10, max: 500 } },
        },
      })

      // Markdown fields
      .addMarkdown({
        label: "Markdown Basic",
        toolbar: [
          "heading",
          "bold",
          "italic",
          "strikethrough",
          "code",
          "unordered_list",
          "ordered_list",
          "quote",
          "link",
          "image",
          "fullscreen",
        ],
        body: { api_key: "markdown_basic" },
      })
      .addMarkdown({
        label: "Markdown Required",
        toolbar: [
          "heading",
          "bold",
          "italic",
          "strikethrough",
          "code",
          "unordered_list",
          "ordered_list",
          "quote",
          "link",
          "image",
          "fullscreen",
        ],
        body: { api_key: "markdown_required", validators: { required: true } },
      })
      .addMarkdown({
        label: "Markdown Full Toolbar",
        toolbar: [
          "heading",
          "bold",
          "italic",
          "strikethrough",
          "code",
          "unordered_list",
          "ordered_list",
          "quote",
          "link",
          "image",
          "fullscreen",
        ],
        body: {
          api_key: "markdown_full_toolbar",
          validators: { length: { min: 20, max: 2000 } },
        },
      })

      // WYSIWYG fields
      .addWysiwyg({
        label: "WYSIWYG Basic",
        toolbar: [
          "format",
          "bold",
          "italic",
          "strikethrough",
          "code",
          "ordered_list",
          "unordered_list",
          "quote",
          "table",
          "link",
          "image",
          "show_source",
          "undo",
          "redo",
          "align_left",
          "align_center",
          "align_right",
          "align_justify",
          "outdent",
          "indent",
          "fullscreen",
        ],
        body: { api_key: "wysiwyg_basic" },
      })
      .addWysiwyg({
        label: "WYSIWYG Required",
        toolbar: [
          "format",
          "bold",
          "italic",
          "strikethrough",
          "code",
          "ordered_list",
          "unordered_list",
          "quote",
          "table",
          "link",
          "image",
          "show_source",
          "undo",
          "redo",
          "align_left",
          "align_center",
          "align_right",
          "align_justify",
          "outdent",
          "indent",
          "fullscreen",
        ],
        body: { api_key: "wysiwyg_required", validators: { required: true } },
      })
      .addWysiwyg({
        label: "WYSIWYG Full Toolbar",
        toolbar: [
          "format",
          "bold",
          "italic",
          "strikethrough",
          "code",
          "ordered_list",
          "unordered_list",
          "quote",
          "table",
          "link",
          "image",
          "show_source",
          "undo",
          "redo",
          "align_left",
          "align_center",
          "align_right",
          "align_justify",
          "outdent",
          "indent",
          "fullscreen",
        ],
        body: {
          api_key: "wysiwyg_full_toolbar",
          validators: { length: { min: 50, max: 5000 } },
        },
      })

      // Boolean radio group fields
      .addBooleanRadioGroup({
        label: "Boolean Radio Basic",
        positive_radio: { label: "Yes" },
        negative_radio: { label: "No" },
        body: { api_key: "boolean_radio_basic" },
      })
      .addBooleanRadioGroup({
        label: "Boolean Radio Custom",
        positive_radio: { label: "Yes", hint: "Choose yes" },
        negative_radio: { label: "No", hint: "Choose no" },
        body: { api_key: "boolean_radio_custom", hint: "Select yes or no" },
      })

      // String multi-select fields
      .addStringMultiSelect({
        label: "String Multi Basic",
        options: [
          { label: "Option 1", value: "opt1" },
          { label: "Option 2", value: "opt2" },
          { label: "Option 3", value: "opt3" },
        ],
        body: { api_key: "string_multi_basic" },
      })
      .addStringMultiSelect({
        label: "String Multi Required",
        options: [
          { label: "Red", value: "red" },
          { label: "Green", value: "green" },
          { label: "Blue", value: "blue" },
        ],
        body: {
          api_key: "string_multi_required",
          validators: { required: true },
        },
      })

      // String checkbox group fields
      .addStringCheckboxGroup({
        label: "String Checkbox Basic",
        options: [
          { label: "Feature A", value: "feat_a" },
          { label: "Feature B", value: "feat_b" },
          { label: "Feature C", value: "feat_c" },
        ],
        body: { api_key: "string_checkbox_basic" },
      })
      .addStringCheckboxGroup({
        label: "String Checkbox Required",
        options: [
          { label: "High", value: "high" },
          { label: "Medium", value: "medium" },
          { label: "Low", value: "low" },
        ],
        body: {
          api_key: "string_checkbox_required",
          validators: { required: true },
        },
      })

      // Link fields (with unique validators)
      .addLink({
        label: "Link Basic",
        body: {
          api_key: "link_basic",
          validators: {
            item_item_type: {
              item_types: [await getModel("TestReferenceModel")],
            },
          },
        },
      })
      .addLink({
        label: "Link Required",
        body: {
          api_key: "link_required",
          validators: {
            required: true,
            item_item_type: {
              item_types: [await getModel("TestReferenceModel")],
            },
          },
        },
      })
      .addLink({
        label: "Link Unique",
        body: {
          api_key: "link_unique",
          validators: {
            unique: true,
            item_item_type: {
              item_types: [await getModel("TestReferenceModel")],
            },
          },
        },
      })
      .addLink({
        label: "Link Compact + Unique",
        appearance: "compact",
        body: {
          api_key: "link_compact_unique",
          hint: "Compact appearance",
          validators: {
            unique: true,
            item_item_type: {
              item_types: [await getModel("TestReferenceModel")],
            },
          },
        },
      })
      .addLink({
        label: "Link Expanded + Required",
        appearance: "expanded",
        body: {
          api_key: "link_expanded_required",
          hint: "Expanded appearance",
          validators: {
            required: true,
            item_item_type: {
              item_types: [await getModel("TestReferenceModel")],
            },
          },
        },
      })

      // Links fields
      .addLinks({
        label: "Links Basic",
        body: {
          api_key: "links_basic",
          validators: {
            items_item_type: {
              item_types: [await getModel("TestReferenceModel")],
            },
          },
        },
      })
      .addLinks({
        label: "Links Required",
        body: {
          api_key: "links_required",
          validators: {
            items_item_type: {
              item_types: [await getModel("TestReferenceModel")],
            },
          },
        },
      })
      .addLinks({
        label: "Links Compact",
        appearance: "compact",
        body: {
          api_key: "links_compact",
          validators: {
            size: { min: 1, max: 5 },
            items_item_type: {
              item_types: [await getModel("TestReferenceModel")],
            },
          },
        },
      })
      .addLinks({
        label: "Links Expanded",
        appearance: "expanded",
        body: {
          api_key: "links_expanded",
          validators: {
            size: { min: 2, max: 10 },
            items_item_type: {
              item_types: [await getModel("TestReferenceModel")],
            },
          },
        },
      })

      // Modular content fields
      .addModularContent({
        label: "Modular Content Basic",
        body: {
          api_key: "modular_content_basic",
          validators: {
            rich_text_blocks: {
              item_types: [await getBlock("TestReferenceBlock")],
            },
          },
        },
      })
      .addModularContent({
        label: "Modular Content Required",
        body: {
          api_key: "modular_content_required",
          validators: {
            rich_text_blocks: {
              item_types: [await getBlock("TestReferenceBlock")],
            },
          },
        },
      })
      .addModularContent({
        label: "Modular Content Collapsed",
        start_collapsed: true,
        body: {
          api_key: "modular_content_collapsed",
          validators: {
            size: { min: 1, max: 20 },
            rich_text_blocks: {
              item_types: [await getBlock("TestReferenceBlock")],
            },
          },
        },
      })

      // Single block fields
      .addSingleBlock({
        label: "Single Block Basic",
        body: {
          api_key: "single_block_basic",
          validators: {
            single_block_blocks: {
              item_types: [await getBlock("TestReferenceBlock")],
            },
          },
        },
      })
      .addSingleBlock({
        label: "Single Block Required",
        body: {
          api_key: "single_block_required",
          validators: {
            required: true,
            single_block_blocks: {
              item_types: [await getBlock("TestReferenceBlock")],
            },
          },
        },
      })
      .addSingleBlock({
        label: "Single Block Framed",
        type: "framed_single_block",
        body: {
          api_key: "single_block_framed",
          hint: "Framed appearance",
          validators: {
            single_block_blocks: {
              item_types: [await getBlock("TestReferenceBlock")],
            },
          },
        },
      })
      .addSingleBlock({
        label: "Single Block Frameless",
        type: "frameless_single_block",
        start_collapsed: true,
        body: {
          api_key: "single_block_frameless",
          hint: "Frameless appearance",
          validators: {
            single_block_blocks: {
              item_types: [await getBlock("TestReferenceBlock")],
            },
          },
        },
      })

      // Structured text fields
      .addStructuredText({
        label: "Structured Text Basic",
        body: { api_key: "structured_text_basic" },
      })
      .addStructuredText({
        label: "Structured Text Required",
        body: {
          api_key: "structured_text_required",
          validators: {
            length: { min: 1, max: 10000 },
          },
        },
      })
      .addStructuredText({
        label: "Structured Text Full Config",
        nodes: [
          "blockquote",
          "code",
          "heading",
          "link",
          "list",
          "thematicBreak",
        ],
        marks: [
          "strong",
          "emphasis",
          "underline",
          "strikethrough",
          "code",
          "highlight",
        ],
        heading_levels: [1, 2, 3, 4, 5, 6],
        blocks_start_collapsed: true,
        show_links_target_blank: true,
        show_links_meta_editor: true,
        body: {
          api_key: "structured_text_full_config",
          hint: "Full structured text configuration",
          validators: {
            length: { min: 100, max: 10000 },
          },
        },
      })
  );
}
