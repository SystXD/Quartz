import { QuartzClient } from "@quartz/client/client";
import { BasePlugin, PluginMetadata } from "../base-plugin";
import { getFiles } from "@quartz/lib/utils";
import colors from "@quartz/lib/colors";
import { ClientAdapter } from "@core/lib/adapter";
import { logger } from "@quartz/lib/logger/default-logger";

export interface CommandLoderPluginOptions<T extends ClientAdapter<T>> {
  /**
   * The directory to load commands from
   */
  directory: string;
  /**
   * The Quartz client instance
   */
  client: QuartzClient<T>;
}
export function useCommand<T extends ClientAdapter<T>>({
  directory,
  client,
}: CommandLoderPluginOptions<T>) {
  return class UseCommand extends BasePlugin {
    public _active: boolean = false;
    public meta: PluginMetadata = {
      name: "use-command",
      version: "1.0.0",
      author: "Quartz",
      description: "Official command registration plugin for Quartz",
    };

    #loadCommands() {
      const commandFiles = getFiles(directory);
      const commands = [];
      for (const commandFile of commandFiles) {
        const commandClass =
          require(commandFile.filePath)?.default ||
          Object.values(require(commandFile.filePath))[0];

        if (!commandClass) {
          logger.warn(
            colors.yellow(
              `Skipping ${commandFile.fileName} as it does not export a valid command class...`
            )
          );
          continue;
        }

        // TODO: Add a check to verify the class is a valid instance of a Command class'
        commands.push(commandClass);
      }

      return commands;
    }

    async #registerCommands() {
      let loadedCommands: number | null;

      const commands = this.#loadCommands();
      // TODO: Replace with client.token
      loadedCommands = (
        await client.commandResolver.registerCommands(
          commands,
          "replace with an actual token..."
        )
      ).length;
      logger.info(
        colors.green(
          `Successfully loaded total of ${loadedCommands} commands...`
        )
      );
    }

    public override onAfterConnect(): void {
      this.#registerCommands();
    }
  };
}
