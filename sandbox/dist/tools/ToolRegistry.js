export class ToolRegistry {
    constructor() {
        this.tools = new Map();
    }
    register(name, tool) {
        this.tools.set(name, tool);
    }
    listTools() {
        return Array.from(this.tools.values()).map((tool) => ({
            name: tool.name,
            description: tool.description,
            actions: tool.listActions(),
        }));
    }
    async execute(toolName, action, params) {
        const tool = this.tools.get(toolName);
        if (!tool) {
            throw new Error(`Tool "${toolName}" not found`);
        }
        return tool.execute(action, params);
    }
}
//# sourceMappingURL=ToolRegistry.js.map