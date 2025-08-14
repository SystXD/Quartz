import { REST, DiscordAPIError } from "@discordjs/rest";
import type {
  RESTPutAPIApplicationCommandsResult,
  RESTPutAPIApplicationCommandsJSONBody,
} from "discord-api-types/v10";
import {
  createQuartzError,
  QuartzErrorCode,
} from "@quartz/lib/errors";
import { logger as defaultLogger } from "@quartz/lib/logger/default-logger";
import { ILogger } from '@quartz/lib/logger/logger'
type CommandAvailability = "GLOBAL" | "GUILD";


export class RESTCommandHandler {
  /**
   * Constructs a new instance of the RESTCommandHandler.
   *
   * @param restClient The instance of the REST client to use.
   * @param logger The logger instance to use for logging. If not provided, the default logger will be used.
   */
  constructor(
    private restClient: REST,
    private logger: ILogger = defaultLogger
  ) {}

  /**
   * Registers the given commands with the Discord API, either globally or in a single guild.
   *
   * @param commands The JSON body of the commands to register.
   * @param token The bot token to use for authentication.
   * @param type Determines whether the commands should be registered globally or in a single guild.
   * Defaults to "GLOBAL".
   * @param id The ID of the guild to register the commands in, if `type` is "GUILD".
   * @returns The result of the REST call, which contains the IDs of the registered commands.
   * @throws {QuartzErrorCode.COMMAND_REGISTRATION_FAILED} If the registration fails, either due to a missing guild ID or an underlying error.
   */
  async registerCommands(
    commands: RESTPutAPIApplicationCommandsJSONBody,
    token: string,
    type: CommandAvailability = "GLOBAL",
    id?: string
  ): Promise<RESTPutAPIApplicationCommandsResult> {
    this.restClient.setToken(token);

    try {
      if (type === "GUILD") {
        if (!id) {
          throw createQuartzError(
            QuartzErrorCode.COMMAND_REGISTRATION_FAILED,
            { reason: "missing_guild_id" }
          );
        }
        return await this.registerCommandsInGuild(commands, id);
      }

      return await this.registerCommandsGlobally(commands, id);
    } catch (error) {
      this.logger.error("[QuartzError] Command registration flow failed", {
        cause: error,
      });
      throw error;
    }
  }

  /**
   * Registers the given commands in a specific guild using the Discord API.
   *
   * @param commands The JSON body of the commands to register in the guild.
   * @param guildId The ID of the guild where the commands should be registered.
   * @returns The result of the REST call, which contains the IDs of the registered commands.
   * @throws {Error} If the registration fails due to an underlying error.
   */

  private async registerCommandsInGuild(
    commands: RESTPutAPIApplicationCommandsJSONBody,
    guildId: string
  ): Promise<RESTPutAPIApplicationCommandsResult> {
    try {
      return (await this.restClient.put(
        `/applications/${guildId}/commands`,
        { body: commands }
      )) as RESTPutAPIApplicationCommandsResult;
    } catch (error) {
      this.handleAndThrow(error, "[QuartzError] Command registration failed in guild");
    }
  }


/**
 * Registers the given commands globally using the Discord API.
 *
 * @param commands The JSON body of the commands to register globally.
 * @param applicationId Optional ID of the application for which to register commands. If not provided, defaults to the current application ("@me").
 * @returns The result of the REST call, which contains the IDs of the registered commands.
 * @throws {Error} If the registration fails due to an underlying error.
 */

  private async registerCommandsGlobally(
    commands: RESTPutAPIApplicationCommandsJSONBody,
    applicationId?: string
  ): Promise<RESTPutAPIApplicationCommandsResult> {
    const target = applicationId ?? "@me";

    try {
      return (await this.restClient.put(
        `/applications/${target}/commands`,
        { body: commands }
      )) as RESTPutAPIApplicationCommandsResult;
    } catch (error) {
      this.handleAndThrow(error, "[QuartzError] Command registration failed globally");
    }
  }

  private handleAndThrow(error: unknown, message: string): never {
    if (error instanceof DiscordAPIError) {
      this.logger.error(`[QuartzError] ${message}`, {
        reason: error.message,
        status: (error as any).status,
      });
    } else {
      this.logger.error(`[QuartzError] ${message}`, { cause: error });
    }

    throw createQuartzError(QuartzErrorCode.COMMAND_REGISTRATION_FAILED, {}, { cause: error });
  }
}
