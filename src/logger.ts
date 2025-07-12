export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

export interface LogContext {
  model?: string;
  block?: string;
  itemType?: string;
  field?: string;
  operation?: string;
  [key: string]: string | undefined;
}

export class ConsoleLogger {
  private readonly prefix = "[dato-builder]";
  private colors = {
    reset: "\x1b[0m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    gray: "\x1b[90m",
    cyan: "\x1b[36m",
    magenta: "\x1b[35m",
  };

  private readonly level: LogLevel;
  private readonly context: LogContext;

  constructor(level: LogLevel = LogLevel.INFO, context: LogContext = {}) {
    this.level = level;
    this.context = context;
  }

  // Create a child logger with additional context
  child(additionalContext: LogContext): ConsoleLogger {
    return new ConsoleLogger(this.level, {
      ...this.context,
      ...additionalContext,
    });
  }

  private shouldLog(level: LogLevel): boolean {
    return this.level >= level;
  }

  private colorize(color: string, text: string): string {
    return `${color}${text}${this.colors.reset}`;
  }

  private formatContext(): string {
    const contextParts: string[] = [];

    if (this.context.model) {
      contextParts.push(
        this.colorize(this.colors.cyan, `[${this.context.model}]`),
      );
    }

    if (this.context.block) {
      contextParts.push(
        this.colorize(this.colors.magenta, `[${this.context.block}]`),
      );
    }

    if (this.context.itemType) {
      contextParts.push(
        this.colorize(this.colors.blue, `[itemType:${this.context.itemType}]`),
      );
    }

    if (this.context.field) {
      contextParts.push(
        this.colorize(this.colors.yellow, `[field:${this.context.field}]`),
      );
    }

    if (this.context.operation) {
      contextParts.push(
        this.colorize(this.colors.green, `[op:${this.context.operation}]`),
      );
    }

    // Add any other context keys
    Object.entries(this.context).forEach(([key, value]) => {
      if (
        !["model", "block", "itemType", "field", "operation"].includes(key) &&
        value
      ) {
        contextParts.push(this.colorize(this.colors.gray, `[${key}:${value}]`));
      }
    });

    return contextParts.length > 0 ? `${contextParts.join(" ")} ` : "";
  }

  error(...msg: string[]) {
    if (!this.shouldLog(LogLevel.ERROR)) return;

    const formatted = this.colorize(
      this.colors.red,
      `❌ ${this.prefix} ${this.formatContext()}ERROR: ${msg.join(" ")}`,
    );

    console.error(formatted);
  }

  warn(...msg: string[]) {
    if (!this.shouldLog(LogLevel.WARN)) return;

    const formatted = this.colorize(
      this.colors.yellow,
      `⚠️ ${this.prefix} ${this.formatContext()}WARN: ${msg.join(" ")}`,
    );

    console.warn(formatted);
  }

  info(...msg: string[]) {
    if (!this.shouldLog(LogLevel.INFO)) return;

    const formatted = this.colorize(
      this.colors.blue,
      `ℹ️ ${this.prefix} ${this.formatContext()}INFO: ${msg.join(" ")}`,
    );

    console.info(formatted);
  }

  debug(...msg: string[]) {
    if (!this.shouldLog(LogLevel.DEBUG)) return;

    const formatted = this.colorize(
      this.colors.gray,
      `🐛 ${this.prefix} ${this.formatContext()}DEBUG: ${msg.join(" ")}`,
    );

    console.debug(formatted);
  }

  // Special method for logging JSON objects with pretty formatting
  debugJson(message: string, obj: any) {
    if (!this.shouldLog(LogLevel.DEBUG)) return;

    const prettyJson = JSON.stringify(obj, null, 2);
    const formatted = this.colorize(
      this.colors.gray,
      `🐛 ${this.prefix} ${this.formatContext()}DEBUG: ${message}`,
    );

    console.debug(formatted);
    console.debug(this.colorize(this.colors.gray, prettyJson));
  }

  // Compact JSON formatting (single line but with spaces)
  debugJsonCompact(message: string, obj: any) {
    if (!this.shouldLog(LogLevel.DEBUG)) return;

    const compactJson = JSON.stringify(obj, null, 0)
      .replace(/,/g, ", ")
      .replace(/:/g, ": ");
    const formatted = this.colorize(
      this.colors.gray,
      `🐛 ${this.prefix} ${this.formatContext()}DEBUG: ${message} ${compactJson}`,
    );

    console.debug(formatted);
  }

  success(...msg: string[]) {
    if (!this.shouldLog(LogLevel.INFO)) return;

    const formatted = this.colorize(
      this.colors.green,
      `✅ ${this.prefix} ${this.formatContext()}SUCCESS: ${msg.join(" ")}`,
    );

    console.log(formatted);
  }
}
