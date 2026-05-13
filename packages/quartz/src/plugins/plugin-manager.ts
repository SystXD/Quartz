import { createQuartzError, QuartzErrorCode } from "@quartz/lib/errors";
import { logger } from "@quartz/lib/logger/default-logger";
import { BasePlugin } from "@quartz/plugins/base-plugin";

export type PluginConstructor<T extends BasePlugin = BasePlugin> = new (
  ...args: unknown[]
) => T;

export interface PluginRegistrationOptions {
  args?: unknown[];
  autoActivate?: boolean;
}

type PluginMethodParams<K extends keyof BasePlugin> = BasePlugin[K] extends (
  ...a: infer A
) => unknown
  ? A
  : never;

type PluginMethodReturn<K extends keyof BasePlugin> = BasePlugin[K] extends (
  ...a: any
) => infer R
  ? R
  : never;

export class PluginManager {
  private readonly plugins = new Map<string, BasePlugin>();

  public async register<T extends BasePlugin>(
    PluginClass: PluginConstructor<T>,
    options: PluginRegistrationOptions = {},
  ): Promise<T> {
    const { args = [], autoActivate = false } = options;

    let plugin: T;
    try {
      plugin = new PluginClass(...args);
    } catch (err) {
      logger.error(
        `[QuartzError] Failed to construct plugin ${PluginClass.name}`,
        { cause: err },
      );
      throw err;
    }

    if (this.plugins.has(plugin.name)) {
      throw createQuartzError(QuartzErrorCode.PLUGIN_ALREADY_REGISTERED, {
        pluginName: plugin.name,
      });
    }

    this.plugins.set(plugin.name, plugin);

    if (autoActivate) {
      try {
        await plugin.activate();
      } catch (err) {
        logger.error(
          `[QuartzError] Failed to auto-activate plugin ${plugin.name}`,
          { cause: err },
        );
      }
    }

    return plugin;
  }

  public async unregister(name: string): Promise<boolean> {
    const plugin = this.get(name);
    if (!plugin) return false;

    if (plugin.isActive) {
      try {
        await plugin.deactivate();
      } catch (err) {
        logger.error(
          `[QuartzError] Failed to deactivate plugin ${plugin.name}`,
          { cause: err },
        );
      }
    }

    this.plugins.delete(plugin.name);
    return true;
  }

  public async activate(name: string): Promise<boolean> {
    const plugin = this.get(name);
    if (!plugin) return false;

    try {
      await plugin.activate();
      return true;
    } catch (err) {
      logger.error(`[QuartzError] Failed to activate plugin ${plugin.name}`, {
        cause: err,
      });
      return false;
    }
  }

  public async deactivate(name: string): Promise<boolean> {
    const plugin = this.get(name);
    if (!plugin) return false;

    try {
      await plugin.deactivate();
      return true;
    } catch (err) {
      logger.error(`[QuartzError] Failed to deactivate plugin ${plugin.name}`, {
        cause: err,
      });
      return false;
    }
  }

  public async runHook<K extends keyof BasePlugin>(
    hookName: K,
    ...args: PluginMethodParams<K> extends never ? [] : PluginMethodParams<K>
  ): Promise<Array<Awaited<PluginMethodReturn<K>>>> {
    const results: Array<Awaited<PluginMethodReturn<K>>> = [];
    for (const plugin of this.plugins.values()) {
      try {
        const method = plugin[hookName];
        if (plugin.isActive && typeof method === "function") {
          const result = await Promise.resolve(
            (
              method as (...a: PluginMethodParams<K>) => PluginMethodReturn<K>
            ).apply(plugin, args as PluginMethodParams<K>),
          );
          results.push(result as Awaited<PluginMethodReturn<K>>);
        }
      } catch (err) {
        logger.error(
          `[QuartzError] "${hookName.toString()}" hook failed for ${plugin.name}`,
          {
            cause: err,
          },
        );
      }
    }
    return results;
  }

  public get<T extends BasePlugin = BasePlugin>(name: string): T | undefined {
    return this.plugins.get(name) as T | undefined;
  }

  public getAll(): BasePlugin[] {
    return Array.from(this.plugins.values());
  }

  public get size(): number {
    return this.plugins.size;
  }
}
