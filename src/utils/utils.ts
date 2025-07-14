import pluralize from "pluralize";

interface DatoApiKeyOptions {
  name: string;
  suffix?: string | null;
  preservePlural?: boolean;
}

export function generateDatoApiKey({
  name,
  suffix,
  preservePlural = true,
}: DatoApiKeyOptions): string {
  let result = name.toLowerCase();

  // Remove apostrophes (for possessive forms)
  result = result.replace(/['´'']/g, "");
  // Replace non-alphanumeric characters with underscores
  result = result.replace(/[^a-z0-9]/g, "_");
  // Remove underscores before digits
  result = result.replace(/_([0-9])/g, "$1");
  // Collapse multiple underscores into one
  result = result.replace(/_+/g, "_");
  // Trim leading and trailing underscores
  result = result.replace(/^_|_$/g, "");

  // Split into words
  let words = result.split("_").filter((word) => word.length > 0);

  // Only singularize if explicitly asked
  if (!preservePlural) {
    words = words.map(pluralize.singular);
  }

  result = words.join("_");

  // Handle the suffix if provided
  if (suffix) {
    let formattedSuffix = suffix.toLowerCase();
    formattedSuffix = formattedSuffix.replace(/[^a-z0-9]/g, "_");
    formattedSuffix = formattedSuffix.replace(/_([0-9])/g, "$1");
    formattedSuffix = formattedSuffix.replace(/_+/g, "_");
    formattedSuffix = formattedSuffix.replace(/^_|_$/g, "");

    if (result && formattedSuffix) {
      return `${result}_${formattedSuffix}`;
    }
    if (formattedSuffix) {
      return `_${formattedSuffix}`;
    }
  }

  return result;
}

export function toPascalCase(str: string): string {
  return str
    .replace(/[^a-zA-Z0-9\s]/g, " ")
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join("");
}
