import { BaseDispatchEvent } from "@core/events/base/base-dispatch-event";
import { GatewayMessageCreateDispatch } from "discord-api-types/v10";
export class MessageCreateEvent extends BaseDispatchEvent<
  "messageCreate",
  GatewayMessageCreateDispatch
> {
  constructor(data: GatewayMessageCreateDispatch) {
    super({
      op: 0,
      t: "messageCreate",
      s: 0,
      d: data,
    });
  }
}
