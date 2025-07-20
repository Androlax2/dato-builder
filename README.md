# Dato Builder

**TypeScript-powered DatoCMS schema builder with fluent API for rapid content model development**

[![npm version](https://img.shields.io/npm/v/dato-builder.svg)](https://www.npmjs.com/package/dato-builder)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

Quickly create Models, Blocks, and content structures in DatoCMS from your TypeScript source code with concurrent builds, interactive generation, and comprehensive validation.

## Table of Contents

- [Installation](#installation)
- [Configuration](#configuration)
- [CLI Commands](#cli-commands)
- [Usage](#usage)
  - [1. Define a Block](#1-define-a-block)
  - [2. Generate Files Quickly](#2-generate-files-quickly)
  - [3. Define a Model](#3-define-a-model)
  - [4. Build Everything](#4-build-everything)
- [Comprehensive Field \& Validator Reference](#comprehensive-field--validator-reference)
  - [Text Fields](#text-fields)
    - [`SingleLineString`](#singlelinestring)
    - [`MultiLineText`](#multilinetext)
    - [`Markdown`](#markdown)
    - [`Wysiwyg`](#wysiwyg)
    - [`Textarea`](#textarea)
  - [Numeric Fields](#numeric-fields)
    - [`Integer`](#integer)
    - [`Float`](#float)
  - [Boolean Fields](#boolean-fields)
    - [`Boolean`](#boolean)
    - [`BooleanRadioGroup`](#booleanradiogroup)
  - [Date \& Time Fields](#date--time-fields)
    - [`DateField`](#datefield)
    - [`DateTime`](#datetime)
  - [Media Fields](#media-fields)
    - [`SingleAsset`](#singleasset)
    - [`AssetGallery`](#assetgallery)
    - [`ExternalVideo`](#externalvideo)
  - [Link Fields](#link-fields)
    - [`Link`](#link)
    - [`Links`](#links)
  - [Structural Fields](#structural-fields)
    - [`Slug`](#slug)
    - [`Location`](#location)
    - [ModularContent](#modularcontent)
    - [SingleBlock](#singleblock)
    - [StructuredText](#structuredtext)
    - [`Seo`](#seo)
  - [Aliases](#aliases)
  - [Validators Appendix](#validators-appendix)
    - [`date_range`](#date_range)
    - [`date_time_range`](#date_time_range)
    - [`enum`](#enum)
    - [`extension`](#extension)
    - [`file_size`](#file_size)
    - [`format`](#format)
    - [`slug_format`](#slug_format)
    - [`image_dimensions`](#image_dimensions)
    - [`image_aspect_ratio`](#image_aspect_ratio)
    - [`item_item_type`](#item_item_type)
    - [`items_item_type`](#items_item_type)
    - [`length`](#length)
    - [`number_range`](#number_range)
    - [`required`](#required)
    - [`required_alt_title`](#required_alt_title)
    - [`required_seo_fields`](#required_seo_fields)
    - [`title_length`](#title_length)
    - [`description_length`](#description_length)
    - [`rich_text_blocks`](#rich_text_blocks)
    - [`single_block_blocks`](#single_block_blocks)
    - [`sanitized_html`](#sanitized_html)
    - [`structured_text_blocks`](#structured_text_blocks)
    - [`structured_text_inline_blocks`](#structured_text_inline_blocks)
    - [`structured_text_links`](#structured_text_links)
  - [Type Compatibility Matrix](#type-compatibility-matrix)

## Installation

```bash
npm install --save-dev dato-builder
```

## Configuration

### Quick Setup

Create a `dato-builder.config.js` in your project root:

```javascript
/** @type {import("dato-builder").DatoBuilderConfig} */
const config = {
  apiToken: process.env.DATO_CMA_TOKEN,
  overwriteExistingFields: false,
  blockApiKeySuffix: "block",
};

export default config;
```

### Complete Configuration Reference

#### Required Configuration

| Option     | Type     | Description                                                                                                             |
|------------|----------|-------------------------------------------------------------------------------------------------------------------------|
| `apiToken` | `string` | **Required.** Your DatoCMS Content Management API token. Find this in your DatoCMS project settings under "API tokens". |

#### Optional Configuration

| Option                    | Type             | Default              | Description                                                                          |
|---------------------------|------------------|----------------------|--------------------------------------------------------------------------------------|
| `overwriteExistingFields` | `boolean`        | `false`              | Controls field update behavior (see [Field Update Behavior](#field-update-behavior)) |
| `modelApiKeySuffix`       | `string \| null` | `"model"`            | Suffix for model API keys (e.g., "page" → "page_model")                              |
| `blockApiKeySuffix`       | `string \| null` | `"block"`            | Suffix for block API keys (e.g., "hero" → "hero_block")                              |
| `modelsPath`              | `string`         | `"./datocms/models"` | Path where CLI searches for model definitions                                        |
| `blocksPath`              | `string`         | `"./datocms/blocks"` | Path where CLI searches for block definitions                                        |
| `logLevel`                | `LogLevel`       | `LogLevel.INFO`      | Minimum logging level (see [Logging Configuration](#logging-configuration))          |

### Field Update Behavior

The `overwriteExistingFields` option controls how dato-builder handles existing fields in DatoCMS:

#### `false` (Default - Safe Mode)
```javascript
/** @type {import("dato-builder").DatoBuilderConfig} */
const config = {
  overwriteExistingFields: false, // Safe: preserve manual changes
};

export default config;
```
- ✅ **New fields**: Created as defined in code
- ✅ **Removed fields**: Deleted from DatoCMS
- 🔒 **Existing fields**: Left untouched (preserves manual dashboard changes)
- **Use case**: Development workflows where content editors make manual adjustments

#### `true` (Sync Mode)
```javascript
/** @type {import("dato-builder").DatoBuilderConfig} */
const config = {
  overwriteExistingFields: true, // Sync: code is source of truth
};

export default config;
```
- ✅ **New fields**: Created as defined in code
- ✅ **Removed fields**: Deleted from DatoCMS
- ⚠️ **Existing fields**: Updated to match code (overwrites manual changes)
- **Use case**: Production deployments where code definitions are authoritative

### Configuration File Formats

#### JavaScript Configuration
```javascript
/** @type {import("dato-builder").DatoBuilderConfig} */
const config = {
  apiToken: process.env.DATO_CMA_TOKEN,
  overwriteExistingFields: false,
  // ... other options
};

export default config;
```

#### TypeScript Configuration
```typescript
// dato-builder.config.ts
import type { DatoBuilderConfig } from "dato-builder";

const config: DatoBuilderConfig = {
  apiToken: process.env.DATO_CMA_TOKEN!,
  overwriteExistingFields: false,
  // ... other options
};

export default config;
```

### Logging Configuration

Configure logging verbosity with the `logLevel` option:

```javascript
import { LogLevel } from "dato-builder";

/** @type {import("dato-builder").DatoBuilderConfig} */
const config = {
  logLevel: LogLevel.DEBUG, // or use numeric values
};

export default config;
```

#### Available Log Levels

| Level            | Value | Description         | When to Use        |
|------------------|-------|---------------------|--------------------|
| `LogLevel.NONE`  | `-1`  | No logging          | Production (quiet) |
| `LogLevel.ERROR` | `0`   | Errors only         | Production         |
| `LogLevel.WARN`  | `1`   | Warnings and errors | Production         |
| `LogLevel.INFO`  | `2`   | General information | **Default**        |
| `LogLevel.DEBUG` | `3`   | Detailed debugging  | Development        |
| `LogLevel.TRACE` | `4`   | Maximum verbosity   | Troubleshooting    |

### Troubleshooting Configuration

#### Common Issues

**Missing API Token**
```bash
# Error: Validation error: Missing apiToken
# Solution: Set environment variable
export DATO_CMA_TOKEN=your_token_here
```

**Invalid Paths**
```bash
# Error: No dato-builder config file found
# Solution: Ensure config file exists in project root
touch dato-builder.config.js
```

**Permission Errors**
```bash
# Error: API token lacks sufficient permissions
# Solution: Use Content Management API token with write permissions
```

#### Configuration Debugging
```javascript
/** @type {import("dato-builder").DatoBuilderConfig} */
const config = {
  logLevel: 3, // Enable DEBUG logging
  // ... other config
};

export default config;
```

```bash
# Run with debug output
npx dato-builder build --debug
```

## CLI Commands

### Build Commands

- **`npx dato-builder build`**  
  Build all DatoCMS types and blocks with enhanced options:
  - `--skip-deletion` - Skip deletion detection and removal of orphaned items
  - `--skip-deletion-confirmation` - Skip confirmation prompts for deletions
  - `--concurrent` - Enable concurrent builds (default concurrency: 3)
  - `--concurrency <number>` - Set specific concurrency level (implies --concurrent)
  - `--auto-concurrency` - Automatically determine concurrency based on CPU cores

### Generation Commands

- **`npx dato-builder generate`**  
  Interactive generator to create new blocks or models with guided prompts.

- **`npx dato-builder generate:block`**  
  Generate a new DatoCMS block with interactive prompts for name and configuration.

- **`npx dato-builder generate:model`**  
  Generate a new DatoCMS model with options for singleton, sortable, and tree structure.

### Utility Commands

- **`npx dato-builder clear-cache`**  
  Clear all caches to force fresh builds.

### Global Options

All commands support these global options:
- `-d, --debug` - Output detailed debugging information
- `-v, --verbose` - Display fine-grained trace logs
- `-q, --quiet` - Only display errors
- `-n, --no-cache` - Disable cache usage

### 📋 Quick Reference

| Command          | Purpose                   | Key Options                             |
|------------------|---------------------------|-----------------------------------------|
| `build`          | Build all blocks/models   | `--auto-concurrency`, `--skip-deletion` |
| `generate`       | Interactive file creation | *None*                                  |
| `generate:block` | Create new block          | *None*                                  |
| `generate:model` | Create new model          | *None*                                  |
| `clear-cache`    | Reset all caches          | *None*                                  |

### 🔧 Troubleshooting

**Common Issues & Solutions:**

**Build Errors**
```bash
# Problem: Build fails with permission errors
# Solution: Check DatoCMS API token permissions
npx dato-builder build --debug

# Problem: Slow builds
# Solution: Enable concurrent processing
npx dato-builder build --auto-concurrency
```

**Cache Issues**
```bash
# Problem: Stale data or unexpected results
# Solution: Clear cache and rebuild
npx dato-builder clear-cache
npx dato-builder build --no-cache
```

**Generation Errors**
```bash
# Problem: Generator validation fails
# Solution: Ensure proper naming (PascalCase)
# ✅ Good: MyNewBlock, BlogPost
# ❌ Bad: my-block, blog_post
```

---

## Usage

### 1. Define a Block

```typescript
// datocms/blocks/TestBlock.ts
import { BlockBuilder, type BuilderContext } from "dato-builder";

export default async function buildTestBlock({ config }: BuilderContext) {
  return new BlockBuilder({
      name: "Test Block",
      config,
  })
    .addHeading({ label: "Title" })
    .addTextarea({ label: "Description" })
    .addImage({
      label: "Image",
      body: { validators: { required: true } },
    });
}
```

_Run it:_

```bash
npx dato-builder build
```

### 2. Generate Files Quickly

Create new blocks and models interactively:

```bash
# Interactive generator
npx dato-builder generate

# Or generate specific types directly
npx dato-builder generate:block
npx dato-builder generate:model
```

### 3. Define a Model

```typescript
// datocms/models/TestModel.ts
import { ModelBuilder, type BuilderContext } from "dato-builder";

export default async function buildTestModel({ config, getBlock }: BuilderContext) {
  return new ModelBuilder({
      name: "Test Model",
      config,
  })
    .addHeading({ label: "Title" })
    .addTextarea({ label: "Description" })
    .addModularContent({
      label: "Content",
      body: {
        validators: { rich_text_blocks: { item_types: [await getBlock("TestBlock")] } },
      },
    });
}
```

_Run it:_

```bash
npx dato-builder build
```

> 🔗 **Advanced Usage**: See [Field Reference](#comprehensive-field--validator-reference) for all available field types and validators.

### 4. Build Everything

```bash
# Build with performance optimizations
npx dato-builder build --auto-concurrency

# Build without deletion detection
npx dato-builder build --skip-deletion
```

---

# Comprehensive Field & Validator Reference

This reference covers all available fields, grouped by category, along with their configuration options, supported validators, usage examples, and available aliases.

---

## Text Fields

### `SingleLineString`

```ts
builder.addSingleLineString({
  label: "Username",
  body: { validators: { required: true, length: { min: 3, max: 20 } } },
  options: { placeholder: "Enter username" },
});
```

### `MultiLineText`

```ts
builder.addMultiLineText({
  label: "Description",
  body: {
    validators: { sanitized_html: { sanitize_before_validation: true } },
  },
});
```

### `Markdown`

```ts
builder.addMarkdown({
  label: "Body",
  toolbar: ["bold", "italic", "link"],
});
```

### `Wysiwyg`

```ts
builder.addWysiwyg({
  label: "Content",
  toolbar: ["format", "bold", "italic", "link", "image"],
});
```

### `Textarea`

```ts
builder.addTextarea({
  label: "Notes",
  placeholder: "Type notes here...",
});
```

---

## Numeric Fields

### `Integer`

```ts
builder.addInteger({
  label: "Quantity",
  body: { validators: { number_range: { min: 1 } } },
});
```

### `Float`

```ts
builder.addFloat({
  label: "Price",
  body: { validators: { required: true } },
});
```

---

## Boolean Fields

### `Boolean`

```ts
builder.addBoolean({
  label: "Published",
});
```

### `BooleanRadioGroup`

```ts
builder.addBooleanRadioGroup({
  label: "Active?",
  positive_radio: { label: "Yes" },
  negative_radio: { label: "No" },
});
```

---

## Date & Time Fields

### `DateField`

```ts
builder.addDate({
  label: "Publish Date",
  body: { validators: { required: true } },
});
```

### `DateTime`

```ts
builder.addDateTime({
  label: "Event Time",
});
```

---

## Media Fields

### `SingleAsset`

```ts
builder.addSingleAsset({
  label: "Avatar",
  body: {
    validators: { required: true, extension: { predefined_list: "image" } },
  },
});
```

### `AssetGallery`

```ts
builder.addAssetGallery({
  label: "Gallery",
  body: { validators: { size: { min: 1 } } },
});
```

### `ExternalVideo`

```ts
builder.addExternalVideo({
  label: "Promo Video",
});
```

---

## Link Fields

### `Link`

```ts
builder.addLink({
  label: "Author",
  body: { validators: { item_item_type: { item_types: ["author_item_type_id"] } } },
});
```

### `Links`

```ts
builder.addLinks({
  label: "Related Articles",
  body: {
    validators: {
      items_item_type: { item_types: ["article_item_type_id"] },
      size: { min: 1, max: 5 },
    },
  },
});
```

---

## Structural Fields

### `Slug`

```ts
builder.addSlug({
  label: "URL slug",
  url_prefix: "/blog/",
  placeholder: "my-post",
  body: { validators: { slug_format: { predefined_pattern: "webpage_slug" } } },
});
```

### `Location`

```ts
builder.addLocation({
  label: "Venue",
  body: { validators: { required: true } },
});
```

### ModularContent

> **Option A**: Use `getBlock()` via `BuilderContext`
>
> The `BuilderContext` now includes a `getBlock()` & a `getModel()` helper to automatically resolve block API keys (IDs) / Model API 
> Keys (IDs) at runtime.

```typescript
// datocms/models/TestModel.ts
import { ModelBuilder, type BuilderContext } from "dato-builder";

export default async function buildTestModel({ config, getBlock, getModel }: BuilderContext) {
  return new ModelBuilder({
      name: "Test Model",
      config
  })
    .addHeading({ label: "Title" })
    .addTextarea({ label: "Description" })
    .addModularContent({
      label: "Content Sections",
      body: {
        validators: {
          rich_text_blocks: {
            item_types: [
                await getBlock("SectionBlock"), // dynamically resolve SectionBlock ID
                await getModel("HighlightModel"), // dynamically resolve HighlightModel ID
            ],
          },
          size: { min: 1 },
        },
      },
    });
}
```

> **Option B**: Hard-coded IDs
>
> If you already know the API keys (e.g. from a previous run), you can skip the async calls and just list them directly:

```typescript
// datocms/models/TestModel.ts
import { ModelBuilder, type BuilderContext } from "dato-builder";

export default function buildTestModel({config}: BuilderContext) {
  return new ModelBuilder({
      name: "Test Model",
      config
  })
    .addHeading({ label: "Title" })
    .addTextarea({ label: "Description" })
    .addModularContent({
      label: "Content Sections",
      body: {
        validators: {
          rich_text_blocks: {
            // replace these with the real API keys you got from DatoCMS
            item_types: ["section_block_item_type_id", "highlight_model_item_type_id"],
          },
          size: { min: 1 },
        },
      },
    });
}
```

### SingleBlock

> **Option A**: Use `getBlock()` via `BuilderContext`
>
> The `BuilderContext` now includes a `getBlock()` & a `getModel()` helper to automatically resolve block API keys (IDs) / Model API
> Keys (IDs) at runtime.

```typescript
// datocms/models/PageModel.ts
import { ModelBuilder, type BuilderContext } from "dato-builder";

export default async function buildPageModel({ config, getBlock }: BuilderContext) {
    return new ModelBuilder({
        name: "Page Model",
        config,
    })
        .addSingleBlock({
            label: "Hero",
            type: "framed_single_block",
            start_collapsed: true,
            body: {
                validators: {
                    single_block_blocks: {
                        item_types: [await getBlock("HeroBlock")],
                    },
                },
            },
        });
}
```

> **Option B**: Hard-coded IDs
>
> If the block ID is known and stable:

```typescript
builder.addSingleBlock({
  label: "Hero",
  type: "framed_single_block",
  start_collapsed: true,
  body: {
    validators: {
      single_block_blocks: {
        item_types: ["hero_block_item_type_id"],
      },
    },
  },
});
```

### StructuredText

> **Option A**: Use `getBlock()` via `BuilderContext`
>
> The `BuilderContext` now includes a `getBlock()` & a `getModel()` helper to automatically resolve block API keys (IDs) / Model API
> Keys (IDs) at runtime.

```typescript
// datocms/models/ArticleModel.ts
import { ModelBuilder, type BuilderContext } from "dato-builder";

export default async function buildArticleModel({ config, getBlock }: BuilderContext) {
    return new ModelBuilder({
        name: "Article Model",
        config,
    })
        .addStructuredText({
            label: "Content",
            nodes: ["heading", "paragraph", "link"],
            marks: ["strong", "emphasis"],
            body: {
                validators: {
                    structured_text_blocks: {
                        item_types: [await getBlock("QuoteBlock")],
                    },
                },
            },
        });
}
```

> **Option B**: Hard-coded IDs
>
> List known block IDs directly:

```typescript
builder.addStructuredText({
  label: "Content",
  nodes: ["heading", "paragraph", "link"],
  marks: ["strong", "emphasis"],
  body: {
    validators: {
      structured_text_blocks: {
        item_types: ["quote_block_item_type_id"],
      },
    },
  },
});
```

### `Seo`

```ts
builder.addSeo({
  label: "SEO",
  fields: ["title", "description", "image"],
  previews: ["google", "twitter"],
  body: {
    validators: { required_seo_fields: { title: true, description: true } },
  },
});
```

---

## Aliases

Some methods are provided as convenient aliases:

| Alias Method | Primary Method   |
| ------------ | ---------------- |
| `addImage`   | `addSingleAsset` |

**Example**

```ts
builder.addImage({ label: "Logo" }); // same as addSingleAsset
```

---

## Validators Appendix

Below is a detailed breakdown of each supported validator, including parameter definitions, requirements, and usage examples.

---

### `date_range`

**Description:**

Accepts dates only inside a specified range.

**Parameters:**

| Name | Type   | Required | Description                                                 |
| ---- | ------ | -------- | ----------------------------------------------------------- |
| min  | `Date` | No       | Earliest allowed date (must be a JavaScript `Date` object). |
| max  | `Date` | No       | Latest allowed date (must be a JavaScript `Date` object).   |

> ⚠️ At least one of `min` or `max` **must** be specified.

**Example Usage:**

```ts
builder.addDate({
  label: "Start Date",
  body: {
    validators: {
      date_range: {
        min: new Date("2025-01-01"),
        // max: new Date("2025-12-31"), // you can omit one side if you only care about an open-ended range
      },
    },
  },
});
```

---

### `date_time_range`

**Description:** Accept date/time values only inside a specified range.

**Parameters:**

| Name | Type             | Required | Description      |
| ---- | ---------------- | -------- | ---------------- |
| min  | `Date`, `string` | No       | Minimum datetime |
| max  | `Date`, `string` | No       | Maximum datetime |

> At least one of `min` or `max` must be specified.

**Example:**

```ts
builder.addDateTime({
  label: "Deadline",
  body: { validators: { date_time_range: { max: "2025-12-31T23:59:59Z" } } },
});
```

---

### `enum`

**Description:** Only accept a specific set of string values.

**Parameters:**

| Name   | Type            | Required | Description    |
| ------ | --------------- | -------- | -------------- |
| values | `Array<string>` | Yes      | Allowed values |

**Example:**

```ts
builder.addSingleLineString({
  label: "Status",
  body: {
    validators: { enum: { values: ["draft", "published", "archived"] } },
  },
});
```

---

### `extension`

**Description:** Only accept assets with specified file extensions or types.

**Parameters:**

| Name            | Type                                                | Required | Description               |
| --------------- | --------------------------------------------------- | -------- | ------------------------- |
| extensions      | `Array<string>`                                     | No       | Allowed file extensions   |
| predefined_list | `image`, `transformable_image`, `video`, `document` | No       | Predefined asset category |

> Only one of `extensions` or `predefined_list` must be specified.

**Example:**

```ts
builder.addSingleAsset({
  label: "Upload",
  body: { validators: { extension: { predefined_list: "image" } } },
});
```

---

### `file_size`

**Description:** Accept assets only within a specified file size range.

**Parameters:**

| Name      | Type            | Required | Description             |
| --------- | --------------- | -------- | ----------------------- |
| min_value | `number`        | No       | Minimum file size value |
| min_unit  | `B`, `KB`, `MB` | No       | Unit for minimum size   |
| max_value | `number`        | No       | Maximum file size value |
| max_unit  | `B`,`KB`,`MB`   | No       | Unit for maximum size   |

> At least one value/unit pair must be specified.

**Example:**

```ts
builder.addSingleAsset({
  label: "Image",
  body: { validators: { file_size: { max_value: 5, max_unit: "MB" } } },
});
```

---

### `format`

**Description:** Accept only strings matching a custom or predefined format.

**Parameters:**

| Name               | Type           | Required | Description                                         |
| ------------------ | -------------- | -------- | --------------------------------------------------- |
| custom_pattern     | `RegExp`       | No       | Custom regex pattern                                |
| predefined_pattern | `email` ,`url` | No       | Predefined format type                              |
| description        | `string`       | No       | Hint shown on validation failure (only with custom) |

> Only one of `custom_pattern` or `predefined_pattern` must be specified.

**Example:**

```ts
builder.addSingleLineString({
  label: "Email",
  body: { validators: { format: { predefined_pattern: "email" } } },
});
```

---

### `slug_format`

**Description:** Only accept slug values matching a custom or predefined slug pattern.

**Parameters:**

| Name               | Type           | Required | Description            |
| ------------------ | -------------- | -------- | ---------------------- |
| custom_pattern     | `RegExp`       | No       | Custom regex for slug  |
| predefined_pattern | `webpage_slug` | No       | Predefined slug format |

> Only one of `custom_pattern` or `predefined_pattern` must be specified.

**Example:**

```ts
builder.addSlug({
  label: "Slug",
  body: { validators: { slug_format: { predefined_pattern: "webpage_slug" } } },
});
```

---

### `image_dimensions`

**Description:** Accept assets only within specified width/height bounds.

**Parameters:**

| Name             | Type     | Required | Description    |
| ---------------- | -------- | -------- | -------------- |
| width_min_value  | `number` | No       | Minimum width  |
| width_max_value  | `number` | No       | Maximum width  |
| height_min_value | `number` | No       | Minimum height |
| height_max_value | `number` | No       | Maximum height |

> At least one width/height pair must be specified.

**Example:**

```ts
builder.addSingleAsset({
  label: "Thumbnail",
  body: {
    validators: {
      image_dimensions: { width_min_value: 300, height_min_value: 200 },
    },
  },
});
```

---

### `image_aspect_ratio`

**Description:** Accept assets only within a specified aspect ratio.

**Parameters:**

| Name               | Type     | Required | Description                      |
| ------------------ | -------- | -------- | -------------------------------- |
| min_ar_numerator   | `number` | No       | Minimum aspect ratio numerator   |
| min_ar_denominator | `number` | No       | Minimum aspect ratio denominator |
| eq_ar_numerator    | `number` | No       | Exact aspect ratio numerator     |
| eq_ar_denominator  | `number` | No       | Exact aspect ratio denominator   |
| max_ar_numerator   | `number` | No       | Maximum aspect ratio numerator   |
| max_ar_denominator | `number` | No       | Maximum aspect ratio denominator |

> At least one ratio pair must be specified.

**Example:**

```ts
builder.addSingleAsset({
  label: "Banner",
  body: {
    validators: {
      image_aspect_ratio: { eq_ar_numerator: 16, eq_ar_denominator: 9 },
    },
  },
});
```

---

### `item_item_type`

**Description:** Accept references only to specified model records.

**Parameters:**

| Name                                            | Type                                   | Required | Description                                          |
| ----------------------------------------------- | -------------------------------------- | -------- | ---------------------------------------------------- |
| item_types                                      | `Array<string>`                        | ✅       | IDs of allowed model types                           |
| on_publish_with_unpublished_references_strategy | `fail`, `publish_references`           | No       | Strategy when publishing with unpublished references |
| on_reference_unpublish_strategy                 | `fail`,`unpublish`,`delete_references` | No       | Strategy when referenced record is unpublished       |
| on_reference_delete_strategy                    | `fail`, `delete_references`            | No       | Strategy when referenced record is deleted           |

**Example:**

```ts
builder.addLink({
  label: "Author",
  body: {
    validators: {
      item_item_type: {
        item_types: ["author_item_type_id"],
        on_publish_with_unpublished_references_strategy: "fail",
      },
    },
  },
});
```

---

### `items_item_type`

**Description:** Accept multiple references only to specified model records.

_(Same parameters and strategies as `item_item_type`)_

**Example:**

```ts
builder.addLinks({
  label: "Related Posts",
  body: { validators: { items_item_type: { item_types: ["post_item_type_id"] } } },
});
```

---

### `length`

**Description:** Accept strings only with a specified character count.

**Parameters:**

| Name | Type     | Required | Description    |
| ---- | -------- | -------- | -------------- |
| min  | `number` | No       | Minimum length |
| eq   | `number` | No       | Exact length   |
| max  | `number` | No       | Maximum length |

> At least one of `min`, `eq`, or `max` must be specified.

**Example:**

```ts
builder.addSingleLineString({
  label: "Code",
  body: { validators: { length: { eq: 6 } } },
});
```

---

### `number_range`

**Description:** Accept numbers only inside a specified range.

**Parameters:**

| Name | Type     | Required | Description   |
| ---- | -------- | -------- | ------------- |
| min  | `number` | No       | Minimum value |
| max  | `number` | No       | Maximum value |

> At least one of `min` or `max` must be specified.

**Example:**

```ts
builder.addFloat({
  label: "Rating",
  body: { validators: { number_range: { min: 0, max: 5 } } },
});
```

---

### `required`

**Description:** Value must be specified or validation fails.

**Example:**

```ts
builder.addSingleLineString({
  label: "Title",
  body: { validators: { required: true } },
});
```

---

### `required_alt_title`

**Description:** Assets must include custom title or alt text.

**Parameters:**

| Name  | Type      | Required | Description            |
| ----- | --------- | -------- | ---------------------- |
| title | `boolean` | No       | Require a custom title |
| alt   | `boolean` | No       | Require alternate text |

> At least one of `title` or `alt` must be true.

**Example:**

```ts
builder.addSingleAsset({
  label: "Image",
  body: { validators: { required_alt_title: { title: true, alt: true } } },
});
```

---

### `required_seo_fields`

**Description:** SEO inputs must include one or more specified fields.

**Parameters:**

| Name         | Type      | Required | Description                  |
| ------------ | --------- | -------- | ---------------------------- |
| title        | `boolean` | No       | Require meta title           |
| description  | `boolean` | No       | Require meta description     |
| image        | `boolean` | No       | Require social sharing image |
| twitter_card | `boolean` | No       | Require Twitter card type    |

> At least one field must be true.

**Example:**

```ts
builder.addSeo({
  label: "Meta",
  body: {
    validators: { required_seo_fields: { title: true, description: true } },
  },
});
```

---

### `title_length`

**Description:** Limits the SEO title length.

**Parameters:**

| Name | Type     | Required | Description    |
| ---- | -------- | -------- | -------------- |
| min  | `number` | No       | Minimum length |
| max  | `number` | No       | Maximum length |

> At least one of `min` or `max` must be specified.

**Example:**

```ts
builder.addSeo({
  label: "Meta",
  body: { validators: { title_length: { max: 60 } } },
});
```

---

### `description_length`

**Description:** Limits the SEO description length.

**Parameters:**

| Name | Type     | Required | Description    |
| ---- | -------- | -------- | -------------- |
| min  | `number` | No       | Minimum length |
| max  | `number` | No       | Maximum length |

> At least one of `min` or `max` must be specified.

**Example:**

```ts
builder.addSeo({
  label: "Meta",
  body: { validators: { description_length: { max: 155 } } },
});
```

---

### `rich_text_blocks`

**Description:** Only accept specified block models in rich text block nodes.

**Parameters:**

| Name       | Type            | Required | Description                 |
| ---------- | --------------- | -------- | --------------------------- |
| item_types | `Array<string>` | ✅       | IDs of allowed block models |

**Example:**

```ts
builder.addModularContent({
  label: "Sections",
  body: { validators: { rich_text_blocks: { item_types: ["section_item_type_id"] } } },
});
```

---

### `single_block_blocks`

**Description:** Only accept specified block models in single-block fields.

**Parameters:**

| Name       | Type            | Required | Description                 |
| ---------- | --------------- | -------- | --------------------------- |
| item_types | `Array<string>` | ✅       | IDs of allowed block models |

**Example:**

```ts
builder.addSingleBlock({
  label: "Hero",
  body: { validators: { single_block_blocks: { item_types: ["hero_block_item_type_id"] } } },
});
```

---

### `sanitized_html`

**Description:** Checks for malicious code in HTML input fields.

**Parameters:**

| Name                       | Type      | Required | Description                        |
| -------------------------- | --------- | -------- | ---------------------------------- |
| sanitize_before_validation | `boolean` | ✅       | Sanitize content before validation |

**Example:**

```ts
builder.addMarkdown({
  label: "Notes",
  toolbar: [],
  body: {
    validators: { sanitized_html: { sanitize_before_validation: true } },
  },
});
```

---

### `structured_text_blocks`

**Description:** Only accept specified block models in structured text block nodes.

**Parameters:**

| Name       | Type            | Required | Description                 |
| ---------- | --------------- | -------- | --------------------------- |
| item_types | `Array<string>` | ✅       | IDs of allowed block models |

**Example:**

```ts
builder.addStructuredText({
  label: "Content",
  body: { validators: { structured_text_blocks: { item_types: ["quote_item_type_id"] } } },
});
```

---

### `structured_text_inline_blocks`

**Description:** Only accept specified block models in inline block nodes of structured text.

**Parameters:**

| Name       | Type            | Required | Description                 |
| ---------- | --------------- | -------- | --------------------------- |
| item_types | `Array<string>` | ✅       | IDs of allowed block models |

**Example:**

```ts
builder.addStructuredText({
  label: "Content",
  body: {
    validators: { structured_text_inline_blocks: { item_types: ["link_item_type_id"] } },
  },
});
```

---

### `structured_text_links`

**Description:** Only accept itemLink and inlineItem nodes for specified models in structured text.

**Parameters:**

| Name                                            | Type                                       | Required | Description                                          |
| ----------------------------------------------- | ------------------------------------------ | -------- | ---------------------------------------------------- |
| item_types                                      | `Array<string>`                            | ✅       | IDs of allowed models                                |
| on_publish_with_unpublished_references_strategy | `fail`, `publish_references`               | No       | Strategy when publishing with unpublished references |
| on_reference_unpublish_strategy                 | `fail` , `unpublish` , `delete_references` | No       | Strategy when referenced record is unpublished       |
| on_reference_delete_strategy                    | `fail` , `delete_references`               | No       | Strategy when referenced record is deleted           |

**Example:**

```ts
builder.addStructuredText({
  label: "Content",
  body: { validators: { structured_text_links: { item_types: ["author_item_type_id"] } } },
});
```

---

## Type Compatibility Matrix

| Field Class                                | Validators Supported                                                                                                                                                                                                             |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SingleLineString                           | [required](#required), [unique](#unique), [length](#length), [format](#format), [enum](#enum)                                                                                                                                    |
| MultiLineText, Markdown, Wysiwyg, Textarea | [required](#required), [length](#length), [format](#format), [sanitized_html](#sanitized_html)                                                                                                                                   |
| Integer, Float                             | [required](#required), [number_range](#number_range)                                                                                                                                                                             |
| Boolean, BooleanRadioGroup                 | [required](#required)                                                                                                                                                                                                            |
| DateField                                  | [required](#required), [date_range](#date_range)                                                                                                                                                                                 |
| DateTime                                   | [required](#required), [date_time_range](#date_time_range)                                                                                                                                                                       |
| SingleAsset                                | [required](#required), [extension](#extension), [file_size](#file_size), [image_dimensions](#image_dimensions), [image_aspect_ratio](#image_aspect_ratio), [required_alt_title](#required_alt_title)                             |
| AssetGallery                               | [size](#size), [extension](#extension), [file_size](#file_size), [image_dimensions](#image_dimensions), [image_aspect_ratio](#image_aspect_ratio), [required_alt_title](#required_alt_title)                                     |
| ExternalVideo                              | [required](#required)                                                                                                                                                                                                            |
| Link                                       | [item_item_type](#item_item_type), [required](#required), [unique](#unique)                                                                                                                                                      |
| Links                                      | [items_item_type](#items_item_type), [size](#size)                                                                                                                                                                               |
| Slug                                       | [required](#required), [length](#length), [slug_format](#slug_format), [slug_title_field](#slug_title_field)                                                                                                                     |
| Location                                   | [required](#required)                                                                                                                                                                                                            |
| ModularContent                             | [rich_text_blocks](#rich_text_blocks), [size](#size)                                                                                                                                                                             |
| SingleBlock                                | [single_block_blocks](#single_block_blocks), [required](#required)                                                                                                                                                               |
| StructuredText                             | [length](#length), [structured_text_blocks](#structured_text_blocks), [structured_text_inline_blocks](#structured_text_inline_blocks), [structured_text_links](#structured_text_links)                                           |
| Seo                                        | [required_seo_fields](#required_seo_fields), [file_size](#file_size), [image_dimensions](#image_dimensions), [image_aspect_ratio](#image_aspect_ratio), [title_length](#title_length), [description_length](#description_length) |

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.
