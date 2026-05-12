import { ClientAdapter } from "@core/lib/adapter";
import { Client } from "discord.js";
import { error } from "@adapters/discord.js/lib/errors";

interface DJSAdapterOptions {
  client: Client;
  token: string;
}
export class DJSAdapter implements ClientAdapter<Client> {
  public readonly adapterName = "discord.js";
  public adapterClient!: Client<boolean>;
  private token!: string;
  constructor({ client, token }: DJSAdapterOptions) {
    this.adapterClient = client;
    this.token = token;
    if (!this.adapterClient)
      throw error("NOT_FOUND", "Client missing or invalid in adapter");
    if (!this.token)
      throw error("NOT_FOUND", "Token missing or invalid in adapter");
  }
  public async connect(): Promise<void> {
    try {
      await this.adapterClient.login(this.token!);
    } catch (err) {
      throw error("CONNECTION_FAILED", "Connection failed", { cause: err });
    }
  }
  public async disconnect(): Promise<void> {
    try {
        await this.adapterClient.destroy();
    } catch (err) {
      throw error("DISCONNECT_FAILED", "Disconnect failed", { cause: err });
    }
  }
  public async isReady(): Promise<boolean> {
     return this.adapterClient.isReady();
  }
}
