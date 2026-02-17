import { Sandbox as SandboxBase, SandboxOpts as SandboxOptsBase, SandboxBetaCreateOpts as SandboxBetaCreateOptsBase, CommandResult } from 'e2b';
interface CursorPosition {
    x: number;
    y: number;
}
interface ScreenSize {
    width: number;
    height: number;
}
export interface SandboxOpts extends SandboxOptsBase {
    resolution?: [number, number];
    dpi?: number;
    display?: string;
}
export interface SandboxBetaCreateOpts extends SandboxBetaCreateOptsBase {
    resolution?: [number, number];
    dpi?: number;
    display?: string;
}
export declare class Sandbox extends SandboxBase {
    protected static readonly defaultTemplate: string;
    display: string;
    stream: VNCServer;
    private lastXfce4Pid;
    constructor(opts: Omit<SandboxOpts, 'timeoutMs' | 'metadata'> & {
        sandboxId: string;
        envdVersion: string;
    });
    static create<S extends typeof Sandbox>(this: S, templateOrOpts?: SandboxOpts | string, opts?: SandboxOpts): Promise<InstanceType<S>>;
    static betaCreate<S extends typeof Sandbox>(this: S, templateOrOpts?: SandboxBetaCreateOpts | string, opts?: SandboxOpts): Promise<InstanceType<S>>;
    waitAndVerify(cmd: string, onResult: (result: CommandResult) => boolean, timeout?: number, interval?: number): Promise<boolean>;
    screenshot(format?: 'bytes' | 'blob' | 'stream'): Promise<string & Uint8Array<ArrayBufferLike> & Blob & ReadableStream<Uint8Array<ArrayBufferLike>>>;
    leftClick(x?: number, y?: number): Promise<void>;
    doubleClick(x?: number, y?: number): Promise<void>;
    rightClick(x?: number, y?: number): Promise<void>;
    middleClick(x?: number, y?: number): Promise<void>;
    scroll(direction?: 'up' | 'down', amount?: number): Promise<void>;
    moveMouse(x: number, y: number): Promise<void>;
    mousePress(button?: 'left' | 'right' | 'middle'): Promise<void>;
    mouseRelease(button?: 'left' | 'right' | 'middle'): Promise<void>;
    getCursorPosition(): Promise<CursorPosition>;
    getScreenSize(): Promise<ScreenSize>;
    write(text: string, options?: {
        chunkSize: number;
        delayInMs: number;
    }): Promise<void>;
    press(key: string | string[]): Promise<void>;
    drag([x1, y1]: [number, number], [x2, y2]: [number, number]): Promise<void>;
    wait(ms: number): Promise<void>;
    open(fileOrUrl: string): Promise<void>;
    getCurrentWindowId(): Promise<string>;
    getApplicationWindows(application: string): Promise<string[]>;
    getWindowTitle(windowId: string): Promise<string>;
    launch(application: string, uri?: string): Promise<void>;
    protected _start(display: string, opts?: SandboxOpts): Promise<void>;
    private startXfce4;
    private breakIntoChunks;
    private quoteString;
}
interface VNCServerOptions {
    vncPort?: number;
    port?: number;
    requireAuth?: boolean;
    windowId?: string;
}
interface UrlOptions {
    autoConnect?: boolean;
    viewOnly?: boolean;
    resize?: 'off' | 'scale' | 'remote';
    authKey?: string;
}
declare class VNCServer {
    private vncPort;
    private port;
    private novncAuthEnabled;
    private url;
    private novncHandle;
    private password;
    private readonly novncCommand;
    private readonly desktop;
    constructor(desktop: Sandbox);
    getAuthKey(): string;
    getUrl({ autoConnect, viewOnly, resize, authKey, }?: UrlOptions): string;
    start(opts?: VNCServerOptions): Promise<void>;
    stop(): Promise<void>;
    private getVNCCommand;
    private waitForPort;
    private checkVNCRunning;
}
export {};
//# sourceMappingURL=SandboxDesktop.d.ts.map