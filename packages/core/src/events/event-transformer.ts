export type EventMap = Record<string, unknown>;
export type TransformEvent<T> = T | null;

export abstract class EventTransformer<
  TInput extends EventMap = EventMap,
  TOutput extends EventMap = EventMap
> {
  public abstract transform<K extends keyof TInput>(
    event: K,
    data: TInput[K],
    ...args: unknown[]
  ): TransformEvent<TOutput[keyof TOutput]>;
}
