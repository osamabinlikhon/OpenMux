export interface Tool {
  name: string;
  description: string;
  execute(action: string, params: any): Promise<any>;
  listActions(): string[];
}

export class ToolRegistry {
  private tools: Map<string, Tool> = new Map();

  register(name: string, tool: Tool): void {
    this.tools.set(name, tool);
  }

  listTools(): Array<{ name: string; description: string; actions: string[] }> {
    return Array.from(this.tools.values()).map((tool) => ({
      name: tool.name,
      description: tool.description,
      actions: tool.listActions(),
    }));
  }

  async execute(toolName: string, action: string, params: any): Promise<any> {
    const tool = this.tools.get(toolName);
    if (!tool) {
      throw new Error(`Tool "${toolName}" not found`);
    }

    return tool.execute(action, params);
  }
}
