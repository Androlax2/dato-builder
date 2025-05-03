import {buildClient, type Client as DatoClient,} from "@datocms/cma-client-node";

let clientInstance: DatoClient | null = null;

export function configureDatoClient(config: { apiToken: string }) {
    clientInstance = buildClient(config);
}

export function getDatoClient(): DatoClient {
    if (!clientInstance) {
        throw new Error(
            "Dato client is not configured. Call `configureDatoClient()` first.",
        );
    }
    return clientInstance;
}
