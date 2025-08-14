export interface ILogger {
  log(message: string, meta?: Record<string, unknown>): void;
  error(message: string, stringMeta?: Record<string, unknown>): void;
  warn(message: string, meta?: Record<string, unknown>): void;
  info(message: string, meta?: Record<string, unknown>): void;
}

export type MetaFormatter = (meta: Record<string, unknown>) => string;
export type PrefixStrategy = (message: string) => string;

export interface LoggerConfig {
  readonly provider: ILogger;
  readonly metaFormatter?: MetaFormatter;
  readonly prefixStrategy?: PrefixStrategy;
}

const defaultMetaFormatter: MetaFormatter = (meta) => {
  if (!meta || Object.keys(meta).length === 0) return "";

  try {
    return JSON.stringify(meta);
  } catch {
    return "[Serialization Error]";
  }
};

const frameworkPrefix = (frameworkName: string): PrefixStrategy => {
  return (message: string) => `[${frameworkName}] ${message}`;
};

class StructuredLogger implements ILogger {
  constructor(
    private readonly provider: ILogger,
    private readonly metaFormatter: MetaFormatter,
    private readonly prefixStrategy: PrefixStrategy
  ) {}

  private formatMessage(
    message: string,
    meta?: Record<string, unknown>
  ): string {
    const prefixed = this.prefixStrategy(message);
    const formattedMeta = this.metaFormatter(meta || {});
    return formattedMeta ? `${prefixed} ${formattedMeta}` : prefixed;
  }

  log(message: string, meta?: Record<string, unknown>): void {
    this.provider.log(this.formatMessage(message, meta));
  }

  error(message: string, meta?: Record<string, unknown>): void {
    this.provider.error(this.formatMessage(message, meta));
  }

  warn(message: string, meta?: Record<string, unknown>): void {
    this.provider.warn(this.formatMessage(message, meta));
  }

  info(message: string, meta?: Record<string, unknown>): void {
    this.provider.info(this.formatMessage(message, meta));
  }
}

/**
 * Factory function to create a structured logger with customizable formatting strategies.
 *
 * @param config - Configuration object containing provider and optional strategies
 * @returns A new logger instance that decorates the provided logger
 *
 * @example
 * ```typescript
 * const logger = createLogger({
 *   provider: console,
 *   metaFormatter: defaultMetaFormatter,
 *   prefixStrategy: frameworkPrefix('MyApp')
 * });
 * ```
 */
export function createLogger(config: LoggerConfig): ILogger {
  const metaFormatter = config.metaFormatter ?? defaultMetaFormatter;
  const prefixStrategy = config.prefixStrategy ?? frameworkPrefix("Quartz");

  return new StructuredLogger(config.provider, metaFormatter, prefixStrategy);
}
