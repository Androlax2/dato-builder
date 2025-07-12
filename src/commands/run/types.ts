export interface FileInfo {
  name: string;
  type: "block" | "model";
  filePath: string;
  dependencies: Set<string>;
}

export interface BuildResult {
  name: string;
  type: "block" | "model";
  fromCache: boolean;
  success: boolean;
  error?: Error | string;
}
