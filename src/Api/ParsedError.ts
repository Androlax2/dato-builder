export type ParsedError = {
    /** The top‐level CMA error code, e.g. "INVALID_FIELD" */
    outerCode: string;
    /** The nested validation code, e.g. "VALIDATION_UNIQUENESS" */
    innerCode?: string;
    /** The raw `details` object from the error */
    // biome-ignore lint/suspicious/noExplicitAny: Any is needed here
    details: any;
    /** URL to the docs for this error */
    docUrl: string;
    /** If true, it’s safe to retry */
    transient: boolean;
};
