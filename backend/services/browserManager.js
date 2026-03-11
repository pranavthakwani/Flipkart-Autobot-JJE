import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class BrowserManager {
  constructor() {
    this.browser = null;
    this.contexts = new Map();
    this.cookiesDir = path.join(__dirname, '../storage/cookies');

    if (!fs.existsSync(this.cookiesDir)) {
      fs.mkdirSync(this.cookiesDir, { recursive: true });
    }
  }

  async initBrowser() {
    if (!this.browser) {
      this.browser = await chromium.launch({
        headless: false,
        slowMo: 100
      });
      console.log('Browser launched');
    }
    return this.browser;
  }

  async getContext(accountId, cookieFileName) {
    if (this.contexts.has(accountId)) {
      return this.contexts.get(accountId);
    }

    await this.initBrowser();
    const context = await this.browser.newContext();

    const cookiePath = path.join(this.cookiesDir, cookieFileName);
    if (fs.existsSync(cookiePath)) {
      try {
        const cookiesData = fs.readFileSync(cookiePath, 'utf8');
        const cookies = JSON.parse(cookiesData);
        await context.addCookies(cookies);
        console.log(`Loaded ${cookies.length} cookies for account ${accountId}`);
      } catch (e) {
        console.error(`Error loading cookies for account ${accountId}:`, e.message);
      }
    }

    this.contexts.set(accountId, context);
    return context;
  }

  async saveCookies(accountId, cookieFileName) {
    const context = this.contexts.get(accountId);
    if (!context) {
      throw new Error(`No context found for account ${accountId}`);
    }

    const cookies = await context.cookies();
    const cookiePath = path.join(this.cookiesDir, cookieFileName);
    fs.writeFileSync(cookiePath, JSON.stringify(cookies, null, 2));
    console.log(`Saved cookies for account ${accountId} to ${cookiePath}`);
  }

  async closeContext(accountId) {
    const context = this.contexts.get(accountId);
    if (context) {
      await context.close();
      this.contexts.delete(accountId);
      console.log(`Closed context for account ${accountId}`);
    }
  }

  async closeBrowser() {
    for (const [accountId] of this.contexts) {
      await this.closeContext(accountId);
    }

    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      console.log('Browser closed');
    }
  }

  getCookiesPath(cookieFileName) {
    return path.join(this.cookiesDir, cookieFileName);
  }
}

export default new BrowserManager();
