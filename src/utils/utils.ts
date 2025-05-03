export function generateDatoApiKey(name: string, suffix?: string): string {
    // 1. lowercase + non-alphanumerics → underscores
    // 2. collapse multiple underscores
    // 3. remove underscore before digits
    // 4. trim leading/trailing underscores
    // 5. append suffix if provided
    return `${
        name
            .toLowerCase()
            .replace(/[^a-z0-9_]/g, "_")
            .replace(/_{2,}/g, "_")
            .replace(/_([0-9])/g, "$1") // remove underscore before numbers
            .replace(/^_+|_+$/g, "") // trim leading/trailing _
    }${suffix ? `_${suffix}` : ""}`;
}
