import { ApiError, type Client } from "@datocms/cma-client-node";
import { parseApiError, throwMappedApiError } from "./apiErrorHandler";

export default class DatoApi {
  constructor(readonly client: Client) {}

  public async call<T>(
    fn: () => Promise<T>,
    retries = 3,
    backoffMs = 500,
  ): Promise<T> {
    let lastErr: unknown;
    for (let i = 1; i <= retries; i++) {
      try {
        return await fn();
      } catch (err: unknown) {
        // Retry on transient CMA errors
        if (err instanceof ApiError) {
          const first = err.errors[0]?.attributes;
          if (first?.transient && i < retries) {
            await new Promise((r) => setTimeout(r, backoffMs * i));
            continue;
          }
        }

        // For non-transient or other errors, map CMA errors or capture last error
        const parsed = parseApiError(err);
        if (parsed) {
          throwMappedApiError(err);
        }

        lastErr = err;
        break;
      }
    }
    throw lastErr;
  }
}
