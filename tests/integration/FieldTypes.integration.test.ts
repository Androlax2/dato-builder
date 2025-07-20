import { exec } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { afterAll, beforeAll, describe, expect, it } from "@jest/globals";

const execAsync = promisify(exec);

describe("Field Types Integration", () => {
  let apiToken: string;
  let tempBlocksPath: string;

  beforeAll(async () => {
    apiToken = process.env.DATOCMS_API_TOKEN!;
    if (!apiToken) {
      throw new Error("DATOCMS_API_TOKEN environment variable is required");
    }

    // Create temporary directory for test blocks
    tempBlocksPath = path.join(process.cwd(), "temp-test-field-blocks");
    await fs.mkdir(tempBlocksPath, { recursive: true });
  });

  afterAll(async () => {
    // Cleanup temp directory
    try {
      await fs.rm(tempBlocksPath, { recursive: true, force: true });
    } catch (error) {
      console.warn("Failed to remove temp directory:", error);
    }
  });

  describe("Text Field Types", () => {
    it("should create blocks with various text field types", async () => {
      const blockContent = `
import { BlockBuilder } from "../../src/index.js";
import type { BuilderContext } from "../../src/types/BuilderContext.js";

export default function buildTextFieldTestBlock({ config }: BuilderContext) {
  return new BlockBuilder({
    name: "Text Field Test Block",
    config,
    options: {
      api_key: "text_field_test_block",
    },
  })
    .addSingleLineString({
      label: "Single Line Text",
      body: {
        api_key: "single_line_text",
        validators: {
          required: {},
          length: { min: 1, max: 100 }
        }
      }
    })
    .addMultiLineText({
      label: "Multi Line Text",
      body: {
        api_key: "multi_line_text",
        validators: {
          required: {}
        }
      }
    })
    .addMarkdown({
      label: "Markdown Content",
      body: {
        api_key: "markdown_content"
      },
      toolbar: ["bold", "italic", "link"]
    })
    .addWysiwyg({
      label: "Rich Text",
      body: {
        api_key: "rich_text"
      },
      toolbar: ["format", "bold", "italic", "link"]
    })
    .addTextarea({
      label: "Textarea",
      body: {
        api_key: "textarea_field"
      },
      placeholder: "Enter text here..."
    });
}`;

      const blockPath = path.join(tempBlocksPath, "TextFieldTestBlock.ts");
      await fs.writeFile(blockPath, blockContent);

      const buildCommand = [
        "npx tsx src/cli.ts build",
        `--blocks-path="${tempBlocksPath}"`,
        "--skip-deletion",
      ].join(" ");

      const { stdout } = await execAsync(buildCommand, {
        timeout: 60000,
        env: {
          ...process.env,
          DATOCMS_API_TOKEN: apiToken,
        },
      });

      expect(stdout).toContain("SUCCESS");
      expect(stdout).toContain("TextFieldTestBlock");
    }, 60000);
  });

  describe("Numeric Field Types", () => {
    it("should create blocks with numeric field types", async () => {
      const blockContent = `
import { BlockBuilder } from "../../src/index.js";
import type { BuilderContext } from "../../src/types/BuilderContext.js";

export default function buildNumericFieldTestBlock({ config }: BuilderContext) {
  return new BlockBuilder({
    name: "Numeric Field Test Block",
    config,
    options: {
      api_key: "numeric_field_test_block",
    },
  })
    .addInteger({
      label: "Integer Field",
      body: {
        api_key: "integer_field",
        validators: {
          required: {},
          number_range: { min: 1, max: 100 }
        }
      }
    })
    .addFloat({
      label: "Float Field",
      body: {
        api_key: "float_field",
        validators: {
          number_range: { min: 0.0, max: 10.0 }
        }
      }
    });
}`;

      const blockPath = path.join(tempBlocksPath, "NumericFieldTestBlock.ts");
      await fs.writeFile(blockPath, blockContent);

      const buildCommand = [
        "npx tsx src/cli.ts build",
        `--blocks-path="${tempBlocksPath}"`,
        "--skip-deletion",
      ].join(" ");

      const { stdout } = await execAsync(buildCommand, {
        timeout: 60000,
        env: {
          ...process.env,
          DATOCMS_API_TOKEN: apiToken,
        },
      });

      expect(stdout).toContain("SUCCESS");
      expect(stdout).toContain("NumericFieldTestBlock");
    }, 60000);
  });

  describe("Date and Time Field Types", () => {
    it("should create blocks with date and time fields", async () => {
      const blockContent = `
import { BlockBuilder } from "../../src/index.js";
import type { BuilderContext } from "../../src/types/BuilderContext.js";

export default function buildDateTimeFieldTestBlock({ config }: BuilderContext) {
  return new BlockBuilder({
    name: "DateTime Field Test Block",
    config,
    options: {
      api_key: "datetime_field_test_block",
    },
  })
    .addDate({
      label: "Date Field",
      body: {
        api_key: "date_field",
        validators: {
          required: {},
          date_range: {
            min: new Date("2024-01-01"),
            max: new Date("2025-12-31")
          }
        }
      }
    })
    .addDateTime({
      label: "DateTime Field",
      body: {
        api_key: "datetime_field",
        validators: {
          date_time_range: {
            min: new Date("2024-01-01T00:00:00Z")
          }
        }
      }
    });
}`;

      const blockPath = path.join(tempBlocksPath, "DateTimeFieldTestBlock.ts");
      await fs.writeFile(blockPath, blockContent);

      const buildCommand = [
        "npx tsx src/cli.ts build",
        `--blocks-path="${tempBlocksPath}"`,
        "--skip-deletion",
      ].join(" ");

      const { stdout } = await execAsync(buildCommand, {
        timeout: 60000,
        env: {
          ...process.env,
          DATOCMS_API_TOKEN: apiToken,
        },
      });

      expect(stdout).toContain("SUCCESS");
      expect(stdout).toContain("DateTimeFieldTestBlock");
    }, 60000);
  });

  describe("Boolean Field Types", () => {
    it("should create blocks with boolean fields", async () => {
      const blockContent = `
import { BlockBuilder } from "../../src/index.js";
import type { BuilderContext } from "../../src/types/BuilderContext.js";

export default function buildBooleanFieldTestBlock({ config }: BuilderContext) {
  return new BlockBuilder({
    name: "Boolean Field Test Block",
    config,
    options: {
      api_key: "boolean_field_test_block",
    },
  })
    .addBoolean({
      label: "Boolean Field",
      body: {
        api_key: "boolean_field",
        validators: {
          required: {}
        }
      }
    })
    .addBooleanRadioGroup({
      label: "Boolean Radio Group",
      body: {
        api_key: "boolean_radio_group"
      },
      positive_radio: { label: "Yes" },
      negative_radio: { label: "No" }
    });
}`;

      const blockPath = path.join(tempBlocksPath, "BooleanFieldTestBlock.ts");
      await fs.writeFile(blockPath, blockContent);

      const buildCommand = [
        "npx tsx src/cli.ts build",
        `--blocks-path="${tempBlocksPath}"`,
        "--skip-deletion",
      ].join(" ");

      const { stdout } = await execAsync(buildCommand, {
        timeout: 60000,
        env: {
          ...process.env,
          DATOCMS_API_TOKEN: apiToken,
        },
      });

      expect(stdout).toContain("SUCCESS");
      expect(stdout).toContain("BooleanFieldTestBlock");
    }, 60000);
  });

  describe("Media Field Types", () => {
    it("should create blocks with media fields", async () => {
      const blockContent = `
import { BlockBuilder } from "../../src/index.js";
import type { BuilderContext } from "../../src/types/BuilderContext.js";

export default function buildMediaFieldTestBlock({ config }: BuilderContext) {
  return new BlockBuilder({
    name: "Media Field Test Block",
    config,
    options: {
      api_key: "media_field_test_block",
    },
  })
    .addSingleAsset({
      label: "Single Asset",
      body: {
        api_key: "single_asset",
        validators: {
          required: {},
          extension: { predefined_list: "image" },
          file_size: { max_value: 5, max_unit: "MB" }
        }
      }
    })
    .addAssetGallery({
      label: "Asset Gallery",
      body: {
        api_key: "asset_gallery",
        validators: {
          size: { min: 1, max: 10 },
          extension: { predefined_list: "image" }
        }
      }
    })
    .addExternalVideo({
      label: "External Video",
      body: {
        api_key: "external_video"
      }
    });
}`;

      const blockPath = path.join(tempBlocksPath, "MediaFieldTestBlock.ts");
      await fs.writeFile(blockPath, blockContent);

      const buildCommand = [
        "npx tsx src/cli.ts build",
        `--blocks-path="${tempBlocksPath}"`,
        "--skip-deletion",
      ].join(" ");

      const { stdout } = await execAsync(buildCommand, {
        timeout: 60000,
        env: {
          ...process.env,
          DATOCMS_API_TOKEN: apiToken,
        },
      });

      expect(stdout).toContain("SUCCESS");
      expect(stdout).toContain("MediaFieldTestBlock");
    }, 60000);
  });

  describe("Special Field Types", () => {
    it("should create blocks with special field types", async () => {
      const blockContent = `
import { BlockBuilder } from "../../src/index.js";
import type { BuilderContext } from "../../src/types/BuilderContext.js";

export default function buildSpecialFieldTestBlock({ config }: BuilderContext) {
  return new BlockBuilder({
    name: "Special Field Test Block",
    config,
    options: {
      api_key: "special_field_test_block",
    },
  })
    .addSlug({
      label: "URL Slug",
      body: {
        api_key: "url_slug",
        validators: {
          required: {},
          slug_format: { predefined_pattern: "webpage_slug" }
        }
      },
      url_prefix: "/blog/"
    })
    .addLocation({
      label: "Location",
      body: {
        api_key: "location_field",
        validators: {
          required: {}
        }
      }
    })
    .addColorPicker({
      label: "Color Picker",
      body: {
        api_key: "color_picker"
      }
    })
    .addJson({
      label: "JSON Field",
      body: {
        api_key: "json_field"
      }
    })
    .addSeo({
      label: "SEO Meta",
      body: {
        api_key: "seo_meta",
        validators: {
          required_seo_fields: { title: true, description: true }
        }
      },
      fields: ["title", "description", "image"],
      previews: ["google", "twitter"]
    });
}`;

      const blockPath = path.join(tempBlocksPath, "SpecialFieldTestBlock.ts");
      await fs.writeFile(blockPath, blockContent);

      const buildCommand = [
        "npx tsx src/cli.ts build",
        `--blocks-path="${tempBlocksPath}"`,
        "--skip-deletion",
      ].join(" ");

      const { stdout } = await execAsync(buildCommand, {
        timeout: 60000,
        env: {
          ...process.env,
          DATOCMS_API_TOKEN: apiToken,
        },
      });

      expect(stdout).toContain("SUCCESS");
      expect(stdout).toContain("SpecialFieldTestBlock");
    }, 60000);
  });

  describe("Field Validation Edge Cases", () => {
    it("should handle complex validation scenarios", async () => {
      const blockContent = `
import { BlockBuilder } from "../../src/index.js";
import type { BuilderContext } from "../../src/types/BuilderContext.js";

export default function buildValidationTestBlock({ config }: BuilderContext) {
  return new BlockBuilder({
    name: "Validation Test Block",
    config,
    options: {
      api_key: "validation_test_block",
    },
  })
    .addSingleLineString({
      label: "Email Field",
      body: {
        api_key: "email_field",
        validators: {
          required: {},
          format: { predefined_pattern: "email" },
          length: { max: 255 }
        }
      }
    })
    .addSingleLineString({
      label: "Enum Field",
      body: {
        api_key: "enum_field",
        validators: {
          required: {},
          enum: { values: ["option1", "option2", "option3"] }
        }
      }
    })
    .addSingleAsset({
      label: "Image with Dimensions",
      body: {
        api_key: "image_with_dimensions",
        validators: {
          required: {},
          extension: { predefined_list: "image" },
          image_dimensions: {
            width_min_value: 300,
            width_max_value: 1920,
            height_min_value: 200,
            height_max_value: 1080
          },
          image_aspect_ratio: {
            eq_ar_numerator: 16,
            eq_ar_denominator: 9
          }
        }
      }
    });
}`;

      const blockPath = path.join(tempBlocksPath, "ValidationTestBlock.ts");
      await fs.writeFile(blockPath, blockContent);

      const buildCommand = [
        "npx tsx src/cli.ts build",
        `--blocks-path="${tempBlocksPath}"`,
        "--skip-deletion",
      ].join(" ");

      const { stdout } = await execAsync(buildCommand, {
        timeout: 60000,
        env: {
          ...process.env,
          DATOCMS_API_TOKEN: apiToken,
        },
      });

      expect(stdout).toContain("SUCCESS");
      expect(stdout).toContain("ValidationTestBlock");
    }, 60000);
  });

  describe("Field Error Scenarios", () => {
    it("should handle invalid field configurations gracefully", async () => {
      const blockContent = `
import { BlockBuilder } from "../../src/index.js";
import type { BuilderContext } from "../../src/types/BuilderContext.js";

export default function buildInvalidFieldTestBlock({ config }: BuilderContext) {
  return new BlockBuilder({
    name: "Invalid Field Test Block",
    config,
    options: {
      api_key: "invalid_field_test_block",
    },
  })
    .addSingleLineString({
      label: "Valid Field",
      body: {
        api_key: "valid_field",
        validators: {
          required: {}
        }
      }
    });
}`;

      const blockPath = path.join(tempBlocksPath, "InvalidFieldTestBlock.ts");
      await fs.writeFile(blockPath, blockContent);

      // First, create the block successfully
      const buildCommand = [
        "npx tsx src/cli.ts build",
        `--blocks-path="${tempBlocksPath}"`,
        "--skip-deletion",
      ].join(" ");

      const { stdout } = await execAsync(buildCommand, {
        timeout: 60000,
        env: {
          ...process.env,
          DATOCMS_API_TOKEN: apiToken,
        },
      });

      expect(stdout).toContain("SUCCESS");
      expect(stdout).toContain("InvalidFieldTestBlock");

      // Now test with duplicate API key scenario by building again
      const { stdout: secondBuildOutput } = await execAsync(buildCommand, {
        timeout: 60000,
        env: {
          ...process.env,
          DATOCMS_API_TOKEN: apiToken,
        },
      });

      expect(secondBuildOutput).toContain("SUCCESS");
    }, 120000);
  });
});
