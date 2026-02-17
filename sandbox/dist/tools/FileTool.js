import * as fs from 'fs/promises';
import * as path from 'path';
export class FileTool {
    constructor() {
        this.name = 'file';
        this.description = 'File system operations';
    }
    listActions() {
        return ['read', 'write', 'delete', 'list', 'exists'];
    }
    async execute(action, params) {
        switch (action) {
            case 'read':
                return this.read(params.path);
            case 'write':
                return this.write(params.path, params.content);
            case 'delete':
                return this.delete(params.path);
            case 'list':
                return this.list(params.path);
            case 'exists':
                return this.exists(params.path);
            default:
                throw new Error(`Action "${action}" not supported`);
        }
    }
    async read(filePath) {
        try {
            const content = await fs.readFile(filePath, 'utf-8');
            return { success: true, content };
        }
        catch (error) {
            throw new Error(`Failed to read file: ${error}`);
        }
    }
    async write(filePath, content) {
        try {
            await fs.writeFile(filePath, content, 'utf-8');
            return { success: true, message: `File written successfully` };
        }
        catch (error) {
            throw new Error(`Failed to write file: ${error}`);
        }
    }
    async delete(filePath) {
        try {
            await fs.unlink(filePath);
            return { success: true, message: `File deleted successfully` };
        }
        catch (error) {
            throw new Error(`Failed to delete file: ${error}`);
        }
    }
    async list(dirPath) {
        try {
            const files = await fs.readdir(dirPath);
            const fileDetails = await Promise.all(files.map(async (file) => {
                const stat = await fs.stat(path.join(dirPath, file));
                return {
                    name: file,
                    type: stat.isDirectory() ? 'directory' : 'file',
                };
            }));
            return { success: true, files: fileDetails };
        }
        catch (error) {
            throw new Error(`Failed to list directory: ${error}`);
        }
    }
    async exists(filePath) {
        try {
            await fs.access(filePath);
            return { success: true, exists: true };
        }
        catch {
            return { success: true, exists: false };
        }
    }
}
//# sourceMappingURL=FileTool.js.map