import {
  Sandbox as SandboxBase,
  SandboxOpts as SandboxOptsBase,
  SandboxBetaCreateOpts as SandboxBetaCreateOptsBase,
  CommandHandle,
  CommandResult,
  CommandExitError,
  TimeoutError,
} from 'e2b'

import { generateRandomString } from './utils'

interface CursorPosition {
  x: number
  y: number
}

interface ScreenSize {
  width: number
  height: number
}

const MOUSE_BUTTONS = {
  left: 1,
  right: 3,
  middle: 2,
}

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
}

function mapKey(key: string): string {
  const lowerKey = key.toLowerCase()
  if (lowerKey in KEYS) {
    return KEYS[lowerKey as keyof typeof KEYS]
  }
  return lowerKey
}

export interface SandboxOpts extends SandboxOptsBase {
  resolution?: [number, number]
  dpi?: number
  display?: string
}

export interface SandboxBetaCreateOpts extends SandboxBetaCreateOptsBase {
  resolution?: [number, number]
  dpi?: number
  display?: string
}

export class Sandbox extends SandboxBase {
  protected static override readonly defaultTemplate: string = 'desktop'
  public display: string = ':0'
  public stream: VNCServer = new VNCServer(this)
  private lastXfce4Pid: number | null = null

  constructor(
    opts: Omit<SandboxOpts, 'timeoutMs' | 'metadata'> & {
      sandboxId: string
      envdVersion: string
    }
  ) {
    super(opts)
  }

  static async create<S extends typeof Sandbox>(
    this: S,
    templateOrOpts?: SandboxOpts | string,
    opts?: SandboxOpts
  ): Promise<InstanceType<S>> {
    const { template, sandboxOpts } =
      typeof templateOrOpts === 'string'
        ? { template: templateOrOpts, sandboxOpts: opts }
        : { template: this.defaultTemplate, sandboxOpts: templateOrOpts }

    const display = opts?.display || ':0'
    const sandboxOptsWithDisplay = {
      ...sandboxOpts,
      envs: {
        ...sandboxOpts?.envs,
        DISPLAY: display,
      },
    }

    const sbx = (await super.create(
      template,
      sandboxOptsWithDisplay
    )) as InstanceType<S>
    await sbx._start(display, sandboxOptsWithDisplay)

    return sbx
  }

  static async betaCreate<S extends typeof Sandbox>(
    this: S,
    templateOrOpts?: SandboxBetaCreateOpts | string,
    opts?: SandboxOpts
  ): Promise<InstanceType<S>> {
    const { template, sandboxOpts } =
      typeof templateOrOpts === 'string'
        ? { template: templateOrOpts, sandboxOpts: opts }
        : { template: this.defaultTemplate, sandboxOpts: templateOrOpts }

    const display = opts?.display || ':0'
    const sandboxOptsWithDisplay = {
      ...sandboxOpts,
      envs: {
        ...sandboxOpts?.envs,
        DISPLAY: display,
      },
    }

    const sbx = (await super.betaCreate(
      template,
      sandboxOptsWithDisplay
    )) as InstanceType<S>
    await sbx._start(display, sandboxOptsWithDisplay)

    return sbx
  }

  async waitAndVerify(
    cmd: string,
    onResult: (result: CommandResult) => boolean,
    timeout: number = 10,
    interval: number = 0.5
  ): Promise<boolean> {
    let elapsed = 0

    while (elapsed < timeout) {
      try {
        if (onResult(await this.commands.run(cmd))) {
          return true
        }
      } catch (e) {
        if (e instanceof CommandExitError) {
          continue
        }
        throw e
      }

      await new Promise((resolve) => setTimeout(resolve, interval * 1000))
      elapsed += interval
    }

    return false
  }

  async screenshot(format: 'bytes' | 'blob' | 'stream' = 'bytes') {
    const path = `/tmp/screenshot-${generateRandomString()}.png`
    await this.commands.run(`scrot --pointer ${path}`)

    // @ts-expect-error
    const file = await this.files.read(path, { format })
    this.files.remove(path)
    return file
  }

  async leftClick(x?: number, y?: number): Promise<void> {
    if (x && y) {
      await this.moveMouse(x, y)
    }

    await this.commands.run('xdotool click 1')
  }

  async doubleClick(x?: number, y?: number): Promise<void> {
    if (x && y) {
      await this.moveMouse(x, y)
    }

    await this.commands.run('xdotool click --repeat 2 1')
  }

  async rightClick(x?: number, y?: number): Promise<void> {
    if (x && y) {
      await this.moveMouse(x, y)
    }

    await this.commands.run('xdotool click 3')
  }

  async middleClick(x?: number, y?: number): Promise<void> {
    if (x && y) {
      await this.moveMouse(x, y)
    }

    await this.commands.run('xdotool click 2')
  }

  async scroll(
    direction: 'up' | 'down' = 'down',
    amount: number = 1
  ): Promise<void> {
    const button = direction === 'up' ? '4' : '5'
    await this.commands.run(`xdotool click --repeat ${amount} ${button}`)
  }

  async moveMouse(x: number, y: number): Promise<void> {
    await this.commands.run(`xdotool mousemove --sync ${x} ${y}`)
  }

  async mousePress(
    button: 'left' | 'right' | 'middle' = 'left'
  ): Promise<void> {
    await this.commands.run(`xdotool mousedown ${MOUSE_BUTTONS[button]}`)
  }

  async mouseRelease(
    button: 'left' | 'right' | 'middle' = 'left'
  ): Promise<void> {
    await this.commands.run(`xdotool mouseup ${MOUSE_BUTTONS[button]}`)
  }

  async getCursorPosition(): Promise<CursorPosition> {
    const result = await this.commands.run('xdotool getmouselocation')

    const match = result.stdout.match(/x:(\d+)\s+y:(\d+)/)
    if (!match) {
      throw new Error(
        `Failed to parse cursor position from output: ${result.stdout}`
      )
    }

    const [, x, y] = match
    if (!x || !y) {
      throw new Error(`Invalid cursor position values: x=${x}, y=${y}`)
    }

    return { x: parseInt(x), y: parseInt(y) }
  }

  async getScreenSize(): Promise<ScreenSize> {
    const result = await this.commands.run('xrandr')

    const match = result.stdout.match(/(\d+x\d+)/)
    if (!match) {
      throw new Error(
        `Failed to parse screen size from output: ${result.stdout}`
      )
    }

    try {
      const [width, height] = match[1].split('x').map((val) => parseInt(val))
      return { width, height }
    } catch (error) {
      throw new Error(`Invalid screen size format: ${match[1]}`)
    }
  }

  async write(
    text: string,
    options: { chunkSize: number; delayInMs: number } = {
      chunkSize: 25,
      delayInMs: 75,
    }
  ): Promise<void> {
    const chunks = this.breakIntoChunks(text, options.chunkSize)

    for (const chunk of chunks) {
      await this.commands.run(
        `xdotool type --delay ${options.delayInMs} -- ${this.quoteString(
          chunk
        )}`
      )
    }
  }

  async press(key: string | string[]): Promise<void> {
    if (Array.isArray(key)) {
      key = key.map(mapKey).join('+')
    } else {
      key = mapKey(key)
    }

    await this.commands.run(`xdotool key ${key}`)
  }

  async drag(
    [x1, y1]: [number, number],
    [x2, y2]: [number, number]
  ): Promise<void> {
    await this.moveMouse(x1, y1)
    await this.mousePress()
    await this.moveMouse(x2, y2)
    await this.mouseRelease()
  }

  async wait(ms: number): Promise<void> {
    await this.commands.run(`sleep ${ms / 1000}`)
  }

  async open(fileOrUrl: string): Promise<void> {
    await this.commands.run(`xdg-open ${fileOrUrl}`, {
      background: true,
    })
  }

  async getCurrentWindowId(): Promise<string> {
    const result = await this.commands.run('xdotool getwindowfocus')
    return result.stdout.trim()
  }

  async getApplicationWindows(application: string): Promise<string[]> {
    const result = await this.commands.run(
      `xdotool search --onlyvisible --class ${application}`
    )

    return result.stdout.trim().split('\n')
  }

  async getWindowTitle(windowId: string): Promise<string> {
    const result = await this.commands.run(`xdotool getwindowname ${windowId}`)

    return result.stdout.trim()
  }

  async launch(application: string, uri?: string): Promise<void> {
    await this.commands.run(`gtk-launch ${application} ${uri ?? ''}`, {
      background: true,
      timeoutMs: 0,
    })
  }

  protected async _start(display: string, opts?: SandboxOpts): Promise<void> {
    this.display = display
    this.lastXfce4Pid = null
    this.stream = new VNCServer(this)

    const [width, height] = opts?.resolution ?? [1024, 768]
    await this.commands.run(
      `Xvfb ${display} -ac -screen 0 ${width}x${height}x24 ` +
        `-retro -dpi ${opts?.dpi ?? 96} -nolisten tcp -nolisten unix`,
      { background: true, timeoutMs: 0 }
    )

    const hasStarted = await this.waitAndVerify(
      `xdpyinfo -display ${display}`,
      (r: CommandResult) => r.exitCode === 0
    )
    if (!hasStarted) {
      throw new TimeoutError('Could not start Xvfb')
    }

    await this.startXfce4()
  }

  private async startXfce4(): Promise<void> {
    if (
      this.lastXfce4Pid === null ||
      (
        await this.commands.run(
          `ps aux | grep ${this.lastXfce4Pid} | grep -v grep | head -n 1`
        )
      ).stdout
        .trim()
        .includes('[xfce4-session] <defunct>')
    ) {
      const result = await this.commands.run('startxfce4', {
        background: true,
        timeoutMs: 0,
      })
      this.lastXfce4Pid = result.pid
    }
  }

  private *breakIntoChunks(text: string, n: number): Generator<string> {
    for (let i = 0; i < text.length; i += n) {
      yield text.slice(i, i + n)
    }
  }

  private quoteString(s: string): string {
    if (!s) {
      return "''"
    }

    if (!/[^\w@%+=:,./-]/.test(s)) {
      return s
    }

    return "'" + s.replace(/'/g, "'\"'\"'") + "'"
  }
}

interface VNCServerOptions {
  vncPort?: number
  port?: number
  requireAuth?: boolean
  windowId?: string
}

interface UrlOptions {
  autoConnect?: boolean
  viewOnly?: boolean
  resize?: 'off' | 'scale' | 'remote'
  authKey?: string
}

class VNCServer {
  private vncPort: number = 5900
  private port: number = 6080
  private novncAuthEnabled: boolean = false
  private url: URL | null = null
  private novncHandle: CommandHandle | null = null
  private password: string | undefined
  private readonly novncCommand: string
  private readonly desktop: Sandbox

  constructor(desktop: Sandbox) {
    this.desktop = desktop
    this.novncCommand =
      `cd /opt/noVNC/utils && ./novnc_proxy --vnc localhost:${this.vncPort} ` +
      `--listen ${this.port} --web /opt/noVNC > /tmp/novnc.log 2>&1`
  }

  public getAuthKey(): string {
    if (!this.password) {
      throw new Error(
        'Unable to retrieve stream auth key, check if requireAuth is enabled'
      )
    }

    return this.password
  }

  public getUrl({
    autoConnect = true,
    viewOnly = false,
    resize = 'scale',
    authKey,
  }: UrlOptions = {}): string {
    if (this.url === null) {
      throw new Error('Server is not running')
    }

    const url = new URL(this.url)
    if (autoConnect) {
      url.searchParams.set('autoconnect', 'true')
    }
    if (viewOnly) {
      url.searchParams.set('view_only', 'true')
    }
    if (resize) {
      url.searchParams.set('resize', resize)
    }
    if (authKey) {
      url.searchParams.set('password', authKey)
    }
    return url.toString()
  }

  public async start(opts: VNCServerOptions = {}): Promise<void> {
    if (await this.checkVNCRunning()) {
      throw new Error('Stream is already running')
    }

    this.vncPort = opts.vncPort ?? this.vncPort
    this.port = opts.port ?? this.port
    this.novncAuthEnabled = opts.requireAuth ?? this.novncAuthEnabled
    this.password = this.novncAuthEnabled ? generateRandomString() : undefined
    this.url = new URL(`https://${this.desktop.getHost(this.port)}/vnc.html`)

    const vncCommand = await this.getVNCCommand(opts.windowId)
    await this.desktop.commands.run(vncCommand)

    this.novncHandle = await this.desktop.commands.run(this.novncCommand, {
      background: true,
      timeoutMs: 0,
    })
    if (!(await this.waitForPort(this.port))) {
      throw new Error('Could not start noVNC server')
    }
  }

  public async stop(): Promise<void> {
    if (await this.checkVNCRunning()) {
      await this.desktop.commands.run('pkill x11vnc')
    }

    if (this.novncHandle) {
      await this.novncHandle.kill()
      this.novncHandle = null
    }
  }

  private async getVNCCommand(windowId?: string): Promise<string> {
    let pwdFlag = '-nopw'
    if (this.novncAuthEnabled) {
      await this.desktop.commands.run('mkdir -p ~/.vnc')
      await this.desktop.commands.run(
        `x11vnc -storepasswd ${this.password} ~/.vnc/passwd`
      )
      pwdFlag = '-usepw'
    }

    return (
      `x11vnc -bg -display ${this.desktop.display} -forever -wait 50 -shared ` +
      `-rfbport ${this.vncPort} ${pwdFlag} 2>/tmp/x11vnc_stderr.log` +
      (windowId ? ` -id ${windowId}` : '')
    )
  }

  private async waitForPort(port: number): Promise<boolean> {
    return await this.desktop.waitAndVerify(
      `netstat -tuln | grep ":${port} "`,
      (r: CommandResult) => r.stdout.trim() !== ''
    )
  }

  private async checkVNCRunning(): Promise<boolean> {
    try {
      const result = await this.desktop.commands.run('pgrep -x x11vnc')
      return result.stdout.trim() !== ''
    } catch (error) {
      return false
    }
  }
}
