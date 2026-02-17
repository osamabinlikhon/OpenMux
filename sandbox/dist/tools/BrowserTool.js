import puppeteer from 'puppeteer';
export class BrowserTool {
    constructor() {
        this.name = 'browser';
        this.description = 'Control and automate web browser';
        this.browser = null;
        this.pages = new Map();
    }
    listActions() {
        return ['launch', 'navigate', 'screenshot', 'click', 'type', 'get_content', 'close'];
    }
    async execute(action, params) {
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
    async launch() {
        try {
            this.browser = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
            const page = await this.browser.newPage();
            const pageId = Math.random().toString(36).substring(7);
            this.pages.set(pageId, page);
            return { pageId, success: true };
        }
        catch (error) {
            throw new Error(`Failed to launch browser: ${error}`);
        }
    }
    async navigate(pageId, url) {
        const page = this.pages.get(pageId);
        if (!page)
            throw new Error(`Page "${pageId}" not found`);
        try {
            await page.goto(url, { waitUntil: 'networkidle0' });
            return { success: true };
        }
        catch (error) {
            throw new Error(`Failed to navigate to ${url}: ${error}`);
        }
    }
    async screenshot(pageId) {
        const page = this.pages.get(pageId);
        if (!page)
            throw new Error(`Page "${pageId}" not found`);
        try {
            const screenshot = await page.screenshot({ encoding: 'base64' });
            return { success: true, data: screenshot };
        }
        catch (error) {
            throw new Error(`Failed to take screenshot: ${error}`);
        }
    }
    async click(pageId, selector) {
        const page = this.pages.get(pageId);
        if (!page)
            throw new Error(`Page "${pageId}" not found`);
        try {
            await page.click(selector);
            return { success: true };
        }
        catch (error) {
            throw new Error(`Failed to click element: ${error}`);
        }
    }
    async type(pageId, selector, text) {
        const page = this.pages.get(pageId);
        if (!page)
            throw new Error(`Page "${pageId}" not found`);
        try {
            await page.type(selector, text);
            return { success: true };
        }
        catch (error) {
            throw new Error(`Failed to type text: ${error}`);
        }
    }
    async getContent(pageId) {
        const page = this.pages.get(pageId);
        if (!page)
            throw new Error(`Page "${pageId}" not found`);
        try {
            const content = await page.content();
            return { success: true, content };
        }
        catch (error) {
            throw new Error(`Failed to get content: ${error}`);
        }
    }
    async close(pageId) {
        const page = this.pages.get(pageId);
        if (!page)
            throw new Error(`Page "${pageId}" not found`);
        try {
            await page.close();
            this.pages.delete(pageId);
            return { success: true };
        }
        catch (error) {
            throw new Error(`Failed to close page: ${error}`);
        }
    }
    async cleanup() {
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
            this.pages.clear();
        }
    }
}
//# sourceMappingURL=BrowserTool.js.map