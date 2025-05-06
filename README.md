# Dato Builder

Quickly create Models, Blocks in DatoCMS from your source code.

## Table of Contents

- [Dato Builder](#dato-builder)
  - [Table of Contents](#table-of-contents)
  - [Installation](#installation)
  - [Configuration](#configuration)
  - [CLI Commands](#cli-commands)
  - [Usage](#usage)
    - [1. Define a Block](#1-define-a-block)
    - [2. Define a Model](#2-define-a-model)
    - [3. Build Everything](#3-build-everything)
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
    - [`BooleanField`](#booleanfield)
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
    - [`sanitization`](#sanitization)
    - [`structured_text_blocks`](#structured_text_blocks)
    - [`structured_text_inline_blocks`](#structured_text_inline_blocks)
    - [`structured_text_links`](#structured_text_links)
  - [Type Compatibility Matrix](#type-compatibility-matrix)

## Installation

```bash
npm install --save-dev dato-builder
```

## Configuration

Create a `dato-builder.config.js` in your project root:

```javascript
/** @type {import("dato-builder").DatoBuilderConfig} */
module.exports = {
  apiToken: process.env.DATO_CMA_TOKEN, // your DatoCMS CMA token
  overwriteExistingFields: false, // create new fields only; existing fields remain untouched
  debug: false, // enable verbose logging
};
```

> **overwriteExistingFields:**
>
> - `false` (default): only new fields are created; updates/deletions are skipped.
> - `true`: existing fields matching your code’s API keys are updated, and any extra fields are removed.

## CLI Commands

- **`npx dato-builder run <file|dir>`**  
  Build one or more scripts (blocks, models, or whole folders).

- **`npx dato-builder clear-cache`**  
  Wipe the local cache that tracks what’s already been synced.

---

## Usage

### 1. Define a Block

```typescript
// datocms/blocks/TestBlock.ts
import { BlockBuilder } from "dato-builder";

export default async function buildTestBlock() {
  const block = new BlockBuilder("Test Block")
    .addHeading({ label: "Title" })
    .addTextarea({ label: "Description" })
    .addImage({
      label: "Image",
      body: { validators: { required: true } },
    });

  return block.upsert();
}
```

_Run it:_

```bash
npx dato-builder run datocms/blocks/TestBlock.ts
```

### 2. Define a Model

```typescript
// datocms/models/TestModel.ts
import { ModelBuilder } from "dato-builder";
import buildTestBlock from "../blocks/TestBlock";

export default async function buildTestModel() {
  const testBlockId = await buildTestBlock();

  const model = new ModelBuilder("Test Model")
    .addHeading({ label: "Title" })
    .addTextarea({ label: "Description" })
    .addModularContent({
      label: "Content",
      body: {
        validators: { rich_text_blocks: { item_types: [testBlockId] } },
      },
    });

  return model.upsert();
}

void buildTestModel();
```

_Run it:_

```bash
npx dato-builder run datocms/models/TestModel.ts
```

### 3. Build Everything

```bash
npx dato-builder run datocms/
```

---

_Note: You can add more builder scripts (blocks or models) and then point `run` at the parent folder to sync them all in one go._

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
  body: { validators: { number_range: { min: 0 } } },
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

### `BooleanField`

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
  body: { validators: { item_item_type: { item_types: ["author"] } } },
});
```

### `Links`

```ts
builder.addLinks({
  label: "Related Articles",
  body: {
    validators: {
      items_item_type: { item_types: ["article"] },
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

> **Option A**: Dynamic IDs via builder functions
>
> Run each builder first to get its generated API key (ID), then plug those IDs in.

```typescript
// datocms/models/TestModel.ts
import { ModelBuilder } from "dato-builder";
import buildSectionBlock from "../blocks/SectionBlock";
import buildHighlightModel from "../models/HighlightModel";

export default async function buildTestModel() {
  // 1. Build the other blocks/models and capture their API keys:
  const sectionBlockId = await buildSectionBlock();
  const highlightModelId = await buildHighlightModel();

  // 2. Use those IDs in your modular-content validator:
  const model = new ModelBuilder("Test Model")
    .addHeading({ label: "Title" })
    .addTextarea({ label: "Description" })
    .addModularContent({
      label: "Content Sections",
      body: {
        validators: {
          rich_text_blocks: {
            item_types: [sectionBlockId, highlightModelId],
          },
          size: { min: 1 },
        },
      },
    });

  return model.upsert();
}

void buildTestModel();
```

> **Option B**: Hard-coded IDs
>
> If you already know the API keys (e.g. from a previous run), you can skip the async calls and just list them directly:

```typescript
// datocms/models/TestModel.ts
import { ModelBuilder } from "dato-builder";

export default function buildTestModel() {
  const model = new ModelBuilder("Test Model")
    .addHeading({ label: "Title" })
    .addTextarea({ label: "Description" })
    .addModularContent({
      label: "Content Sections",
      body: {
        validators: {
          rich_text_blocks: {
            // replace these with the real API keys you got earlier
            item_types: ["section_block_api_key", "highlight_model_api_key"],
          },
          size: { min: 1 },
        },
      },
    });

  return model.upsert();
}

void buildTestModel();
```

### SingleBlock

> **Option A**: Dynamic IDs via builder functions
>
> Capture the block ID from your builder before using it:

```typescript
import { ModelBuilder } from "dato-builder";
import buildHeroBlock from "../blocks/HeroBlock";

export default async function buildPageModel() {
  const heroBlockId = await buildHeroBlock();

  const model = new ModelBuilder("Page Model").addSingleBlock({
    label: "Hero",
    type: "framed_single_block",
    start_collapsed: true,
    body: {
      validators: {
        single_block_blocks: {
          item_types: [heroBlockId],
        },
      },
    },
  });

  return model.upsert();
}

void buildPageModel();
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
        item_types: ["heroBlock"],
      },
    },
  },
});
```

### StructuredText

> **Option A**: Dynamic IDs via builder functions
>
> Fetch block IDs before defining your structured text field:

```typescript
import { ModelBuilder } from "dato-builder";
import buildQuoteBlock from "../blocks/QuoteBlock";

export default async function buildArticleModel() {
  const quoteBlockId = await buildQuoteBlock();

  const model = new ModelBuilder("Article Model").addStructuredText({
    label: "Content",
    nodes: ["heading", "paragraph", "link"],
    marks: ["strong", "emphasis"],
    body: {
      validators: {
        structured_text_blocks: {
          item_types: [quoteBlockId],
        },
      },
    },
  });

  return model.upsert();
}

void buildArticleModel();
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
        item_types: ["quoteBlock"],
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
Accepts dates only inside a specified range. Throws an error at construction time if neither `min` nor `max` is provided.

**Parameters:**

| Name | Type   | Required | Description                                                 |
| ---- | ------ | -------- | ----------------------------------------------------------- |
| min  | `Date` | No       | Earliest allowed date (must be a JavaScript `Date` object). |
| max  | `Date` | No       | Latest allowed date (must be a JavaScript `Date` object).   |

> ⚠️ At least one of `min` or `max` **must** be specified.

**Example Usage:**

````ts
builder.addDate({
  label: "Start Date",
  body: {
    validators: {
      date_range: {
        min: new Date("2025-01-01"),
        // max: new Date("2025-12-31"), // you can omit one side if you only care about an open-ended range
      }
    }
  }
});

---

### `date_time_range`

**Description:** Accept date/time values only inside a specified range.

**Parameters:**

| Name | Type              | Required | Description      |
| ---- | ----------------- | -------- | ---------------- |
| min  | ISO 8601 datetime | No       | Minimum datetime |
| max  | ISO 8601 datetime | No       | Maximum datetime |

> At least one of `min` or `max` must be specified.

**Example:**

```ts
builder.addDateTime({
  label: "Deadline",
  body: { validators: { date_time_range: { max: "2025-12-31T23:59:59Z" } } },
});
````

---

### `enum`

**Description:** Only accept a specific set of string values.

**Parameters:**

| Name   | Type          | Required | Description    |
| ------ | ------------- | -------- | -------------- |
| values | Array<string> | Yes      | Allowed values |

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

| Name            | Type          | Required              | Description             |            |     |                           |
| --------------- | ------------- | --------------------- | ----------------------- | ---------- | --- | ------------------------- |
| extensions      | Array<string> | No                    | Allowed file extensions |            |     |                           |
| predefined_list | 'image'       | 'transformable_image' | 'video'                 | 'document' | No  | Predefined asset category |

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

| Name      | Type   | Required | Description             |     |                       |
| --------- | ------ | -------- | ----------------------- | --- | --------------------- |
| min_value | number | No       | Minimum file size value |     |                       |
| min_unit  | 'B'    | 'KB'     | 'MB'                    | No  | Unit for minimum size |
| max_value | number | No       | Maximum file size value |     |                       |
| max_unit  | 'B'    | 'KB'     | 'MB'                    | No  | Unit for maximum size |

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

| Name               | Type    | Required | Description                                         |                        |
| ------------------ | ------- | -------- | --------------------------------------------------- | ---------------------- |
| custom_pattern     | RegExp  | No       | Custom regex pattern                                |                        |
| predefined_pattern | 'email' | 'url'    | No                                                  | Predefined format type |
| description        | string  | No       | Hint shown on validation failure (only with custom) |                        |

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
| custom_pattern     | RegExp         | No       | Custom regex for slug  |
| predefined_pattern | 'webpage_slug' | No       | Predefined slug format |

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

| Name             | Type   | Required | Description    |
| ---------------- | ------ | -------- | -------------- |
| width_min_value  | number | No       | Minimum width  |
| width_max_value  | number | No       | Maximum width  |
| height_min_value | number | No       | Minimum height |
| height_max_value | number | No       | Maximum height |

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

| Name               | Type   | Required | Description                      |
| ------------------ | ------ | -------- | -------------------------------- |
| min_ar_numerator   | number | No       | Minimum aspect ratio numerator   |
| min_ar_denominator | number | No       | Minimum aspect ratio denominator |
| eq_ar_numerator    | number | No       | Exact aspect ratio numerator     |
| eq_ar_denominator  | number | No       | Exact aspect ratio denominator   |
| max_ar_numerator   | number | No       | Maximum aspect ratio numerator   |
| max_ar_denominator | number | No       | Maximum aspect ratio denominator |

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

| Name                                            | Type          | Required             | Description                |                                                      |                                                |
| ----------------------------------------------- | ------------- | -------------------- | -------------------------- | ---------------------------------------------------- | ---------------------------------------------- |
| item_types                                      | Array<string> | ✅                   | IDs of allowed model types |                                                      |                                                |
| on_publish_with_unpublished_references_strategy | 'fail'        | 'publish_references' | No                         | Strategy when publishing with unpublished references |                                                |
| on_reference_unpublish_strategy                 | 'fail'        | 'unpublish'          | 'delete_references'        | No                                                   | Strategy when referenced record is unpublished |
| on_reference_delete_strategy                    | 'fail'        | 'delete_references'  | No                         | Strategy when referenced record is deleted           |                                                |

**Example:**

```ts
builder.addLink({
  label: "Author",
  body: {
    validators: {
      item_item_type: {
        item_types: ["author"],
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
  body: { validators: { items_item_type: { item_types: ["post"] } } },
});
```

---

### `length`

**Description:** Accept strings only with a specified character count.

**Parameters:**

| Name | Type   | Required | Description    |
| ---- | ------ | -------- | -------------- |
| min  | number | No       | Minimum length |
| eq   | number | No       | Exact length   |
| max  | number | No       | Maximum length |

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

| Name | Type   | Required | Description   |
| ---- | ------ | -------- | ------------- |
| min  | number | No       | Minimum value |
| max  | number | No       | Maximum value |

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

_(No parameters—just `required: true` or omitted)_

**Example:**

```ts
builder.addBoolean({
  label: "Active",
  body: { validators: { required: true } },
});
```

---

### `required_alt_title`

**Description:** Assets must include custom title or alt text.

**Parameters:**

| Name  | Type    | Required | Description            |
| ----- | ------- | -------- | ---------------------- |
| title | boolean | No       | Require a custom title |
| alt   | boolean | No       | Require alternate text |

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

| Name         | Type    | Required | Description                  |
| ------------ | ------- | -------- | ---------------------------- |
| title        | boolean | No       | Require meta title           |
| description  | boolean | No       | Require meta description     |
| image        | boolean | No       | Require social sharing image |
| twitter_card | boolean | No       | Require Twitter card type    |

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

| Name | Type   | Required | Description    |
| ---- | ------ | -------- | -------------- |
| min  | number | No       | Minimum length |
| max  | number | No       | Maximum length |

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

| Name | Type   | Required | Description    |
| ---- | ------ | -------- | -------------- |
| min  | number | No       | Minimum length |
| max  | number | No       | Maximum length |

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

| Name       | Type          | Required | Description                 |
| ---------- | ------------- | -------- | --------------------------- |
| item_types | Array<string> | ✅       | IDs of allowed block models |

**Example:**

```ts
builder.addModularContent({
  label: "Sections",
  body: { validators: { rich_text_blocks: { item_types: ["section"] } } },
});
```

---

### `single_block_blocks`

**Description:** Only accept specified block models in single-block fields.

**Parameters:**

| Name       | Type          | Required | Description                 |
| ---------- | ------------- | -------- | --------------------------- |
| item_types | Array<string> | ✅       | IDs of allowed block models |

**Example:**

```ts
builder.addSingleBlock({
  label: "Hero",
  body: { validators: { single_block_blocks: { item_types: ["heroBlock"] } } },
});
```

---

### `sanitization`

**Description:** Checks for malicious code in HTML input fields.

**Parameters:**

| Name                       | Type    | Required | Description                        |
| -------------------------- | ------- | -------- | ---------------------------------- |
| sanitize_before_validation | boolean | ✅       | Sanitize content before validation |

**Example:**

```ts
builder.addMarkdown({
  label: "Notes",
  body: { validators: { sanitization: { sanitize_before_validation: true } } },
});
```

---

### `structured_text_blocks`

**Description:** Only accept specified block models in structured text block nodes.

**Parameters:**

| Name       | Type          | Required | Description                 |
| ---------- | ------------- | -------- | --------------------------- |
| item_types | Array<string> | ✅       | IDs of allowed block models |

**Example:**

```ts
builder.addStructuredText({
  label: "Content",
  body: { validators: { structured_text_blocks: { item_types: ["quote"] } } },
});
```

---

### `structured_text_inline_blocks`

**Description:** Only accept specified block models in inline block nodes of structured text.

**Parameters:**

| Name       | Type          | Required | Description                 |
| ---------- | ------------- | -------- | --------------------------- |
| item_types | Array<string> | ✅       | IDs of allowed block models |

**Example:**

```ts
builder.addStructuredText({
  label: "Content",
  body: {
    validators: { structured_text_inline_blocks: { item_types: ["link"] } },
  },
});
```

---

### `structured_text_links`

**Description:** Only accept itemLink and inlineItem nodes for specified models in structured text.

**Parameters:**

| Name                                            | Type          | Required             | Description           |                                                      |                                                |
| ----------------------------------------------- | ------------- | -------------------- | --------------------- | ---------------------------------------------------- | ---------------------------------------------- |
| item_types                                      | Array<string> | ✅                   | IDs of allowed models |                                                      |                                                |
| on_publish_with_unpublished_references_strategy | 'fail'        | 'publish_references' | No                    | Strategy when publishing with unpublished references |                                                |
| on_reference_unpublish_strategy                 | 'fail'        | 'unpublish'          | 'delete_references'   | No                                                   | Strategy when referenced record is unpublished |
| on_reference_delete_strategy                    | 'fail'        | 'delete_references'  | No                    | Strategy when referenced record is deleted           |                                                |

**Example:**

```ts
builder.addStructuredText({
  label: "Content",
  body: { validators: { structured_text_links: { item_types: ["author"] } } },
});
```

---

## Type Compatibility Matrix

| Field Class                                | Validators Supported                                                                                   |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| SingleLineString                           | required, unique, length, format, enum                                                                 |
| MultiLineText, Markdown, Wysiwyg, Textarea | required, length, format, sanitized_html                                                               |
| Integer, Float                             | required, number_range                                                                                 |
| BooleanField, BooleanRadioGroup            | required                                                                                               |
| DateField                                  | required, date_range                                                                                   |
| DateTime                                   | required, date_time_range                                                                              |
| SingleAsset                                | required, extension, file_size, image_dimensions, image_aspect_ratio, required_alt_title               |
| AssetGallery                               | size, extension, file_size, image_dimensions, image_aspect_ratio, required_alt_title                   |
| ExternalVideo                              | required                                                                                               |
| Link                                       | item_item_type, required, unique                                                                       |
| Links                                      | items_item_type, size                                                                                  |
| Slug                                       | required, length, slug_format, slug_title_field                                                        |
| Location                                   | required                                                                                               |
| ModularContent                             | rich_text_blocks, size                                                                                 |
| SingleBlock                                | single_block_blocks, required                                                                          |
| StructuredText                             | length, structured_text_blocks, structured_text_inline_blocks, structured_text_links                   |
| Seo                                        | required_seo_fields, file_size, image_dimensions, image_aspect_ratio, title_length, description_length |

---
