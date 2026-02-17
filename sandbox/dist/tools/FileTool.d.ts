import { Tool } from './ToolRegistry';
export declare class FileTool implements Tool {
    name: string;
    description: string;
    listActions(): string[];
    execute(action: string, params: any): Promise<any>;
    private read;
    private write;
    private delete;
    private list;
    private exists;
}
//# sourceMappingURL=FileTool.d.ts.map