
export abstract class ClientAdapter<T> {
    public readonly abstract adapterName: string
    public abstract connect(): Promise<void>;
    public abstract disconnect(): Promise<void>;
    public abstract adapterClient: T
}

