import { exec } from 'child_process';
import { promisify } from 'util';
const execAsync = promisify(exec);
export class ShellTool {
    constructor() {
        this.name = 'shell';
        this.description = 'Execute shell commands';
    }
    listActions() {
        return ['execute', 'bash', 'sh'];
    }
    async execute(action, params) {
        switch (action) {
            case 'execute':
            case 'bash':
            case 'sh':
                return this.executeCommand(params.command);
            default:
                throw new Error(`Action "${action}" not supported`);
        }
    }
    async executeCommand(command) {
        try {
            const { stdout, stderr } = await execAsync(command);
            return {
                success: true,
                stdout: stdout.trim(),
                stderr: stderr.trim(),
                exitCode: 0,
            };
        }
        catch (error) {
            return {
                success: false,
                stdout: error.stdout ? error.stdout.trim() : '',
                stderr: error.stderr ? error.stderr.trim() : '',
                exitCode: error.code || 1,
            };
        }
    }
}
//# sourceMappingURL=ShellTool.js.map