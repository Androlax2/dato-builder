type SlugifySeparator = "-" | "_";

export function slugify(
  text: string,
  separator: SlugifySeparator = "-",
): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, separator) // Replace spaces with separator
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, separator) // Replace multiple hyphens with single one
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, ""); // Trim - from end of text
}
