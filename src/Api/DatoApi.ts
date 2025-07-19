import { ApiError, type Client } from "@datocms/cma-client-node";
import { ConsoleLogger } from "../logger";
import { parseApiError, throwMappedApiError } from "./apiErrorHandler";

export default class DatoApi {
  private logger: ConsoleLogger;
  
  constructor(readonly client: Client, logger?: ConsoleLogger) {
    this.logger = logger || new ConsoleLogger();
  }

  public async call<T>(
    fn: () => Promise<T>,
    retries = 3,
    backoffMs = 500,
    operation?: string,
    requestData?: any,
  ): Promise<T> {
    const startTime = Date.now();
    const operationName = operation || 'unknown';
    
    this.logger.debug(`API Call Start: ${operationName}`);
    if (requestData) {
      this.logger.debugJson(`API Request Data: ${operationName}`, requestData);
    }
    
    let lastErr: unknown;
    for (let i = 1; i <= retries; i++) {
      try {
        const result = await fn();
        const duration = Date.now() - startTime;
        this.logger.debug(`API Call End: ${operationName} (${duration}ms)`);
        
        // Log response data (but truncate large responses)
        if (Array.isArray(result) && result.length > 0) {
          this.logger.debugJson(`API Response: ${operationName} (${result.length} items)`, {
            count: result.length,
            sample: result[0],
          });
        } else if (result && typeof result === 'object') {
          this.logger.debugJson(`API Response: ${operationName}`, result);
        }
        
        return result;
      } catch (err: unknown) {
        // Retry on transient CMA errors
        if (err instanceof ApiError) {
          const first = err.errors[0]?.attributes;
          if (first?.transient && i < retries) {
            this.logger.debug(`API Retry: ${operationName} (attempt ${i}, transient error)`);
            await new Promise((r) => setTimeout(r, backoffMs * i));
            continue;
          }
        }

        // For non-transient or other errors, map CMA errors or capture last error
        const parsed = parseApiError(err);
        if (parsed) {
          const duration = Date.now() - startTime;
          this.logger.debug(`API Error: ${operationName} (${duration}ms) - ${(err as Error).message}`);
          if (err instanceof ApiError) {
            this.logger.debugJson(`API Error Details: ${operationName}`, {
              message: err.message,
              errors: err.errors,
            });
          }
          throwMappedApiError(err);
        }

        lastErr = err;
        break;
      }
    }
    
    const duration = Date.now() - startTime;
    this.logger.debug(`API Error: ${operationName} (${duration}ms) - ${(lastErr as Error).message}`);
    throw lastErr;
  }
}
