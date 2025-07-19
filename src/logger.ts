export enum LogLevel {
  NONE = -1,
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
  TRACE = 4,
}

export interface LogContext {
  model?: string;
  block?: string;
  itemType?: string;
  field?: string;
  operation?: string;
  [key: string]: string | number | boolean | undefined;
}

export interface LoggerOptions {
  prefix?: string;
  colors?: boolean;
  timestamp?: boolean;
  contextOrder?: string[];
  maxContextLength?: number;
  prettyJson?: boolean;
}

export class ConsoleLogger {
  private readonly prefix: string = "";
  private readonly enableColors: boolean;
  private readonly showTimestamp: boolean;
  private readonly contextOrder: string[];
  private readonly maxContextLength: number;
  private readonly prettyJson: boolean;
  private readonly timers = new Map<string, number>();

  private readonly colors = {
    reset: "\x1b[0m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    gray: "\x1b[90m",
    cyan: "\x1b[36m",
    magenta: "\x1b[35m",
    white: "\x1b[37m",
    bold: "\x1b[1m",
    dim: "\x1b[2m",
  };

  private readonly level: LogLevel;
  private readonly context: LogContext;

  constructor(
    level: LogLevel = LogLevel.INFO,
    context: LogContext = {},
    options: LoggerOptions = {},
  ) {
    this.level = level;
    this.context = context;
    this.prefix = options.prefix || "";
    this.enableColors = options.colors !== false;
    this.showTimestamp = options.timestamp || false;
    this.contextOrder = options.contextOrder || [
      "model",
      "block",
      "itemType",
      "field",
      "operation",
    ];
    this.maxContextLength = options.maxContextLength || 30;
    this.prettyJson = options.prettyJson !== false;
  }

  // Create a child logger with additional context
  child(additionalContext: LogContext): ConsoleLogger {
    return new ConsoleLogger(
      this.level,
      { ...this.context, ...additionalContext },
      {
        prefix: this.prefix,
        colors: this.enableColors,
        timestamp: this.showTimestamp,
        contextOrder: this.contextOrder,
        maxContextLength: this.maxContextLength,
        prettyJson: this.prettyJson,
      },
    );
  }

  // Update log level
  setLevel(level: LogLevel): void {
    (this as any).level = level;
  }

  private shouldLog(level: LogLevel): boolean {
    return this.level >= level;
  }

  private colorize(color: string, text: string): string {
    if (!this.enableColors) return text;
    return `${color}${text}${this.colors.reset}`;
  }

  private formatTimestamp(): string {
    if (!this.showTimestamp) return "";
    const now = new Date();
    const time = now.toTimeString().split(" ")[0];
    return this.colorize(this.colors.dim, `[${time}] `);
  }

  private truncateContext(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return `${text.substring(0, maxLength - 3)}...`;
  }

  private formatContext(): string {
    const contextParts: string[] = [];

    // Add contexts in specified order
    for (const key of this.contextOrder) {
      const value = this.context[key];
      if (value !== undefined) {
        let formatted = "";
        let color = this.colors.gray;

        switch (key) {
          case "model":
            formatted = `${value}`;
            color = this.colors.cyan;
            break;
          case "block":
            formatted = `${value}`;
            color = this.colors.magenta;
            break;
          case "itemType":
            formatted = `${value}`;
            color = this.colors.blue;
            break;
          case "field":
            formatted = `${value}`;
            color = this.colors.yellow;
            break;
          case "operation":
            formatted = `${value}`;
            color = this.colors.green;
            break;
          default:
            formatted = `${key}:${value}`;
        }

        const truncated = this.truncateContext(
          formatted,
          this.maxContextLength,
        );
        contextParts.push(this.colorize(color, `[${truncated}]`));
      }
    }

    // Add any remaining context keys not in the order
    for (const [key, value] of Object.entries(this.context)) {
      if (!this.contextOrder.includes(key) && value !== undefined) {
        const formatted = this.truncateContext(
          `${key}:${value}`,
          this.maxContextLength,
        );
        contextParts.push(this.colorize(this.colors.gray, `[${formatted}]`));
      }
    }

    return contextParts.length > 0 ? `${contextParts.join(" ")} ` : "";
  }

  private formatMessage(level: string, color: string, ...msg: any[]): string {
    const timestamp = this.formatTimestamp();
    const context = this.formatContext();
    const prefixStr = this.prefix ?? "";
    const prefixText = prefixStr
      ? `${this.colorize(this.colors.dim, prefixStr)} `
      : "";

    const bodyText = `${level}: ${msg.join(" ")}`;
    const coloredBody = this.colorize(color, bodyText);

    return `${timestamp} ${prefixText}${context}${coloredBody}`;
  }

  error(...msg: any[]) {
    if (!this.shouldLog(LogLevel.ERROR)) return;
    const formatted = this.formatMessage("ERROR", this.colors.red, ...msg);
    console.error(formatted);
  }

  warn(...msg: any[]) {
    if (!this.shouldLog(LogLevel.WARN)) return;
    const formatted = this.formatMessage("WARN", this.colors.yellow, ...msg);
    console.warn(formatted);
  }

  info(...msg: any[]) {
    if (!this.shouldLog(LogLevel.INFO)) return;
    const formatted = this.formatMessage("INFO", this.colors.blue, ...msg);
    console.info(formatted);
  }

  debug(...msg: any[]) {
    if (!this.shouldLog(LogLevel.DEBUG)) return;
    const formatted = this.formatMessage("DEBUG", this.colors.gray, ...msg);
    console.debug(formatted);
  }

  trace(...msg: any[]) {
    if (!this.shouldLog(LogLevel.TRACE)) return;
    const formatted = this.formatMessage("TRACE", this.colors.dim, ...msg);
    console.debug(formatted);
  }

  success(...msg: any[]) {
    if (!this.shouldLog(LogLevel.INFO)) return;
    const formatted = this.formatMessage("SUCCESS", this.colors.green, ...msg);
    console.log(formatted);
  }

  // Enhanced JSON logging with better formatting
  json(message: string, obj: any, level: LogLevel = LogLevel.DEBUG) {
    if (!this.shouldLog(level)) return;

    const levelMap = {
      [LogLevel.NONE]: {
        method: () => {},
        color: this.colors.reset,
      },
      [LogLevel.ERROR]: {
        method: console.error,
        color: this.colors.red,
      },
      [LogLevel.WARN]: {
        method: console.warn,
        color: this.colors.yellow,
      },
      [LogLevel.INFO]: {
        method: console.info,
        color: this.colors.blue,
      },
      [LogLevel.DEBUG]: {
        method: console.debug,
        color: this.colors.gray,
      },
      [LogLevel.TRACE]: {
        method: console.debug,
        color: this.colors.dim,
      },
    };

    const { method, color } = levelMap[level];
    const timestamp = this.formatTimestamp();
    const context = this.formatContext();
    const prefixText = this.colorize(this.colors.dim, this.prefix);
    const levelText = this.colorize(color, LogLevel[level]);

    // Format the header
    const header = `${timestamp} ${prefixText} ${context}${levelText}: ${message}`;
    method(header);

    // Format the JSON with proper indentation and colors
    if (this.prettyJson) {
      const jsonStr = JSON.stringify(obj, null, 2);
      const coloredJson = this.enableColors
        ? this.colorize(this.colors.dim, jsonStr)
        : jsonStr;
      method(coloredJson);
    } else {
      // Compact but readable format
      const compactJson = JSON.stringify(obj, null, 0)
        .replace(/,/g, ", ")
        .replace(/:/g, ": ")
        .replace(/\{/g, "{ ")
        .replace(/\}/g, " }");
      const coloredJson = this.enableColors
        ? this.colorize(this.colors.dim, compactJson)
        : compactJson;
      method(coloredJson);
    }
  }

  debugJson(message: string, obj: any) {
    this.json(message, obj, LogLevel.DEBUG);
  }

  infoJson(message: string, obj: any) {
    this.json(message, obj, LogLevel.INFO);
  }

  errorJson(message: string, obj: any) {
    this.json(message, obj, LogLevel.ERROR);
  }

  traceJson(message: string, obj: any) {
    this.json(message, obj, LogLevel.TRACE);
  }

  time(label: string) {
    this.timers.set(label, Date.now());
    this.debug(`Timer started: ${label}`);
  }

  timeEnd(label: string) {
    const startTime = this.timers.get(label);
    if (startTime === undefined) {
      this.warn(`Timer "${label}" was not started`);
      return;
    }

    const elapsed = Date.now() - startTime;
    this.timers.delete(label);
    this.debug(`Timer ended: ${label} (${elapsed}ms)`);
    return elapsed;
  }

  clearTimers() {
    if (this.timers.size === 0) {
      return;
    }

    this.timers.clear();
    this.debug("All timers cleared from memory");
  }

  clearTimer(label: string) {
    if (this.timers.has(label)) {
      this.timers.delete(label);
      this.debug(`Timer "${label}" cleared from memory`);
    } else {
      this.warn(`Timer "${label}" does not exist`);
    }
  }

  getActiveTimers(): string[] {
    return Array.from(this.timers.keys());
  }

  cleanupOldTimers(maxAgeMs: number) {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [label, startTime] of this.timers.entries()) {
      if (now - startTime > maxAgeMs) {
        this.timers.delete(label);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      this.debug(
        `Cleaned up ${cleanedCount} old timer(s) older than ${maxAgeMs}ms`,
      );
    }
  }

  progress(current: number, total: number, item?: string) {
    if (!this.shouldLog(LogLevel.INFO)) return;

    const percentage = Math.round((current / total) * 100);
    const bar =
      "█".repeat(Math.floor(percentage / 5)) +
      "░".repeat(20 - Math.floor(percentage / 5));
    const itemText = item ? ` - ${item}` : "";

    const formatted = this.formatMessage(
      "PROGRESS",
      this.colors.blue,
      `[${bar}] ${percentage}% (${current}/${total})${itemText}`,
    );

    // Use \r to overwrite the same line for progress updates
    process.stdout.write(`\r${formatted}`);

    // If we're at 100%, add a newline
    if (current === total) {
      process.stdout.write("\n");
    }
  }

  banner(title: string, details?: string[]) {
    if (!this.shouldLog(LogLevel.INFO)) return;

    const width = 60;
    const border = "=".repeat(width);
    const titleLine = `${title}`
      .padStart((width + title.length) / 2)
      .padEnd(width);

    console.log(this.colorize(this.colors.blue + this.colors.bold, border));
    console.log(this.colorize(this.colors.blue + this.colors.bold, titleLine));

    if (details) {
      for (const detail of details) {
        const detailLine = `${detail}`.padEnd(width);
        console.log(this.colorize(this.colors.blue, detailLine));
      }
    }

    console.log(this.colorize(this.colors.blue + this.colors.bold, border));
  }

  table(data: Record<string, any>[]) {
    if (!this.shouldLog(LogLevel.INFO)) return;
    console.table(data);
  }

  group(label: string) {
    if (!this.shouldLog(LogLevel.DEBUG)) return;
    console.group(this.colorize(this.colors.bold, `${label}`));
  }

  groupEnd() {
    if (!this.shouldLog(LogLevel.DEBUG)) return;
    console.groupEnd();
  }

  operation(operation: string) {
    return this.child({ operation });
  }

  item(type: string, name: string) {
    return this.child({ [type]: name });
  }
}
