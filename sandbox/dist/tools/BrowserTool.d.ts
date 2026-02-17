import { Tool } from './ToolRegistry';
export declare class BrowserTool implements Tool {
    name: string;
    description: string;
    private browser;
    private pages;
    listActions(): string[];
    execute(action: string, params: any): Promise<any>;
    private launch;
    private navigate;
    private screenshot;
    private click;
    private type;
    private getContent;
    private close;
    cleanup(): Promise<void>;
}
//# sourceMappingURL=BrowserTool.d.ts.map