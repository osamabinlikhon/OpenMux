import { Tool } from './ToolRegistry';
import * as fs from 'fs/promises';
import * as path from 'path';

export class FileTool implements Tool {
  name = 'file';
  description = 'File system operations';

  listActions(): string[] {
    return ['read', 'write', 'delete', 'list', 'exists'];
  }

  async execute(action: string, params: any): Promise<any> {
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

  private async read(filePath: string): Promise<{ success: boolean; content: string }> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      return { success: true, content };
    } catch (error) {
      throw new Error(`Failed to read file: ${error}`);
    }
  }

  private async write(
    filePath: string,
    content: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      await fs.writeFile(filePath, content, 'utf-8');
      return { success: true, message: `File written successfully` };
    } catch (error) {
      throw new Error(`Failed to write file: ${error}`);
    }
  }

  private async delete(filePath: string): Promise<{ success: boolean; message: string }> {
    try {
      await fs.unlink(filePath);
      return { success: true, message: `File deleted successfully` };
    } catch (error) {
      throw new Error(`Failed to delete file: ${error}`);
    }
  }

  private async list(dirPath: string): Promise<{
    success: boolean;
    files: Array<{ name: string; type: string }>;
  }> {
    try {
      const files = await fs.readdir(dirPath);
      const fileDetails = await Promise.all(
        files.map(async (file) => {
          const stat = await fs.stat(path.join(dirPath, file));
          return {
            name: file,
            type: stat.isDirectory() ? 'directory' : 'file',
          };
        })
      );
      return { success: true, files: fileDetails };
    } catch (error) {
      throw new Error(`Failed to list directory: ${error}`);
    }
  }

  private async exists(filePath: string): Promise<{ success: boolean; exists: boolean }> {
    try {
      await fs.access(filePath);
      return { success: true, exists: true };
    } catch {
      return { success: true, exists: false };
    }
  }
}
