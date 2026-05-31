import { HubConnection, HubConnectionBuilder, HubConnectionState, IHttpConnectionOptions, IStreamResult } from "@microsoft/signalr";

// i just want to make our lifes easier - befaci
export default class _ {
    private _CONNECTION: HubConnection|undefined;
    public readonly url: URL;

    public serverTimeoutMs: number = 30000;
    public keepAliveIntervalMs: number = 15000;

    constructor(url: URL) {
        this.url=url;
    }
    public init(options: IHttpConnectionOptions) {
        if (!this._CONNECTION) return;
        this._CONNECTION = new HubConnectionBuilder().withUrl(this.url.toString(), options).build();

        this.serverTimeoutMs = this._CONNECTION.serverTimeoutInMilliseconds;
        this.keepAliveIntervalMs = this._CONNECTION.keepAliveIntervalInMilliseconds;
    }

    /**
     * Starts a connection between the client and the server
     * @returns {true|false} - Returns yes if the connection was successful
     */
    public async connect(): Promise<boolean> {
        if (!this.isConnected()) await this._CONNECTION?.start();
        return this.isConnected();
    }
    /**
     * Restarts a connection between the client and the server
     * @returns {true|false} - Returns yes if the connection was successful
     */
    public async reconnect(): Promise<boolean> {
        if (this.isConnected()) {
            await this._CONNECTION?.stop();
            await this._CONNECTION?.start();
        } else await this._CONNECTION?.start();
        return this.isConnected();
    }
    /**
     * Stops a connection between the client and the server
     * @returns {true|false} - Returns yes if the connection was successful
     */
    public async disconnect(): Promise<boolean> {
        if (this.isConnected()) await this._CONNECTION?.stop();
        return this.isConnected();
    }

    public getConnectionState(): HubConnectionState { return this._CONNECTION ? this._CONNECTION.state : HubConnectionState.Disconnected }
    /**
     * Checks if connected to the SignalR server
     * @returns {true|false} - Returns yes if the client is connected
     */
    public isConnected(): boolean {
        if (
            typeof this._CONNECTION === "undefined" ||
            // perhaps include Disconnecting if some strange stuff happens?
            [HubConnectionState.Disconnected, HubConnectionState.Connecting, HubConnectionState.Reconnecting].includes(this.getConnectionState())
        ) return false;
        return true
    }

    public onStateChange(state: "Close", callback: (error?: Error) => void): void;
    public onStateChange(state: "Reconnected", callback: (connectionId?: string) => void): void;
    public onStateChange(state: "Reconnecting", callback: (error?: Error) => void): void;
    public onStateChange(state: "Close"|"Reconnected"|"Reconnecting", callback: (arg: any) => void): void {
        switch (state) {
            case "Close":
                this._CONNECTION?.onclose(callback);
                break;
            case "Reconnected":
                this._CONNECTION?.onreconnected(callback);
                break;
            case "Reconnecting":
                this._CONNECTION?.onreconnecting(callback);
                break;
        }
    }

    /**
     * Sends a packet to the server with an answer from the server
     * @param method - The name of the packet
     * @param args
     */
    public async invokePacket(method: string, ...args: any[]): Promise<any> {
        if (!this.isConnected()) return;
        return await this._CONNECTION?.invoke(method, args);
    }
    /**
     * Sends a packet to the server without any answers from the server
     * @param method - The name of the packet
     * @param args
     */
    public async sendPacket(method: string, ...args: any[]) {
        if (!this.isConnected()) return;
        await this._CONNECTION?.send(method, args);
    }
    /**
     * "Invokes a streaming hub method on the server using the specified name and arguments."
     * @param method - The name of the packet
     * @param args
     * @returns your mom
     */ // i struggled with that one lol
    public streamPackets<T>(method: string, ...args: any[]): IStreamResult<T> | undefined {
        if (!this.isConnected()) return;
        return this._CONNECTION?.stream<T>(method, args);
    }

    public on(method: string, callback: (...args: any[]) => any): void {
        this._CONNECTION?.on(method, callback);
    }
    public off(method: string): void {
        this._CONNECTION?.off(method);
    }
}
