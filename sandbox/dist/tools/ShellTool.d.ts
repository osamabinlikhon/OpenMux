import { Tool } from './ToolRegistry';
export declare class ShellTool implements Tool {
    name: string;
    description: string;
    listActions(): string[];
    execute(action: string, params: any): Promise<any>;
    private executeCommand;
}
//# sourceMappingURL=ShellTool.d.ts.map