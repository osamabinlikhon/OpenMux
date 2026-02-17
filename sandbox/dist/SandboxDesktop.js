import { Sandbox as SandboxBase, CommandExitError, TimeoutError, } from 'e2b';
import { generateRandomString } from './utils';
const MOUSE_BUTTONS = {
    left: 1,
    right: 3,
    middle: 2,
};
const KEYS = {
    alt: 'Alt_L',
    alt_left: 'Alt_L',
    alt_right: 'Alt_R',
    backspace: 'BackSpace',
    break: 'Pause',
    caps_lock: 'Caps_Lock',
    cmd: 'Super_L',
    command: 'Super_L',
    control: 'Control_L',
    control_left: 'Control_L',
    control_right: 'Control_R',
    ctrl: 'Control_L',
    del: 'Delete',
    delete: 'Delete',
    down: 'Down',
    end: 'End',
    enter: 'Return',
    esc: 'Escape',
    escape: 'Escape',
    f1: 'F1',
    f2: 'F2',
    f3: 'F3',
    f4: 'F4',
    f5: 'F5',
    f6: 'F6',
    f7: 'F7',
    f8: 'F8',
    f9: 'F9',
    f10: 'F10',
    f11: 'F11',
    f12: 'F12',
    home: 'Home',
    insert: 'Insert',
    left: 'Left',
    menu: 'Menu',
    meta: 'Meta_L',
    num_lock: 'Num_Lock',
    page_down: 'Page_Down',
    page_up: 'Page_Up',
    pause: 'Pause',
    print: 'Print',
    right: 'Right',
    scroll_lock: 'Scroll_Lock',
    shift: 'Shift_L',
    shift_left: 'Shift_L',
    shift_right: 'Shift_R',
    space: 'space',
    super: 'Super_L',
    super_left: 'Super_L',
    super_right: 'Super_R',
    tab: 'Tab',
    up: 'Up',
    win: 'Super_L',
    windows: 'Super_L',
};
function mapKey(key) {
    const lowerKey = key.toLowerCase();
    if (lowerKey in KEYS) {
        return KEYS[lowerKey];
    }
    return lowerKey;
}
export class Sandbox extends SandboxBase {
    constructor(opts) {
        super(opts);
        this.display = ':0';
        this.stream = new VNCServer(this);
        this.lastXfce4Pid = null;
    }
    static async create(templateOrOpts, opts) {
        const { template, sandboxOpts } = typeof templateOrOpts === 'string'
            ? { template: templateOrOpts, sandboxOpts: opts }
            : { template: this.defaultTemplate, sandboxOpts: templateOrOpts };
        const display = opts?.display || ':0';
        const sandboxOptsWithDisplay = {
            ...sandboxOpts,
            envs: {
                ...sandboxOpts?.envs,
                DISPLAY: display,
            },
        };
        const sbx = (await super.create(template, sandboxOptsWithDisplay));
        await sbx._start(display, sandboxOptsWithDisplay);
        return sbx;
    }
    static async betaCreate(templateOrOpts, opts) {
        const { template, sandboxOpts } = typeof templateOrOpts === 'string'
            ? { template: templateOrOpts, sandboxOpts: opts }
            : { template: this.defaultTemplate, sandboxOpts: templateOrOpts };
        const display = opts?.display || ':0';
        const sandboxOptsWithDisplay = {
            ...sandboxOpts,
            envs: {
                ...sandboxOpts?.envs,
                DISPLAY: display,
            },
        };
        const sbx = (await super.betaCreate(template, sandboxOptsWithDisplay));
        await sbx._start(display, sandboxOptsWithDisplay);
        return sbx;
    }
    async waitAndVerify(cmd, onResult, timeout = 10, interval = 0.5) {
        let elapsed = 0;
        while (elapsed < timeout) {
            try {
                if (onResult(await this.commands.run(cmd))) {
                    return true;
                }
            }
            catch (e) {
                if (e instanceof CommandExitError) {
                    continue;
                }
                throw e;
            }
            await new Promise((resolve) => setTimeout(resolve, interval * 1000));
            elapsed += interval;
        }
        return false;
    }
    async screenshot(format = 'bytes') {
        const path = `/tmp/screenshot-${generateRandomString()}.png`;
        await this.commands.run(`scrot --pointer ${path}`);
        // @ts-expect-error
        const file = await this.files.read(path, { format });
        this.files.remove(path);
        return file;
    }
    async leftClick(x, y) {
        if (x && y) {
            await this.moveMouse(x, y);
        }
        await this.commands.run('xdotool click 1');
    }
    async doubleClick(x, y) {
        if (x && y) {
            await this.moveMouse(x, y);
        }
        await this.commands.run('xdotool click --repeat 2 1');
    }
    async rightClick(x, y) {
        if (x && y) {
            await this.moveMouse(x, y);
        }
        await this.commands.run('xdotool click 3');
    }
    async middleClick(x, y) {
        if (x && y) {
            await this.moveMouse(x, y);
        }
        await this.commands.run('xdotool click 2');
    }
    async scroll(direction = 'down', amount = 1) {
        const button = direction === 'up' ? '4' : '5';
        await this.commands.run(`xdotool click --repeat ${amount} ${button}`);
    }
    async moveMouse(x, y) {
        await this.commands.run(`xdotool mousemove --sync ${x} ${y}`);
    }
    async mousePress(button = 'left') {
        await this.commands.run(`xdotool mousedown ${MOUSE_BUTTONS[button]}`);
    }
    async mouseRelease(button = 'left') {
        await this.commands.run(`xdotool mouseup ${MOUSE_BUTTONS[button]}`);
    }
    async getCursorPosition() {
        const result = await this.commands.run('xdotool getmouselocation');
        const match = result.stdout.match(/x:(\d+)\s+y:(\d+)/);
        if (!match) {
            throw new Error(`Failed to parse cursor position from output: ${result.stdout}`);
        }
        const [, x, y] = match;
        if (!x || !y) {
            throw new Error(`Invalid cursor position values: x=${x}, y=${y}`);
        }
        return { x: parseInt(x), y: parseInt(y) };
    }
    async getScreenSize() {
        const result = await this.commands.run('xrandr');
        const match = result.stdout.match(/(\d+x\d+)/);
        if (!match) {
            throw new Error(`Failed to parse screen size from output: ${result.stdout}`);
        }
        try {
            const [width, height] = match[1].split('x').map((val) => parseInt(val));
            return { width, height };
        }
        catch (error) {
            throw new Error(`Invalid screen size format: ${match[1]}`);
        }
    }
    async write(text, options = {
        chunkSize: 25,
        delayInMs: 75,
    }) {
        const chunks = this.breakIntoChunks(text, options.chunkSize);
        for (const chunk of chunks) {
            await this.commands.run(`xdotool type --delay ${options.delayInMs} -- ${this.quoteString(chunk)}`);
        }
    }
    async press(key) {
        if (Array.isArray(key)) {
            key = key.map(mapKey).join('+');
        }
        else {
            key = mapKey(key);
        }
        await this.commands.run(`xdotool key ${key}`);
    }
    async drag([x1, y1], [x2, y2]) {
        await this.moveMouse(x1, y1);
        await this.mousePress();
        await this.moveMouse(x2, y2);
        await this.mouseRelease();
    }
    async wait(ms) {
        await this.commands.run(`sleep ${ms / 1000}`);
    }
    async open(fileOrUrl) {
        await this.commands.run(`xdg-open ${fileOrUrl}`, {
            background: true,
        });
    }
    async getCurrentWindowId() {
        const result = await this.commands.run('xdotool getwindowfocus');
        return result.stdout.trim();
    }
    async getApplicationWindows(application) {
        const result = await this.commands.run(`xdotool search --onlyvisible --class ${application}`);
        return result.stdout.trim().split('\n');
    }
    async getWindowTitle(windowId) {
        const result = await this.commands.run(`xdotool getwindowname ${windowId}`);
        return result.stdout.trim();
    }
    async launch(application, uri) {
        await this.commands.run(`gtk-launch ${application} ${uri ?? ''}`, {
            background: true,
            timeoutMs: 0,
        });
    }
    async _start(display, opts) {
        this.display = display;
        this.lastXfce4Pid = null;
        this.stream = new VNCServer(this);
        const [width, height] = opts?.resolution ?? [1024, 768];
        await this.commands.run(`Xvfb ${display} -ac -screen 0 ${width}x${height}x24 ` +
            `-retro -dpi ${opts?.dpi ?? 96} -nolisten tcp -nolisten unix`, { background: true, timeoutMs: 0 });
        const hasStarted = await this.waitAndVerify(`xdpyinfo -display ${display}`, (r) => r.exitCode === 0);
        if (!hasStarted) {
            throw new TimeoutError('Could not start Xvfb');
        }
        await this.startXfce4();
    }
    async startXfce4() {
        if (this.lastXfce4Pid === null ||
            (await this.commands.run(`ps aux | grep ${this.lastXfce4Pid} | grep -v grep | head -n 1`)).stdout
                .trim()
                .includes('[xfce4-session] <defunct>')) {
            const result = await this.commands.run('startxfce4', {
                background: true,
                timeoutMs: 0,
            });
            this.lastXfce4Pid = result.pid;
        }
    }
    *breakIntoChunks(text, n) {
        for (let i = 0; i < text.length; i += n) {
            yield text.slice(i, i + n);
        }
    }
    quoteString(s) {
        if (!s) {
            return "''";
        }
        if (!/[^\w@%+=:,./-]/.test(s)) {
            return s;
        }
        return "'" + s.replace(/'/g, "'\"'\"'") + "'";
    }
}
Sandbox.defaultTemplate = 'desktop';
class VNCServer {
    constructor(desktop) {
        this.vncPort = 5900;
        this.port = 6080;
        this.novncAuthEnabled = false;
        this.url = null;
        this.novncHandle = null;
        this.desktop = desktop;
        this.novncCommand =
            `cd /opt/noVNC/utils && ./novnc_proxy --vnc localhost:${this.vncPort} ` +
                `--listen ${this.port} --web /opt/noVNC > /tmp/novnc.log 2>&1`;
    }
    getAuthKey() {
        if (!this.password) {
            throw new Error('Unable to retrieve stream auth key, check if requireAuth is enabled');
        }
        return this.password;
    }
    getUrl({ autoConnect = true, viewOnly = false, resize = 'scale', authKey, } = {}) {
        if (this.url === null) {
            throw new Error('Server is not running');
        }
        const url = new URL(this.url);
        if (autoConnect) {
            url.searchParams.set('autoconnect', 'true');
        }
        if (viewOnly) {
            url.searchParams.set('view_only', 'true');
        }
        if (resize) {
            url.searchParams.set('resize', resize);
        }
        if (authKey) {
            url.searchParams.set('password', authKey);
        }
        return url.toString();
    }
    async start(opts = {}) {
        if (await this.checkVNCRunning()) {
            throw new Error('Stream is already running');
        }
        this.vncPort = opts.vncPort ?? this.vncPort;
        this.port = opts.port ?? this.port;
        this.novncAuthEnabled = opts.requireAuth ?? this.novncAuthEnabled;
        this.password = this.novncAuthEnabled ? generateRandomString() : undefined;
        this.url = new URL(`https://${this.desktop.getHost(this.port)}/vnc.html`);
        const vncCommand = await this.getVNCCommand(opts.windowId);
        await this.desktop.commands.run(vncCommand);
        this.novncHandle = await this.desktop.commands.run(this.novncCommand, {
            background: true,
            timeoutMs: 0,
        });
        if (!(await this.waitForPort(this.port))) {
            throw new Error('Could not start noVNC server');
        }
    }
    async stop() {
        if (await this.checkVNCRunning()) {
            await this.desktop.commands.run('pkill x11vnc');
        }
        if (this.novncHandle) {
            await this.novncHandle.kill();
            this.novncHandle = null;
        }
    }
    async getVNCCommand(windowId) {
        let pwdFlag = '-nopw';
        if (this.novncAuthEnabled) {
            await this.desktop.commands.run('mkdir -p ~/.vnc');
            await this.desktop.commands.run(`x11vnc -storepasswd ${this.password} ~/.vnc/passwd`);
            pwdFlag = '-usepw';
        }
        return (`x11vnc -bg -display ${this.desktop.display} -forever -wait 50 -shared ` +
            `-rfbport ${this.vncPort} ${pwdFlag} 2>/tmp/x11vnc_stderr.log` +
            (windowId ? ` -id ${windowId}` : ''));
    }
    async waitForPort(port) {
        return await this.desktop.waitAndVerify(`netstat -tuln | grep ":${port} "`, (r) => r.stdout.trim() !== '');
    }
    async checkVNCRunning() {
        try {
            const result = await this.desktop.commands.run('pgrep -x x11vnc');
            return result.stdout.trim() !== '';
        }
        catch (error) {
            return false;
        }
    }
}
//# sourceMappingURL=SandboxDesktop.js.map