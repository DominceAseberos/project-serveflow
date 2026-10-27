import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const resultsDir = path.join(rootDir, 'audit-results');
const docsDir = path.join(rootDir, 'docs', 'screenshots');

if (!fs.existsSync(resultsDir)) fs.mkdirSync(resultsDir, { recursive: true });
if (!fs.existsSync(docsDir)) fs.mkdirSync(docsDir, { recursive: true });

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const TARGET_URL = 'http://localhost:5174';

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runAudit() {
  console.log('======================================================');
  console.log('📸 SERVEFLOW POS: CAPTURING AUTHENTIC REAL UI SCREENSHOTS');
  console.log('======================================================');

  console.log(`[1/4] Connecting to Google Chrome engine at ${CHROME_PATH}...`);
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    defaultViewport: { width: 1440, height: 900 },
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  const page = await browser.newPage();
  const consoleErrors = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  page.on('pageerror', (err) => {
    consoleErrors.push(err.toString());
  });

  async function capture(name) {
    const rawPath = path.join(resultsDir, name);
    const docPath = path.join(docsDir, name);
    await page.screenshot({ path: rawPath });
    fs.copyFileSync(rawPath, docPath);
    console.log(`  📸 Captured: ${name}`);
  }

  // Safe navigation helper
  async function navigateTo(viewName) {
    // If inside TV Display Kiosk, exit first
    const exitBtns = await page.$$('button');
    for (const b of exitBtns) {
      const text = await page.evaluate((el) => el.textContent, b);
      if (text && text.includes('Exit Kiosk')) {
        await b.click();
        await sleep(500);
        break;
      }
    }

    const navButtons = await page.$$('aside nav button');
    for (const btn of navButtons) {
      const text = await page.evaluate((el) => el.textContent, btn);
      if (text && text.trim().startsWith(viewName)) {
        await btn.click();
        await sleep(800);
        return true;
      }
    }
    return false;
  }

  try {
    console.log(`[2/4] Navigating to ${TARGET_URL}...`);
    await page.goto(TARGET_URL, { waitUntil: 'networkidle0', timeout: 20000 });
    await sleep(2000); // Allow IndexedDB initial seeding to settle

    // 1. Initial POS Screen
    await capture('01_initial_pos_screen.png');

    // 2. Category Filter & Search
    console.log('\n--- Step 1: Category Filter & Search ---');
    const catButtons = await page.$$('button');
    for (const btn of catButtons) {
      const text = await page.evaluate((el) => el.textContent, btn);
      if (text && text.includes('Pastries & Bakes')) {
        await btn.click();
        await sleep(500);
        break;
      }
    }
    await capture('02_search_filter.png');

    // Reset Category to "All Items"
    const allBtns = await page.$$('button');
    for (const btn of allBtns) {
      const text = await page.evaluate((el) => el.textContent, btn);
      if (text && text.includes('All Items')) {
        await btn.click();
        await sleep(500);
        break;
      }
    }

    // 3. Add Items to Cart, Modifiers, Senior/PWD legal discount
    console.log('\n--- Step 2: Populating Cart & Legal Discounts ---');
    const addButtons = await page.$$('button[title="Add item to current order"]');
    console.log(`  Found ${addButtons.length} product add buttons.`);
    if (addButtons.length >= 2) {
      await addButtons[0].click(); // Spanish Latte
      await sleep(400);
      await addButtons[1].click(); // Caramel Macchiato or Croissant
      await sleep(400);
    }

    // Add note/modifier to first item
    const noteBtns = await page.$$('button');
    for (const btn of noteBtns) {
      const text = await page.evaluate((el) => el.textContent, btn);
      if (text && text.includes('+ Add Note / Modifier')) {
        await btn.click();
        await sleep(300);
        break;
      }
    }

    // Select modifier pills in modifier popup
    const modPills = await page.$$('button');
    for (const p of modPills) {
      const text = await page.evaluate((el) => el.textContent, p);
      if (text && (text.includes('Oat Milk Sub') || text.includes('Extra Shot'))) {
        await p.click();
        await sleep(200);
      }
    }

    // Click "Save Note"
    const saveBtns = await page.$$('button');
    for (const b of saveBtns) {
      const text = await page.evaluate((el) => el.textContent, b);
      if (text && text.includes('Save Note')) {
        await b.click();
        await sleep(300);
        break;
      }
    }

    // Fill Guest Name & Table Identifier
    const guestInput = await page.$('input[placeholder="Guest Name"]');
    if (guestInput) {
      await guestInput.type('Engr. Helena Valderama');
    }

    const tableInput = await page.$('input[placeholder*="Table"]');
    if (tableInput) {
      await tableInput.type('T-04 (Patio)');
    }

    // Select 20% Senior Citizen / PWD (RA 9994)
    const discountSelect = await page.$('select');
    if (discountSelect) {
      await discountSelect.select('senior_pwd');
      await sleep(400);
    }

    // Type OSCA / PWD ID
    const oscaInput = await page.$('input[placeholder*="OSCA ID"]');
    if (oscaInput) {
      await oscaInput.type('OSCA-DVO-99214');
      await sleep(300);
    }

    await capture('03_cart_configured.png');

    // 4. Trigger Payment Modal
    console.log('\n--- Step 3: Payment Modal & Touchscreen Bills ---');
    const payBtns = await page.$$('button');
    for (const b of payBtns) {
      const text = await page.evaluate((el) => el.textContent, b);
      if (text && text.startsWith('Pay ₱')) {
        await b.click();
        await sleep(600);
        break;
      }
    }

    // In Payment Modal, tap the ₱1,000 Philippine Peso bill button!
    const billBtns = await page.$$('button');
    for (const b of billBtns) {
      const text = await page.evaluate((el) => el.textContent, b);
      if (text && text.trim() === '₱1,000') {
        await b.click();
        await sleep(500);
        break;
      }
    }

    await capture('04_payment_modal.png');

    // 5. Complete Order and View 80mm Hardware Receipt Modal
    console.log('\n--- Step 4: 80mm Hardware Receipt Modal ---');
    const completeBtns = await page.$$('button');
    for (const b of completeBtns) {
      const text = await page.evaluate((el) => el.textContent, b);
      if (text && text.includes('Complete Order')) {
        await b.click();
        await sleep(800);
        break;
      }
    }

    await capture('05_receipt_modal.png');

    // Start New Order to cleanly dismiss receipt modal
    const startNewBtns = await page.$$('button');
    for (const b of startNewBtns) {
      const text = await page.evaluate((el) => el.textContent, b);
      if (text && text.includes('Start New Order')) {
        await b.click();
        await sleep(500);
        break;
      }
    }

    // 6. Cash Drawer & Shift Reconciliation Modal
    console.log('\n--- Step 5: Cash Drawer Modal ---');
    const drawerBtns = await page.$$('header button');
    for (const b of drawerBtns) {
      const text = await page.evaluate((el) => el.textContent, b);
      if (text && text.includes('Cash Drawer')) {
        await b.click();
        await sleep(600);
        break;
      }
    }
    await capture('15_cash_drawer_modal.png');

    // Close Cash Drawer modal
    const closeBtns = await page.$$('button');
    for (const b of closeBtns) {
      const text = await page.evaluate((el) => el.textContent, b);
      if (text && text.includes('Close')) {
        await b.click();
        await sleep(400);
        break;
      }
    }

    // 7. Cast to TV Modal
    console.log('\n--- Step 6: TV Connect / Cast Modal ---');
    const castBtns = await page.$$('header button');
    for (const b of castBtns) {
      const text = await page.evaluate((el) => el.textContent, b);
      if (text && text.includes('Cast TV')) {
        await b.click();
        await sleep(600);
        break;
      }
    }
    await capture('16_tv_connect_modal.png');

    // Close TV modal
    const closeTvBtns = await page.$$('button');
    for (const b of closeTvBtns) {
      const text = await page.evaluate((el) => el.textContent, b);
      if (text && text.includes('Close')) {
        await b.click();
        await sleep(400);
        break;
      }
    }

    // 8. Kitchen Display System (KDS) & Order Dispatch
    console.log('\n--- Step 7: KDS Kitchen Display Tickets ---');
    // Add 1 meal to cart and dispatch to kitchen
    const addBtns2 = await page.$$('button[title="Add item to current order"]');
    if (addBtns2.length >= 3) {
      await addBtns2[2].click(); // Chicken Pesto Pasta
      await sleep(400);
    }
    const sendKitchenBtns = await page.$$('button');
    for (const b of sendKitchenBtns) {
      const text = await page.evaluate((el) => el.textContent, b);
      if (text && text.includes('Send Kitchen')) {
        await b.click();
        await sleep(600);
        break;
      }
    }

    await navigateTo('Kitchen');
    await capture('06_kitchen_kds_view.png');

    // Mark ticket ready
    const readyBtns = await page.$$('button');
    for (const b of readyBtns) {
      const text = await page.evaluate((el) => el.textContent, b);
      if (text && text.includes('Mark Ready for Pickup')) {
        await b.click();
        await sleep(600);
        break;
      }
    }
    await capture('07_kds_ticket_ready.png');

    // 9. TV Display View (Customer Kiosk)
    console.log('\n--- Step 8: TV Customer Display Kiosk ---');
    await page.goto(`${TARGET_URL}/?view=tv`, { waitUntil: 'networkidle0' });
    await sleep(1500);
    await capture('08_tv_order_display.png');

    // 10. AdminLTE Dashboard
    console.log('\n--- Step 9: Admin Dashboard ---');
    await page.goto(TARGET_URL, { waitUntil: 'networkidle0' });
    await sleep(1000);
    await navigateTo('Admin');
    await capture('09_admin_dashboard.png');

    // 11. Inventory Ledger
    console.log('\n--- Step 10: Inventory Ledger ---');
    await navigateTo('Inventory');
    await capture('10_inventory_table.png');

    // 12. Sync Queue
    console.log('\n--- Step 11: Sync Queue ---');
    await navigateTo('Sync Queue');
    await capture('11_sync_queue_before.png');

    const replayBtn = await page.$('button.bg-emerald-800');
    if (replayBtn) {
      await replayBtn.click();
      await sleep(1200);
    }
    await capture('12_sync_queue_after.png');

    // 13. Sales Reports & Official 80mm Z-Reading
    console.log('\n--- Step 12: Sales Reports & Official Z-Reading ---');
    await navigateTo('Reports');
    await capture('13_sales_reports_zreading.png');

    // Open Official 80mm Z-Reading Modal
    const zBtns = await page.$$('button');
    for (const b of zBtns) {
      const text = await page.evaluate((el) => el.textContent, b);
      if (text && text.includes('Official 80mm Z-Reading')) {
        await b.click();
        await sleep(600);
        break;
      }
    }
    await capture('17_zreading_slip_modal.png');

    // Close Z-Reading modal
    const closeZBtns = await page.$$('button');
    for (const b of closeZBtns) {
      const text = await page.evaluate((el) => el.textContent, b);
      if (text && text.includes('Close')) {
        await b.click();
        await sleep(400);
        break;
      }
    }

    // 14. Settings View
    console.log('\n--- Step 13: Settings View ---');
    await navigateTo('Settings');
    await capture('14_settings_view.png');

    console.log('\n======================================================');
    console.log('✅ ALL SCREENSHOTS AUTHENTICALLY CAPTURED & SAVED');
    console.log(`Total Console Errors: ${consoleErrors.length}`);
    if (consoleErrors.length > 0) {
      console.log('Console Errors:', consoleErrors);
    }
    console.log('======================================================');

  } catch (err) {
    console.error('Audit test failed:', err);
  } finally {
    await browser.close();
  }
}

runAudit();
