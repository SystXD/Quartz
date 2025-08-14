import { randomUUID } from "crypto";

/**
 * Plugin metadata interface
 */
export interface PluginMetadata {
  /**
   * Plugin name
   */
  readonly name: string;
  /**
   * Plugin version
   */
  readonly version: string;
  /**
   * Plugin description
   */
  readonly description?: string;
  /**
   * Plugin author
   */
  readonly author?: string;
}

/**
 * Base class for all plugins
 */
export abstract class BasePlugin {
  /**
   * Unique identifier
   */
  public readonly id: string = randomUUID();
  
  /**
   * Plugin creation timestamp
   */
  public readonly createdAt: number = Date.now();
  
  /**
   * Plugin metadata
   */
  public abstract readonly meta: PluginMetadata;
  
  /**
   * Plugin active state
   */
  public _active: boolean = false;
  
  /**
   * Get plugin name
   */
  public get name(): string {
    return this.meta.name;
  }
  
  /**
   * Get plugin active state
   */
  public get isActive(): boolean {
    return this._active;
  }
  
   /**
   * Activate plugin
   */
  public async activate(): Promise<void> {
    if (this._active) return;
    
    await this.onActivate?.();
    this._active = true;
  }

 /**
   * Deactivate plugin
   */
  public async deactivate(): Promise<void> {
    if (!this._active) return;
    
    await this.onDeactivate?.();
    this._active = false;
  }


  public onActivate?(): void | Promise<void>;
  public onDeactivate?(): void | Promise<void>;
  public onBeforeConnect?(): void
  public onAfterConnect?(): void
  public toJSON(): Record<string, unknown> {
    return {
      id: this.id,
      name: this.name,
      active: this._active,
      createdAt: this.createdAt,
      meta: this.meta
    };
  }

  public toString(): string {
    return `${this.meta.name}@${this.meta.version}`;
  }
}