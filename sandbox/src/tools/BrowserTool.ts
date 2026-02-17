import { Tool } from './ToolRegistry';
import puppeteer, { Browser, Page } from 'puppeteer';

export class BrowserTool implements Tool {
  name = 'browser';
  description = 'Control and automate web browser';
  private browser: Browser | null = null;
  private pages: Map<string, Page> = new Map();

  listActions(): string[] {
    return ['launch', 'navigate', 'screenshot', 'click', 'type', 'get_content', 'close'];
  }

  async execute(action: string, params: any): Promise<any> {
    switch (action) {
      case 'launch':
        return this.launch();
      case 'navigate':
        return this.navigate(params.pageId, params.url);
      case 'screenshot':
        return this.screenshot(params.pageId);
      case 'click':
        return this.click(params.pageId, params.selector);
      case 'type':
        return this.type(params.pageId, params.selector, params.text);
      case 'get_content':
        return this.getContent(params.pageId);
      case 'close':
        return this.close(params.pageId);
      default:
        throw new Error(`Action "${action}" not supported`);
    }
  }

  private async launch(): Promise<{ pageId: string; success: boolean }> {
    try {
      this.browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      const page = await this.browser.newPage();
      const pageId = Math.random().toString(36).substring(7);
      this.pages.set(pageId, page);

      return { pageId, success: true };
    } catch (error) {
      throw new Error(`Failed to launch browser: ${error}`);
    }
  }

  private async navigate(pageId: string, url: string): Promise<{ success: boolean }> {
    const page = this.pages.get(pageId);
    if (!page) throw new Error(`Page "${pageId}" not found`);

    try {
      await page.goto(url, { waitUntil: 'networkidle0' });
      return { success: true };
    } catch (error) {
      throw new Error(`Failed to navigate to ${url}: ${error}`);
    }
  }

  private async screenshot(pageId: string): Promise<{ success: boolean; data: string }> {
    const page = this.pages.get(pageId);
    if (!page) throw new Error(`Page "${pageId}" not found`);

    try {
      const screenshot = await page.screenshot({ encoding: 'base64' });
      return { success: true, data: screenshot as string };
    } catch (error) {
      throw new Error(`Failed to take screenshot: ${error}`);
    }
  }

  private async click(pageId: string, selector: string): Promise<{ success: boolean }> {
    const page = this.pages.get(pageId);
    if (!page) throw new Error(`Page "${pageId}" not found`);

    try {
      await page.click(selector);
      return { success: true };
    } catch (error) {
      throw new Error(`Failed to click element: ${error}`);
    }
  }

  private async type(pageId: string, selector: string, text: string): Promise<{ success: boolean }> {
    const page = this.pages.get(pageId);
    if (!page) throw new Error(`Page "${pageId}" not found`);

    try {
      await page.type(selector, text);
      return { success: true };
    } catch (error) {
      throw new Error(`Failed to type text: ${error}`);
    }
  }

  private async getContent(pageId: string): Promise<{ success: boolean; content: string }> {
    const page = this.pages.get(pageId);
    if (!page) throw new Error(`Page "${pageId}" not found`);

    try {
      const content = await page.content();
      return { success: true, content };
    } catch (error) {
      throw new Error(`Failed to get content: ${error}`);
    }
  }

  private async close(pageId: string): Promise<{ success: boolean }> {
    const page = this.pages.get(pageId);
    if (!page) throw new Error(`Page "${pageId}" not found`);

    try {
      await page.close();
      this.pages.delete(pageId);
      return { success: true };
    } catch (error) {
      throw new Error(`Failed to close page: ${error}`);
    }
  }

  async cleanup(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.pages.clear();
    }
  }
}
