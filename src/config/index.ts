import {
  type Client as DatoClient,
  buildClient,
} from "@datocms/cma-client-node";
import { loadDatoBuilderConfig } from "./loader";
import type { DatoBuilderConfig } from "./types";

const { apiToken } = loadDatoBuilderConfig() as Required<
  Pick<DatoBuilderConfig, "apiToken">
>;

const clientInstance: DatoClient = buildClient({ apiToken });

/**
 * Retrieve the singleton DatoCMS CMA client, already configured
 * with the project’s apiToken from dato-builder.config.
 */
export function getDatoClient(): DatoClient {
  return clientInstance;
}
