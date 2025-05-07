import pluralize from "pluralize";

export function generateDatoApiKey(name: string, suffix?: string): string {
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

  // Singularize each word
  words = words.map(pluralize.singular);

  // Rejoin words
  result = words.join("_");

  // Handle the suffix if provided
  if (suffix) {
    // Process suffix the same way as main string (except singularization)
    let formattedSuffix = suffix.toLowerCase();
    formattedSuffix = formattedSuffix.replace(/[^a-z0-9]/g, "_");
    formattedSuffix = formattedSuffix.replace(/_([0-9])/g, "$1");
    formattedSuffix = formattedSuffix.replace(/_+/g, "_");
    formattedSuffix = formattedSuffix.replace(/^_|_$/g, "");

    // Append suffix with underscore if both parts exist
    if (result && formattedSuffix) {
      return `${result}_${formattedSuffix}`;
    }
    if (formattedSuffix) {
      return `_${formattedSuffix}`;
    }
  }

  return result;
}
