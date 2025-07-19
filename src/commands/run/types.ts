export interface FileInfo {
  name: string;
  type: "block" | "model";
  filePath: string;
  dependencies: Set<string>;
}

export interface BuildResult {
  name: string;
  type: "block" | "model" | "unknown";
  fromCache: boolean;
  success: boolean;
  error?: Error | string;
}
