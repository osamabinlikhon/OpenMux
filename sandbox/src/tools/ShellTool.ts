import { Tool } from './ToolRegistry';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class ShellTool implements Tool {
  name = 'shell';
  description = 'Execute shell commands';

  listActions(): string[] {
    return ['execute', 'bash', 'sh'];
  }

  async execute(action: string, params: any): Promise<any> {
    switch (action) {
      case 'execute':
      case 'bash':
      case 'sh':
        return this.executeCommand(params.command);
      default:
        throw new Error(`Action "${action}" not supported`);
    }
  }

  private async executeCommand(command: string): Promise<{
    success: boolean;
    stdout: string;
    stderr: string;
    exitCode: number;
  }> {
    try {
      const { stdout, stderr } = await execAsync(command);
      return {
        success: true,
        stdout: stdout.trim(),
        stderr: stderr.trim(),
        exitCode: 0,
      };
    } catch (error: any) {
      return {
        success: false,
        stdout: error.stdout ? error.stdout.trim() : '',
        stderr: error.stderr ? error.stderr.trim() : '',
        exitCode: error.code || 1,
      };
    }
  }
}
