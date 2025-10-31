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
import { QuartzEvents } from "@core/events/quartz-events";

interface QuartzReryOptions {
  /** Maximum number of times to retry connection**/
  maxRetry: number;

  /** Whether to retry connection or not */
  enabled: boolean;

  /** How long to wait between retries in milliseconds */
  retryTimeout: number;
}

interface QuartzPluginOptions {
  plugins?: (new (...args: unknown[]) => BasePlugin)[];
}

type QuartzClientOptions = QuartzReryOptions &
  QuartzPluginOptions & { cacheProvider: CacheProvider };

export class QuartzClient<T extends ClientAdapter<T>> extends EventEmitter {
  /**
   * @param adapter ClientAdapter instance
   * @param retryOptions Options to control how many times connection is retried
   * - `maxRetry`: Maximum number of times to retry connection
   * - `enabled`: Whether to retry connection or not
   * - `retryTimeout`: How long to wait between retries in milliseconds
   */
  public cache!: CacheProvider;
  constructor(
    private adapter: ClientAdapter<T>,
    private clientOptions: QuartzClientOptions = {
      maxRetry: 5,
      enabled: true,
      retryTimeout: 1000,
      cacheProvider: CacheProviderRegistry.resolveCacheProvider("memory")!,
    },
  ) {
    super();
    this.cache = this.clientOptions.cacheProvider;
    this.clientOptions.plugins?.forEach((plugin) =>
      this.#pluginsResolver.register(plugin),
    );
  }

  commandResolver = new RESTCommandHandler(new REST());
  #pluginsResolver = new PluginManager();

  /**
   * Connect to the adapter and start the client
   * @throws {QuartzErrorCode.MAX_CONNCETIONS_EXCEEDED} If the maximum number of retries is exceeded
   * @throws {QuartzErrorCode.CONNECTION_FAILED} If the connection fails and retry is disabled
   */

  get client(): ClientAdapter<T> {
    return this.adapter.adapterClient;
  }

  async start() {
    try {
      this.#pluginsResolver.runHook("onBeforeConnect");
      await this.adapter.connect();
      this.#pluginsResolver.runHook("onAfterConnect");
    } catch (error) {
      if (this.clientOptions.enabled) {
        await retry(async () => this.adapter.connect(), {
          maxRetry: this.clientOptions.maxRetry,
          retryTimeout: this.clientOptions.retryTimeout,
          onRetry: (err, attemp) =>
            logger.warn(
              `Connection FAILED: ${attemp} ${err} retrying connection in ${this.clientOptions.retryTimeout}ms`,
            ),
        }).catch(() => {
          throw createQuartzError(QuartzErrorCode.MAX_CONNCETIONS_EXCEEDED, {
            adapterName: this.adapter.adapterName,
          });
        });
        return;
      }
      throw createQuartzError(
        QuartzErrorCode.CONNECTION_FAILED,
        {
          adapterName: this.adapter.adapterName,
        },
        { cause: error },
      );
    }
  }

  isReady(): Promise<boolean> {
    return this.adapter.isReady();
  }

  on<K extends keyof typeof QuartzEvents>(
    eventName: K,
    listener: (...args: any[]) => void,
  ): this {
    super.on(eventName, listener);
    return this;
  }

  once<K extends keyof typeof QuartzEvents>(
    eventName: K,
    listener: (...args: any[]) => void,
  ): this {
    super.once(eventName, listener);
    return this;
  }
}
