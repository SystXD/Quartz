export interface GatewayPayload<D = unknown> {
  op: number;
  d: D | null;
  s?: number | null;
  t?: string | null;
}

/**
 * Base class for all WS events
 */
export abstract class BaseGatewayEvent<D = unknown> {
  public readonly raw: GatewayPayload<D>;

  constructor(raw: GatewayPayload<D>) {
    this.raw = raw;
  }

  get op(): number {
    return this.raw.op;
  }

  get type(): string | null | undefined {
    return this.raw.t;
  }

  get seq(): number | null | undefined {
    return this.raw.s;
  }

  get data(): D | null {
    return this.raw.d;
  }
}
