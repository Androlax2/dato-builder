export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
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
  };

  private readonly level: LogLevel;

  constructor(level: LogLevel = LogLevel.INFO) {
    this.level = level;
  }

  private shouldLog(level: LogLevel): boolean {
    return this.level >= level;
  }

  private colorize(color: string, text: string): string {
    return `${color}${text}${this.colors.reset}`;
  }

  error(...msg: string[]) {
    if (!this.shouldLog(LogLevel.ERROR)) return;

    const formatted = this.colorize(
      this.colors.red,
      `❌ ${this.prefix} ERROR: ${msg.join(" ")}`,
    );

    console.error(formatted);
  }

  warn(...msg: string[]) {
    if (!this.shouldLog(LogLevel.WARN)) return;

    const formatted = this.colorize(
      this.colors.yellow,
      `⚠️ ${this.prefix} WARN: ${msg.join(" ")}`,
    );

    console.warn(formatted);
  }

  info(...msg: string[]) {
    if (!this.shouldLog(LogLevel.INFO)) return;

    const formatted = this.colorize(
      this.colors.blue,
      `ℹ️ ${this.prefix} INFO: ${msg.join(" ")}`,
    );

    console.info(formatted);
  }

  debug(...msg: string[]) {
    if (!this.shouldLog(LogLevel.DEBUG)) return;

    const formatted = this.colorize(
      this.colors.gray,
      `🐛 ${this.prefix} DEBUG: ${msg.join(" ")}`,
    );

    console.debug(formatted);
  }

  success(...msg: string[]) {
    if (!this.shouldLog(LogLevel.INFO)) return;

    const formatted = this.colorize(
      this.colors.green,
      `✅ ${this.prefix} SUCCESS: ${msg.join(" ")}`,
    );

    console.log(formatted);
  }
}
