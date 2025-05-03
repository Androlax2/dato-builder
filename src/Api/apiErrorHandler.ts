import type {ErrorEntity} from "@datocms/rest-client-utils/src/errors";
import GenericDatoError from "./Error/GenericDatoError";
import NotFoundError from "./Error/NotFoundError";
import UniquenessError from "./Error/UniquenessError";
import type {ParsedError} from "./ParsedError";

type ErrorBody = { data: ErrorEntity[] };

function isErrorBody(body: unknown): body is ErrorBody {
    if (typeof body !== "object" || body === null || !("data" in body)) {
        return false;
    }

    const bodyWithData = body as { data: unknown };

    if (!Array.isArray(bodyWithData.data)) {
        return false;
    }

    const bodyWithDataList = bodyWithData as { data: unknown[] };

    if (bodyWithDataList.data.length === 0) {
        return false;
    }

    const firstEl = bodyWithDataList.data[0];

    return !(
        typeof firstEl !== "object" ||
        firstEl === null ||
        !("id" in firstEl) ||
        !("type" in firstEl) ||
        !("attributes" in firstEl) ||
        (firstEl as ErrorEntity).type !== "api_error"
    );
}

/**
 * Extracts the list of ErrorEntity items from a thrown error, or null
 */
function getErrorEntities(err: unknown): ErrorEntity[] | null {
    // Some clients attach the parsed JSON to err.response.body
    // biome-ignore lint/suspicious/noExplicitAny: any is needed here
    const resp = (err as any)?.response;
    if (resp && isErrorBody(resp.body)) {
        return (resp.body as ErrorBody).data;
    }
    return null;
}

/**
 * Parse the first ErrorEntity into our richer ParsedError
 */
export function parseApiError(err: unknown): ParsedError | null {
    const entities = getErrorEntities(err);
    if (!entities?.length) return null;

    const {
        code: outerCode,
        doc_url: docUrl,
        details,
        transient,
    } = entities[0].attributes;

    // If `details` itself has a `code` field, treat that as innerCode
    const innerCode =
        details && typeof details === "object" && "code" in details
            ? // biome-ignore lint/suspicious/noExplicitAny: any is needed here
            ((details as any).code as string)
            : undefined;

    return {
        outerCode,
        innerCode,
        details,
        docUrl,
        transient: transient ?? false,
    };
}

/**
 * Map of Dato error codes → custom exception constructors
 * We prioritize innerCode over outerCode
 */
const ERROR_MAP: Record<string, new (info: ParsedError) => GenericDatoError> = {
    VALIDATION_UNIQUENESS: UniquenessError,
    NOT_FOUND: NotFoundError,
};

/**
 * If the given error is a Dato CMA error, throw a mapped custom exception.
 * Otherwise, re-throw the original error.
 */
export function throwMappedApiError(err: unknown): never {
    const parsed = parseApiError(err);
    if (parsed) {
        const key = parsed.innerCode ?? parsed.outerCode;
        const Ctor = ERROR_MAP[key] ?? GenericDatoError;
        throw new Ctor(parsed);
    }
    throw err;
}
