export function generateDatoApiKey(name: string, suffix?: string): string {
    return `${name
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, "_")
        .replace(/_{2,}/g, "_")
        .replace(/_$/, "")
        .replace(/^_/, "")}${suffix ? `_${suffix}` : ""}`;
}
