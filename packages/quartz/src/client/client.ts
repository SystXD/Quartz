import { ClientAdapter } from "@core/lib/adapter";
import { createQuartzError, QuartzErrorCode } from "@quartz/lib/errors";
import { retry } from "@quartz/lib/utils";
import { EventEmitter } from "events";
import { logger } from "@quartz/lib/logger/default-logger";
import { RESTCommandHandler } from "@quartz/register/rest-register";
import { REST } from "@discordjs/rest";
import { PluginManager } from "@quartz/plugins/plugin-manager";
import { BasePlugin } from "@quartz/plugins/base-plugin";
import {
  CacheProviderRegistry,
  CacheProvider,
} from "@quartz/lib/cache-provider";
import { QuartzEventMap, QuartzEventName } from "@core/events/quartz-events";

interface QuartzRetryOptions {
  maxRetry: number;
  enabled: boolean;
  retryTimeout: number;
}

type QuartzClientOptions = QuartzRetryOptions & {
  plugins?: (new (...args: unknown[]) => BasePlugin)[];
  cacheProvider: CacheProvider;
};

const defaultOptions: QuartzClientOptions = {
  maxRetry: 5,
  enabled: true,
  retryTimeout: 1000,
  cacheProvider: CacheProviderRegistry.resolveCacheProvider("memory")!,
};

export class QuartzClient<T extends ClientAdapter<T>> extends EventEmitter {
  public cache: CacheProvider;
  #plugins = new PluginManager();
  readonly commandResolver = new RESTCommandHandler(new REST());

  constructor(
    private adapter: ClientAdapter<T>,
    private options: QuartzClientOptions = defaultOptions,
  ) {
    super();
    this.cache = options.cacheProvider;
    options.plugins?.forEach((p) => this.#plugins.register(p));
  }

  get client(): ClientAdapter<T> {
    return this.adapter.adapterClient;
  }

  async start(): Promise<void> {
    try {
      await this.#plugins.runHook("onBeforeConnect");
      await this.adapter.connect();
      await this.#plugins.runHook("onAfterConnect");
    } catch (error) {
      if (!this.options.enabled) {
        throw createQuartzError(
          QuartzErrorCode.CONNECTION_FAILED,
          {
            adapterName: this.adapter.adapterName,
          },
          { cause: error },
        );
      }

      await retry(() => this.adapter.connect(), {
        maxRetry: this.options.maxRetry,
        retryTimeout: this.options.retryTimeout,
        onRetry: (err, attempt) =>
          logger.warn(
            `Connection failed (attempt ${attempt}): ${err} — retrying in ${this.options.retryTimeout}ms`,
          ),
      }).catch(() => {
        throw createQuartzError(QuartzErrorCode.MAX_CONNCETIONS_EXCEEDED, {
          adapterName: this.adapter.adapterName,
        });
      });
    }
  }

  isReady(): Promise<boolean> {
    return this.adapter.isReady();
  }

  on<K extends QuartzEventName>(
    event: K,
    listener: (...args: QuartzEventMap[K]) => void,
  ): this {
    super.on(event, listener as (...args: unknown[]) => void);
    return this;
  }

  once<K extends QuartzEventName>(
    event: K,
    listener: (...args: QuartzEventMap[K]) => void,
  ): this {
    super.once(event, listener as (...args: unknown[]) => void);
    return this;
  }

  emit<K extends QuartzEventName>(
    event: K,
    ...args: QuartzEventMap[K]
  ): boolean {
    return super.emit(event, ...args);
  }
}


