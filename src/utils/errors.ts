import type GenericDatoError from "../Api/Error/GenericDatoError.js";
/**
 * Operation types for error messaging
 */
export type OperationType = "create" | "update" | "delete";

/**
 * Interface for resources with id and api_key
 */
export interface ResourceWithKey {
  id: string;
  api_key: string;
}

/**
 * Creates a human-readable error message for API operations
 *
 * @param operation - The type of operation being performed (create, update, delete)
 * @param error - The error that occurred
 * @param resourceType - The type of resource being operated on (field, model, etc.)
 * @param resourceDef - The resource definition for create/update operations
 * @param existingResource - The existing resource for update/delete operations
 * @returns A formatted error message with user-friendly explanation and technical details
 */
export function createUserFriendlyErrorMessage(
  operation: OperationType,
  error: unknown,
  resourceType: string,
  // biome-ignore lint/suspicious/noExplicitAny: any is needed here
  resourceDef?: { api_key: string; [key: string]: any },
  existingResource?: ResourceWithKey,
): string {
  // Handle GenericDatoError
  if (isDatoError(error)) {
    const datoError = error as GenericDatoError;
    const errorDetails = datoError.info.details || {};
    const errorField = errorDetails.field || "";

    // Base message depends on operation
    let message = "";
    if (operation === "create") {
      message = `Failed to create ${resourceType} "${resourceDef?.api_key}": `;
    } else if (operation === "update") {
      message = `Failed to update ${resourceType} "${resourceDef?.api_key}" (id: ${existingResource?.id}): `;
    } else if (operation === "delete") {
      message = `Failed to delete ${resourceType} "${existingResource?.api_key}" (id: ${existingResource?.id}): `;
    }

    // Add explanation based on error type
    message += getErrorExplanation(
      datoError.info.innerCode,
      errorField,
      resourceType,
    );

    // Add technical details for developers
    message += `\n\nTechnical details: [${datoError.info.outerCode}/${
      datoError.info.innerCode || ""
    }] ${JSON.stringify(errorDetails)}`;

    // Add resource definition as debug info for create/update operations
    if ((operation === "create" || operation === "update") && resourceDef) {
      message += `\n\n${resourceType} definition: ${JSON.stringify(
        resourceDef,
        null,
        2,
      )}`;
    }

    return message;
  }

  // Handle other errors
  const errorMessage = error instanceof Error ? error.message : String(error);
  if (operation === "create") {
    return `Failed to create ${resourceType} "${resourceDef?.api_key}": ${errorMessage}`;
  }

  if (operation === "update") {
    return `Failed to update ${resourceType} "${resourceDef?.api_key}" (id: ${existingResource?.id}): ${errorMessage}`;
  }

  return `Failed to delete ${resourceType} "${existingResource?.api_key}" (id: ${existingResource?.id}): ${errorMessage}`;
}

/**
 * Check if an error is a DatoCMS error
 */
function isDatoError(error: unknown): boolean {
  return <boolean>(
    (error &&
      typeof error === "object" &&
      "name" in error &&
      error.name === "GenericDatoError" &&
      "info" in error)
  );
}

/**
 * Get a user-friendly explanation based on error code
 */
function getErrorExplanation(
  innerCode: string | undefined,
  errorField: string,
  resourceType: string,
): string {
  switch (innerCode) {
    case "VALIDATION_RESERVED":
      return `The ${resourceType} name "${errorField}" is reserved by the system and cannot be used.`;

    case "VALIDATION_INVALID": {
      // Extract problematic part from the path
      const fieldPath = errorField.split(".");
      const lastPart = fieldPath[fieldPath.length - 1];
      let message = `Invalid value for "${lastPart}" in the ${resourceType} configuration.`;

      // Add more specific advice for common cases
      if (errorField.includes("item_types")) {
        message +=
          " The specified item type ID may not exist or may not be compatible.";
      }
      return message;
    }

    case "VALIDATION_UNIQUENESS":
      return `A ${resourceType} with this API key already exists.`;

    case "VALIDATION_DEPENDENCY":
      return `This ${resourceType} cannot be deleted because other content depends on it.`;

    case "VALIDATION_REQUIRED":
      return `This ${resourceType} is required by the system and cannot be deleted.`;

    default:
      return `Validation failed for "${errorField}".`;
  }
}

/**
 * Wrapper for API calls with error handling
 *
 * @param operation - The type of operation being performed
 * @param apiCall - The API call function to execute
 * @param resourceType - The type of resource being operated on
 * @param resourceDef - The resource definition for create/update operations
 * @param existingResource - The existing resource for update/delete operations
 * @returns The result of the API call
 * @throws Enhanced error with user-friendly message
 */
export async function executeWithErrorHandling<T>(
  operation: OperationType,
  apiCall: () => Promise<T>,
  resourceType: string,
  // biome-ignore lint/suspicious/noExplicitAny: any is needed here
  resourceDef?: { api_key: string; [key: string]: any },
  existingResource?: ResourceWithKey,
): Promise<T> {
  try {
    return await apiCall();
  } catch (error: unknown) {
    const errorMessage = createUserFriendlyErrorMessage(
      operation,
      error,
      resourceType,
      resourceDef,
      existingResource,
    );

    throw new Error(errorMessage);
  }
}
