import browserManager from './browserManager.js';

class FlipkartBotService {
  async checkLoginStatus(page) {
    console.log('Checking if session is valid...');
    await page.waitForTimeout(3000);

    const loginIndicators = [
      '[data-testid="my-acc-label"]',
      '.ex2d38-0',
      '.e3HGqP',
      'div:has-text("My Account")',
      'div:has-text("Logout")'
    ];

    for (const indicator of loginIndicators) {
      try {
        await page.waitForSelector(indicator, { timeout: 2000 });
        console.log('Valid session found! Logged in successfully.');
        return true;
      } catch (e) {
        continue;
      }
    }

    console.log('Session expired or invalid.');
    return false;
  }

  async navigateToProduct(page, productName) {
    // Create search URL from product name
    const encodedProductName = encodeURIComponent(productName.trim());
    const searchUrl = `https://www.flipkart.com/search?q=${encodedProductName}`;
    
    console.log(`Searching for product: ${productName}`);
    console.log(`Search URL: ${searchUrl}`);
    
    await page.goto(searchUrl, { waitUntil: 'networkidle' });

    try {
      await page.locator('button:has-text("✕")').click({ timeout: 3000 });
    } catch (e) {}

    // Wait for search results to load
    await page.waitForSelector('a[href*="/p/"]', { timeout: 10000 });

    return page.locator('a[href*="/p/"]').first();
  }

  async extractProductPrice(page) {
    let productPrice = '0';
    const priceSelectors = [
      'div[class*="price"]',
      'span[class*="price"]',
      '.Nx9bqj',
      '.Nq9OHc',
      'div[data-testid="price"]',
      '._30jeq3',
      '.Bfpp2M'
    ];

    for (const selector of priceSelectors) {
      try {
        const priceElement = await page.waitForSelector(selector, { timeout: 3000 });
        const priceText = await priceElement.textContent();
        const priceMatch = priceText.match(/[\d,]+/);
        if (priceMatch) {
          productPrice = priceMatch[0].replace(/,/g, '');
          console.log(`Found price: ₹${productPrice}`);
          break;
        }
      } catch (e) {
        continue;
      }
    }

    return productPrice;
  }

  async clickBuyNow(page) {
    console.log("Looking for Buy Now button...");
    await page.waitForTimeout(2000);

    const buyNowSelectors = [
      'div.css-1rynq56:has-text("Buy now")',
      'div:has-text("Buy now")',
      'button:has-text("Buy Now")',
      '[data-testid="Buy Now"]',
      'text=Buy now'
    ];

    for (const selector of buyNowSelectors) {
      try {
        await page.waitForSelector(selector, { timeout: 3000 });
        await page.locator(selector).first().click();
        console.log(`Clicked Buy Now with selector: ${selector}`);
        return true;
      } catch (e) {
        console.log(`Selector ${selector} failed, trying next...`);
      }
    }

    throw new Error('Could not find Buy Now button');
  }

  async waitForCheckoutPage(context, currentPage) {
    console.log("Waiting for checkout page to open...");

    const [checkoutPage] = await Promise.all([
      context.waitForEvent('page', { timeout: 10000 }),
      currentPage.waitForTimeout(2000)
    ]).catch(() => {
      console.log("No new page detected, using current page");
      return [null];
    });

    const finalCheckoutPage = checkoutPage || currentPage;
    await finalCheckoutPage.waitForLoadState('networkidle');
    console.log("Checkout page loaded");

    return finalCheckoutPage;
  }

  async clickContinue(page) {
    console.log("Looking for Continue button...");
    await page.waitForTimeout(2000);

    const continueSelectors = [
      'div.css-146c3p1.r-1vgyyaa.r-ubezar.r-1rsjblm:has-text("Continue")',
      'div.css-1rynq56.r-1vgyyaa.r-ubezar.r-1rsjblm:has-text("Continue")',
      'div:has-text("Continue")',
      'button:has-text("Continue")',
      '[data-testid="Continue"]',
      'text=Continue'
    ];

    for (const selector of continueSelectors) {
      try {
        await page.waitForSelector(selector, { timeout: 3000 });
        await page.locator(selector).first().click();
        console.log(`Clicked Continue with selector: ${selector}`);
        return;
      } catch (e) {
        console.log(`Continue selector ${selector} failed, trying next...`);
      }
    }
  }

  async extractPriceBreakdown(page) {
    try {
      await page.waitForSelector('#right-section-sticky', { timeout: 10000 });
      const rightSection = await page.waitForSelector('#right-section-sticky', { timeout: 5000 });

      // Extract the complete price summary HTML element
      const priceSummaryElement = await rightSection.$('[data-testid="price-summary"]');
      const priceSummaryHTML = priceSummaryElement ? await priceSummaryElement.innerHTML() : '';

      // Extract the discount offer HTML element
      const discountOfferElement = await rightSection.$('.BbzIJW');
      const discountOfferHTML = discountOfferElement ? await discountOfferElement.outerHTML() : '';

      console.log('Extracted complete price breakdown HTML');

      return {
        priceSummaryHTML,
        discountOfferHTML,
        // Keep the old structure for backward compatibility
        mrp: '₹0',
        fees: [],
        discounts: [],
        total: '₹0',
        discountOffer: '',
        cardImages: [],
        numericData: {
          mrp: 0,
          total: 0,
          fees: [],
          discounts: []
        }
      };
    } catch (error) {
      console.log('Could not extract price breakdown, using default:', error.message);
      return {
        priceSummaryHTML: '',
        discountOfferHTML: '',
        mrp: '₹0',
        fees: [],
        discounts: [],
        total: '₹0',
        discountOffer: '',
        cardImages: [],
        numericData: {
          mrp: 0,
          total: 0,
          fees: [],
          discounts: []
        }
      };
    }
  }

  async processProduct(accountId, cookieFileName, productName, emitUpdate) {
    try {
      const context = await browserManager.getContext(accountId, cookieFileName);
      const page = await context.newPage();

      await page.goto('https://www.flipkart.com', { waitUntil: 'networkidle' });
      await page.reload({ waitUntil: 'networkidle' });

      const hasValidSession = await this.checkLoginStatus(page);

      if (!hasValidSession) {
        await page.close();
        return {
          success: false,
          error: 'Session expired. Please upload new cookies.',
          needsLogin: true
        };
      }

      emitUpdate({ status: 'processing', message: `Searching for ${productName}...` });
      await this.navigateToProduct(page, productName);

      const [newPage] = await Promise.all([
        context.waitForEvent('page'),
        page.locator('a[href*="/p/"]').first().click()
      ]);

      await newPage.waitForLoadState('networkidle');
      console.log("Opened product page");

      emitUpdate({ status: 'processing', message: 'Extracting price...' });
      const productPrice = await this.extractProductPrice(newPage);

      emitUpdate({ status: 'processing', message: 'Clicking Buy Now...', amount: productPrice });
      await this.clickBuyNow(newPage);

      const checkoutPage = await this.waitForCheckoutPage(context, newPage);
      await this.clickContinue(checkoutPage);

      emitUpdate({ status: 'processing', message: 'Extracting price breakdown...' });
      const priceBreakdown = await this.extractPriceBreakdown(checkoutPage);

      await page.close();

      return {
        success: true,
        amount: productPrice,
        priceBreakdown,
        checkoutPage
      };

    } catch (error) {
      console.error('Error processing product:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async fillPaymentDetails(accountId, cardDetails) {
    try {
      const context = browserManager.contexts.get(accountId);
      if (!context) {
        throw new Error('No active context for this account');
      }

      const pages = context.pages();
      const checkoutPage = pages[pages.length - 1];

      await checkoutPage.waitForSelector('#cards', { timeout: 10000 });

      await checkoutPage.fill('#cc-input', cardDetails.cardNumber);
      await checkoutPage.fill('input[autocomplete="cc-exp"]', cardDetails.expiry);
      await checkoutPage.fill('#cvv-input', cardDetails.cvv);

      await checkoutPage.click('button[class*="Button-module_button"]');

      await checkoutPage.waitForTimeout(5000);

      return { success: true, message: 'Payment submitted successfully' };

    } catch (error) {
      console.error('Error filling payment details:', error);
      return { success: false, error: error.message };
    }
  }
}

export default new FlipkartBotService();
