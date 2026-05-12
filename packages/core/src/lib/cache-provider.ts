import { createQuartzError, QuartzErrorCode } from "@core/lib/errors";

export interface CacheProvider {
  get<T>(key: string): Promise<T> | T | null;
  set<T>(key: string, value: T, ttl?: number | string): Promise<void> | void;
  delete(key: string): Promise<void> | void;
  clear(): Promise<void> | void;
}

interface CacheItem<T = any> {
  value: T;
  expiresAt?: number;
}

class InMemoryCacheProvider implements CacheProvider {
  #cache: Map<string, CacheItem> = new Map();

  get<T>(key: string): T | null {
    const item = this.#cache.get(key);
    if (!item) return null;

    if (item.expiresAt && Date.now() > item.expiresAt) {
      this.#cache.delete(key);
      return null;
    }

    return item.value as T;
  }

  set<T>(key: string, value: T, ttl?: number | string): void {
    const item: CacheItem<T> = { value };

    if (ttl !== undefined) {
      const ttlMs = typeof ttl === "string" ? this.#parseTTL(ttl) : ttl;
      if (ttlMs > 0) {
        item.expiresAt = Date.now() + ttlMs;
      }
    }

    this.#cache.set(key, item);
  }

  delete(key: string): void {
    this.#cache.delete(key);
  }

  clear(): void {
    this.#cache.clear();
  }

  #parseTTL(ttl: string): number {
    const match = ttl.match(/^(\d+)(s|m|h|d)?$/);
    if (!match || !match.length) return 0;

    const value = parseInt(match[1]!);
    const unit = match[2] || "s";

    const multipliers = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
    return value * (multipliers[unit as keyof typeof multipliers] || 1000);
  }
}

export class CacheProviderRegistry extends null {
  static #providers: Map<string, CacheProvider> = new Map([
    ["memory", new InMemoryCacheProvider()],
  ]);

  static register(name: string, provider: CacheProvider) {
    if (!this.#providers.has(name)) {
      this.#providers.set(name, provider);
    }
  }

  static resolveCacheProvider(name: string): CacheProvider {
    if (!this.#providers.has(name)) {
      throw createQuartzError(QuartzErrorCode.CACHE_PROVIDER_NOT_FOUND, {
        providerName: name,
      });
    }
    return this.#providers.get(name)!;
  }
}
