import {
  BaseGatewayEvent,
  type GatewayPayload,
} from "@core/events/base/base-gateway-event";
import { createQuartzError, QuartzErrorCode } from "@core/lib/errors";

export interface GatewayDispatch<T extends string = string, D = unknown>
  extends GatewayPayload<D> {
  op: 0;
  t: T;
  s: number;
  d: D;
}
export function isDispatch(
  payload: GatewayPayload<unknown>
): payload is GatewayDispatch<string, unknown> {
  return (
    !!payload &&
    typeof payload === "object" &&
    payload.op === 0 &&
    payload.t != null &&
    payload.s != null
  );
}
/**
 * Base class for all dispatch events
 */
export abstract class BaseDispatchEvent<
  T extends string = string,
  D = unknown,
> extends BaseGatewayEvent<D> {
  public readonly name: T;
  public readonly sequence: number;
  public readonly payload: D;

  constructor(dispatch: GatewayDispatch<T, D>) {
    super(dispatch);
    if (!isDispatch(dispatch)) {
      throw createQuartzError(
        QuartzErrorCode.INVALID_EVENT_DATA,
        {
          eventName: this.constructor.name,
        },
        { cause: dispatch }
      );
    }
    this.name = dispatch.t as T;
    this.sequence = dispatch.s;
    this.payload = dispatch.d;
  }

  override get type(): T {
    return this.name;
  }

  override get seq(): number {
    return this.sequence;
  }

  override get data(): D {
    return this.payload;
  }

  toJSON() {
    return {
      op: this.op,
      t: this.type,
      s: this.seq,
      d: this.data,
    };
  }
}
